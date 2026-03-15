import { createServiceClient } from "@/lib/supabase/server";
import { PatientCard } from "@/components/nurse/PatientCard";
import { AlertFeed } from "@/components/nurse/AlertFeed";
import { SignOutButton } from "@/components/SignOutButton";
import type { Alert } from "@/lib/types";

export const revalidate = 0; // always fresh

export default async function NurseDashboard() {
  const supabase = createServiceClient();

  const [patientsRes, alertsRes] = await Promise.all([
    supabase
      .from("patients")
      .select("*, profiles!profile_id(*)")
      .eq("admission_status", "admitted")
      .order("created_at"),
    supabase
      .from("alerts")
      .select("*")
      .in("status", ["open", "acknowledged"])
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const patients = patientsRes.data ?? [];
  const alerts: Alert[] = alertsRes.data ?? [];

  const alertsByPatient = alerts.reduce<Record<string, Alert[]>>((acc, a) => {
    acc[a.patient_id] = acc[a.patient_id] ?? [];
    acc[a.patient_id].push(a);
    return acc;
  }, {});

  const totalOpen = alerts.filter((a) => a.status === "open").length;
  const criticalCount = alerts.filter(
    (a) => a.severity === "critical" && a.status === "open",
  ).length;

  return (
    <div className="min-h-screen bg-[#f4f5f8] font-sans">
      {/* 2000s Enterprise Header */}
      <header className="sticky top-0 z-10 bg-[#003366] border-b-2 border-[#a0a0a0] px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white uppercase tracking-wider">
              Nurse Administration Dashboard
            </h1>
            <p className="text-xs text-[#cccccc] mt-1">
              Active Patients: {patients.length} | Pending Alerts: {totalOpen}
              {criticalCount > 0 && (
                <span className="ml-3 border border-white bg-[#cc0000] px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-widest">
                  Critical: {criticalCount}
                </span>
              )}
            </p>
          </div>
          <SignOutButton className="bg-[#e1e1e1] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-3 py-1 text-xs font-bold text-black uppercase active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Patient list */}
          <div className="lg:col-span-2 space-y-0 border border-[#a0a0a0] bg-[#f9f9f9] shadow-sm">
            {/* Panel Header */}
            <div className="bg-[#cccccc] border-b border-[#a0a0a0] px-3 py-1.5">
              <h2 className="text-xs font-bold text-[#333] uppercase tracking-wide">
                Patient Roster
              </h2>
            </div>

            <div className="p-3">
              {patients.length === 0 && (
                <div className="border border-[#cccccc] bg-white px-6 py-10 text-center text-[#666] text-sm">
                  No admitted patients found in current query.
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                {patients.map((p) => (
                  <PatientCard
                    key={p.id}
                    patient={p}
                    openAlerts={alertsByPatient[p.id] ?? []}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Alert feed sidebar */}
          <div className="space-y-0 border border-[#a0a0a0] bg-[#f9f9f9] shadow-sm h-fit">
            {/* Panel Header */}
            <div className="bg-[#cccccc] border-b border-[#a0a0a0] px-3 py-1.5 flex justify-between items-center">
              <h2 className="text-xs font-bold text-[#333] uppercase tracking-wide">
                System Alerts
              </h2>
              {totalOpen > 0 && (
                <span className="border border-[#cc0000] bg-white px-1.5 py-0.5 text-[10px] font-bold text-[#cc0000]">
                  {totalOpen} PENDING
                </span>
              )}
            </div>

            <div className="p-3">
              <AlertFeed alerts={alerts} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
