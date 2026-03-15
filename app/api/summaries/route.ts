import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'

const Schema = z.object({
  patientId: z.string().min(1),
  summary_text: z.string().optional(),
  allergies: z.string().optional(),
  diagnoses_display: z.string().optional(),
  precautions: z.string().optional(),
  approved_by_nurse_id: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = Schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

    const { patientId, ...fields } = parsed.data
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('patient_summaries')
      .insert({ patient_id: patientId, ...fields })
      .select()
      .single()

    if (error) return NextResponse.json({ error: 'Insert failed' }, { status: 500 })

    return NextResponse.json({ success: true, summary: data })
  } catch (err) {
    console.error('[POST /api/summaries]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
