'use client'

import { useState } from 'react'

interface RoomControlsProps {
  patientId: string
  onAction?: (message: string) => void
}

type DeviceAction = {
  label: string
  deviceType: string
  action: string
  value?: number
}

const DEVICE_ACTIONS: DeviceAction[] = [
  { label: 'TV On',       deviceType: 'tv',     action: 'on' },
  { label: 'TV Off',       deviceType: 'tv',     action: 'off' },
  { label: 'Lights On',   deviceType: 'lights', action: 'on' },
  { label: 'Lights Off',   deviceType: 'lights', action: 'off' },
  { label: 'Dim Lights',   deviceType: 'lights', action: 'dim', value: 30 },
  { label: 'Raise Bed',    deviceType: 'bed',    action: 'raise' },
  { label: 'Lower Bed',  deviceType: 'bed',    action: 'lower' },
  { label: 'Call Nurse',  deviceType: 'nurse_call', action: 'trigger' },
]

export function RoomControls({ patientId, onAction }: RoomControlsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleDevice = async (device: DeviceAction) => {
    const key = `${device.deviceType}-${device.action}`
    setLoading(key)
    try {
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          deviceType: device.deviceType,
          action: device.action,
          value: device.value,
        }),
      })
      const data = await res.json()
      const msg = data.message ?? `${device.label} done.`
      onAction?.(msg)
      setFeedback(msg)
      setTimeout(() => setFeedback(null), 3000)
    } catch {
      const msg = `Could not control ${device.label}. Please try the physical button.`
      onAction?.(msg)
      setFeedback(msg)
      setTimeout(() => setFeedback(null), 3000)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="bg-white border border-gray-300 p-4 space-y-3">
      <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Room Controls</h2>
      {feedback && (
        <p className="border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs text-gray-700">{feedback}</p>
      )}
      <div className="grid grid-cols-2 gap-2">
        {DEVICE_ACTIONS.map((device) => {
          const key = `${device.deviceType}-${device.action}`
          const isLoading = loading === key
          const isNurseCall = device.deviceType === 'nurse_call'
          return (
            <button
              key={key}
              onClick={() => handleDevice(device)}
              disabled={!!loading}
              className={`flex items-center gap-2 border px-3 py-2 text-sm font-medium transition active:scale-95 focus:outline-none disabled:opacity-50 ${
                isNurseCall
                  ? 'col-span-2 justify-center border-red-500 bg-red-600 text-white hover:bg-red-700'
                  : 'border-gray-400 bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
              aria-label={device.label}
            >
              <span>{device.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
