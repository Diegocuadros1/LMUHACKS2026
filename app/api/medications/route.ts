import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'

const Schema = z.object({
  patientId: z.string().min(1),
  med_name: z.string().min(1).max(200),
  dose: z.string().max(200).optional(),
  schedule_text: z.string().max(500).optional(),
  nurse_notes: z.string().max(500).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = Schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

    const { patientId, med_name, dose, schedule_text, nurse_notes } = parsed.data
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('medications')
      .insert({ patient_id: patientId, med_name, dose, schedule_text, nurse_notes, active: true })
      .select()
      .single()

    if (error) return NextResponse.json({ error: 'Insert failed' }, { status: 500 })

    return NextResponse.json({ success: true, medication: data })
  } catch (err) {
    console.error('[POST /api/medications]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
