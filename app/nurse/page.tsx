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
    <div className="min-h-screen bg-gray-100">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-300 px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Nurse Administration Dashboard</h1>
            <div className="flex items-center gap-4 mt-0.5">
              <p className="text-xs text-gray-500">
                Active Patients: {patients.length} | Pending Alerts: {totalOpen}
              </p>
              {criticalCount > 0 && (
                <span className="border border-red-500 bg-white px-2 py-0.5 text-xs font-semibold text-red-600 uppercase tracking-wide">
                  Critical: {criticalCount}
                </span>
              )}
            </div>
          </div>
          <SignOutButton className="border border-gray-400 bg-gray-200 px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-300 transition" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Patient list */}
          <div className="lg:col-span-2 bg-white border border-gray-300">
            <div className="border-b border-gray-300 px-4 py-2.5">
              <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Patient Roster</h2>
            </div>
            <div className="p-4">
              {patients.length === 0 && (
                <div className="border border-gray-300 bg-gray-50 px-6 py-10 text-center text-gray-500 text-sm">
                  No admitted patients found.
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
          <div className="bg-white border border-gray-300 h-fit">
            <div className="border-b border-gray-300 px-4 py-2.5 flex justify-between items-center">
              <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">System Alerts</h2>
              {totalOpen > 0 && (
                <span className="border border-red-500 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                  {totalOpen} PENDING
                </span>
              )}
            </div>
            <div className="p-4">
              <AlertFeed alerts={alerts} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
