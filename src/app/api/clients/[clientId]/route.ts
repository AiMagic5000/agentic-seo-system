import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import type { SEOClient } from '@/types'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params

    const { data: client, error } = await supabaseAdmin
      .from('seo_clients')
      .select('*')
      .eq('id', clientId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Client not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: client })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch client'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params
    const body: Partial<SEOClient> = await request.json()

    // Strip fields that should not be updated directly via this endpoint
    const { id: _id, created_at: _created, ...updatePayload } = body

    const { data: client, error } = await supabaseAdmin
      .from('seo_clients')
      .update({ ...updatePayload, updated_at: new Date().toISOString() })
      .eq('id', clientId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Client not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: client })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update client'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params

    const { data: client, error } = await supabaseAdmin
      .from('seo_clients')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', clientId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Client not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: client })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to deactivate client'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
