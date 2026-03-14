'use client'

import { useState } from 'react'
import type { Alert } from '@/lib/types'

interface AlertFeedProps {
  alerts: Alert[]
  onStatusChange?: (alertId: string, status: 'acknowledged' | 'resolved') => void
}

const severityStyles: Record<string, string> = {
  critical: 'border-red-500 bg-red-50',
  high:     'border-orange-400 bg-orange-50',
  medium:   'border-yellow-400 bg-yellow-50',
  low:      'border-blue-300 bg-blue-50',
}

const severityBadge: Record<string, string> = {
  critical: 'bg-red-600 text-white',
  high:     'bg-orange-500 text-white',
  medium:   'bg-yellow-500 text-white',
  low:      'bg-blue-500 text-white',
}

export function AlertFeed({ alerts, onStatusChange }: AlertFeedProps) {
  const [updating, setUpdating] = useState<string | null>(null)

  const handleStatus = async (alert: Alert, status: 'acknowledged' | 'resolved') => {
    setUpdating(alert.id)
    try {
      await fetch(`/api/alerts/${alert.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      onStatusChange?.(alert.id, status)
    } catch {
      console.error('Failed to update alert status')
    } finally {
      setUpdating(null)
    }
  }

  const open = alerts.filter((a) => a.status === 'open')
  const rest = alerts.filter((a) => a.status !== 'open')

  if (alerts.length === 0) {
    return (
      <div className="rounded-2xl bg-green-50 px-6 py-8 text-center text-green-700">
        <p className="text-2xl">✅</p>
        <p className="mt-2 font-semibold">No active alerts</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {[...open, ...rest].map((alert) => (
        <div
          key={alert.id}
          className={`rounded-xl border-l-4 p-4 space-y-2 ${severityStyles[alert.severity]}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${severityBadge[alert.severity]}`}>
                {alert.severity}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(alert.created_at).toLocaleString()}
              </span>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              alert.status === 'open' ? 'bg-red-100 text-red-700' :
              alert.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-500'
            }`}>
              {alert.status}
            </span>
          </div>

          <p className="text-sm text-gray-800">{alert.reason}</p>
          <p className="text-xs text-gray-400">Created by: {alert.created_by}</p>

          {alert.status === 'open' && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => handleStatus(alert, 'acknowledged')}
                disabled={updating === alert.id}
                className="rounded-lg bg-yellow-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-yellow-600 disabled:opacity-50"
              >
                Acknowledge
              </button>
              <button
                onClick={() => handleStatus(alert, 'resolved')}
                disabled={updating === alert.id}
                className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                Resolve
              </button>
            </div>
          )}
          {alert.status === 'acknowledged' && (
            <button
              onClick={() => handleStatus(alert, 'resolved')}
              disabled={updating === alert.id}
              className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              Mark Resolved
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
