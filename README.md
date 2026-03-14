# CareCompanion — Hospital Patient Assistant MVP

A supervised AI assistant for hospital patients built for LMU Hacks 2026.

> ⚠️ **This is a demo application.** Not a medical device. The AI assistant does not diagnose, prescribe, or alter treatment plans. All responses are supervised and bounded by nurse-approved patient data.

---

## Product Overview

CareCompanion gives hospital patients a friendly, accessible AI interface to:
- Ask questions about their condition, medications, and schedule
- Control their room (TV, lights, bed position)
- Message or call family contacts
- Trigger nurse alerts — automatically for urgent symptoms, manually for comfort

Nurses get a dashboard to:
- View all admitted patients and open alerts
- Edit and approve patient summaries (what the AI can reference)
- Read full chat logs and flag incorrect AI responses
- View a timeline of all AI tool calls

---

## Architecture

```
carecompanion/
├── app/
│   ├── page.tsx                        # Demo landing page
│   ├── layout.tsx
│   ├── globals.css
│   ├── patient/[patientId]/page.tsx    # Patient-facing interface
│   ├── nurse/page.tsx                  # Nurse dashboard
│   ├── nurse/patients/[patientId]/     # Patient detail for nurse
│   └── api/
│       ├── chat/route.ts               # Main AI chat handler (tool-calling loop)
│       ├── devices/route.ts            # Room device control
│       ├── contacts/call/route.ts      # Call contact
│       ├── contacts/message/route.ts   # SMS contact
│       ├── emergency/route.ts          # Emergency button
│       ├── alerts/[alertId]/route.ts   # Alert status updates
│       ├── messages/[id]/flag/route.ts # Flag AI response
│       └── summaries/[id]/route.ts     # Edit patient summary
├── components/
│   ├── patient/
│   │   ├── ChatWindow.tsx              # Main chat UI with suggestion chips
│   │   ├── VoiceButton.tsx             # Mic button (mocked STT — swap real SDK here)
│   │   ├── SummaryCard.tsx             # Patient health summary display
│   │   ├── MedicationCard.tsx          # Medication schedule
│   │   ├── RoomControls.tsx            # TV/lights/bed/nurse call buttons
│   │   ├── ContactActions.tsx          # Call/text family
│   │   └── AlertBanner.tsx             # Alert notification banner
│   └── nurse/
│       ├── PatientCard.tsx             # Patient list card with alert badges
│       ├── AlertFeed.tsx               # Alert feed with acknowledge/resolve
│       ├── ChatLogViewer.tsx           # Chat history with flag button
│       └── NurseSummaryEditor.tsx      # Editable approved summary
├── lib/
│   ├── types.ts                        # Shared TypeScript types
│   ├── supabase/
│   │   ├── client.ts                   # Browser-side Supabase client
│   │   └── server.ts                   # Server + service-role clients
│   ├── ai/
│   │   ├── system-prompt.ts            # AI guardrails + urgency keywords
│   │   └── tool-registry.ts            # Tool schemas + dispatcher
│   └── tools/
│       ├── getPatientSummary.ts
│       ├── getMedicationSchedule.ts
│       ├── callContact.ts              # MOCKED — replace with Twilio
│       ├── sendMessage.ts              # MOCKED — replace with Twilio
│       ├── createNurseAlert.ts
│       ├── controlRoomDevice.ts        # MOCKED — persists state to DB
│       └── logInteraction.ts
└── supabase/
    ├── migrations/001_initial.sql
    └── seed.sql
```

**Data flow:**
1. Patient sends message → `POST /api/chat`
2. Server pre-screens for urgent keywords → auto-creates critical alert if triggered
3. OpenAI GPT-4o-mini processes message with tool-calling enabled
4. Tools execute server-side (Supabase service role) → results returned to model
5. Final response stored in `chat_messages` → returned to client

---

## Local Setup

