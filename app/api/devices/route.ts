import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { controlRoomDevice } from '@/lib/tools/controlRoomDevice'

const Schema = z.object({
  patientId: z.string().min(36).max(36),
  deviceType: z.enum(['tv', 'lights', 'bed', 'nurse_call']),
  action: z.enum(['on', 'off', 'dim', 'raise', 'lower', 'trigger', 'set']),
  value: z.number().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = Schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

    const { patientId, deviceType, action, value } = parsed.data

    console.log("[/api/devices] Control Request:", { patientId, deviceType, action, value })
    const result = await controlRoomDevice(patientId, deviceType, action, value)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[/api/devices]', err)
    return NextResponse.json({ error: 'Device control failed' }, { status: 500 })
  }
}
