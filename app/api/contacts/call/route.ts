import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { callContact } from '@/lib/tools/callContact'

const Schema = z.object({
  patientId: z.string().min(36).max(36),
  contactName: z.string().min(1).max(100),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = Schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

    const result = await callContact(parsed.data.patientId, parsed.data.contactName)
    console.log("[/api/contacts/call] Call initiated:", { patientId: parsed.data.patientId, contactName: parsed.data.contactName })

    return NextResponse.json(result)
  } catch (err) {
    console.error('[/api/contacts/call]', err)
    return NextResponse.json({ error: 'Call failed' }, { status: 500 })
  }
}