### 1. Prerequisites
- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier works)
- An [OpenAI](https://platform.openai.com) API key

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env.local
```
Edit `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase Dashboard > Project Settings > API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — same page, "anon public" key
- `SUPABASE_SERVICE_ROLE_KEY` — same page, "service_role" key (keep secret!)
- `OPENAI_API_KEY` — from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### 4. Database (already applied via Supabase MCP)
If starting fresh:
```bash
# Option A: Paste supabase/migrations/001_initial.sql into Supabase SQL Editor
# Option B: Supabase CLI
npx supabase db push
```

### 5. Seed demo data (already seeded)
```bash
# Paste supabase/seed.sql into Supabase SQL Editor
# or: psql $DATABASE_URL -f supabase/seed.sql
```

### 6. Run
```bash
npm run dev
# Open http://localhost:3000
```

---

## Demo Navigation

| URL | Description |
|-----|-------------|
| `/` | Landing page with demo links |
| `/patient/aaaaaaaa-0000-0000-0000-000000000001` | John Martinez — Room 214A |
| `/patient/aaaaaaaa-0000-0000-0000-000000000002` | Maria Thompson — Room 307B |
| `/nurse` | Nurse dashboard |
| `/nurse/patients/aaaaaaaa-0000-0000-0000-000000000001` | John's detail view |

---

## Modifying Assistant Rules

**`lib/ai/system-prompt.ts`**
- Edit the system prompt to change what topics are allowed
- Add/remove items from `URGENT_KEYWORDS` to tune escalation triggers

**`lib/ai/tool-registry.ts`**
- Add a new tool: define the JSON schema in `TOOL_DEFINITIONS`, add a case in `dispatchTool()`
- Implement the handler in `lib/tools/yourTool.ts`

---

## What Is Mocked vs Real

| Feature | Status | Notes |
|---------|--------|-------|
| OpenAI chat + tool-calling | ✅ Real | GPT-4o-mini; requires `OPENAI_API_KEY` |
| Supabase database | ✅ Real | Fully live |
| Patient summary retrieval | ✅ Real | From `patient_summaries` table |
| Medication schedule | ✅ Real | From `medications` table |
| Nurse alert creation | ✅ Real | Writes to `alerts` table |
| Room device state | ✅ Real | Persists `state_json` to DB |
| Phone calls | 🟡 Mocked | `lib/tools/callContact.ts` — swap for Twilio |
| SMS messages | 🟡 Mocked | `lib/tools/sendMessage.ts` — swap for Twilio |
| Hardware room control | 🟡 Mocked | IoT gateway integration point |
| Voice input (mic) | 🟡 Mocked | `VoiceButton.tsx` — swap for Web Speech API |
| Authentication | ❌ Bypassed | Service role key; no login for demo |

---

## Known Limitations

1. **No auth**: Pages are accessible by URL. Production needs Supabase Auth with RLS scoped per user.
2. **No real-time**: Nurse dashboard requires manual refresh. Add Supabase Realtime subscriptions.
3. **No TTS**: Text responses only. Add Web Speech API `speechSynthesis` or ElevenLabs.
4. **GPT-4o-mini**: Fast/cheap for hackathon. Upgrade to GPT-4o for richer language handling.
5. **No multi-device**: Single active session per patient.

---

## Next 5 Best Features to Build

1. **Supabase Realtime** — Auto-push new alerts to the nurse dashboard via WebSocket
2. **Voice output (TTS)** — Read responses aloud via Web Speech API or ElevenLabs for accessibility
3. **Supabase Auth** — Magic link for nurses, kiosk/PIN mode for patient bedside tablets
4. **Mobile push notifications** — Service worker + Realtime to alert nurses on their phones
5. **Shift handoff report** — Auto-generate a per-patient shift summary from alerts, tool logs, and chats

---

## Production Hardening Checklist

- [ ] Replace open RLS policies (see comments in `001_initial.sql`)
- [ ] Never expose service role key to the client
- [ ] Rate limit `/api/chat` (e.g., Upstash)
- [ ] Add content moderation before/after OpenAI
- [ ] Real Twilio integration for calls/SMS
- [ ] HIPAA-compliant audit logging
- [ ] Supabase Auth with MFA for nurses
- [ ] Accessibility audit (WCAG 2.1 AA)
