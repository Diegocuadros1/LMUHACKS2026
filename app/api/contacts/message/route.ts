import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendMessage } from '@/lib/tools/sendMessage'

const Schema = z.object({
  patientId: z.string().uuid(),
  contactId: z.string().uuid(),
  message: z.string().min(1).max(500),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = Schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

    const { patientId, contactId, message } = parsed.data
    const result = await sendMessage(patientId, contactId, message)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[/api/contacts/message]', err)
    return NextResponse.json({ error: 'Message send failed' }, { status: 500 })
  }
}
