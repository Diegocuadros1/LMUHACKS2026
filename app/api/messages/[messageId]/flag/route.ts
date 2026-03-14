import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'

const Schema = z.object({ flagged: z.boolean() })

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ messageId: string }> }) {
  try {
    const { messageId } = await params
    const body = await req.json()
    const parsed = Schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

    const supabase = createServiceClient()
    const { error } = await supabase
      .from('chat_messages')
      .update({ flagged_incorrect: parsed.data.flagged })
      .eq('id', messageId)

    if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

    console.log(`Message ${messageId} flagged as incorrect:`, parsed.data.flagged)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[/api/messages/flag]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
