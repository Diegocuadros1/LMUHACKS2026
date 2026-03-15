'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const supabase = createClient()

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (authError || !authData.user) {
      setError('Invalid email or password.')
      setIsLoading(false)
      return
    }

    // Look up this user's profile role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profile) {
      setError('Account found but no profile exists. Contact your administrator.')
      setIsLoading(false)
      return
    }

    if (profile.role === 'nurse' || profile.role === 'admin') {
      router.push('/nurse')
      return
    }

    if (profile.role === 'patient') {
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('profile_id', authData.user.id)
        .single()

      if (patientError || !patient) {
        setError('Patient record not found. Contact your nurse.')
        setIsLoading(false)
        return
      }

      router.push(`/patient/${patient.id}`)
      return
    }

    setError('Unrecognized account role. Contact your administrator.')
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center font-serif text-[#333] pt-0">
      <div className="w-full bg-[#003366] py-6 text-center shadow-md">
        <h1 className="text-2xl font-bold text-white tracking-widest uppercase">
          Care Companion AI
        </h1>
        <p className="text-xs text-gray-300">
          Care Companion Access Portal v1.0.0
        </p>
      </div>

      <div className="w-full max-w-md mt-16 px-4">
        <form
          onSubmit={handleLogin}
          className="bg-[#e1e1e1] border-2 border-t-[#ffffff] border-l-[#ffffff] border-r-[#808080] border-b-[#808080] p-8 space-y-4"
        >
          <h2 className="text-lg font-bold border-b border-[#808080] pb-2 mb-4">
            Secure User Sign-On
          </h2>

          {error && (
            <div className="bg-white border-2 border-[#cc0000] p-3 text-xs font-bold text-[#cc0000] text-center uppercase">
              {error}
            </div>
          )}

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold uppercase">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border-2 border-t-[#808080] border-l-[#808080] border-r-[#ffffff] border-b-[#ffffff] px-2 py-1 text-sm bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold uppercase">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border-2 border-t-[#808080] border-l-[#808080] border-r-[#ffffff] border-b-[#ffffff] px-2 py-1 text-sm bg-white focus:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#cccccc] border-2 border-t-[#ffffff] border-l-[#ffffff] border-r-[#808080] border-b-[#808080] px-6 py-1 text-sm font-bold active:border-t-[#808080] active:border-l-[#808080] active:border-r-[#ffffff] active:border-b-[#ffffff] disabled:opacity-60"
            >
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
