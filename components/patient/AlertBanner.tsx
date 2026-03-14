'use client'

interface AlertBannerProps {
  message: string
  onDismiss?: () => void
}

export function AlertBanner({ message, onDismiss }: AlertBannerProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-red-600 px-6 py-4 text-white shadow-lg">
      <div className="flex items-center gap-3">
        <span className="text-2xl" aria-hidden>🚨</span>
        <p className="text-lg font-semibold">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="rounded-lg bg-white/20 px-4 py-2 text-sm font-medium hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Dismiss alert"
        >
          Dismiss
        </button>
      )}
    </div>
  )
}
