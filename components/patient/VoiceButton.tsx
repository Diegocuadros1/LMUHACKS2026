'use client'

// VOICE INTEGRATION PLACEHOLDER
// To connect real speech-to-text:
//   1. Web Speech API: const recognition = new window.SpeechRecognition() — available in Chrome/Edge
//   2. OpenAI Whisper: POST audio blob to /api/transcribe
//   3. AssemblyAI / Deepgram: use their SDK for real-time streaming
// See: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition

interface VoiceButtonProps {
  onTranscript: (text: string) => void
  disabled?: boolean
}

export function VoiceButton({ onTranscript, disabled }: VoiceButtonProps) {
  const handleClick = () => {
    // --- MOCK: simulate voice input with a canned phrase ---
    // Replace this block with a real Web Speech API or vendor SDK call
    const mockPhrases = [
      "What medications am I taking today?",
      "Can you turn off the lights?",
      "I'd like to call my daughter.",
      "Can you raise my bed?",
      "What is my diagnosis?",
    ]
    const phrase = mockPhrases[Math.floor(Math.random() * mockPhrases.length)]
    onTranscript(phrase)
    // --- END MOCK ---

    /* Example Web Speech API integration (uncomment when ready):
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser. Try Chrome or Edge.')
      return
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      onTranscript(transcript)
    }
    recognition.start()
    */
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      aria-label="Speak your request"
      title="Voice input (mocked — click to simulate)"
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition hover:bg-indigo-700 active:scale-95 disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-indigo-300"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
        <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291A6.751 6.751 0 0 1 5.25 12.75v-1.5A.75.75 0 0 1 6 10.5Z" />
      </svg>
    </button>
  )
}
