# WhatsApp AI Chatbot for Hair Salons

## Working Style
- **Build autonomously.** Make decisions and implement without asking unless there is genuinely no alternative. Do not ask for confirmation on technical choices, file structure, naming, or implementation details.
- **When user input is truly required** (e.g. API keys, account credentials, choosing between product directions): explain what is needed, why, and give explicit step-by-step instructions assuming zero technical knowledge. Include where to click, what to copy, what to paste.
- **Constantly verify.** After every significant action (install, file creation, build, deploy), check that it succeeded. Read output, fix errors immediately, and re-run. Do not move on from a broken step.
- **Self-anneal.** When something fails, diagnose the root cause, try a different approach, and verify the fix — do not retry the same failing command or ask the user to debug. Exhaust all autonomous options before escalating.

## What This Is
Dual-interface WhatsApp assistant for hair salons in KL. One WA number per salon, two modes:
- **Customer**: booking bot + info assistant (services, prices, hours). Auto-detects BM/English/Manglish.
- **Admin**: conversational ops assistant (1-2 admins identified by phone number match).

Multi-tenant: every query scoped by salonId, routed by waPhoneNumberId.

## Tech Stack
- **Convex**: DB, API, HTTP actions (webhook), scheduler. Source of truth for all data.
- **Next.js + Tailwind**: Onboarding web form only (no admin dashboard).
- **Claude Sonnet 4.5**: AI layer via tool_use/function calling. No separate intent classifier.
- **Meta WhatsApp Cloud API**: Inbound webhook + outbound messaging.
- **Google Calendar API**: One-way sync (Convex → GCal). Fire-and-forget.

## Project Layout
```
convex/
  schema.ts              # 7 tables: salons, stylists, services, customers, bookings, conversations, messages, noShowLog
  http.ts                # Webhook router (GET verify + POST incoming)
  crons.ts               # Sunday pulse, monthly routine, stale cleanup
  {salons,customers,bookings,services,stylists,messages}/  # queries.ts + mutations.ts per domain
  whatsapp/webhook.ts    # Parse Meta payload, schedule AI processing
  whatsapp/send.ts       # Send text/template messages via WA Cloud API
  ai/router.ts           # Resolve salon → determine role → load context → call Claude → reply
  ai/prompts.ts          # Dynamic system prompt builder (base + salon context + conversation state)
  ai/tools.ts            # Claude tool definitions (customer set + admin set)
  ai/customerAgent.ts    # Customer conversation logic
  ai/adminAgent.ts       # Admin conversation logic
  calendar/sync.ts       # Google Calendar create/delete events
  scheduled/             # reminders.ts, checkins.ts, pulse.ts, monthlyRoutine.ts
app/                     # Next.js — onboarding form only
  onboarding/page.tsx    # 5-step form: salon details → hours → services → stylists → review
components/onboarding/   # Step components
```

## Key Schema Tables
- **salons**: waPhoneNumberId (index), adminPhones[], openingHours[], closedDates[], WA credentials
- **bookings**: status lifecycle: pending_approval → confirmed → reminder_sent → customer_confirmed → completed|no_show|cancelled_*
- **conversations**: state machine per phone+salon (idle, collecting_info, booking_flow, reschedule_flow, etc.) + flowData for partial progress
- **messages**: conversation history for AI context (load last 20, or 5 if stale >24hrs)
- **customers**: noShowCount tracked, isBlacklisted flag
- **noShowLog**: audit trail, flaggedAsRepeatOffender

## Architecture Patterns
- Webhook returns 200 immediately; AI processes async via `ctx.scheduler.runAfter(0, ...)`
- Per-booking scheduled jobs: reminders at booking-1hr, admin check-ins at booking+15min
- Crons: Sunday pulse (10am MYT), monthly routine (1st of month), stale conversation cleanup (every 6hrs)
- Calendar sync triggered via `runAfter(0, ...)` from booking mutations — never blocks the mutation
- Admin auth: phone number match against salon.adminPhones array (no PIN)
- Services have per-service durationMinutes (not fixed slots)
- Stylists are auto-assigned; customer can request specific (forwarded to admin for approval)

## Conventions
- All phone numbers in E.164 format
- Dates as ISO strings ("2026-02-20"), times as 24hr strings ("14:00")
- Timezone: "Asia/Kuala_Lumpur"
- Soft-delete via isActive=false (never hard-delete services/stylists)
- Convex domain folders have queries.ts + mutations.ts (no validators.ts unless needed)
- Use `internal` functions for AI/scheduler; public functions only for Next.js client

## Commands
- `npx convex dev` — run Convex dev server
- `npm run dev` — run Next.js dev server
- `npx convex deploy` — deploy to production
