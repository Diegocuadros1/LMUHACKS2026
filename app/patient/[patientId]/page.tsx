import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { ChatWindow } from '@/components/patient/ChatWindow'
import { SummaryCard } from '@/components/patient/SummaryCard'
import { MedicationCard } from '@/components/patient/MedicationCard'
import { RoomControls } from '@/components/patient/RoomControls'
import { ContactActions } from '@/components/patient/ContactActions'
import { AlertBanner } from '@/components/patient/AlertBanner'

interface Props {
  params: Promise<{ patientId: string }>
}

export default async function PatientPage({ params }: Props) {
  const { patientId } = await params
  const supabase = createServiceClient()

  // Fetch all patient data in parallel
  const [patientRes, summaryRes, medsRes, contactsRes, alertsRes, sessionRes] = await Promise.all([
    supabase
      .from('patients')
      .select('*, profiles(*)')
      .eq('id', patientId)
      .single(),
    supabase
      .from('patient_summaries')
      .select('*')
      .eq('patient_id', patientId)
      .single(),
    supabase
      .from('medications')
      .select('*')
      .eq('patient_id', patientId)
      .eq('active', true)
      .order('created_at'),
    supabase
      .from('contacts')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at'),
    supabase
      .from('alerts')
      .select('*')
      .eq('patient_id', patientId)
      .eq('status', 'open')
      .order('created_at', { ascending: false }),
    // Get or create a chat session
    supabase
      .from('chat_sessions')
      .select('*')
      .eq('patient_id', patientId)
      .is('ended_at', null)
      .order('started_at', { ascending: false })
      .limit(1),
  ])

  if (patientRes.error || !patientRes.data) notFound()

  const patient = patientRes.data
  const summary = summaryRes.data ?? null
  const medications = medsRes.data ?? []
  const contacts = contactsRes.data ?? []
  const openAlerts = alertsRes.data ?? []

  // Ensure a chat session exists
  let sessionId: string
  if (sessionRes.data && sessionRes.data.length > 0) {
    sessionId = sessionRes.data[0].id
  } else {
    const { data: newSession } = await supabase
      .from('chat_sessions')
      .insert({ patient_id: patientId })
      .select()
      .single()
    sessionId = newSession?.id ?? crypto.randomUUID()
  }

  // Load recent messages for this session
  const { data: recentMessages } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(30)

  const firstName = patient.profiles?.full_name?.split(' ')[0] ?? 'there'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="sticky top-0 z-10 bg-blue-700 px-4 py-4 shadow-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-200">Room {patient.room_number}</p>
            <h1 className="text-xl font-bold text-white">Hello, {firstName} 👋</h1>
          </div>
          <Link
            href="/"
            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition"
          >
            ← Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        {/* Emergency escalation */}
        {openAlerts.length > 0 && (
          <AlertBanner
            message={`You have ${openAlerts.length} open alert${openAlerts.length > 1 ? 's' : ''}. Your nurse has been notified.`}
          />
        )}

        {/* Emergency button */}
        <form action={`/api/emergency?patientId=${patientId}`} method="POST">
          <button
            type="submit"
            className="w-full rounded-2xl bg-red-600 py-5 text-2xl font-extrabold text-white shadow-lg hover:bg-red-700 active:scale-95 transition focus:outline-none focus:ring-4 focus:ring-red-300"
          >
            🚨 EMERGENCY — Call Nurse Now
          </button>
        </form>

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Chat */}
          <div className="lg:col-span-2">
            <ChatWindow
              patientId={patientId}
              sessionId={sessionId}
              initialMessages={(recentMessages ?? []).map((m) => ({
                role: m.sender === 'patient' ? 'user' : 'assistant',
                content: m.content,
                timestamp: new Date(m.created_at),
              }))}
            />
          </div>

          {/* Medications */}
          <MedicationCard medications={medications} />

          {/* Summary */}
          <SummaryCard summary={summary} />

          {/* Room controls */}
          <RoomControls
            patientId={patientId}
            onAction={(msg) => console.log('[RoomControls]', msg)}
          />

          {/* Contacts */}
          <ContactActions
            contacts={contacts}
            patientId={patientId}
            onFeedback={(msg) => console.log('[Contacts]', msg)}
          />
        </div>
      </main>
    </div>
  )
}
