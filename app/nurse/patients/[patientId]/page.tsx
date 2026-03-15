import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Pill } from 'lucide-react'
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

  const latestSession = sessions[0]
  const messagesRes = latestSession
    ? await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', latestSession.id)
        .order('created_at', { ascending: true })
    : null
  const messages = (messagesRes?.data ?? []).slice().reverse()

  const name = patient.profiles?.full_name ?? 'Unknown'
  const emergencyContact = [patient.emergency_contact_name, patient.emergency_contact_phone]
    .filter(Boolean)
    .join(' · ') || '—'

  return (
    <main className="h-screen overflow-hidden bg-slate-100 p-4">
      <div className="mx-auto flex h-full max-w-400 flex-col gap-4">
        {/* Header */}
        <section className="flex shrink-0 items-center rounded-3xl bg-emerald-700 px-4 py-3 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href="/nurse"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20 transition"
            >
              <ArrowLeft className="h-3 w-3" />
              Dashboard
            </Link>
            <div>
              <h1 className="text-base font-bold">{name}</h1>
              <p className="text-xs text-emerald-100">
                Room {patient.room_number} · {patient.admission_status} · DOB{' '}
                {patient.date_of_birth
                  ? new Date(patient.date_of_birth).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>
        </section>

        {/* Main dashboard */}
        <div className="grid min-h-0 flex-1 grid-cols-12 gap-4">
          {/* Left column */}
          <div className="col-span-3 flex min-h-0 flex-col gap-4">
            <Card className="shrink-0 p-3">
              <div className="mb-2 flex items-center gap-2">
                <User className="h-4 w-4 text-slate-600" />
                <h2 className="text-sm font-bold text-slate-900">Profile</h2>
              </div>
              <div className="space-y-2 text-xs">
                <InfoRow label="Full Name" value={name} />
                <InfoRow label="Room" value={patient.room_number} />
                <InfoRow label="Status" value={patient.admission_status} />
                <InfoRow label="Emergency Contact" value={emergencyContact} />
                {contacts.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Family Contacts
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {contacts.map((c) => (
                        <span
                          key={c.id}
                          className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700"
                        >
                          {c.name} ({c.relationship}) · {c.phone}
                          {c.can_call && ' 📞'}
                          {c.can_text && ' 💬'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

<Card className="min-h-0 flex-1 flex flex-col p-3">
              <div className="mb-2 shrink-0">
                <h2 className="text-sm font-bold text-slate-900">
                  Alerts
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    ({alerts.filter((a) => a.status === 'open').length} open)
                  </span>
                </h2>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                <AlertFeed alerts={alerts} />
              </div>
            </Card>
          </div>

          {/* Center column */}
          <div className="col-span-6 flex min-h-0 flex-col gap-4">
            {summary && (
              <div className="shrink-0">
                <NurseSummaryEditor summary={summary} nurseId={DEMO_NURSE_ID} />
              </div>
            )}

            <Card className="min-h-0 flex-1 flex flex-col p-3">
              <div className="mb-2 shrink-0 flex items-center gap-2">
                <Pill className="h-4 w-4 text-slate-600" />
                <h2 className="text-sm font-bold text-slate-900">Medications</h2>
              </div>
              <div className="flex-1 min-h-0 space-y-2 overflow-y-auto pr-1">
                {medications.length === 0 && (
                  <p className="text-xs text-slate-400">No medications on file.</p>
                )}
                {medications.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-xs font-semibold text-slate-900">
                          {m.med_name} — {m.dose}
                        </h3>
                        {m.schedule_text && (
                          <p className="mt-0.5 text-[11px] text-slate-600">⏰ {m.schedule_text}</p>
                        )}
                        {m.nurse_notes && (
                          <p className="mt-0.5 text-[11px] italic text-orange-600">{m.nurse_notes}</p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          m.active
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {m.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="col-span-3 flex min-h-0 flex-col">
            <Card className="flex-1 min-h-0 flex flex-col p-3">
              <div className="mb-2 shrink-0 flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-slate-900">Chat Log</h2>
                <span className="text-[10px] text-slate-400">
                  {latestSession?.started_at
                    ? new Date(latestSession.started_at).toLocaleString()
                    : 'No session'}
                </span>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                <ChatLogViewer messages={messages} />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

function Card({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </section>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-medium text-slate-900">{value}</p>
    </div>
  )
}

