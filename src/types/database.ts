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

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  title_ar?: string;
  title_en?: string;
  assigned_priest_ids?: string[]; // For secretary role: list of priest IDs managed by this secretary
  created_at?: string;
  updated_at?: string;
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
