import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
    try {
        const data = await request.formData();
        const files = data.getAll('file') as unknown as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ success: false, error: 'No files uploaded' }, { status: 400 });
        }

        const urls: string[] = [];
        const uploadDir = join(process.cwd(), 'public/uploads');
        await require('fs').promises.mkdir(uploadDir, { recursive: true }).catch(() => { });

        for (const file of files) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
            const filename = `${Date.now()}_${safeName}`;

            const filepath = join(uploadDir, filename);
            await writeFile(filepath, buffer);

            urls.push(`/uploads/${filename}`);
        }

        return NextResponse.json({ success: true, urls });
    } catch (error: any) {
        console.error('Upload Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
