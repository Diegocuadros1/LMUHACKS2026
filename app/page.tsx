'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    // Basic Demo Logic
    if (!username || !password) {
      setError('Please enter both credentials.')
      setIsLoading(false)
      return
    }

    // Small delay to simulate a real authentication request
    setTimeout(() => {
      const normalizedUser = username.toLowerCase()
      
      if (normalizedUser === 'admin' && password === 'password123') {
        router.push('/nurse')
      } else if (normalizedUser === 'patient' && password === 'password123') {
        const DEMO_ID = 'aaaaaaaa-0000-0000-0000-000000000001'
        router.push(`/patient/${DEMO_ID}`)
      } else {
        setError('Invalid credentials. Check the hint below.')
        setIsLoading(false)
      }
    }, 800)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-700 to-blue-900 px-4 py-16">
      <div className="w-full max-w-md text-center space-y-4">
        <div className="text-6xl mb-2">🏥</div>
        <h1 className="text-5xl font-extrabold tracking-tight text-white">CareCompanion</h1>
        <p className="text-xl text-blue-200 font-medium">Healthcare Professional & Patient Portal</p>
      </div>

      <div className="mt-10 w-full max-w-md">
        <form 
          onSubmit={handleLogin} 
          className="rounded-3xl bg-white p-10 shadow-2xl space-y-6"
        >
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold border border-red-100 animate-pulse">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-bold text-gray-500 ml-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 transition-all bg-gray-50 focus:bg-white"
              placeholder="admin or patient"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-bold text-gray-500 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 transition-all bg-gray-50 focus:bg-white"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-blue-600 px-6 py-4 text-lg font-bold text-white shadow-lg hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {isLoading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>
      </div>

      <div className="mt-12 p-4 rounded-xl bg-white/5 border border-white/10 max-w-sm text-center">
        <p className="text-xs text-blue-300 leading-relaxed">
          <b>Hackathon Access:</b><br />
          Admin: <code className="text-white">admin</code> / <code className="text-white">password123</code><br />
          Patient: <code className="text-white">patient</code> / <code className="text-white">password123</code>
        </p>
      </div>

      <p className="mt-8 text-[10px] text-blue-400/60 max-w-xs text-center uppercase tracking-tighter">
        CareCompanion is a demo. AI responses are not medical advice.
      </p>
    </div>
  )
}