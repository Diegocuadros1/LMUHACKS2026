'use client'

import { useState, useRef, useEffect } from 'react'

interface VoiceButtonProps {
  onTranscript: (text: string) => void
  disabled?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecognition = any

export function VoiceButton({ onTranscript, disabled }: VoiceButtonProps) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(true)
  const recognitionRef = useRef<AnyRecognition>(null)

  useEffect(() => {
    // Check support on mount (client-only)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    if (!w.SpeechRecognition && !w.webkitSpeechRecognition) setSupported(false)
    return () => recognitionRef.current?.abort()
  }, [])

  const startListening = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition
    if (!SR) {
      alert('Voice input requires Chrome or Edge. Please type your message instead.')
      return
    }

    const recognition = new SR()
    recognitionRef.current = recognition

    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.continuous = false // auto-stop after silence — good for patient use

    recognition.onstart = () => setListening(true)

    recognition.onresult = (event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => {
      const transcript = event.results[0][0].transcript.trim()
      if (transcript) onTranscript(transcript)
    }

    recognition.onerror = (event: { error: string }) => {
      console.warn('[VoiceButton] Speech recognition error:', event.error)
      // 'no-speech' is normal — user was quiet, don't alert
      if (event.error !== 'no-speech') {
        alert(`Voice input error: ${event.error}. Please try again or type your message.`)
      }
      setListening(false)
    }

    recognition.onend = () => setListening(false)

    recognition.start()
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  const handleClick = () => {
    if (listening) stopListening()
    else startListening()
  }

  if (!supported) {
    return (
      <button
        disabled
        type="button"
        title="Voice input requires Chrome or Edge"
        aria-label="Voice input not supported in this browser"
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-300 text-gray-500 cursor-not-allowed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
          <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
          <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291A6.751 6.751 0 0 1 5.25 12.75v-1.5A.75.75 0 0 1 6 10.5Z" />
        </svg>
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      type="button"
      aria-label={listening ? 'Stop listening' : 'Speak your request'}
      title={listening ? 'Listening… click to stop' : 'Click to speak'}
      className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white shadow-lg transition active:scale-95 disabled:opacity-50 focus:outline-none focus:ring-4 ${
        listening
          ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300'
          : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300'
      }`}
    >
      {listening && (
        <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-60" />
      )}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="relative h-6 w-6">
        <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
        <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291A6.751 6.751 0 0 1 5.25 12.75v-1.5A.75.75 0 0 1 6 10.5Z" />
      </svg>
    </button>
  )
}
