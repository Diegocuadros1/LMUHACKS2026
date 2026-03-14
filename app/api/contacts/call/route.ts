import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { callContact } from '@/lib/tools/callContact'

const Schema = z.object({
  patientId: z.string().min(36).max(36),
  contactId: z.string().min(36).max(36),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = Schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

    const result = await callContact(parsed.data.patientId, parsed.data.contactId)
    console.log("[/api/contacts/call] Call initiated:", { patientId: parsed.data.patientId, contactId: parsed.data.contactId })
    return NextResponse.json(result)
  } catch (err) {
    console.error('[/api/contacts/call]', err)
    return NextResponse.json({ error: 'Call failed' }, { status: 500 })
  }
}
