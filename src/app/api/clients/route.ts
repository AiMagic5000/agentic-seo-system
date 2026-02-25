import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import type { OnboardingFormData } from '@/types'

export async function GET() {
  try {
    const { data: clients, error } = await supabaseAdmin
      .from('seo_clients')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: clients })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch clients'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: OnboardingFormData = await request.json()
    const { url, business_name, niche, platform, gsc_property_url, data_sources } = body

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'url is required' },
        { status: 400 }
      )
    }
    if (!business_name) {
      return NextResponse.json(
        { success: false, error: 'business_name is required' },
        { status: 400 }
      )
    }
    if (!niche) {
      return NextResponse.json(
        { success: false, error: 'niche is required' },
        { status: 400 }
      )
    }
    if (!platform) {
      return NextResponse.json(
        { success: false, error: 'platform is required' },
        { status: 400 }
      )
    }

    const domain = new URL(url).hostname.replace('www.', '')

    const { data: client, error } = await supabaseAdmin
      .from('seo_clients')
      .insert({
        site_url: url,
        domain,
        business_name,
        niche,
        platform,
        gsc_property_url: gsc_property_url || null,
        data_sources: data_sources ?? [],
        active: true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: client }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create client'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
