# CareCompanion — Hospital Patient Assistant

A supervised AI assistant for hospital patients built for LMU Hacks 2026. --Won 1st Place

> **This is a demo application.** Not a medical device. The AI assistant does not diagnose, prescribe, or alter treatment plans. All responses are supervised and bounded by nurse-approved patient data.

---

## Product Overview

CareCompanion gives hospital patients a friendly, accessible AI interface to:
- Ask questions about their condition, medications, and schedule
- Control their room (TV, lights, bed position)
- Message or call family contacts
- Trigger nurse alerts — automatically for urgent symptoms, manually for comfort
- Speak and listen — full voice I/O via Web Speech API (Chrome/Edge)

Nurses get a dashboard to:
- View all admitted patients and open alerts
- Send direct messages to patients (visible in the patient's chat)
- Edit patient summaries (diagnoses, allergies, precautions) and medications
- Read full chat logs and audit all AI tool calls

---

## Architecture

```
carecompanion/
├── app/
│   ├── page.tsx                             # Login page (Supabase Auth)
│   ├── layout.tsx
│   ├── globals.css
│   ├── patient/[patientId]/page.tsx         # Patient-facing interface
│   ├── nurse/page.tsx                       # Nurse dashboard (patient roster + alert feed)
│   ├── nurse/patients/[patientId]/page.tsx  # Patient detail for nurse
│   └── api/
│       ├── chat/route.ts                    # Main AI chat handler (agentic tool-calling loop)
│       ├── devices/route.ts                 # Room device state (GET + POST)
│       ├── emergency/route.ts               # Emergency button → critical alert
│       ├── nurse-message/route.ts           # Nurse sends message to patient chat
│       ├── session-messages/route.ts        # Patient polls for new nurse messages (every 4s)
│       ├── medications/route.ts             # Create/update medications
│       ├── alerts/[alertId]/route.ts        # Alert status updates (acknowledge/resolve)
│       ├── messages/[id]/flag/route.ts      # Flag an AI response for review
│       └── summaries/[id]/route.ts          # Edit patient summary
├── components/
│   ├── patient/
│   │   ├── ChatWindow.tsx                   # Chat UI, suggestion chips, TTS playback
│   │   ├── VoiceButton.tsx                  # STT via Web Speech API (Chrome/Edge)
│   │   ├── SummaryCard.tsx                  # Patient health summary display
│   │   ├── MedicationCard.tsx               # Medication schedule
│   │   ├── RoomControls.tsx                 # TV/lights/bed/nurse call buttons
│   │   ├── ContactActions.tsx               # Call/text family by name
│   │   └── AlertBanner.tsx                  # Open alert notification banner
│   └── nurse/
│       ├── PatientCard.tsx                  # Patient list card with alert badges
│       ├── AlertFeed.tsx                    # Alert feed with acknowledge/resolve actions
│       ├── ChatLogViewer.tsx                # Read-only chat history with flag button
│       ├── NurseSummaryEditor.tsx           # Editable nurse-approved summary
│       ├── NurseMedicationEditor.tsx        # Add/edit/remove medications
│       └── NurseMessageSender.tsx           # Send direct messages to patient chat
├── lib/
│   ├── types.ts                             # Shared TypeScript types
│   ├── supabase/
│   │   ├── client.ts                        # Browser Supabase client
│   │   └── server.ts                        # Server + service-role clients
│   ├── ai/
│   │   ├── system-prompt.ts                 # AI guardrails, urgency keywords, alert thresholds
│   │   └── tool-registry.ts                 # Tool schemas + dispatcher
│   └── tools/
│       ├── getPatientSummary.ts
│       ├── getMedicationSchedule.ts
│       ├── callContact.ts                   # MOCKED — replace with Twilio
│       ├── sendMessage.ts                   # MOCKED — replace with Twilio
│       ├── createNurseAlert.ts
│       ├── controlRoomDevice.ts             # MOCKED — updates DB state, no real IoT
│       └── logInteraction.ts
└── supabase/
    ├── migrations/001_initial.sql
    └── seed.sql
```

**AI chat request flow:**
1. Patient sends message → `POST /api/chat`
2. Server pre-screens for urgent/alert keywords → auto-creates alert if triggered
3. OpenAI `gpt-4o-mini` processes message with tool-calling enabled
4. Tools execute server-side (Supabase service role) → results returned to model
5. Up to 5 rounds of tool calls; final response stored in `chat_messages`
6. Client receives response, optionally reads it aloud via `SpeechSynthesis`

---

## Database

All data lives in a real **Supabase (PostgreSQL)** database. The schema has 10 tables:

| Table | Description |
|-------|-------------|
| `profiles` | Auth users — role: `patient`, `nurse`, or `admin` |
| `patients` | Patient records — room number, admission status, assigned nurse |
| `patient_summaries` | Nurse-approved summaries — allergies, diagnoses, precautions |
| `medications` | Active medications with schedule and nurse notes |
| `chat_sessions` | Open chat sessions per patient |
| `chat_messages` | All messages: patient, assistant, nurse, system |
| `alerts` | Alerts with severity (`critical/high/medium/low`) and status (`open/acknowledged/resolved`) |
| `contacts` | Family/emergency contacts with `can_call` / `can_text` flags |
| `room_devices` | TV, lights, bed, nurse call — state stored as JSON |
| `tool_logs` | Audit trail of all AI tool calls (input, output, status) |

Row-level security (RLS) is enabled on all tables. In this demo build, policies are open (`FOR ALL USING (true)`) — tighten before production.

### Known schema gotchas

- **FK ambiguity**: `patients` has two FK columns to `profiles` (`profile_id` for the patient and `nurse_id` for the assigned nurse). Always disambiguate: `select('*, profiles!profile_id(*)')`.
- **Non-standard UUIDs**: Demo seed UUIDs use version 0 / variant 0 (e.g. `aaaaaaaa-0000-0000-0000-000000000001`). These fail Zod v4's strict `.uuid()`. The codebase uses a lenient regex validator instead.

---

## Authentication

Login uses **real Supabase Auth** (`supabase.auth.signInWithPassword()`). On success, the user's `profile.role` determines where they are redirected.

**Demo credentials:**

| Username | Password | Destination |
|----------|----------|-------------|
| `admin` | `password123` | `/nurse` |
| `patient` | `password123` | `/patient/aaaaaaaa-0000-0000-0000-000000000001` |

Credentials are seeded in `supabase/seed.sql`. The session is stored via Supabase SSR cookies and validated server-side.

---

## What Is Mocked vs Real

| Feature | Status | Notes |
|---------|--------|-------|
| Authentication | ✅ Real | Supabase Auth with seeded demo users |
| Supabase database | ✅ Real | Fully live PostgreSQL |
| OpenAI chat + tool-calling | ✅ Real | `gpt-4o-mini`; requires `OPENAI_API_KEY` |
| Patient summary retrieval | ✅ Real | Reads from `patient_summaries` table |
| Medication schedule | ✅ Real | Reads from `medications` table |
| Nurse alert creation | ✅ Real | Writes to `alerts` table |
| Nurse → patient messaging | ✅ Real | Writes to `chat_messages`, patient polls every 4s |
| Tool audit logs | ✅ Real | All tool calls logged to `tool_logs` |
| Voice input (STT) | ✅ Real | Web Speech API (`SpeechRecognition`) — Chrome/Edge only |
| Voice output (TTS) | ✅ Real | Web Speech API (`SpeechSynthesis`) — Chrome/Edge only |
| Room device state | 🟡 Mocked | Persists JSON to DB; no real IoT/hardware calls |
| Phone calls | 🟡 Mocked | Logs to console — swap `lib/tools/callContact.ts` for Twilio |
| SMS messages | 🟡 Mocked | Logs to console — swap `lib/tools/sendMessage.ts` for Twilio |

---

## Local Setup

### Prerequisites
- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier works)
- An [OpenAI](https://platform.openai.com) API key

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env.local
```
Fill in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=       # Supabase Dashboard > Project Settings > API
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # "anon public" key
SUPABASE_SERVICE_ROLE_KEY=      # "service_role" key — never expose to client!
OPENAI_API_KEY=                 # platform.openai.com/api-keys
NEXT_PUBLIC_DEMO_PATIENT_1=aaaaaaaa-0000-0000-0000-000000000001
NEXT_PUBLIC_DEMO_PATIENT_2=aaaaaaaa-0000-0000-0000-000000000002
```

### 3. Apply database migrations
```bash
# Option A: Paste supabase/migrations/001_initial.sql into Supabase SQL Editor
# Option B: Supabase CLI
npx supabase db push
```

### 4. Seed demo data
```bash
# Paste supabase/seed.sql into Supabase SQL Editor
# or:
psql $DATABASE_URL -f supabase/seed.sql
```

### 5. Run
```bash
npm run dev
# Open http://localhost:3000
```

---

## Demo Flow

1. Go to `http://localhost:3000` — you'll see the login page
2. Log in as `patient` / `password123` to enter the patient view for John Martinez (Room 214A)
3. Try the chat (type or use mic in Chrome/Edge), room controls, contact buttons, and emergency button
4. Log in as `admin` / `password123` to enter the nurse dashboard
5. From the nurse dashboard, click a patient to open the detail view — send a message, edit their summary, or acknowledge alerts

---

## AI Tool System

Six tools are available to the AI via OpenAI function calling:

| Tool | Description |
|------|-------------|
| `getPatientSummary` | Retrieve nurse-approved summary, allergies, diagnoses, precautions |
| `getMedicationSchedule` | List active medications |
| `createNurseAlert` | Alert the nursing team with a severity level |
| `callContact` | Initiate a call to a family member (by name) |
| `sendMessage` | Send SMS to a contact (by name) |
| `controlRoomDevice` | Control TV, lights, bed, or nurse call button |

**Security:** `dispatchTool()` always injects `patientId` from server-side request context — never from the AI's own arguments — to prevent prompt injection.

**Alert pre-screening:** Before the OpenAI call, `/api/chat` scans the message for keywords. Urgent matches (e.g. "can't breathe", "chest pain") auto-create a critical alert. Secondary matches (e.g. "pain", "call nurse") auto-create a medium alert. The AI then continues with its own judgment on top.

### Adding a new tool

1. Create `lib/tools/myTool.ts` — implement and call `logInteraction()`
2. Add the OpenAI schema to `TOOL_DEFINITIONS` in `lib/ai/tool-registry.ts`
3. Add a `case` to `dispatchTool()` in the same file

---

## Modifying Assistant Rules

**`lib/ai/system-prompt.ts`** — Edit the system prompt to change allowed topics, tone, or mandatory escalation thresholds. `URGENT_KEYWORDS` and `ALERT_KEYWORDS` control the pre-screening step in `/api/chat`.

---

## Known Limitations

1. **No real-time push**: Nurse dashboard requires manual refresh for new patients/alerts. Patient chat polls for nurse messages every 4 seconds. Add Supabase Realtime subscriptions for true live updates.
2. **Voice is Chrome/Edge only**: Web Speech API (`SpeechRecognition` / `SpeechSynthesis`) is not supported in Firefox or Safari.
3. **Open RLS policies**: All tables are fully readable/writable by any authenticated user. Scope RLS policies per role before any real deployment.
4. **No session expiry handling**: The demo doesn't redirect on expired sessions.
5. **Single active session per patient**: No multi-device or multi-tab support.

---

## Next Features to Build

1. **Supabase Realtime** — WebSocket subscriptions to push new alerts/messages to nurses and patients instantly
2. **Twilio integration** — Real SMS and voice calls via `lib/tools/sendMessage.ts` and `lib/tools/callContact.ts`
3. **IoT room control** — Replace mocked `controlRoomDevice.ts` with a real hospital room-control API or MQTT gateway
4. **Mobile push notifications** — Service worker + Realtime to alert nurses on their phones during off-screen time
5. **Shift handoff report** — Auto-generate a per-patient shift summary from alerts, tool logs, and chat history

---

## Production Hardening Checklist

- [ ] Scope RLS policies per role (patient can only read their own data; nurse can read their assigned patients)
- [ ] Never expose the service role key to the client
- [ ] Rate limit `/api/chat` (e.g., Upstash)
- [ ] Add content moderation before and after OpenAI calls
- [ ] Twilio integration for real calls and SMS
- [ ] HIPAA-compliant audit logging
- [ ] Supabase Auth MFA for nurses
- [ ] Session expiry redirect handling
- [ ] Accessibility audit (WCAG 2.1 AA) — especially for voice-dependent interactions
