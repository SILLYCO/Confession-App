import { User, PriestProfile, Booking, NotificationLog, DEFAULT_SKELETON_AVATAR } from '../types/database';

export const MOCK_USERS: User[] = [
  {
    id: '00000000-0000-0000-0000-000000000000',
    name: 'Archdeacon George (Super Admin)',
    email: 'admin@church.org',
    phone: '+1 (555) 019-0000',
    role: 'admin',
    title_en: 'Archdeacon George (Super Admin)',
    title_ar: 'الأرشيدياكون جورج (مدير النظام)',
    avatar_url: DEFAULT_SKELETON_AVATAR,
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Phoebe Mikhail (Secretary)',
    email: 'secretary@church.org',
    phone: '+1 (555) 019-2831',
    role: 'secretary',
    title_en: 'Church Secretary',
    title_ar: 'مكتب أمانة سر الكنيسة',
    assigned_priest_ids: [],
    avatar_url: DEFAULT_SKELETON_AVATAR,
  },
];

export const MOCK_PRIEST_PROFILES: PriestProfile[] = [];

export const INITIAL_MOCK_BOOKINGS: Booking[] = [];

export const INITIAL_MOCK_NOTIFICATIONS: NotificationLog[] = [];

