import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Pill } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'
import { NurseSummaryEditor } from '@/components/nurse/NurseSummaryEditor'
import { NurseMessageSender } from '@/components/nurse/NurseMessageSender'
import { MedicationEditor } from '@/components/nurse/MedicationEditor'
import { ChatLogViewer } from '@/components/nurse/ChatLogViewer'
import { AlertFeed } from '@/components/nurse/AlertFeed'
import type { ToolLog } from '@/lib/types'

interface Props {
  params: Promise<{ patientId: string }>;
}

const DEMO_NURSE_ID = "00000000-0000-0000-0000-000000000001";

export default async function NursePatientDetailPage({ params }: Props) {
  const { patientId } = await params;
  const supabase = createServiceClient();

  const [
    patientRes,
    summaryRes,
    medsRes,
    contactsRes,
    alertsRes,
    sessionsRes,
    toolLogsRes,
  ] = await Promise.all([
    supabase
      .from("patients")
      .select("*, profiles!profile_id(*)")
      .eq("id", patientId)
      .single(),
    supabase
      .from("patient_summaries")
      .select("*")
      .eq("patient_id", patientId)
      .single(),
    supabase
      .from("medications")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at"),
    supabase
      .from("contacts")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at"),
    supabase
      .from("alerts")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("chat_sessions")
      .select("*")
      .eq("patient_id", patientId)
      .order("started_at", { ascending: false })
      .limit(5),
    supabase
      .from("tool_logs")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (patientRes.error || !patientRes.data) notFound();

  const patient = patientRes.data
  const summary = summaryRes.data
  const medications = medsRes.data ?? []
  const contacts = contactsRes.data ?? []
  const alerts = alertsRes.data ?? []
  const sessions = sessionsRes.data ?? []

  const latestSession = sessions[0];
  const messagesRes = latestSession
    ? await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", latestSession.id)
        .order("created_at", { ascending: true })
    : null;
  const messages = (messagesRes?.data ?? []).slice().reverse();

  const name = patient.profiles?.full_name ?? "Unknown";
  const emergencyContact =
    [patient.emergency_contact_name, patient.emergency_contact_phone]
      .filter(Boolean)
      .join(" · ") || "—";

  return (
    <main className="h-screen bg-slate-100 p-4">
      <div className="mx-auto flex h-full max-w-400 flex-col gap-4">
        {/* Header */}
<section className="flex shrink-0 items-center border-2 border-[#a0a0a0] bg-[#003366] px-4 py-3 text-white shadow-none rounded-none">
          <div className="flex items-center gap-4">
            <Link
              href="/nurse"
              className="bg-[#cccccc] border-2 border-t-[#ffffff] border-l-[#ffffff] border-r-[#808080] border-b-[#808080] px-3 py-1 text-[11px] font-bold text-black uppercase active:border-t-[#808080] active:border-l-[#808080] active:border-r-[#ffffff] active:border-b-[#ffffff] no-underline shadow-none rounded-none flex items-center gap-1 cursor-pointer transition-none"
            >
              <ArrowLeft className="h-3 w-3" />
              [ DASHBOARD ]
            </Link>
            <div>
              <h1 className="text-[15px] font-bold uppercase tracking-wider text-white">
                {name}
              </h1>
              <p className="text-[11px] text-[#cccccc] uppercase mt-0.5">
                <span className="font-bold text-white">RM:</span>{" "}
                {patient.room_number} |
                <span className="font-bold text-white ml-2"> STAT:</span>{" "}
                {patient.admission_status} |
                <span className="font-bold text-white ml-2"> DOB:</span>{" "}
                {patient.date_of_birth
                  ? new Date(patient.date_of_birth).toLocaleDateString(
                      "en-US",
                      {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric",
                      },
                    )
                  : "N/A"}
              </p>
            </div>
          </div>
        </section>

        {/* Main dashboard */}
        <div className="grid min-h-0 flex-1 grid-cols-12 gap-4">
          {/* Left column */}
          <div className="col-span-3 flex min-h-0 flex-col gap-4">
            <Card className="shrink-0 border border-[#a0a0a0] bg-[#f9f9f9] rounded-none shadow-none p-0 font-sans">
              {/* 2000s Panel Header */}
              <div className="bg-[#cccccc] border-b border-[#a0a0a0] px-3 py-1.5 flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-[#333]" />
                <h2 className="text-xs font-bold text-[#333] uppercase tracking-wide">
                  Patient Profile
                </h2>
              </div>

              <div className="p-3 space-y-3 text-xs">
                <div className="space-y-1">
                  <InfoRow label="Full Name" value={name} />
                  <InfoRow
                    label="Room"
                    value={patient.room_number.toString()}
                  />
                  <InfoRow label="Status" value={patient.admission_status} />
                  <InfoRow label="Emerg. Contact" value={emergencyContact} />
                </div>

                {contacts.length > 0 && (
                  <div className="pt-2 border-t border-[#cccccc]">
                    <p className="text-[10px] font-bold uppercase tracking-tight text-[#666] mb-1.5">
                      Family Contacts
                    </p>
                    <div className="flex flex-col gap-1">
                      {contacts.map((c) => (
                        <div
                          key={c.id}
                          className="border border-[#cccccc] bg-white px-2 py-1 text-[10px] text-[#333] rounded-none uppercase"
                        >
                          <span className="font-bold">{c.name}</span> (
                          {c.relationship})<br />
                          {c.phone}
                          {c.can_call && (
                            <span className="ml-1 text-[#006600]">[VOICE]</span>
                          )}
                          {c.can_text && (
                            <span className="ml-1 text-[#0033cc]">[SMS]</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card className="min-h-0 flex-1 flex flex-col rounded-none border border-[#a0a0a0] bg-[#f9f9f9] p-0 shadow-none">
              {/* 2000s Panel Header */}
              <div className="bg-[#cccccc] border-b border-[#a0a0a0] px-3 py-1.5 shrink-0 flex justify-between items-center">
                <h2 className="text-xs font-bold text-[#333] uppercase tracking-wide">
                  System Alerts
                </h2>
                <span className="text-[10px] font-bold text-[#666] uppercase">
                  ({alerts.filter((a) => a.status === "open").length} PENDING)
                </span>
              </div>

              {/* Feed Container */}
              <div className="flex-1 min-h-0 overflow-y-auto p-2">
                <AlertFeed alerts={alerts} />
              </div>
            </Card>
          </div>

          {/* Center column */}
          <div className="col-span-6 flex min-h-0 flex-col gap-4">
            <div className="shrink-0">
              <NurseMessageSender sessionId={latestSession?.id ?? ''} patientName={name} />
            </div>

            <div className="shrink-0">
              <NurseSummaryEditor summary={summary} patientId={patientId} nurseId={DEMO_NURSE_ID} />
            </div>

            <Card className="min-h-50 flex-1 flex flex-col rounded-none border border-[#a0a0a0] bg-[#f9f9f9] p-0 shadow-none">
              <div className="bg-[#cccccc] border-b border-[#a0a0a0] px-3 py-1.5 shrink-0 flex items-center gap-2">
                <Pill className="h-4 w-4 text-[#333]" />
                <h2 className="text-xs font-bold text-[#333] uppercase tracking-wide">
                  Medications
                </h2>
              </div>
              <div className="flex-1 min-h-0 flex flex-col">
                <MedicationEditor patientId={patientId} initialMedications={medications} />
              </div>
            </Card>
          </div>

          {/* Right column */}
<<<<<<< HEAD
          <div className="col-span-3 flex min-h-0 flex-col gap-4">
            <Card className="flex-1 min-h-0 flex flex-col rounded-none border border-[#a0a0a0] bg-[#f9f9f9] p-0 shadow-none overflow-hidden">
              {/* 2000s Panel Header */}
              <div className="bg-[#cccccc] border-b border-[#a0a0a0] px-3 py-1.5 flex items-center justify-between shrink-0">
                <h2 className="text-xs font-bold text-[#333] uppercase tracking-wide">
                  Chat Log
                </h2>
                <span className="text-[10px] font-bold text-[#555] uppercase">
=======
          <div className="col-span-3 flex min-h-0 flex-col">
            <Card className="flex-1 min-h-0 flex flex-col p-3">
              <div className="mb-2 shrink-0 flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-slate-900">Chat Log</h2>
                <span className="text-[10px] text-slate-400">
>>>>>>> c2f86ce6644a65edc329692c8b242a0731f76b8d
                  {latestSession?.started_at
                    ? new Date(latestSession.started_at).toLocaleString("en-US")
                    : "NO ACTIVE SESSION"}
                </span>
              </div>

              {/* Viewer Container */}
              <div className="flex-1 min-h-0 flex flex-col p-2">
                <ChatLogViewer messages={messages} />
              </div>
            </Card>
<<<<<<< HEAD

            <Card className="shrink-0 border border-[#a0a0a0] bg-[#f9f9f9] rounded-none shadow-none p-0 font-sans">
              {/* 2000s Panel Header */}
              <div className="bg-[#cccccc] border-b border-[#a0a0a0] px-3 py-1.5 shrink-0">
                <h2 className="text-xs font-bold text-[#333] uppercase tracking-wide">
                  System Tool Logs
                </h2>
              </div>

              <div className="p-2">
                {toolLogs.length === 0 ? (
                  <p className="text-[11px] text-[#666] uppercase p-2 border border-[#cccccc] bg-white text-center">
                    No tool calls recorded.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {toolLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`border p-2 text-[10px] font-mono rounded-none ${
                          log.status === "error"
                            ? "border-[#cc0000] bg-[#fff0f0]"
                            : log.status === "mocked"
                              ? "border-[#cca300] bg-[#ffffe6]"
                              : "border-[#a0a0a0] bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-dotted border-[#cccccc] pb-1 mb-1">
                          <span className="font-bold text-[#800080] uppercase">
                            SYS:{log.tool_name}
                          </span>
                          <span
                            className={`border px-1 py-0.5 font-bold uppercase rounded-none ${
                              log.status === "error"
                                ? "border-[#cc0000] text-[#cc0000] bg-white"
                                : log.status === "mocked"
                                  ? "border-[#cca300] text-[#806600] bg-white"
                                  : "border-[#006600] text-black bg-[#e6ffe6]"
                            }`}
                          >
                            {log.status}
                          </span>
                        </div>

                        <div className="flex justify-between items-start pt-1">
                          <p className="text-[#333] truncate w-[75%]">
                            -&gt; {JSON.stringify(log.output_json)}
                          </p>
                          <span className="text-[#666] text-[9px]">
                            {new Date(log.created_at).toLocaleTimeString(
                              "en-US",
                              { hour12: false },
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
=======
>>>>>>> c2f86ce6644a65edc329692c8b242a0731f76b8d
          </div>
        </div>
      </div>
    </main>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-medium text-slate-900">{value}</p>
    </div>
  );
}
