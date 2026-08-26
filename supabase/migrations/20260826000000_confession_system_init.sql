-- ==============================================================================
-- Confession Registration System - Complete Database Schema & Functions
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Roles Enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'priest', 'secretary', 'general');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE slot_status AS ENUM ('available', 'booked', 'unavailable');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('confirmed', 'cancelled', 'completed', 'no_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Public Users Table (mirrored from auth.users or standalone profile)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'general',
    avatar_url TEXT,
    title_ar TEXT,
    title_en TEXT,
    assigned_priest_ids UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Priest Profiles Table
CREATE TABLE IF NOT EXISTS public.priest_profiles (
    priest_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    avg_confession_minutes INTEGER NOT NULL DEFAULT 15 CHECK (avg_confession_minutes >= 5 AND avg_confession_minutes <= 120),
    weekly_schedule JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- Array of: { "id": "uuid", "dayOfWeek": 0-6, "startTime": "09:00", "endTime": "12:00" }
    schedule_overrides JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- Array of: { "id": "uuid", "date": "2026-09-01", "startTime": "09:00", "endTime": "13:00", "isUnavailable": boolean, "reason": "Travel" }
    church_name_ar TEXT DEFAULT 'كنيسة الشهيد العظيم مارجرجس والأنبا أنطونيوس',
    church_name_en TEXT DEFAULT 'St. George & St. Anthony Coptic Orthodox Church',
    bio_ar TEXT,
    bio_en TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Slots Table (Auto-generated)
CREATE TABLE IF NOT EXISTS public.slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    priest_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status slot_status NOT NULL DEFAULT 'available',
    booking_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_priest_slot UNIQUE (priest_id, date, start_time)
);

-- 5. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    priest_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    slot_id UUID NOT NULL REFERENCES public.slots(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status booking_status NOT NULL DEFAULT 'confirmed',
    cancellation_reason TEXT,
    cancelled_by UUID REFERENCES public.users(id),
    cancelled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    attendance_notes TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key back to slots for booking_id
ALTER TABLE public.slots
    DROP CONSTRAINT IF EXISTS fk_slots_booking,
    ADD CONSTRAINT fk_slots_booking FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE SET NULL;

-- 6. Notification Logs Table (Tracks emails and notifications sent)
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- booking_confirmed, booking_cancelled_by_user, booking_cancelled_by_secretary, booking_force_cancelled_schedule_change, booking_force_cancelled_priest_unavailable
    recipient_email TEXT NOT NULL,
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    body_en TEXT NOT NULL,
    body_ar TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_slots_priest_date ON public.slots(priest_id, date, status);
CREATE INDEX IF NOT EXISTS idx_slots_date_status ON public.slots(date, status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_status ON public.bookings(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_priest_date ON public.bookings(priest_id, date, status);
CREATE INDEX IF NOT EXISTS idx_notification_user ON public.notification_logs(user_id, sent_at DESC);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priest_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- RLS Policies
-- ------------------------------------------------------------------------------

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Users RLS
CREATE POLICY "Users are readable by authenticated users"
    ON public.users FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "Secretaries can insert users"
    ON public.users FOR INSERT
    TO authenticated
    WITH CHECK (public.current_user_role() = 'secretary' OR id = auth.uid());

-- Priest Profiles RLS
CREATE POLICY "Priest profiles are viewable by all authenticated users"
    ON public.priest_profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Priests can update only their own profile"
    ON public.priest_profiles FOR UPDATE
    TO authenticated
    USING (priest_id = auth.uid() AND public.current_user_role() = 'priest')
    WITH CHECK (priest_id = auth.uid() AND public.current_user_role() = 'priest');

CREATE POLICY "Priests can insert their own profile"
    ON public.priest_profiles FOR INSERT
    TO authenticated
    WITH CHECK (priest_id = auth.uid() OR public.current_user_role() = 'secretary');

-- Slots RLS
CREATE POLICY "Slots are viewable by all authenticated users"
    ON public.slots FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Priests can update their own slots"
    ON public.slots FOR ALL
    TO authenticated
    USING (priest_id = auth.uid() OR public.current_user_role() = 'secretary')
    WITH CHECK (priest_id = auth.uid() OR public.current_user_role() = 'secretary');

-- Bookings RLS
CREATE POLICY "General users can view their own bookings"
    ON public.bookings FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() 
        OR priest_id = auth.uid() 
        OR public.current_user_role() = 'secretary'
    );

CREATE POLICY "Users and secretaries can insert bookings"
    ON public.bookings FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid() 
        OR public.current_user_role() = 'secretary'
    );

CREATE POLICY "Users and secretaries can update bookings"
    ON public.bookings FOR UPDATE
    TO authenticated
    USING (
        user_id = auth.uid() 
        OR public.current_user_role() = 'secretary'
    );

-- Notification Logs RLS
CREATE POLICY "Users can view their own notifications"
    ON public.notification_logs FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() 
        OR public.current_user_role() = 'secretary'
    );

CREATE POLICY "Users can update their own notification read status"
    ON public.notification_logs FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service can insert notifications"
    ON public.notification_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- Core Business Logic Functions (RPCs)
-- ------------------------------------------------------------------------------

-- 1. Helper: Generate Slots for a Priest in a Date Range
CREATE OR REPLACE FUNCTION public.generate_slots_for_priest(
    p_priest_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS INTEGER AS $$
DECLARE
    v_profile RECORD;
    v_curr_date DATE;
    v_day_of_week INT;
    v_sched_item JSONB;
    v_override_item JSONB;
    v_start_time TIME;
    v_end_time TIME;
    v_slot_start TIME;
    v_slot_end TIME;
    v_duration INTERVAL;
    v_slots_count INTEGER := 0;
    v_is_blackout BOOLEAN;
    v_has_override BOOLEAN;
BEGIN
    SELECT * INTO v_profile FROM public.priest_profiles WHERE priest_id = p_priest_id;
    IF NOT FOUND THEN
        RETURN 0;
    END IF;

    v_duration := (v_profile.avg_confession_minutes || ' minutes')::INTERVAL;
    IF v_duration <= INTERVAL '0 minutes' THEN
        v_duration := INTERVAL '15 minutes';
    END IF;

    v_curr_date := p_start_date;
    WHILE v_curr_date <= p_end_date LOOP
        -- Sunday in Postgres extract(DOW) is 0, Monday is 1, ..., Saturday is 6
        v_day_of_week := EXTRACT(DOW FROM v_curr_date)::INT;
        
        -- Check if there is an override for this date
        v_has_override := FALSE;
        v_is_blackout := FALSE;

        FOR v_override_item IN SELECT * FROM jsonb_array_elements(COALESCE(v_profile.schedule_overrides, '[]'::jsonb)) LOOP
            IF (v_override_item->>'date')::DATE = v_curr_date THEN
                v_has_override := TRUE;
                IF (v_override_item->>'isUnavailable')::BOOLEAN = TRUE THEN
                    v_is_blackout := TRUE;
                ELSE
                    -- Custom override availability window
                    v_start_time := (v_override_item->>'startTime')::TIME;
                    v_end_time := (v_override_item->>'endTime')::TIME;
                    
                    v_slot_start := v_start_time;
                    WHILE v_slot_start + v_duration <= v_end_time LOOP
                        v_slot_end := v_slot_start + v_duration;
                        
                        INSERT INTO public.slots (priest_id, date, start_time, end_time, status)
                        VALUES (
                            p_priest_id, 
                            v_curr_date, 
                            v_slot_start, 
                            v_slot_end, 
                            CASE 
                                WHEN (v_curr_date < CURRENT_DATE) OR (v_curr_date = CURRENT_DATE AND v_slot_start <= CURRENT_TIME) 
                                THEN 'unavailable'::slot_status 
                                ELSE 'available'::slot_status 
                            END
                        )
                        ON CONFLICT (priest_id, date, start_time) DO NOTHING;
                        
                        v_slots_count := v_slots_count + 1;
                        v_slot_start := v_slot_end;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;

        -- If not an override day and not blackout, generate from weeklySchedule
        IF NOT v_has_override AND NOT v_is_blackout THEN
            FOR v_sched_item IN SELECT * FROM jsonb_array_elements(COALESCE(v_profile.weekly_schedule, '[]'::jsonb)) LOOP
                IF (v_sched_item->>'dayOfWeek')::INT = v_day_of_week THEN
                    v_start_time := (v_sched_item->>'startTime')::TIME;
                    v_end_time := (v_sched_item->>'endTime')::TIME;

                    v_slot_start := v_start_time;
                    WHILE v_slot_start + v_duration <= v_end_time LOOP
                        v_slot_end := v_slot_start + v_duration;

                        INSERT INTO public.slots (priest_id, date, start_time, end_time, status)
                        VALUES (
                            p_priest_id, 
                            v_curr_date, 
                            v_slot_start, 
                            v_slot_end, 
                            CASE 
                                WHEN (v_curr_date < CURRENT_DATE) OR (v_curr_date = CURRENT_DATE AND v_slot_start <= CURRENT_TIME) 
                                THEN 'unavailable'::slot_status 
                                ELSE 'available'::slot_status 
                            END
                        )
                        ON CONFLICT (priest_id, date, start_time) DO NOTHING;

                        v_slots_count := v_slots_count + 1;
                        v_slot_start := v_slot_end;
                    END LOOP;
                END IF;
            END LOOP;
        END IF;

        v_curr_date := v_curr_date + INTERVAL '1 day';
    END LOOP;

    RETURN v_slots_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Core Rule 1: Smart Differential Priest Schedule & Duration Update with Booking Preservation
CREATE OR REPLACE FUNCTION public.update_priest_schedule_and_regenerate(
    p_priest_id UUID,
    p_avg_minutes INTEGER,
    p_weekly_schedule JSONB
)
RETURNS JSONB AS $$
DECLARE
    v_affected_booking RECORD;
    v_cancelled_count INTEGER := 0;
    v_preserved_count INTEGER := 0;
    v_priest_user RECORD;
    v_current_profile RECORD;
    v_user_email TEXT;
    v_end_horizon DATE := CURRENT_DATE + INTERVAL '14 days';
    v_new_slots_count INTEGER := 0;
    v_duration_changed BOOLEAN := FALSE;
    v_day_of_week INTEGER;
    v_window_fits BOOLEAN;
BEGIN
    -- Verify caller permission
    IF auth.uid() != p_priest_id AND public.current_user_role() NOT IN ('admin', 'secretary') THEN
        RAISE EXCEPTION 'Unauthorized: only the priest or admin can update schedule';
    END IF;

    SELECT * INTO v_priest_user FROM public.users WHERE id = p_priest_id;
    SELECT * INTO v_current_profile FROM public.priest_profiles WHERE priest_id = p_priest_id;

    v_duration_changed := (COALESCE(v_current_profile.avg_confession_minutes, 15) != p_avg_minutes);

    -- Update priest profile
    UPDATE public.priest_profiles
    SET 
        avg_confession_minutes = p_avg_minutes,
        weekly_schedule = p_weekly_schedule,
        updated_at = NOW()
    WHERE priest_id = p_priest_id;

    -- Evaluate each future confirmed booking
    FOR v_affected_booking IN 
        SELECT b.*, u.email as user_email, u.name as user_name
        FROM public.bookings b
        JOIN public.users u ON u.id = b.user_id
        WHERE b.priest_id = p_priest_id
          AND b.status = 'confirmed'
          AND (b.date > CURRENT_DATE OR (b.date = CURRENT_DATE AND b.start_time > TO_CHAR(NOW(), 'HH24:MI:SS')))
    LOOP
        v_day_of_week := EXTRACT(DOW FROM v_affected_booking.date::DATE);
        v_window_fits := FALSE;

        -- If duration is unchanged, check if booking fits inside any window in the new schedule
        IF NOT v_duration_changed THEN
            SELECT EXISTS (
                SELECT 1 
                FROM jsonb_array_elements(p_weekly_schedule) elem
                WHERE (elem->>'dayOfWeek')::INT = v_day_of_week
                  AND (elem->>'startTime')::TIME <= v_affected_booking.start_time
                  AND (elem->>'endTime')::TIME >= v_affected_booking.end_time
            ) INTO v_window_fits;
        END IF;

        IF v_window_fits THEN
            -- Preserved! Keep booking confirmed
            v_preserved_count := v_preserved_count + 1;
        ELSE
            -- Cancel booking
            UPDATE public.bookings
            SET 
                status = 'cancelled',
                cancellation_reason = 'priest_schedule_change',
                cancelled_by = auth.uid(),
                cancelled_at = NOW()
            WHERE id = v_affected_booking.id;

            -- Record notification log
            INSERT INTO public.notification_logs (
                user_id,
                type,
                recipient_email,
                title_en,
                title_ar,
                body_en,
                body_ar,
                metadata
            ) VALUES (
                v_affected_booking.user_id,
                'booking_force_cancelled_schedule_change',
                v_affected_booking.user_email,
                'Appointment Cancelled: Schedule Updated by Priest',
                'تم إلغاء الموعد: تحديث جدول مواعيد أبونا',
                'Your confession appointment with ' || COALESCE(v_priest_user.name, 'the Priest') || ' on ' || v_affected_booking.date || ' at ' || v_affected_booking.start_time || ' has been cancelled due to a schedule reconfiguration. Please rebook a new available slot.',
                'تم إلغاء موعد الاعتراف مع ' || COALESCE(v_priest_user.name, 'أبونا') || ' يوم ' || v_affected_booking.date || ' الساعة ' || v_affected_booking.start_time || ' بسبب تغيير جدول المواعيد. يرجى الدخول وحجز موعد جديد متاح.',
                jsonb_build_object(
                    'bookingId', v_affected_booking.id,
                    'priestName', v_priest_user.name,
                    'date', v_affected_booking.date,
                    'time', v_affected_booking.start_time
                )
            );

            v_cancelled_count := v_cancelled_count + 1;
        END IF;
    END LOOP;

    -- Delete existing future slots that are available or orphaned
    DELETE FROM public.slots
    WHERE priest_id = p_priest_id
      AND (date > CURRENT_DATE OR (date = CURRENT_DATE AND start_time > TO_CHAR(NOW(), 'HH24:MI:SS')));

    -- Regenerate fresh slots for the next 14 days
    v_new_slots_count := public.generate_slots_for_priest(p_priest_id, CURRENT_DATE, v_end_horizon);

    RETURN jsonb_build_object(
        'success', true,
        'preservedBookingsCount', v_preserved_count,
        'cancelledBookingsCount', v_cancelled_count,
        'newSlotsGenerated', v_new_slots_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Core Rule 4: Add Priest Override (Date Blackout or Custom Hours) & Handle Auto-Cancellations
CREATE OR REPLACE FUNCTION public.add_priest_override(
    p_priest_id UUID,
    p_override JSONB
)
RETURNS JSONB AS $$
DECLARE
    v_override_date DATE;
    v_is_unavailable BOOLEAN;
    v_start_time TIME;
    v_end_time TIME;
    v_affected_booking RECORD;
    v_priest_user RECORD;
    v_cancelled_count INTEGER := 0;
    v_current_overrides JSONB;
BEGIN
    IF auth.uid() != p_priest_id AND public.current_user_role() != 'secretary' THEN
        RAISE EXCEPTION 'Unauthorized: only the priest or secretary can add overrides';
    END IF;

    SELECT * INTO v_priest_user FROM public.users WHERE id = p_priest_id;

    v_override_date := (p_override->>'date')::DATE;
    v_is_unavailable := COALESCE((p_override->>'isUnavailable')::BOOLEAN, false);
    v_start_time := COALESCE((p_override->>'startTime')::TIME, '00:00:00'::TIME);
    v_end_time := COALESCE((p_override->>'endTime')::TIME, '23:59:59'::TIME);

    -- Append override to priest profile
    SELECT schedule_overrides INTO v_current_overrides 
    FROM public.priest_profiles 
    WHERE priest_id = p_priest_id;

    -- Remove any prior override for the same date, then add new one
    UPDATE public.priest_profiles
    SET 
        schedule_overrides = (
            SELECT jsonb_agg(elem)
            FROM jsonb_array_elements(COALESCE(v_current_overrides, '[]'::jsonb)) elem
            WHERE (elem->>'date')::DATE != v_override_date
        ) || jsonb_build_array(p_override),
        updated_at = NOW()
    WHERE priest_id = p_priest_id;

    -- If date is unavailable or restricted, cancel overlapping confirmed bookings
    FOR v_affected_booking IN
        SELECT b.*, u.email as user_email, u.name as user_name
        FROM public.bookings b
        JOIN public.users u ON u.id = b.user_id
        WHERE b.priest_id = p_priest_id
          AND b.status = 'confirmed'
          AND b.date = v_override_date
          AND (
            v_is_unavailable = TRUE
            OR (b.start_time < v_start_time OR b.end_time > v_end_time)
          )
    LOOP
        UPDATE public.bookings
        SET 
            status = 'cancelled',
            cancellation_reason = 'priest_unavailable',
            cancelled_by = auth.uid(),
            cancelled_at = NOW()
        WHERE id = v_affected_booking.id;

        INSERT INTO public.notification_logs (
            user_id,
            type,
            recipient_email,
            title_en,
            title_ar,
            body_en,
            body_ar,
            metadata
        ) VALUES (
            v_affected_booking.user_id,
            'booking_force_cancelled_priest_unavailable',
            v_affected_booking.user_email,
            'Appointment Cancelled: Priest Unavailable',
            'تم إلغاء الموعد: عدم توفر أبونا في هذا التاريخ',
            'Your confession appointment with ' || COALESCE(v_priest_user.name, 'the Priest') || ' on ' || v_affected_booking.date || ' at ' || v_affected_booking.start_time || ' has been cancelled due to priest unavailability / emergency. Please rebook for another date.',
            'تم إلغاء موعد الاعتراف مع ' || COALESCE(v_priest_user.name, 'أبونا') || ' يوم ' || v_affected_booking.date || ' الساعة ' || v_affected_booking.start_time || ' لظروف طارئة / اعتذار أبونا. يرجى حجز موعد آخر.',
            jsonb_build_object(
                'bookingId', v_affected_booking.id,
                'priestName', v_priest_user.name,
                'date', v_affected_booking.date,
                'time', v_affected_booking.start_time,
                'reason', p_override->>'reason'
            )
        );

        v_cancelled_count := v_cancelled_count + 1;
    END LOOP;

    -- Delete old slots on that date
    DELETE FROM public.slots
    WHERE priest_id = p_priest_id
      AND date = v_override_date;

    -- Regenerate slots for that specific date
    PERFORM public.generate_slots_for_priest(p_priest_id, v_override_date, v_override_date);

    RETURN jsonb_build_object(
        'success', true,
        'date', v_override_date,
        'cancelledBookingsCount', v_cancelled_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. Core Rule 2 & Booking Flow: Book Confession Slot with Global One-Active-Booking Guarantee
CREATE OR REPLACE FUNCTION public.book_confession_slot(
    p_slot_id UUID,
    p_user_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_caller_id UUID := auth.uid();
    v_caller_role user_role;
    v_slot RECORD;
    v_existing_booking RECORD;
    v_new_booking RECORD;
    v_user RECORD;
    v_priest RECORD;
BEGIN
    SELECT public.current_user_role() INTO v_caller_role;

    -- Check caller authorization: General user can only book for themselves; Secretary can book for anyone
    IF v_caller_role != 'secretary' AND v_caller_id != p_user_id THEN
        RAISE EXCEPTION 'UNAUTHORIZED_BOOKING';
    END IF;

    -- Check Rule 2: User cannot hold more than 1 upcoming confirmed booking across ALL priests
    SELECT * INTO v_existing_booking
    FROM public.bookings
    WHERE user_id = p_user_id
      AND status = 'confirmed'
      AND (date > CURRENT_DATE OR (date = CURRENT_DATE AND start_time >= CURRENT_TIME))
    LIMIT 1;

    IF FOUND THEN
        RAISE EXCEPTION 'ACTIVE_BOOKING_EXISTS: User already has an upcoming confirmed booking on % at %', 
            v_existing_booking.date, v_existing_booking.start_time;
    END IF;

    -- Lock and verify slot
    SELECT * INTO v_slot
    FROM public.slots
    WHERE id = p_slot_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'SLOT_NOT_FOUND';
    END IF;

    IF v_slot.status != 'available' THEN
        RAISE EXCEPTION 'SLOT_NOT_AVAILABLE';
    END IF;

    IF v_slot.date < CURRENT_DATE OR (v_slot.date = CURRENT_DATE AND v_slot.start_time < CURRENT_TIME) THEN
        RAISE EXCEPTION 'SLOT_IN_PAST';
    END IF;

    -- Insert Booking
    INSERT INTO public.bookings (
        user_id,
        priest_id,
        slot_id,
        date,
        start_time,
        end_time,
        status,
        notes
    ) VALUES (
        p_user_id,
        v_slot.priest_id,
        p_slot_id,
        v_slot.date,
        v_slot.start_time,
        v_slot.end_time,
        'confirmed',
        p_notes
    ) RETURNING * INTO v_new_booking;

    -- Update slot to booked
    UPDATE public.slots
    SET 
        status = 'booked',
        booking_id = v_new_booking.id,
        updated_at = NOW()
    WHERE id = p_slot_id;

    -- Fetch user and priest details for notification
    SELECT * INTO v_user FROM public.users WHERE id = p_user_id;
    SELECT * INTO v_priest FROM public.users WHERE id = v_slot.priest_id;

    -- Insert Confirmation Notification Log
    INSERT INTO public.notification_logs (
        user_id,
        type,
        recipient_email,
        title_en,
        title_ar,
        body_en,
        body_ar,
        metadata
    ) VALUES (
        p_user_id,
        'booking_confirmed',
        v_user.email,
        'Confession Appointment Confirmed',
        'تم تأكيد موعد سر الاعتراف',
        'Your confession appointment with ' || COALESCE(v_priest.name, 'the Priest') || ' has been confirmed for ' || v_slot.date || ' at ' || v_slot.start_time || '.',
        'تم تأكيد موعد سر الاعتراف مع ' || COALESCE(v_priest.name, 'أبونا') || ' يوم ' || v_slot.date || ' الساعة ' || v_slot.start_time || '.',
        jsonb_build_object(
            'bookingId', v_new_booking.id,
            'slotId', p_slot_id,
            'priestName', v_priest.name,
            'date', v_slot.date,
            'startTime', v_slot.start_time,
            'endTime', v_slot.end_time
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'booking', row_to_json(v_new_booking)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. Core Rule 3: User & Secretary Cancellation with 2-Hour Cutoff Enforcement
CREATE OR REPLACE FUNCTION public.cancel_confession_booking(
    p_booking_id UUID,
    p_reason TEXT DEFAULT 'user_cancelled'
)
RETURNS JSONB AS $$
DECLARE
    v_caller_id UUID := auth.uid();
    v_caller_role user_role;
    v_booking RECORD;
    v_user RECORD;
    v_priest RECORD;
    v_slot_timestamp TIMESTAMPTZ;
BEGIN
    SELECT public.current_user_role() INTO v_caller_role;

    SELECT * INTO v_booking
    FROM public.bookings
    WHERE id = p_booking_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'BOOKING_NOT_FOUND';
    END IF;

    IF v_booking.status != 'confirmed' THEN
        RAISE EXCEPTION 'BOOKING_ALREADY_INACTIVE';
    END IF;

    -- Combine slot date and time
    v_slot_timestamp := (v_booking.date || ' ' || v_booking.start_time)::TIMESTAMPTZ;

    -- Permission and 2-Hour Cutoff Rule
    IF v_caller_role != 'secretary' THEN
        -- Must be the owner
        IF v_booking.user_id != v_caller_id THEN
            RAISE EXCEPTION 'UNAUTHORIZED_CANCELLATION';
        END IF;

        -- Check 2-hour cutoff rule
        IF NOW() + INTERVAL '2 hours' > v_slot_timestamp THEN
            RAISE EXCEPTION 'CANCELLATION_CUTOFF_EXCEEDED: Cancellations within 2 hours of appointment must be handled by the Church Secretary.';
        END IF;
    END IF;

    -- Mark booking cancelled
    UPDATE public.bookings
    SET 
        status = 'cancelled',
        cancellation_reason = p_reason,
        cancelled_by = v_caller_id,
        cancelled_at = NOW()
    WHERE id = p_booking_id;

    -- Free the slot back to available
    UPDATE public.slots
    SET 
        status = 'available',
        booking_id = NULL,
        updated_at = NOW()
    WHERE id = v_booking.slot_id;

    SELECT * INTO v_user FROM public.users WHERE id = v_booking.user_id;
    SELECT * INTO v_priest FROM public.users WHERE id = v_booking.priest_id;

    -- Log cancellation notification
    INSERT INTO public.notification_logs (
        user_id,
        type,
        recipient_email,
        title_en,
        title_ar,
        body_en,
        body_ar,
        metadata
    ) VALUES (
        v_booking.user_id,
        CASE WHEN v_caller_role = 'secretary' THEN 'booking_cancelled_by_secretary' ELSE 'booking_cancelled_by_user' END,
        v_user.email,
        'Confession Appointment Cancelled',
        'تم إلغاء موعد سر الاعتراف',
        'Your confession appointment with ' || COALESCE(v_priest.name, 'the Priest') || ' on ' || v_booking.date || ' at ' || v_booking.start_time || ' has been cancelled.',
        'تم إلغاء موعد سر الاعتراف مع ' || COALESCE(v_priest.name, 'أبونا') || ' يوم ' || v_booking.date || ' الساعة ' || v_booking.start_time || '.',
        jsonb_build_object(
            'bookingId', p_booking_id,
            'cancelledBy', v_caller_id,
            'reason', p_reason
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'bookingId', p_booking_id,
        'slotFreed', v_booking.slot_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 6. Core Rule 5: Maintain Rolling Horizon (14 Days)
CREATE OR REPLACE FUNCTION public.maintain_rolling_slot_horizon()
RETURNS JSONB AS $$
DECLARE
    v_priest RECORD;
    v_total_generated INTEGER := 0;
    v_count INTEGER;
BEGIN
    FOR v_priest IN SELECT id FROM public.users WHERE role = 'priest' LOOP
        v_count := public.generate_slots_for_priest(
            v_priest.id,
            CURRENT_DATE,
            (CURRENT_DATE + INTERVAL '14 days')::DATE
        );
        v_total_generated := v_total_generated + v_count;
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'slotsGeneratedOrChecked', v_total_generated
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
