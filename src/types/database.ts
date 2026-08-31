export type UserRole = 'admin' | 'priest' | 'secretary' | 'general';
export type SlotStatus = 'available' | 'booked' | 'unavailable';
export type BookingStatus = 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type CancellationReason = 
  | 'user_cancelled' 
  | 'secretary_cancelled' 
  | 'priest_schedule_change' 
  | 'priest_unavailable'
  | 'completed'
  | 'no_show'
  | string;

export const DEFAULT_SKELETON_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Ccircle cx='50' cy='38' r='18' fill='%2394a3b8'/%3E%3Cpath d='M20 86c0-16 13.4-28 30-28s30 12 30 28' fill='%2394a3b8'/%3E%3C/svg%3E";

export interface WeeklyScheduleItem {
  id: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string; // "HH:MM" e.g. "17:00"
  endTime: string;   // "HH:MM" e.g. "20:00"
}

export interface ScheduleOverride {
  id: string;
  date: string; // "YYYY-MM-DD"
  startTime?: string; // "HH:MM"
  endTime?: string;   // "HH:MM"
  isUnavailable: boolean; // true = complete blackout / emergency cancel
  reason?: string; // e.g. "Travel to Monastery", "Feast Liturgy", "Emergency"
}

export type MaritalStatus = 'single' | 'married' | 'widowed' | 'divorced';
export type ChurchServiceRole = 'general_member' | 'served' | 'servant';
export type Gender = 'male' | 'female';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  secondary_phone?: string;
  role: UserRole;
  avatar_url?: string;
  title_ar?: string;
  title_en?: string;
  
  // Extended Member Profile Fields
  gender?: Gender;
  date_of_birth?: string; // YYYY-MM-DD
  national_id?: string;   // 14 digits
  marital_status?: MaritalStatus;
  profession?: string;
  education?: string;
  address?: string;
  service_status?: ChurchServiceRole;
  served_stage?: string;   // e.g. "ثانوي", "جامعة"
  serving_stage?: string;  // e.g. "خدمة ابتدائي", "إعدادي"
  other_services?: string; // Additional activities description
  confession_father_id?: string; // Assigned Priest ID for confession sacrament
  
  // Confession Rhythm & Regularity Reminder
  confession_reminder_interval_days?: number; // Target interval in days (default: 30)
  confession_reminder_enabled?: boolean;      // Toggle in-app reminders (default: true)
  
  assigned_priest_ids?: string[]; // For secretary role: list of priest IDs managed by this secretary
  created_at?: string;
  updated_at?: string;
}

export type ConfessionRhythmStatus = 'on_track' | 'due_soon' | 'overdue' | 'no_history';

export interface ConfessionRhythmInfo {
  daysSinceLast: number | null;
  intervalDays: number;
  daysRemaining: number | null;
  targetDate: string | null;
  percentageElapsed: number;
  status: ConfessionRhythmStatus;
  hasUpcomingBooking: boolean;
  lastConfessionDate: string | null;
}

export interface PriestProfile {
  priest_id: string;
  avg_confession_minutes: number;
  weekly_schedule: WeeklyScheduleItem[];
  schedule_overrides: ScheduleOverride[];
  church_name_ar?: string;
  church_name_en?: string;
  bio_ar?: string;
  bio_en?: string;
  created_at?: string;
  updated_at?: string;
  // joined user details
  user?: User;
}

export interface Slot {
  id: string;
  priest_id: string;
  date: string; // "YYYY-MM-DD"
  start_time: string; // "HH:MM:SS" or "HH:MM"
  end_time: string;   // "HH:MM:SS" or "HH:MM"
  status: SlotStatus;
  booking_id?: string | null;
  created_at?: string;
  updated_at?: string;
  // Joined details
  priest?: User;
  booking?: Booking;
}

export interface Booking {
  id: string;
  user_id: string;
  priest_id: string;
  slot_id: string;
  date: string; // "YYYY-MM-DD"
  start_time: string; // "HH:MM:SS" or "HH:MM"
  end_time: string;   // "HH:MM:SS" or "HH:MM"
  status: BookingStatus;
  cancellation_reason?: CancellationReason;
  cancelled_by?: string;
  cancelled_at?: string;
  completed_at?: string;
  attendance_notes?: string;
  notes?: string;
  created_at: string;
  // Joined
  user?: User;
  priest?: User;
}

export interface NotificationLog {
  id: string;
  user_id: string;
  type: 
    | 'booking_confirmed' 
    | 'booking_cancelled_by_user' 
    | 'booking_cancelled_by_secretary' 
    | 'booking_force_cancelled_schedule_change' 
    | 'booking_force_cancelled_priest_unavailable';
  recipient_email: string;
  title_en: string;
  title_ar: string;
  body_en: string;
  body_ar: string;
  metadata?: Record<string, any>;
  is_read: boolean;
  sent_at: string;
}

export type AnnouncementPriority = 'normal' | 'important' | 'emergency';
export type AnnouncementAudience = 'all' | 'general' | 'priest' | 'secretary';

export interface ParishAnnouncement {
  id: string;
  title_ar: string;
  title_en: string;
  content_ar: string;
  content_en: string;
  priority: AnnouncementPriority;
  target_audience: AnnouncementAudience;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_by?: string;
  created_at: string;
}
