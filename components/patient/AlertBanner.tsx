'use client'

interface AlertBannerProps {
  message: string
  onDismiss?: () => void
}

export function AlertBanner({ message, onDismiss }: AlertBannerProps) {
  return (
    <div className="flex items-start justify-between gap-4 border border-red-500 bg-white px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="shrink-0 border border-red-500 px-2 py-0.5 text-xs font-semibold text-red-600">
          ALERT
        </span>
        <p className="text-sm font-medium text-gray-900 leading-snug">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 border border-gray-400 bg-gray-200 px-3 py-1 text-xs hover:bg-gray-300 focus:outline-none"
          aria-label="Dismiss alert"
        >
          Dismiss
        </button>
      )}
    </div>
  )
}
