# ⛪ Confession Registration System | نظام حجز مواعيد سر الاعتراف

A full-stack, bilingual web application designed for scheduling church confession appointments with automated slot generation, strict business rules, Postgres Row Level Security (RLS), Supabase Edge Functions, and email dispatch.

---

## 🌟 Key Features

### 1. Bilingual (Arabic / English) & RTL Support
- Full localization for **English** and **العربية** with instant switcher in the navigation bar.
- Automatic `dir="rtl"` and `dir="ltr"` layout adaptation with liturgical Coptic/Orthodox typography and color palette (church gold `#d4af37`, liturgical navy `#102a43`, and warm ivory).

### 2. Multi-Role Support
- **Priest (أبونا)**:
  - Configure average confession duration (e.g. 10, 15, 20, 30 minutes).
  - Define weekly recurring availability windows.
  - Set one-off date overrides & blackout dates (retreats, travel, feast days).
  - View pastoral upcoming confession appointments (read-only).
- **Church Secretary (سكرتارية الكنيسة)**:
  - Global overview of all confession appointments church-wide.
  - Book slots on behalf of congregation members.
  - Emergency cancellation override (bypasses 2-hour cutoff).
  - Role-protected: *cannot* edit Priest schedules or average durations.
- **General User / Congregation Member (شعب الكنيسة)**:
  - Browse priests and view real-time available slot calendars (14-day rolling horizon).
  - Single-click slot reservation with instant confirmation email.
  - Self-service cancellation (subject to the 2-hour cutoff).
  - Active booking banner and history of past/cancelled confessions.

---

## 🛡️ Core Rules & Business Logic

| Rule # | Requirement | Implementation |
|---|---|---|
| **Rule 1** | **Slot Regeneration on Schedule Change** | When a Priest edits `avgConfessionMinutes` or their `weeklySchedule`, all future slots are regenerated. Any existing booked slots are **automatically cancelled** with `cancellation_reason = 'priest_schedule_change'`, and affected members receive an urgent email notice to rebook. |
| **Rule 2** | **One Active Booking per User (Globally)** | A congregation member cannot hold more than **1 upcoming confirmed booking** at a time across *all* priests. Enforced both in UI and transactionally in SQL (`book_confession_slot`). |
| **Rule 3** | **2-Hour Cancellation Cutoff** | Members can self-cancel up to **2 hours** before the slot start time. Within 2 hours, self-service cancellation is locked and the UI directs them to contact Church Secretary Sister Phoebe. Secretaries can perform emergency cancellation overrides. |
| **Rule 4** | **Priest Date Overrides & Blackouts** | When a priest marks a date `isUnavailable` (emergency/retreat), any bookings on that date are **automatically cancelled** (`priest_unavailable`) and email notices are dispatched. |
| **Rule 5** | **14-Day Rolling Horizon** | Slots are generated strictly within a rolling 14-day window to prevent materializing unmanaged future dates. |
| **Rule 6** | **Strict Role Boundaries (RLS)** | Priests control only their own availability. Secretaries can manage bookings across members but cannot modify priest availability. Members can only view/cancel their own bookings. |

---

## 🗄️ Database Architecture & Migrations

The complete SQL migration is located at [`supabase/migrations/20260826000000_confession_system_init.sql`](file:///home/kirolos-haliem/Desktop/Projects/Confession%20App/supabase/migrations/20260826000000_confession_system_init.sql):

- `public.users`: Profiles linked with `auth.users`, roles (`priest`, `secretary`, `general`).
- `public.priest_profiles`: Stores `avg_confession_minutes`, `weekly_schedule` JSONB, `schedule_overrides` JSONB.
- `public.slots`: Auto-generated slots with `priest_id`, `date`, `start_time`, `end_time`, `status` (`available`, `booked`, `unavailable`).
- `public.bookings`: Confession reservations with `status`, `cancellation_reason`, timestamps.
- `public.notification_logs`: Notification & email dispatch ledger.
- **RPC Functions**:
  - `generate_slots_for_priest(p_priest_id, p_start_date, p_end_date)`
  - `update_priest_schedule_and_regenerate(p_priest_id, p_avg_minutes, p_weekly_schedule)`
  - `add_priest_override(p_priest_id, p_override)`
  - `book_confession_slot(p_slot_id, p_user_id, p_notes)`
  - `cancel_confession_booking(p_booking_id, p_reason)`
  - `maintain_rolling_slot_horizon()`

---

## ⚡ Supabase Edge Functions

1. **`send-email-notification`** ([`supabase/functions/send-email-notification/index.ts`](file:///home/kirolos-haliem/Desktop/Projects/Confession%20App/supabase/functions/send-email-notification/index.ts)):
   - Sends bilingual HTML emails via Resend for:
     - `booking_confirmed`
     - `booking_cancelled_by_user`
     - `booking_cancelled_by_secretary`
     - `booking_force_cancelled_schedule_change`
     - `booking_force_cancelled_priest_unavailable`
2. **`cron-slot-horizon`** ([`supabase/functions/cron-slot-horizon/index.ts`](file:///home/kirolos-haliem/Desktop/Projects/Confession%20App/supabase/functions/cron-slot-horizon/index.ts)):
   - Runs daily via pg_cron to top up the rolling 14-day slot window.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Run Local Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Authentication & User Registration
- **Sign In (`تسجيل الدخول`)**: Users sign in with their registered email and password.
- **Member Registration (`إنشاء حساب جديد`)**: Congregation members can register an account with Full Name, Email, Phone, and Password. New accounts are automatically assigned the `general` role.
- **Role Elevation**: Super Administrator promotes users to `priest`, `secretary`, or `admin` via the Super Admin Control Center.
- **Persistent Offline Fallback**: In the absence of remote Supabase credentials, the application runs persistently with real registration and persistent local database storage.

### 4. Supabase Setup (Production Deployment)
1. **Create Supabase Project**:
   Create a new project at [supabase.com](https://supabase.com).
2. **Execute Database Migration & Seed**:
   Run [`supabase/migrations/20260826000000_confession_system_init.sql`](file:///home/kirolos-haliem/Desktop/Projects/Confession%20App/supabase/migrations/20260826000000_confession_system_init.sql) in the Supabase SQL Editor, followed by [`supabase/seed.sql`](file:///home/kirolos-haliem/Desktop/Projects/Confession%20App/supabase/seed.sql).
3. **Set Environment Variables in `.env`**:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   RESEND_API_KEY=re_your_resend_key
   FROM_EMAIL=confessions@yourchurch.org
   ```
4. **Deploy Edge Functions (Optional for Email & Daily Horizon Cron)**:
   ```bash
   npx supabase functions deploy send-email-notification
   npx supabase functions deploy cron-slot-horizon
   ```
