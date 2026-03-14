import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'

const Schema = z.object({
  sessionId: z.string().min(1),
  message: z.string().min(1).max(1000),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { sessionId, message } = parsed.data
    const supabase = createServiceClient()

    const { error } = await supabase.from('chat_messages').insert({
      session_id: sessionId,
      sender: 'nurse',
      content: message,
    })

    if (error) {
      console.error('[/api/nurse-message] DB error:', error)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    console.log('[/api/nurse-message] Nurse message sent to session:', sessionId)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[/api/nurse-message]', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
