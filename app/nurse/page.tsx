import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { PatientCard } from '@/components/nurse/PatientCard'
import { AlertFeed } from '@/components/nurse/AlertFeed'
import type { Alert } from '@/lib/types'

export const revalidate = 0 // always fresh

export default async function NurseDashboard() {
  const supabase = createServiceClient()

  const [patientsRes, alertsRes] = await Promise.all([
    supabase
      .from('patients')
      .select('*, profiles(*)')
      .eq('admission_status', 'admitted')
      .order('created_at'),
    supabase
      .from('alerts')
      .select('*')
      .in('status', ['open', 'acknowledged'])
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const patients = patientsRes.data ?? []
  const alerts: Alert[] = alertsRes.data ?? []

  const alertsByPatient = alerts.reduce<Record<string, Alert[]>>((acc, a) => {
    acc[a.patient_id] = acc[a.patient_id] ?? []
    acc[a.patient_id].push(a)
    return acc
  }, {})

  const totalOpen = alerts.filter((a) => a.status === 'open').length
  const criticalCount = alerts.filter((a) => a.severity === 'critical' && a.status === 'open').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-green-700 px-4 py-4 shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white">🩺 Nurse Dashboard</h1>
            <p className="text-sm text-green-200">
              {patients.length} admitted patients · {totalOpen} open alerts
              {criticalCount > 0 && (
                <span className="ml-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                  {criticalCount} CRITICAL
                </span>
              )}
            </p>
          </div>
          <Link href="/" className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition">
            ← Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Patient list */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Patients</h2>
            {patients.length === 0 && (
              <div className="rounded-2xl bg-white px-6 py-10 text-center text-gray-400 shadow-sm">
                No admitted patients found.
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {patients.map((p) => (
                <PatientCard
                  key={p.id}
                  patient={p}
                  openAlerts={alertsByPatient[p.id] ?? []}
                />
              ))}
            </div>
          </div>

          {/* Alert feed sidebar */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800">
              Alert Feed
              {totalOpen > 0 && (
                <span className="ml-2 rounded-full bg-red-100 px-2.5 py-0.5 text-sm font-semibold text-red-700">
                  {totalOpen}
                </span>
              )}
            </h2>
            <AlertFeed alerts={alerts} />
          </div>
        </div>
      </main>
    </div>
  )
}
