// MOCKED: Real integration would use a hospital room-control API or IoT gateway.
// Replace the state update section with real device API calls when available.

import { createServiceClient } from '@/lib/supabase/server'
import { logInteraction } from './logInteraction'

type DeviceType = 'tv' | 'lights' | 'bed' | 'nurse_call'
type Action = 'on' | 'off' | 'dim' | 'raise' | 'lower' | 'trigger' | 'set'

export async function controlRoomDevice(
  patientId: string,
  deviceType: DeviceType,
  action: Action,
  value?: number | string
) {
  const supabase = createServiceClient()

  const { data: device, error } = await supabase
    .from('room_devices')
    .select('*')
    .eq('patient_id', patientId)
    .eq('device_type', deviceType)
    .single()

  if (error || !device) {
    const result = { success: false, error: `Device "${deviceType}" not found in this room.` }
    await logInteraction(patientId, 'controlRoomDevice', { patientId, deviceType, action, value }, result, 'error')
    return result
  }

  // Build new state based on device type + action
  const currentState = device.state_json as Record<string, unknown>
  let newState: Record<string, unknown> = { ...currentState }
  let description = ''

  if (deviceType === 'tv') {
    if (action === 'on')  { newState.power = true;  description = 'TV turned on.' }
    if (action === 'off') { newState.power = false; description = 'TV turned off.' }
    if (action === 'set' && value !== undefined) {
      newState.channel = Number(value)
      description = `TV channel changed to ${value}.`
    }
  } else if (deviceType === 'lights') {
    if (action === 'on')  { newState.power = true; newState.brightness = 100; description = 'Lights turned on.' }
    if (action === 'off') { newState.power = false; description = 'Lights turned off.' }
    if (action === 'dim') {
      const level = value !== undefined ? Number(value) : 30
      newState.power = true
      newState.brightness = Math.max(0, Math.min(100, level))
      description = `Lights dimmed to ${newState.brightness}%.`
    }
  } else if (deviceType === 'bed') {
    if (action === 'raise') {
      const current = Number(currentState.head_angle ?? 30)
      newState.head_angle = Math.min(90, current + 15)
      description = `Bed head raised to ${newState.head_angle}°.`
    }
    if (action === 'lower') {
      const current = Number(currentState.head_angle ?? 30)
      newState.head_angle = Math.max(0, current - 15)
      description = `Bed head lowered to ${newState.head_angle}°.`
    }
  } else if (deviceType === 'nurse_call') {
    if (action === 'trigger') {
      newState.active = true
      description = 'Nurse call button activated. A nurse will arrive shortly.'
    }
  }

  // Persist new state to database (MOCK: would also send to real device)
  await supabase
    .from('room_devices')
    .update({ state_json: newState })
    .eq('id', device.id)

  const result = {
    success: true,
    mocked: true,
    deviceType,
    action,
    newState,
    message: description || `Device ${deviceType} updated.`,
  }

  console.log(`[controlRoomDevice] ${description || `Updated ${deviceType} with action ${action}.`}`, { patientId, deviceType, action, value, newState })

  await logInteraction(patientId, 'controlRoomDevice', { patientId, deviceType, action, value }, result, 'mocked')
  return result
}
