// src/app/api/cms/homepage/route.ts
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export const revalidate = 0

export async function GET() {
  try {
    const [
      { data: settingsData },
      { data: bannersData },
      { data: categoriesData },
      { data: brandsData },
      { data: testimonialsData },
      { data: trustData },
      { data: pagesData }
    ] = await Promise.all([
      supabaseAdmin.from('HomepageSettings').select('*').eq('id', 'singleton').maybeSingle(),
      supabaseAdmin.from('HeroSlide').select('*').order('order', { ascending: true }),
      supabaseAdmin.from('HomepageCategory').select('*').order('order', { ascending: true }),
      supabaseAdmin.from('BrandLogo').select('*').order('order', { ascending: true }),
      supabaseAdmin.from('Testimonial').select('*').order('createdAt', { ascending: false }),
      supabaseAdmin.from('TrustMarker').select('*').order('order', { ascending: true }),
      supabaseAdmin.from('CmsPage').select('*').order('createdAt', { ascending: false })
    ])
    return NextResponse.json({
      settings: settingsData || {
        footerLinks: '[]',
        navbarLinks: '[]',
        contactInfo: '{}',
        socials: '{}'
      },
      banners: bannersData || [],
      categories: categoriesData || [],
      brands: brandsData || [],
      testimonials: testimonialsData || [],
      trust: trustData || [],
      pages: pagesData || []
    })
  } catch (error) {
    console.error('CMS FETCH ERROR [homepage]:', error)
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 })
  }
}
