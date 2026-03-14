import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'

const Schema = z.object({
  status: z.enum(['acknowledged', 'resolved']),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ alertId: string }> }) {
  try {
    const { alertId } = await params
    const body = await req.json()
    const parsed = Schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })

    const supabase = createServiceClient()
    const { error } = await supabase
      .from('alerts')
      .update({ status: parsed.data.status })
      .eq('id', alertId)

    if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    console.log(`Alert ${alertId} status updated to:`, parsed.data.status)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[/api/alerts/[alertId]]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
