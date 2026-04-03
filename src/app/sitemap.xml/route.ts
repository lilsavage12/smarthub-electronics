import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://smarthub-electronics.com'

  // Fetch all products for dynamic routes
  const { data: products } = await supabaseAdmin
    .from('Product')
    .select('id, updatedAt')
    .eq('isActive', true)

  const staticRoutes = [
    '',
    '/products',
    '/cart',
    '/checkout',
    '/about',
    '/contact',
    '/sitemap',
  ]

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticRoutes.map(route => `
    <url>
      <loc>${baseUrl}${route}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>daily</changefreq>
      <priority>${route === '' ? '1.0' : '0.6'}</priority>
    </url>
  `).join('')}
  ${(products || []).map(product => `
    <url>
      <loc>${baseUrl}/products/${product.id}</loc>
      <lastmod>${product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>
  `).join('')}
</urlset>`

  return new NextResponse(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
