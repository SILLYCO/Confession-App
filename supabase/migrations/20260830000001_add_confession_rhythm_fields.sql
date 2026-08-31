-- Migration: Add Confession Rhythm & Regularity Reminder settings to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS confession_reminder_interval_days INT DEFAULT 30,
ADD COLUMN IF NOT EXISTS confession_reminder_enabled BOOLEAN DEFAULT true;

COMMENT ON COLUMN users.confession_reminder_interval_days IS 'Target personal confession frequency in days (default 30)';
COMMENT ON COLUMN users.confession_reminder_enabled IS 'Flag to toggle gentle in-app confession regularity reminders';
