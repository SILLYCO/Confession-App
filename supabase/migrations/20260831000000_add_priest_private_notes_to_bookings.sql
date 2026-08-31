-- Migration: Add confidential private pastoral notes to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS priest_private_notes TEXT;

COMMENT ON COLUMN bookings.priest_private_notes IS 'Confidential private pastoral notes written by the priest, accessible only to the priest';
