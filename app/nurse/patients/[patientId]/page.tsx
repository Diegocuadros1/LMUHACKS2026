import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { NurseSummaryEditor } from '@/components/nurse/NurseSummaryEditor'
import { ChatLogViewer } from '@/components/nurse/ChatLogViewer'
import { AlertFeed } from '@/components/nurse/AlertFeed'
import type { ToolLog } from '@/lib/types'

interface Props {
  params: Promise<{ patientId: string }>
}

const DEMO_NURSE_ID = '00000000-0000-0000-0000-000000000001'

export default async function NursePatientDetailPage({ params }: Props) {
  const { patientId } = await params
  const supabase = createServiceClient()

  const [patientRes, summaryRes, medsRes, contactsRes, alertsRes, sessionsRes, toolLogsRes] = await Promise.all([
    supabase.from('patients').select('*, profiles!profile_id(*)').eq('id', patientId).single(),
    supabase.from('patient_summaries').select('*').eq('patient_id', patientId).single(),
    supabase.from('medications').select('*').eq('patient_id', patientId).order('created_at'),
    supabase.from('contacts').select('*').eq('patient_id', patientId).order('created_at'),
    supabase.from('alerts').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(20),
    supabase.from('chat_sessions').select('*').eq('patient_id', patientId).order('started_at', { ascending: false }).limit(5),
    supabase.from('tool_logs').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(20),
  ])

  if (patientRes.error || !patientRes.data) notFound()

  const patient = patientRes.data
  const summary = summaryRes.data
  const medications = medsRes.data ?? []
  const contacts = contactsRes.data ?? []
  const alerts = alertsRes.data ?? []
  const sessions = sessionsRes.data ?? []
  const toolLogs: ToolLog[] = toolLogsRes.data ?? []

  // Load messages from most recent session
  const latestSession = sessions[0]
  const messagesRes = latestSession
    ? await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', latestSession.id)
        .order('created_at', { ascending: true })
    : null
  const messages = messagesRes?.data ?? []

  const name = patient.profiles?.full_name ?? 'Unknown'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-green-700 px-4 py-4 shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <Link href="/nurse" className="rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20 transition">
            ← Dashboard
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-white">{name}</h1>
            <p className="text-sm text-green-200">
              Room {patient.room_number} · {patient.admission_status} ·{' '}
              {patient.date_of_birth
                ? `DOB ${new Date(patient.date_of_birth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                : 'DOB unknown'}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient profile */}
            <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 space-y-3">
              <h2 className="text-lg font-bold text-gray-900">Profile</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Full Name</p>
                  <p className="font-semibold text-gray-900">{name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Room</p>
                  <p className="font-semibold text-gray-900">{patient.room_number}</p>
                </div>
                <div>
                  <p className="text-gray-500">Emergency Contact</p>
                  <p className="font-semibold text-gray-900">
                    {patient.emergency_contact_name ?? '—'}{patient.emergency_contact_phone ? ` · ${patient.emergency_contact_phone}` : ''}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="font-semibold text-gray-900 capitalize">{patient.admission_status}</p>
                </div>
              </div>

              {/* Family contacts */}
              {contacts.length > 0 && (
                <div className="pt-2">
                  <p className="text-sm font-semibold text-gray-500 mb-2">Family Contacts</p>
                  <div className="flex flex-wrap gap-2">
                    {contacts.map((c) => (
                      <span key={c.id} className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700">
                        {c.name} ({c.relationship}) · {c.phone}
                        {c.can_call && ' 📞'}
                        {c.can_text && ' 💬'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Summary editor */}
            {summary && (
              <NurseSummaryEditor summary={summary} nurseId={DEMO_NURSE_ID} />
            )}

            {/* Medications */}
            <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 space-y-3">
              <h2 className="text-lg font-bold text-gray-900">Medications</h2>
              {medications.length === 0 && <p className="text-gray-400 text-sm">No medications on file.</p>}
              <div className="space-y-2">
                {medications.map((m) => (
                  <div key={m.id} className="rounded-xl bg-green-50 px-4 py-3 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-900">{m.med_name} — {m.dose}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${m.active ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-500'}`}>
                        {m.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {m.schedule_text && <p className="mt-1 text-gray-600">⏰ {m.schedule_text}</p>}
                    {m.nurse_notes && <p className="mt-1 text-orange-700 italic">Note: {m.nurse_notes}</p>}
                  </div>
                ))}
              </div>
            </section>

            {/* Chat log */}
            <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Chat Log</h2>
                <p className="text-xs text-gray-400">
                  Session: {latestSession?.started_at
                    ? new Date(latestSession.started_at).toLocaleString()
                    : 'None'}
                </p>
              </div>
              <ChatLogViewer messages={messages} />
            </section>

            {/* Tool logs */}
            <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 space-y-3">
              <h2 className="text-lg font-bold text-gray-900">AI Tool Logs</h2>
              {toolLogs.length === 0 && <p className="text-gray-400 text-sm">No tool calls recorded.</p>}
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {toolLogs.map((log) => (
                  <div key={log.id} className={`rounded-xl px-4 py-3 text-xs font-mono ${log.status === 'error' ? 'bg-red-50 border border-red-200' : log.status === 'mocked' ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50 border border-gray-100'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-purple-700">{log.tool_name}</span>
                      <span className={`rounded-full px-2 py-0.5 ${log.status === 'error' ? 'bg-red-200 text-red-800' : log.status === 'mocked' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
                        {log.status}
                      </span>
                      <span className="ml-auto text-gray-400">{new Date(log.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-gray-600 truncate">→ {JSON.stringify(log.output_json)}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right column — alerts */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800">
              Alerts
              <span className="ml-2 text-sm font-normal text-gray-400">({alerts.filter(a => a.status === 'open').length} open)</span>
            </h2>
            <AlertFeed alerts={alerts} />
          </div>
        </div>
      </main>
    </div>
  )
}
