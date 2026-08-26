# Prompt: Confession Registration System

Build a full-stack web app (built with the Antigravity CLI, backed by Supabase — Supabase Auth, Postgres database, Edge Functions) for scheduling church confession appointments. Bilingual UI (Arabic / English, with a language switcher). Three roles: **Priest**, **Secretary**, **General User**.

## Core concept

Priests don't get fixed appointment slots manually — they define a **weekly recurring availability schedule** plus **one-off date overrides**, and an **average confession duration** (in minutes). The system auto-generates bookable time slots by dividing each availability window by the average duration. General Users browse priests, then browse that priest's generated slot calendar, and book one specific slot.

## Data model

**User** (all roles share this table, differentiated by `role` field)
- uid, name, email, phone, role (`priest` | `secretary` | `general`)
- Auth: full account required (email/password or phone+OTP) to book — no guest booking

**PriestProfile** (extends User where role = priest)
- avgConfessionMinutes (int, editable anytime by priest or secretary)
- weeklySchedule: array of `{ dayOfWeek, startTime, endTime }` (recurring default)
- scheduleOverrides: array of `{ date, startTime, endTime, isUnavailable }` (one-off exceptions — can add a special date or block out a normally-available date)

**Slot** (auto-generated, not manually created)
- priestId, date, startTime, endTime (derived from avgConfessionMinutes)
- status: `available` | `booked` | `unavailable`
- bookingId (nullable)
- Generation window: rolling 1–2 weeks ahead only (regenerate as time passes)
- **Exclusivity: exactly one booking per slot, no exceptions**

**Booking**
- userId, priestId, slotId, date, time, status (`confirmed` | `cancelled` | `completed`), createdAt, cancelledAt

## Core rules (these are the parts most likely to get built wrong — pay attention)

1. **Slot regeneration on schedule change**: If a priest edits `avgConfessionMinutes` or their `weeklySchedule`, **all future slots for that priest are regenerated** — including ones that were already booked. Any user with a booking on an affected slot must be notified by email that their booking was cancelled and they need to rebook.
2. **One active booking per user, globally**: A General User cannot hold more than one upcoming `confirmed` booking at a time, across all priests. They must complete/cancel their current booking before booking again.
3. **User-initiated cancellation**: Allowed up to a 2-hour cutoff before the slot's start time. After the cutoff, self-service cancellation is blocked — they must contact the Secretary.
4. **Priest goes unavailable (emergency/travel)**: Priest marks a date or slot range as `isUnavailable` via a schedule override. Any existing bookings on those slots are **automatically cancelled**, and affected users are notified by email.
5. **Slot horizon**: Only generate/show slots 1–2 weeks out on a rolling basis — don't materialize the whole recurring schedule far into the future.

## Roles & permissions

**Priest**
- Set/edit own weekly recurring schedule
- Add one-off date overrides (extra availability or blackout dates)
- Set/edit own average confession duration
- View own upcoming bookings (read-only — cannot book/cancel on behalf of users)

**Secretary** ("church-ops" role)
- View all bookings across all priests
- Book or cancel a slot on behalf of any General User
- **Cannot** edit any priest's schedule or average duration
- Cannot create priest/secretary accounts unless you also want a super-admin tier (flag this as an open question if not specified — default to: only an existing Secretary or a seeded admin can create Priest/Secretary accounts)

**General User**
- View list of priests
- Select a priest → view that priest's available slot calendar (available/booked/unavailable states visibly distinct)
- Book one available slot (subject to the one-active-booking-globally rule)
- Cancel own booking (subject to the 2-hour cutoff)
- Receive email notifications for booking confirmation, cancellation, and forced rebook

## Key user flows to implement

1. **Priest onboarding**: set weekly schedule + avg duration → system generates initial slot set for the next 1–2 weeks.
2. **General User booking**: browse priests → pick priest → see calendar of that priest's slots (grouped by day) → pick an available slot → confirm → email confirmation.
3. **Priest edits duration/schedule**: trigger regeneration → cancel affected bookings → notify affected users by email.
4. **Priest marks a date unavailable**: cancel any bookings on that date for that priest → notify affected users.
5. **User cancels own booking**: check 2-hour cutoff → if allowed, free the slot back to `available` and cancel the booking; if not allowed, show a message directing them to the Secretary.
6. **Secretary books/cancels on behalf of a user**: same booking logic as General User flow, but Secretary selects the user.

## Non-functional requirements

- Bilingual UI (Arabic/English) with a language switcher; RTL layout support for Arabic.
- Email notifications (Supabase Edge Function calling an email provider, e.g. Resend) for: booking confirmed, booking cancelled by user, booking force-cancelled due to schedule change or priest unavailability.
- Postgres Row Level Security (RLS) policies enforcing the role permissions above (Priests can only write their own schedule; Secretaries can write bookings but not priest schedules; General Users can only write their own bookings).
- Slot generation should run as a scheduled Supabase Edge Function (via pg_cron or Supabase's scheduled functions) to keep the rolling 1–2 week window topped up, plus be triggered on-demand when a priest edits their schedule/duration.
