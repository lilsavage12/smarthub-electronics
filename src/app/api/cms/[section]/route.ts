import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  const { section } = await params

  try {
    switch (section) {
      case "homepage":
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

      case "settings":
        const { data: settings } = await supabaseAdmin.from('HomepageSettings').select('*').eq('id', 'singleton').maybeSingle()
        return NextResponse.json(settings || {})

      case "banners":
        const { data: banners } = await supabaseAdmin.from('HeroSlide').select('*').order('order', { ascending: true })
        return NextResponse.json(banners || [])

      case "categories":
        const { data: categories } = await supabaseAdmin.from('HomepageCategory').select('*').order('order', { ascending: true })
        return NextResponse.json(categories || [])

      case "brands":
        const { data: brands } = await supabaseAdmin.from('BrandLogo').select('*').order('order', { ascending: true })
        return NextResponse.json(brands || [])

      case "testimonials":
        const { data: testimonials } = await supabaseAdmin.from('Testimonial').select('*').eq('isActive', true).order('createdAt', { ascending: false })
        return NextResponse.json(testimonials || [])

      case "trust":
        const { data: trust } = await supabaseAdmin.from('TrustMarker').select('*').order('order', { ascending: true })
        return NextResponse.json(trust || [])

      case "pages":
        const { data: pages } = await supabaseAdmin.from('CmsPage').select('*').order('createdAt', { ascending: false })
        return NextResponse.json(pages || [])

      default:
        return NextResponse.json({ error: "Invalid section" }, { status: 400 })
    }
  } catch (error) {
    console.error(`CMS FETCH ERROR [${section}]:`, error)
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  const { section } = await params
  const { id, createdAt, updatedAt, ...body } = await req.json()

  try {
    let table = ""
    switch (section) {
      case "settings":
        const { data: settings, error: sErr } = await supabaseAdmin
          .from('HomepageSettings')
          .upsert({ id: 'singleton', ...body })
          .select()
          .single()
        if (sErr) throw sErr
        return NextResponse.json(settings)

      case "banners": table = "HeroSlide"; break;
      case "categories": table = "HomepageCategory"; break;
      case "brands": table = "BrandLogo"; break;
      case "testimonials": table = "Testimonial"; break;
      case "trust": table = "TrustMarker"; break;
      case "pages": table = "CmsPage"; break;
      default:
        return NextResponse.json({ error: "Invalid section" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin.from(table).insert(body).select().single()
    if (error) throw error
    return NextResponse.json(data)

  } catch (error: any) {
    console.error(`CMS CREATE ERROR [${section}]:`, error)
    return NextResponse.json({ error: error.message || "Failed to create" }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  const { section } = await params
  const { id, createdAt, updatedAt, ...body } = await req.json()

  try {
    let table = ""
    switch (section) {
      case "banners": table = "HeroSlide"; break;
      case "categories": table = "HomepageCategory"; break;
      case "brands": table = "BrandLogo"; break;
      case "testimonials": table = "Testimonial"; break;
      case "trust": table = "TrustMarker"; break;
      case "pages": table = "CmsPage"; break;
      default:
        return NextResponse.json({ error: "Update logic for this section is not available" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin.from(table).update(body).eq('id', id).select().single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    console.error(`CMS UPDATE ERROR [${section}]:`, error)
    return NextResponse.json({ error: error.message || "Update failed" }, { status: 500 })
  }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ section: string }> }
) {
    const { section } = await params
    const { id } = await req.json()

    try {
        let table = ""
        switch (section) {
            case "banners": table = "HeroSlide"; break;
            case "categories": table = "HomepageCategory"; break;
            case "brands": table = "BrandLogo"; break;
            case "testimonials": table = "Testimonial"; break;
            case "trust": table = "TrustMarker"; break;
            case "pages": table = "CmsPage"; break;
            default:
                return NextResponse.json({ error: "Delete invalid for this section" }, { status: 400 })
        }
        const { error } = await supabaseAdmin.from(table).delete().eq('id', id)
        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error(`CMS DELETE ERROR [${section}]:`, error)
        return NextResponse.json({ error: "Delete failed" }, { status: 500 })
    }
}

