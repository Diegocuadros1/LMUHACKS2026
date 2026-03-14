# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (localhost:3000)
npm run build     # Production build
npm run lint      # ESLint
npx tsc --noEmit  # TypeScript check (no test suite exists)
```

Database migrations and seed data are applied via the Supabase MCP tool (`mcp__supabase__apply_migration`, `mcp__supabase__execute_sql`) or directly via `psql $DATABASE_URL -f supabase/seed.sql`.

## Architecture Overview

**CareCompanion** is a Next.js 16 App Router hospital patient assistant with two roles:

- **Patient view** (`/patient/[patientId]`) — AI chatbot with voice I/O, room controls, contact family, medication/summary cards
- **Nurse view** (`/nurse`, `/nurse/patients/[patientId]`) — alert feed, patient list, chat log viewer, summary editor

### Request flow for AI chat

`ChatWindow` (client) → `POST /api/chat` → OpenAI agentic loop (up to 5 rounds, `gpt-4o-mini`) → `dispatchTool()` in `lib/ai/tool-registry.ts` → individual tool functions in `lib/tools/` → Supabase.

Every patient message and every assistant response is persisted to `chat_messages` (patient message saved *before* the OpenAI call).

### Supabase clients

Two clients in `lib/supabase/server.ts`:
- `createClient()` — cookie-based, respects RLS. Use in Server Components.
- `createServiceClient()` — service role, bypasses RLS. Use in API routes and tool functions.

The client-side client (`lib/supabase/client.ts`) is for browser-only reads.

### AI tool system

`lib/ai/tool-registry.ts` defines OpenAI function schemas and a `dispatchTool()` dispatcher. Tool implementations live in `lib/tools/`. All tools call `logInteraction()` to write to the `tool_logs` table for nurse visibility.

**patientId security**: `dispatchTool()` always uses the `patientId` from server-side request context, never from the AI's args, to prevent prompt injection.

### Adding a new tool

1. Create `lib/tools/myTool.ts` — implement and call `logInteraction()`
2. Add the OpenAI schema to `TOOL_DEFINITIONS` in `lib/ai/tool-registry.ts`
3. Add a `case` to `dispatchTool()` in the same file

### Key gotchas

**UUID validation**: Demo seed UUIDs use version 0 / variant 0 (e.g. `aaaaaaaa-0000-0000-0000-000000000001`), which fail Zod v4's strict `.uuid()`. Use the lenient regex from `app/api/chat/route.ts` or `z.string().min(36).max(36)` in other routes.

**Supabase FK ambiguity**: The `patients` table has two FK columns to `profiles` (`profile_id` and `nurse_id`). Always disambiguate: `select('*, profiles!profile_id(*)')` — not `select('*, profiles(*)')`.

**Server → Client Component props**: Never pass inline arrow functions as props from Server Components to Client Components. Client Components that need callbacks should manage their own state.

**Voice (Web Speech API)**: `SpeechRecognition` / `SpeechSynthesis` are Chrome/Edge only. Cast `window as any` to access them — the TypeScript DOM types don't resolve reliably. STT in `VoiceButton.tsx`, TTS in `ChatWindow.tsx`.

**Contact lookup**: Contacts are looked up by name (case-insensitive `ilike`), not by ID, both in the UI (`ContactActions.tsx`) and via the AI tool.

### Demo credentials (login page)

| Username | Password | Destination |
|----------|----------|-------------|
| `admin` | `password123` | `/nurse` |
| `patient` | `password123` | `/patient/aaaaaaaa-0000-0000-0000-000000000001` |

Auth is hardcoded client-side (hackathon demo). No real Supabase auth session is created.

### Environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
NEXT_PUBLIC_DEMO_PATIENT_1=aaaaaaaa-0000-0000-0000-000000000001
NEXT_PUBLIC_DEMO_PATIENT_2=aaaaaaaa-0000-0000-0000-000000000002
```
