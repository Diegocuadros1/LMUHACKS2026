import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// GET /api/session-messages?sessionId=...&after=ISO_TIMESTAMP
// Returns messages for a session newer than `after`, used by ChatWindow polling.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('sessionId')
  const after = searchParams.get('after')

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  let query = supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (after) {
    query = query.gt('created_at', after)
  }

  const { data, error } = await query

  if (error) {
    console.error('[/api/session-messages] DB error:', error)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  return NextResponse.json({ messages: data ?? [] })
}
