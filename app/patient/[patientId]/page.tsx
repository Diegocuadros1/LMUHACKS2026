import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { SignOutButton } from '@/components/SignOutButton'
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
      .select('*, profiles!profile_id(*)')
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

  const firstName = patient.profiles?.full_name?.split(' ')[0] ?? 'there'

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-gray-100">
      {/* Header */}
      <header className="shrink-0 bg-white border-b border-gray-300 px-4 py-3 z-10">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Room {patient.room_number}</p>
            <h1 className="text-lg font-semibold text-gray-900">Hello, {firstName}</h1>
          </div>
          <SignOutButton className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition" />
        </div>
      </header>

      {/* Three-column body — chat in center. Grid enforces strict column widths. */}
      <div className="flex-1 min-h-0 h-full grid gap-3 p-3 mx-auto w-full max-w-screen-2xl" style={{ gridTemplateColumns: '360px 1fr 360px', gridTemplateRows: '100%' }}>

        {/* Left column: Emergency + Medications + Room Controls */}
        <div className="flex flex-col gap-2 min-h-0 overflow-hidden">
          {/* Emergency button */}
          <form action={`/api/emergency?patientId=${patientId}`} method="POST" className="shrink-0">
            <button
              type="submit"
              className="w-full rounded-2xl bg-red-600 py-6 text-2xl font-extrabold text-white shadow-lg hover:bg-red-700 active:scale-95 transition focus:outline-none focus:ring-4 focus:ring-red-300"
            >
              EMERGENCY BUTTON
            </button>
          </form>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-0.5">
            <MedicationCard medications={medications} />
            <RoomControls patientId={patientId} />
          </div>
        </div>

        {/* Center column: Chat fills grid cell height */}
        {/* [&>div]:h-full! overrides ChatWindow's inline style={{ height:'520px' }} */}
        <div className="h-full min-h-0 overflow-hidden [&>div]:h-full!">
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

        {/* Right column: Alerts + Summary + Contacts */}
        <div className="flex flex-col gap-2 min-h-0 overflow-hidden">
          {openAlerts.length > 0 && (
            <div className="shrink-0">
              <AlertBanner
                message={`You have ${openAlerts.length} open alert${openAlerts.length > 1 ? 's' : ''}. Your nurse has been notified.`}
              />
            </div>
          )}

          <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-0.5">
            <SummaryCard summary={summary} />
            <ContactActions contacts={contacts} patientId={patientId} />
          </div>
        </div>

      </div>
    </div>
  )
}
