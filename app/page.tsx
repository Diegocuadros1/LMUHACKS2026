import Link from 'next/link'

const DEMO_PATIENT_1 = process.env.NEXT_PUBLIC_DEMO_PATIENT_1 ?? 'aaaaaaaa-0000-0000-0000-000000000001'
const DEMO_PATIENT_2 = process.env.NEXT_PUBLIC_DEMO_PATIENT_2 ?? 'aaaaaaaa-0000-0000-0000-000000000002'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-700 to-blue-900 px-4 py-16">
      <div className="w-full max-w-lg text-center space-y-4">
        <div className="text-6xl">🏥</div>
        <h1 className="text-5xl font-extrabold tracking-tight text-white">CareCompanion</h1>
        <p className="text-xl text-blue-200">
          AI-powered hospital patient assistant.<br />
          Not a diagnostic tool — always supervised by your care team.
        </p>
      </div>

      <div className="mt-12 w-full max-w-lg space-y-4">
        <p className="text-center text-sm font-semibold uppercase tracking-widest text-blue-300">
          Demo — Select a view
        </p>

        <div className="rounded-2xl bg-white/10 p-6 space-y-3 backdrop-blur-sm">
          <p className="text-sm font-semibold text-blue-200">Patient Views</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              href={`/patient/${DEMO_PATIENT_1}`}
              className="flex flex-col items-center gap-2 rounded-xl bg-white px-4 py-5 text-center shadow hover:shadow-md transition hover:bg-blue-50"
            >
              <span className="text-3xl">👴</span>
              <p className="font-bold text-gray-900">John Martinez</p>
              <p className="text-sm text-gray-500">Room 214A · Diabetes</p>
            </Link>
            <Link
              href={`/patient/${DEMO_PATIENT_2}`}
              className="flex flex-col items-center gap-2 rounded-xl bg-white px-4 py-5 text-center shadow hover:shadow-md transition hover:bg-blue-50"
            >
              <span className="text-3xl">👩</span>
              <p className="font-bold text-gray-900">Maria Thompson</p>
              <p className="text-sm text-gray-500">Room 307B · Post-op</p>
            </Link>
          </div>
        </div>

        <Link
          href="/nurse"
          className="flex items-center justify-center gap-3 rounded-xl bg-green-500 px-6 py-5 text-lg font-bold text-white shadow hover:bg-green-600 transition"
        >
          <span className="text-2xl">🩺</span>
          Nurse Dashboard
        </Link>
      </div>

      <p className="mt-12 text-xs text-blue-400 max-w-sm text-center">
        Demo application for hackathon purposes only. No real patient data.
        AI responses are not medical advice.
      </p>
    </div>
  )
}
