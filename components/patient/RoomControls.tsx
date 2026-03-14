'use client'

import { useState } from 'react'

interface RoomControlsProps {
  patientId: string
  onAction: (message: string) => void
}

type DeviceAction = {
  label: string
  emoji: string
  deviceType: string
  action: string
  value?: number
}

const DEVICE_ACTIONS: DeviceAction[] = [
  { label: 'TV On',       emoji: '📺', deviceType: 'tv',     action: 'on' },
  { label: 'TV Off',      emoji: '📺', deviceType: 'tv',     action: 'off' },
  { label: 'Lights On',   emoji: '💡', deviceType: 'lights', action: 'on' },
  { label: 'Lights Off',  emoji: '💡', deviceType: 'lights', action: 'off' },
  { label: 'Dim Lights',  emoji: '🌙', deviceType: 'lights', action: 'dim', value: 30 },
  { label: 'Raise Bed',   emoji: '🛏️', deviceType: 'bed',    action: 'raise' },
  { label: 'Lower Bed',   emoji: '🛏️', deviceType: 'bed',    action: 'lower' },
  { label: 'Call Nurse',  emoji: '🔔', deviceType: 'nurse_call', action: 'trigger' },
]

export function RoomControls({ patientId, onAction }: RoomControlsProps) {
  const [loading, setLoading] = useState<string | null>(null)

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
      onAction(data.message ?? `${device.label} done.`)
    } catch {
      onAction(`Could not control ${device.label}. Please try the physical button.`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="rounded-2xl bg-purple-50 p-6 space-y-4">
      <h2 className="text-xl font-bold text-purple-900">Room Controls</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {DEVICE_ACTIONS.map((device) => {
          const key = `${device.deviceType}-${device.action}`
          const isLoading = loading === key
          const isNurseCall = device.deviceType === 'nurse_call'
          return (
            <button
              key={key}
              onClick={() => handleDevice(device)}
              disabled={!!loading}
              className={`flex flex-col items-center gap-2 rounded-xl px-3 py-4 text-sm font-semibold shadow-sm transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 ${
                isNurseCall
                  ? 'bg-red-600 text-white hover:bg-red-700 col-span-2'
                  : 'bg-white text-purple-900 hover:bg-purple-100'
              }`}
              aria-label={device.label}
            >
              <span className="text-2xl">{isLoading ? '⏳' : device.emoji}</span>
              <span>{device.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
