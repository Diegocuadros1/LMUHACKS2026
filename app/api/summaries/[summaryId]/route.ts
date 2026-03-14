import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'

const Schema = z.object({
  summary_text: z.string().optional(),
  allergies: z.string().optional(),
  diagnoses_display: z.string().optional(),
  precautions: z.string().optional(),
  approved_by_nurse_id: z.string().min(36).max(36).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ summaryId: string }> }) {
  try {
    const { summaryId } = await params
    const body = await req.json()
    const parsed = Schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

    const supabase = createServiceClient()
    const { error } = await supabase
      .from('patient_summaries')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', summaryId)

    if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

    console.log("Bot viewed summary")
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[/api/summaries]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
