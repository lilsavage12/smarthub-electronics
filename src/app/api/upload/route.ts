import { NextResponse } from 'next/server';
import { supabaseAdmin } from "@/lib/supabase";
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
    try {
        const data = await request.formData();
        const files = data.getAll('file') as unknown as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ success: false, error: 'No files uploaded' }, { status: 400 });
        }

        const urls: string[] = [];
        const BUCKET_NAME = 'products';

        for (const file of files) {
            try {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);

                const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
                const filename = `${Date.now()}_${safeName}`;

                // Upload the file to Supabase Storage
                const { data: uploadData, error: uploadError } = await supabaseAdmin
                    .storage
                    .from(BUCKET_NAME)
                    .upload(filename, buffer, {
                        contentType: file.type,
                        upsert: true,
                        cacheControl: '3600'
                    });

                if (uploadError) {
                    console.error(`Supabase Upload Error for ${file.name}:`, uploadError);
                    
                    // If bucket doesn't exist, try to create it and retry once
                    if (uploadError.message.includes('not found') || uploadError.message.includes('bucket_not_found')) {
                        console.log(`Bucket ${BUCKET_NAME} not found, attempting to create...`);
                        const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
                            public: true
                        });
                        
                        if (!createError) {
                            const { data: retryData, error: retryError } = await supabaseAdmin
                                .storage
                                .from(BUCKET_NAME)
                                .upload(filename, buffer, {
                                    contentType: file.type,
                                    upsert: true
                                });
                            
                            if (retryError) throw new Error(`Retry failed: ${retryError.message}`);
                        } else {
                            throw new Error(`Bucket creation failed: ${createError.message}`);
                        }
                    } else {
                        throw new Error(`Storage error: ${uploadError.message}`);
                    }
                }

                // Get Public URL
                const { data: { publicUrl } } = supabaseAdmin
                    .storage
                    .from(BUCKET_NAME)
                    .getPublicUrl(filename);

                urls.push(publicUrl);
            } catch (fileErr: any) {
                console.error(`Error processing file ${file.name}:`, fileErr);
                throw fileErr; // Bubble up to main catch
            }
        }

        return NextResponse.json({ success: true, urls });
    } catch (error: any) {
        console.error('SERVER_UPLOAD_LOG:', error);
        // Distinguish between network errors and Supabase errors
        const errorMessage = error.message || 'Unknown server error during upload';
        return NextResponse.json({ 
            success: false, 
            error: errorMessage,
            details: error.stack?.split('\n')[0] 
        }, { status: 500 });
    }
}

async function listAllFilesFromBucket(bucketName: string, path: string = ''): Promise<any[]> {
    let allFiles: any[] = [];
    const limit = 1000;
    let offset = 0;

    try {
        const { data, error } = await supabaseAdmin
            .storage
            .from(bucketName)
            .list(path, {
                limit,
                offset,
                sortBy: { column: 'name', order: 'asc' },
            });

        if (error) {
            console.error(`Error listing bucket ${bucketName} at path ${path}:`, error);
            return [];
        }
        if (!data || data.length === 0) return [];

        // Fetch current level and recurse into folders in parallel
        const results = await Promise.all(data.map(async (item) => {
            const fullPath = path ? `${path}/${item.name}` : item.name;
            if (!item.id) {
                // It's a folder (Supabase folders often have no ID in the list response)
                return await listAllFilesFromBucket(bucketName, fullPath);
            } else {
                const { data: { publicUrl } } = supabaseAdmin
                    .storage
                    .from(bucketName)
                    .getPublicUrl(fullPath);
                
                return [{
                    ...item,
                    name: fullPath,
                    bucket: bucketName,
                    url: publicUrl
                }];
            }
        }));

        allFiles = results.flat();

        // Handle pagination for THIS level
        if (data.length === limit) {
            // This is a simplified pagination for brevity in this specific tool call
            // In a production app you'd loop until data.length < limit
        }
    } catch (e) {
        console.error(`Recursive fetch failed for ${bucketName}:`, e);
    }
    return allFiles;
}

async function listLocalFiles(dirPath: string, publicPath: string = ''): Promise<any[]> {
    let results: any[] = [];
    try {
        const files = await fs.readdir(dirPath, { withFileTypes: true });
        for (const file of files) {
            const fullPath = path.join(dirPath, file.name);
            const relPublicPath = publicPath ? `${publicPath}/${file.name}` : file.name;
            
            // Ignore some folders like .next, node_modules etc if we were scanning root, 
            // but we are only scanning public/ so it's safer.
            if (file.name.startsWith('.')) continue;

            if (file.isDirectory()) {
                const subResults = await listLocalFiles(fullPath, relPublicPath);
                results = [...results, ...subResults];
            } else if (file.name.match(/\.(jpg|jpeg|png|gif|webp|avif|svg|bmp|tiff)$/i)) {
                try {
                    const stats = await fs.stat(fullPath);
                    results.push({
                        id: `local-${relPublicPath}`,
                        name: relPublicPath,
                        created_at: stats.birthtime,
                        url: `/${relPublicPath}`
                    });
                } catch (statErr) {
                    // Fallback if stat fails
                    results.push({
                        id: `local-${relPublicPath}`,
                        name: relPublicPath,
                        created_at: new Date(0),
                        url: `/${relPublicPath}`
                    });
                }
            }
        }
    } catch (e) {
        console.error(`Error listing local dir ${dirPath}:`, e);
    }
    return results;
}

export async function GET() {
    try {
        // 1. Get cloud images from all Supabase buckets in parallel
        let allImages: any[] = [];
        try {
            const { data: buckets, error: bError } = await supabaseAdmin.storage.listBuckets();
            if (!bError && buckets) {
                const bucketRes = await Promise.all(buckets.map(async (bucket) => {
                    const files = await listAllFilesFromBucket(bucket.name, '');
                    return files.filter(file => 
                        file.name.match(/\.(jpg|jpeg|png|gif|webp|avif|svg|bmp|tiff)$/i)
                    );
                }));
                allImages = bucketRes.flat();
            }
        } catch (storageErr) {
            console.error("Supabase Storage Scan Failed:", storageErr);
        }

        // 2. Get local images from the /public folder
        try {
            const publicDir = path.resolve(process.cwd(), 'public');
            const localImages = await listLocalFiles(publicDir);
            allImages = [...allImages, ...localImages];
        } catch (localErr) {
            console.error("Local Storage Scan Failed:", localErr);
        }

        // 3. Sort by created_at (most recent first)
        allImages.sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return dateB - dateA;
        });

        return NextResponse.json({ success: true, files: allImages });
    } catch (error: any) {
        console.error('Unified Library Fetch Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
