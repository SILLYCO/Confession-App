import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  User, 
  PriestProfile, 
  Slot, 
  Booking, 
  NotificationLog, 
  WeeklyScheduleItem, 
  ScheduleOverride,
  DEFAULT_SKELETON_AVATAR 
} from '../types/database';
import { 
  MOCK_USERS, 
  MOCK_PRIEST_PROFILES, 
  INITIAL_MOCK_BOOKINGS, 
  INITIAL_MOCK_NOTIFICATIONS 
} from './mockData';
import { 
  generateSlotsForPriest, 
  isWithinTwoHourCutoff, 
  isSlotInPast 
} from './slotGenerator';
import { supabase, isSupabaseConfigured } from './supabase';
import confetti from 'canvas-confetti';

interface AppStoreContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isLoggedIn: boolean;
  login: (user: User) => void;
  loginWithEmail: (email: string) => boolean;
  logout: () => void;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (params: { 
    name: string; 
    email: string; 
    password?: string; 
    phone?: string; 
    title_ar?: string; 
    title_en?: string 
  }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  
  allUsers: User[];
  priests: User[];
  secretaries: User[];
  generalUsers: User[];
  priestProfiles: PriestProfile[];
  bookings: Booking[];
  notificationLogs: NotificationLog[];
  unreadNotificationsCount: number;
  
  // Navigation / Selection State
  selectedPriestForBooking: User | null;
  setSelectedPriestForBooking: (priest: User | null) => void;
  selectedPriestForSecretary: User | null;
  setSelectedPriestForSecretary: (priest: User | null) => void;
  
  // Queries
  getPriestProfile: (priestId: string) => PriestProfile | undefined;
  getPriestSlots: (priestId: string, startDate?: Date, days?: number) => Slot[];
  getUserActiveBooking: (userId?: string) => Booking | undefined;
  getUserBookings: (userId?: string) => Booking[];
  getPriestBookings: (priestId?: string) => Booking[];
  getSecretaryAssignedPriests: (secretaryId?: string) => User[];
  
  // Actions
  bookSlot: (slotId: string, userId: string, notes?: string) => Promise<{ success: boolean; booking?: Booking; error?: string }>;
  cancelBooking: (bookingId: string, cancelledByUserId: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
  updateBookingAttendance: (
    bookingId: string, 
    newStatus: 'completed' | 'no_show', 
    attendanceNotes?: string
  ) => Promise<{ success: boolean; error?: string }>;
  // Smart Schedule Diff & Actions
  previewScheduleChangeImpact: (
    priestId: string, 
    newAvgMinutes: number, 
    newWeeklySchedule: WeeklyScheduleItem[]
  ) => {
    durationChanged: boolean;
    preservedBookings: Booking[];
    cancelledBookings: Booking[];
    newSlotsEstimate: number;
  };
  updatePriestSchedule: (
    priestId: string, 
    avgMinutes: number, 
    weeklySchedule: WeeklyScheduleItem[]
  ) => Promise<{ 
    success: boolean; 
    preservedCount: number; 
    cancelledCount: number; 
    error?: string 
  }>;
  addPriestOverride: (priestId: string, override: ScheduleOverride) => Promise<{ success: boolean; cancelledCount: number; error?: string }>;
  deletePriestOverride: (priestId: string, overrideId: string) => Promise<{ success: boolean; error?: string }>;
  
  // Priest Profile Self-Update
  updatePriestProfileData: (
    priestId: string, 
    userUpdates: Partial<User>, 
    profileUpdates: Partial<PriestProfile>
  ) => Promise<{ success: boolean; error?: string }>;

  // Super Admin Actions
  createUser: (userData: Partial<User>, priestProfileData?: Partial<PriestProfile>, password?: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  updateUser: (userId: string, updates: Partial<User>, priestProfileData?: Partial<PriestProfile>) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (userId: string) => Promise<{ success: boolean; error?: string }>;
  adminResetPassword: (userId: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;

  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  refreshData: () => void;
}

const AppStoreContext = createContext<AppStoreContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_USERS = 'confession_system_users_v3';
const LOCAL_STORAGE_KEY_PROFILES = 'confession_system_profiles_v3';
const LOCAL_STORAGE_KEY_BOOKINGS = 'confession_system_bookings_v3';
const LOCAL_STORAGE_KEY_NOTIFS = 'confession_system_notifs_v3';
const LOCAL_STORAGE_KEY_CURRENT_USER = 'confession_system_current_user_v3';

export const AppStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from local storage or mock data
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_USERS);
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_USER);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return null;
  });

  const [selectedPriestForBooking, setSelectedPriestForBooking] = useState<User | null>(null);
  const [selectedPriestForSecretary, setSelectedPriestForSecretary] = useState<User | null>(null);

  const [priestProfiles, setPriestProfiles] = useState<PriestProfile[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILES);
    return saved ? JSON.parse(saved) : MOCK_PRIEST_PROFILES;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_BOOKINGS);
    return saved ? JSON.parse(saved) : INITIAL_MOCK_BOOKINGS;
  });

  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_NOTIFS);
    return saved ? JSON.parse(saved) : INITIAL_MOCK_NOTIFICATIONS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_USERS, JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(LOCAL_STORAGE_KEY_CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY_CURRENT_USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PROFILES, JSON.stringify(priestProfiles));
  }, [priestProfiles]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_NOTIFS, JSON.stringify(notificationLogs));
  }, [notificationLogs]);

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (user?.role !== 'general') {
      setSelectedPriestForBooking(null);
    }
    if (user?.role !== 'secretary') {
      setSelectedPriestForSecretary(null);
    }
  };

  const login = (user: User) => {
    setCurrentUserState(user);
    if (user.role !== 'general') {
      setSelectedPriestForBooking(null);
    }
    if (user.role !== 'secretary') {
      setSelectedPriestForSecretary(null);
    }
  };

  const loginWithEmail = (email: string): boolean => {
    const found = allUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (found) {
      login(found);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUserState(null);
    setSelectedPriestForBooking(null);
    setSelectedPriestForSecretary(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY_CURRENT_USER);
  };

  // Synchronize with Supabase Auth state and real database tables
  const fetchDatabaseFromSupabase = useCallback(async () => {
    const client = supabase;
    if (!client || !isSupabaseConfigured) return;

    try {
      const [
        { data: usersData },
        { data: profilesData },
        { data: bookingsData },
        { data: notifsData },
      ] = await Promise.all([
        client.from('users').select('*'),
        client.from('priest_profiles').select('*'),
        client.from('bookings').select('*'),
        client.from('notification_logs').select('*').order('sent_at', { ascending: false }),
      ]);

      if (usersData) {
        setAllUsers(usersData);
      }
      if (profilesData) {
        setPriestProfiles(profilesData);
      }
      if (bookingsData) {
        setBookings(bookingsData);
      }
      if (notifsData) {
        setNotificationLogs(notifsData);
      }
    } catch (e) {
      console.warn('Failed to sync from Supabase:', e);
    }
  }, []);

  useEffect(() => {
    const client = supabase;
    if (!client || !isSupabaseConfigured) return;

    // Fetch initial database tables from Supabase
    fetchDatabaseFromSupabase();

    client.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        client
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              login(profile);
            }
          });
      }
    });

    const { data: authListener } = client.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await client
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          login(profile);
        }
        fetchDatabaseFromSupabase();
      } else if (event === 'SIGNED_OUT') {
        logout();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchDatabaseFromSupabase]);

  const signIn = useCallback(async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    if (supabase && isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password || '123456',
      });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          login(profile);
        } else {
          const fallbackUser: User = {
            id: data.user.id,
            name: data.user.user_metadata?.name || email.split('@')[0],
            email: data.user.email || email,
            role: data.user.user_metadata?.role || 'general',
            phone: data.user.user_metadata?.phone,
          };
          login(fallbackUser);
        }
        return { success: true };
      }
    }

    // Local persistent database authentication
    const found = allUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (found) {
      login(found);
      return { success: true };
    }
    return { success: false, error: 'INVALID_CREDENTIALS' };
  }, [allUsers]);

  const signUp = useCallback(async (params: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    title_ar?: string;
    title_en?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (supabase && isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email: params.email.trim(),
        password: params.password || '123456',
        options: {
          data: {
            name: params.name.trim(),
            phone: params.phone?.trim(),
            role: 'general',
            title_ar: params.title_ar || params.name.trim(),
            title_en: params.title_en || params.name.trim(),
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const newUser: User = {
          id: data.user.id,
          name: params.name.trim(),
          email: params.email.trim(),
          phone: params.phone?.trim(),
          role: 'general',
          title_ar: params.title_ar || params.name.trim(),
          title_en: params.title_en || params.name.trim(),
          avatar_url: DEFAULT_SKELETON_AVATAR,
          created_at: new Date().toISOString(),
        };

        await supabase.from('users').upsert(newUser);
        setAllUsers(prev => [...prev.filter(u => u.id !== newUser.id), newUser]);
        login(newUser);
        return { success: true };
      }
    }

    // Local persistent database registration
    const existing = allUsers.find(u => u.email.toLowerCase() === params.email.trim().toLowerCase());
    if (existing) {
      return { success: false, error: 'EMAIL_EXISTS' };
    }

    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: params.name.trim(),
      email: params.email.trim(),
      phone: params.phone?.trim(),
      role: 'general',
      title_ar: params.title_ar || params.name.trim(),
      title_en: params.title_en || params.name.trim(),
      avatar_url: DEFAULT_SKELETON_AVATAR,
      created_at: new Date().toISOString(),
    };

    setAllUsers(prev => [...prev, newUser]);
    login(newUser);
    return { success: true };
  }, [allUsers]);

  const signOut = useCallback(async () => {
    if (supabase && isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    logout();
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (supabase && isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) return { success: false, error: error.message };
    }
    return { success: true };
  }, []);

  const isLoggedIn = Boolean(currentUser);

  const priests = useMemo(() => allUsers.filter(u => u.role === 'priest'), [allUsers]);
  const secretaries = useMemo(() => allUsers.filter(u => u.role === 'secretary'), [allUsers]);
  const generalUsers = useMemo(() => allUsers.filter(u => u.role === 'general'), [allUsers]);

  // Priests assigned to the given secretary
  const getSecretaryAssignedPriests = useCallback((secretaryId?: string) => {
    const secId = secretaryId || currentUser?.id;
    const secretary = allUsers.find(u => u.id === secId);
    if (!secretary) return priests;

    if (!secretary.assigned_priest_ids || secretary.assigned_priest_ids.length === 0) {
      // If none assigned explicitly, default to all priests
      return priests;
    }

    return priests.filter(p => secretary.assigned_priest_ids?.includes(p.id));
  }, [allUsers, currentUser, priests]);

  const unreadNotificationsCount = useMemo(() => {
    if (!currentUser) return 0;
    if (currentUser.role === 'secretary' || currentUser.role === 'admin') {
      return notificationLogs.filter(n => !n.is_read).length;
    }
    return notificationLogs.filter(n => n.user_id === currentUser.id && !n.is_read).length;
  }, [notificationLogs, currentUser]);

  const getPriestProfile = useCallback((priestId: string) => {
    return priestProfiles.find(p => p.priest_id === priestId);
  }, [priestProfiles]);

  // Compute 14-day rolling slots for a priest
  const getPriestSlots = useCallback((priestId: string, startDate: Date = new Date(), days: number = 14) => {
    const profile = priestProfiles.find(p => p.priest_id === priestId);
    if (!profile) return [];

    return generateSlotsForPriest(
      priestId,
      profile.weekly_schedule || [],
      profile.schedule_overrides || [],
      profile.avg_confession_minutes || 15,
      startDate,
      days,
      bookings
    );
  }, [priestProfiles, bookings]);

  // Enriched bookings with joined user and priest details
  const enrichedBookings = useMemo(() => {
    return bookings.map(b => ({
      ...b,
      user: b.user || allUsers.find(u => u.id === b.user_id),
      priest: b.priest || allUsers.find(u => u.id === b.priest_id),
    }));
  }, [bookings, allUsers]);

  // Get active upcoming booking for user
  const getUserActiveBooking = useCallback((userId?: string) => {
    const targetId = userId || currentUser?.id;
    if (!targetId) return undefined;
    return enrichedBookings.find(b => {
      if (b.user_id !== targetId || b.status !== 'confirmed') return false;
      return !isSlotInPast(b.date, b.start_time);
    });
  }, [enrichedBookings, currentUser]);

  const getUserBookings = useCallback((userId?: string) => {
    const targetId = userId || currentUser?.id;
    if (!targetId) return [];
    return enrichedBookings.filter(b => b.user_id === targetId);
  }, [enrichedBookings, currentUser]);

  const getPriestBookings = useCallback((priestId?: string) => {
    const targetId = priestId || currentUser?.id;
    if (!targetId) return [];
    return enrichedBookings.filter(b => b.priest_id === targetId);
  }, [enrichedBookings, currentUser]);

  // Send simulated/real email notification
  const logNotification = useCallback((params: {
    userId: string;
    type: NotificationLog['type'];
    recipientEmail: string;
    titleEn: string;
    titleAr: string;
    bodyEn: string;
    bodyAr: string;
    metadata?: Record<string, any>;
  }) => {
    const newNotif: NotificationLog = {
      id: 'notif_' + Math.random().toString(36).substring(2, 9),
      user_id: params.userId,
      type: params.type,
      recipient_email: params.recipientEmail,
      title_en: params.titleEn,
      title_ar: params.titleAr,
      body_en: params.bodyEn,
      body_ar: params.bodyAr,
      metadata: params.metadata || {},
      is_read: false,
      sent_at: new Date().toISOString(),
    };

    setNotificationLogs(prev => [newNotif, ...prev]);

    // If Supabase is connected, persist log & invoke Edge function if configured
    if (isSupabaseConfigured && supabase) {
      supabase.from('notification_logs').insert({
        user_id: params.userId,
        type: params.type,
        recipient_email: params.recipientEmail,
        title_en: params.titleEn,
        title_ar: params.titleAr,
        body_en: params.bodyEn,
        body_ar: params.bodyAr,
        metadata: params.metadata || {},
        is_read: false,
        sent_at: newNotif.sent_at,
      }).then(() => {}, (err: any) => console.log('Notification log insert:', err));

      supabase.functions.invoke('send-email-notification', {
        body: {
          to: params.recipientEmail,
          type: params.type,
          titleEn: params.titleEn,
          titleAr: params.titleAr,
          bodyEn: params.bodyEn,
          bodyAr: params.bodyAr,
          metadata: params.metadata,
        }
      }).catch(err => console.log('Edge function email log:', err));
    }
  }, []);

  // ----------------------------------------------------------------------------
  // Action 1: Book Confession Slot (Rule 2: Global One-Active-Booking Guarantee)
  // ----------------------------------------------------------------------------
  const bookSlot = useCallback(async (
    slotId: string, 
    targetUserId: string, 
    notes?: string
  ): Promise<{ success: boolean; booking?: Booking; error?: string }> => {
    try {
      if (!currentUser) {
        return { success: false, error: 'Must be logged in to book' };
      }

      // Check if caller is authorized (Secretary, Admin, or the user themselves)
      if (currentUser.role !== 'secretary' && currentUser.role !== 'admin' && currentUser.id !== targetUserId) {
        return { success: false, error: 'Unauthorized to book for this user' };
      }

      // Rule 2 Check: User cannot hold more than 1 upcoming confirmed booking across ALL priests
      const existingActive = bookings.find(b => 
        b.user_id === targetUserId && 
        b.status === 'confirmed' && 
        !isSlotInPast(b.date, b.start_time)
      );

      if (existingActive) {
        return { 
          success: false, 
          error: `Active booking exists: User already has a confirmed appointment on ${existingActive.date} at ${existingActive.start_time}` 
        };
      }

      // Find slot info
      const [_, priestId, date, timePart] = slotId.split('_');
      if (!priestId || !date || !timePart) {
        return { success: false, error: 'Invalid slot format' };
      }

      const priest = allUsers.find(u => u.id === priestId);
      const user = allUsers.find(u => u.id === targetUserId);
      const profile = priestProfiles.find(p => p.priest_id === priestId);

      const startH = timePart.substring(0, 2);
      const startM = timePart.substring(2, 4);
      const startTime = `${startH}:${startM}`;
      
      const duration = profile?.avg_confession_minutes || 15;
      const endTotalM = parseInt(startH) * 60 + parseInt(startM) + duration;
      const endTime = `${Math.floor(endTotalM / 60).toString().padStart(2, '0')}:${(endTotalM % 60).toString().padStart(2, '0')}`;

      // Check if slot in past
      if (isSlotInPast(date, startTime)) {
        return { success: false, error: 'This time slot is in the past' };
      }

      // Check exclusivity
      const alreadyBooked = bookings.some(b => 
        b.priest_id === priestId && 
        b.date === date && 
        b.start_time.startsWith(startTime) && 
        b.status === 'confirmed'
      );

      if (alreadyBooked) {
        return { success: false, error: 'This slot is already booked by another member' };
      }

      // Create booking
      const newBookingId = 'book_' + Math.random().toString(36).substring(2, 9);
      let confirmedBookingId = newBookingId;

      // If Supabase is connected, insert into real database
      if (supabase && isSupabaseConfigured) {
        const { data: dbBooking, error: bookingErr } = await supabase
          .from('bookings')
          .insert({
            user_id: targetUserId,
            priest_id: priestId,
            slot_id: slotId,
            date: date,
            start_time: startTime,
            end_time: endTime,
            status: 'confirmed',
            notes: notes || null,
          })
          .select()
          .single();

        if (bookingErr) {
          console.error('Supabase booking insert error:', bookingErr);
          return { success: false, error: bookingErr.message };
        }
        if (dbBooking) {
          confirmedBookingId = dbBooking.id;
        }
      }

      const newBooking: Booking = {
        id: confirmedBookingId,
        user_id: targetUserId,
        priest_id: priestId,
        slot_id: slotId,
        date,
        start_time: startTime,
        end_time: endTime,
        status: 'confirmed',
        notes: notes || undefined,
        created_at: new Date().toISOString(),
        user,
        priest,
      };

      setBookings(prev => [newBooking, ...prev]);

      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#d4af37', '#b88647', '#102a43']
        });
      } catch {}

      if (user) {
        logNotification({
          userId: targetUserId,
          type: 'booking_confirmed',
          recipientEmail: user.email,
          titleEn: 'Confession Appointment Confirmed',
          titleAr: 'تم تأكيد موعد سر الاعتراف',
          bodyEn: `Your confession appointment with ${priest?.title_en || priest?.name || 'the Priest'} is confirmed for ${date} at ${startTime}.`,
          bodyAr: `تم تأكيد موعد سر الاعتراف مع ${priest?.title_ar || priest?.name || 'أبونا'} يوم ${date} الساعة ${startTime}.`,
          metadata: {
            bookingId: confirmedBookingId,
            priestName: priest?.name,
            date,
            time: startTime,
          }
        });
      }

      return { success: true, booking: newBooking };

    } catch (err: any) {
      return { success: false, error: err.message || 'Booking failed' };
    }
  }, [currentUser, bookings, allUsers, priestProfiles, logNotification]);

  // ----------------------------------------------------------------------------
  // Action 2: Cancel Confession Booking (Rule 3: 2-Hour Cutoff Enforcement)
  // ----------------------------------------------------------------------------
  const cancelBooking = useCallback(async (
    bookingId: string, 
    cancelledByUserId: string, 
    reason: string = 'user_cancelled'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!currentUser) {
        return { success: false, error: 'Must be logged in to cancel' };
      }

      const targetBooking = bookings.find(b => b.id === bookingId);
      if (!targetBooking) {
        return { success: false, error: 'Booking not found' };
      }

      if (targetBooking.status !== 'confirmed') {
        return { success: false, error: 'Booking is already cancelled or completed' };
      }

      const isSecretary = currentUser.role === 'secretary' || currentUser.role === 'admin';
      const isOwner = currentUser.id === targetBooking.user_id;

      if (!isSecretary && !isOwner) {
        return { success: false, error: 'Unauthorized to cancel this booking' };
      }

      // Check Rule 3: 2-Hour cutoff for general users
      if (!isSecretary) {
        const isCutoffExceeded = isWithinTwoHourCutoff(targetBooking.date, targetBooking.start_time);
        if (isCutoffExceeded) {
          return { 
            success: false, 
            error: 'CUTOFF_EXCEEDED: Cancellations within 2 hours of the slot must be handled by the Church Secretary.' 
          };
        }
      }

      // If Supabase is connected, update database
      if (supabase && isSupabaseConfigured) {
        const { error: cancelErr } = await supabase
          .from('bookings')
          .update({
            status: 'cancelled',
            cancellation_reason: reason,
            cancelled_by: cancelledByUserId,
            cancelled_at: new Date().toISOString(),
          })
          .eq('id', bookingId);

        if (cancelErr) {
          console.error('Supabase cancel booking error:', cancelErr);
        }
      }

      const updatedBookings = bookings.map(b => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: 'cancelled' as const,
            cancellation_reason: reason,
            cancelled_by: cancelledByUserId,
            cancelled_at: new Date().toISOString(),
          };
        }
        return b;
      });

      setBookings(updatedBookings);

      const user = allUsers.find(u => u.id === targetBooking.user_id);
      const priest = allUsers.find(u => u.id === targetBooking.priest_id);

      if (user) {
        logNotification({
          userId: user.id,
          type: isSecretary ? 'booking_cancelled_by_secretary' : 'booking_cancelled_by_user',
          recipientEmail: user.email,
          titleEn: 'Confession Appointment Cancelled',
          titleAr: 'تم إلغاء موعد سر الاعتراف',
          bodyEn: `Your confession appointment with ${priest?.name || 'the Priest'} on ${targetBooking.date} at ${targetBooking.start_time} has been cancelled.`,
          bodyAr: `تم إلغاء موعد سر الاعتراف مع ${priest?.name || 'أبونا'} يوم ${targetBooking.date} الساعة ${targetBooking.start_time}.`,
          metadata: {
            bookingId,
            date: targetBooking.date,
            time: targetBooking.start_time,
            reason,
          }
        });
      }

      return { success: true };

    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to cancel booking' };
    }
  }, [bookings, currentUser, allUsers, logNotification]);

  // ----------------------------------------------------------------------------
  // Attendance & Check-in ("Mark as Completed / No-Show")
  // ----------------------------------------------------------------------------
  const updateBookingAttendance = useCallback(async (
    bookingId: string, 
    newStatus: 'completed' | 'no_show', 
    attendanceNotes?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const targetBooking = bookings.find(b => b.id === bookingId);
      if (!targetBooking) {
        return { success: false, error: 'Booking not found' };
      }

      // If Supabase is connected, update database
      if (supabase && isSupabaseConfigured) {
        const { error: attErr } = await supabase
          .from('bookings')
          .update({
            status: newStatus,
            attendance_notes: attendanceNotes !== undefined ? attendanceNotes : targetBooking.attendance_notes,
            completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
            cancellation_reason: newStatus === 'no_show' ? 'no_show' : targetBooking.cancellation_reason,
          })
          .eq('id', bookingId);

        if (attErr) {
          console.error('Supabase attendance update error:', attErr);
        }
      }

      const updatedBookings = bookings.map(b => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: newStatus,
            completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined,
            cancellation_reason: newStatus === 'no_show' ? 'no_show' : b.cancellation_reason,
            attendance_notes: attendanceNotes !== undefined ? attendanceNotes : b.attendance_notes,
          };
        }
        return b;
      });

      setBookings(updatedBookings);
      return { success: true };

    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update attendance' };
    }
  }, [bookings]);

  // ----------------------------------------------------------------------------
  // Smart Schedule Differential Analysis (Pre-Save Impact Preview)
  // ----------------------------------------------------------------------------
  const previewScheduleChangeImpact = useCallback((
    priestId: string, 
    newAvgMinutes: number, 
    newWeeklySchedule: WeeklyScheduleItem[]
  ) => {
    const profile = priestProfiles.find(p => p.priest_id === priestId);
    const durationChanged = (profile?.avg_confession_minutes || 15) !== newAvgMinutes;

    const futureConfirmedBookings = bookings.filter(b => 
      b.priest_id === priestId && 
      b.status === 'confirmed' && 
      !isSlotInPast(b.date, b.start_time)
    );

    const preservedBookings: Booking[] = [];
    const cancelledBookings: Booking[] = [];

    if (durationChanged) {
      // If duration changed, all slot boundaries shift across all days -> cancel all
      cancelledBookings.push(...futureConfirmedBookings);
    } else {
      // If duration is unchanged, check if booking's day and time window still exist in new schedule
      for (const booking of futureConfirmedBookings) {
        const bookingDay = new Date(booking.date + 'T00:00:00').getDay();
        
        // Find if there is a window in new schedule on this day that covers this booking
        const matchingWindow = newWeeklySchedule.find(w => 
          w.dayOfWeek === bookingDay && 
          w.startTime <= booking.start_time && 
          w.endTime >= booking.end_time
        );

        if (matchingWindow) {
          preservedBookings.push(booking);
        } else {
          cancelledBookings.push(booking);
        }
      }
    }

    // Estimate total slots across 14-day rolling window
    let totalSlotsEstimate = 0;
    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const d = new Date();
      d.setDate(d.getDate() + dayOffset);
      const dayOfWeek = d.getDay();
      const windowsForDay = newWeeklySchedule.filter(w => w.dayOfWeek === dayOfWeek);
      for (const win of windowsForDay) {
        const [sh, sm] = win.startTime.split(':').map(Number);
        const [eh, em] = win.endTime.split(':').map(Number);
        const totalMinutes = (eh * 60 + em) - (sh * 60 + sm);
        if (totalMinutes > 0) {
          totalSlotsEstimate += Math.floor(totalMinutes / newAvgMinutes);
        }
      }
    }

    return {
      durationChanged,
      preservedBookings,
      cancelledBookings,
      newSlotsEstimate: totalSlotsEstimate,
    };
  }, [priestProfiles, bookings]);

  // ----------------------------------------------------------------------------
  // Action 3: Smart Differential Priest Schedule & Duration Update
  // ----------------------------------------------------------------------------
  const updatePriestSchedule = useCallback(async (
    priestId: string, 
    avgMinutes: number, 
    weeklySchedule: WeeklyScheduleItem[]
  ): Promise<{ success: boolean; preservedCount: number; cancelledCount: number; error?: string }> => {
    try {
      if (!currentUser || (currentUser.role !== 'priest' && currentUser.role !== 'admin')) {
        return { success: false, preservedCount: 0, cancelledCount: 0, error: 'Unauthorized to edit schedule' };
      }

      const priest = allUsers.find(u => u.id === priestId);
      const impact = previewScheduleChangeImpact(priestId, avgMinutes, weeklySchedule);

      // Only cancel bookings that are strictly invalidated by the schedule changes
      const cancelledBookingIds = new Set(impact.cancelledBookings.map(b => b.id));

      for (const booking of impact.cancelledBookings) {
        const bookedUser = allUsers.find(u => u.id === booking.user_id);
        if (bookedUser) {
          logNotification({
            userId: bookedUser.id,
            type: 'booking_force_cancelled_schedule_change',
            recipientEmail: bookedUser.email,
            titleEn: 'Urgent: Confession Schedule Updated — Please Rebook',
            titleAr: 'تنبيه هام: تم تحديث جدول مواعيد أبونا — يرجى إعادة الحجز',
            bodyEn: impact.durationChanged
              ? `Your confession appointment with ${priest?.title_en || priest?.name} on ${booking.date} at ${booking.start_time} was cancelled because Father updated his average confession duration. Please rebook your slot.`
              : `Your confession appointment with ${priest?.title_en || priest?.name} on ${booking.date} at ${booking.start_time} was cancelled because Father removed or shortened this time window. Please rebook for another available time.`,
            bodyAr: impact.durationChanged
              ? `تم إلغاء موعد الاعتراف مع ${priest?.title_ar || priest?.name} يوم ${booking.date} الساعة ${booking.start_time} لتعديل متوسط مدة الاعتراف. يرجى الدخول لإعادة حجز موعد جديد.`
              : `تم إلغاء موعد الاعتراف مع ${priest?.title_ar || priest?.name} يوم ${booking.date} الساعة ${booking.start_time} لإلغاء أو تعديل فترة التواجد هذه. يرجى الدخول لاختيار موعد متاح آخر.`,
            metadata: {
              bookingId: booking.id,
              priestName: priest?.name,
              date: booking.date,
              time: booking.start_time,
            }
          });
        }
      }

      // Update bookings: only mark cancelled for those in cancelledBookingIds
      setBookings(prev => prev.map(b => {
        if (cancelledBookingIds.has(b.id)) {
          return {
            ...b,
            status: 'cancelled',
            cancellation_reason: 'priest_schedule_change',
            cancelled_by: currentUser.id,
            cancelled_at: new Date().toISOString(),
          };
        }
        return b;
      }));

      // Update priest profile
      setPriestProfiles(prev => prev.map(p => {
        if (p.priest_id === priestId) {
          return {
            ...p,
            avg_confession_minutes: avgMinutes,
            weekly_schedule: weeklySchedule,
            updated_at: new Date().toISOString(),
          };
        }
        return p;
      }));

      // If Supabase is connected, persist schedule changes
      if (supabase && isSupabaseConfigured) {
        await supabase
          .from('priest_profiles')
          .update({
            avg_confession_minutes: avgMinutes,
            weekly_schedule: weeklySchedule,
            updated_at: new Date().toISOString(),
          })
          .eq('priest_id', priestId);

        if (cancelledBookingIds.size > 0) {
          const idsArray = Array.from(cancelledBookingIds);
          await supabase
            .from('bookings')
            .update({
              status: 'cancelled',
              cancellation_reason: 'priest_schedule_change',
              cancelled_by: currentUser.id,
              cancelled_at: new Date().toISOString(),
            })
            .in('id', idsArray);
        }
      }

      return { 
        success: true, 
        preservedCount: impact.preservedBookings.length, 
        cancelledCount: impact.cancelledBookings.length 
      };

    } catch (err: any) {
      return { success: false, preservedCount: 0, cancelledCount: 0, error: err.message || 'Update failed' };
    }
  }, [currentUser, allUsers, previewScheduleChangeImpact, logNotification]);

  // ----------------------------------------------------------------------------
  // Action 4: Priest Adds Override / Blackout Date (Rule 4)
  // ----------------------------------------------------------------------------
  const addPriestOverride = useCallback(async (
    priestId: string, 
    override: ScheduleOverride
  ): Promise<{ success: boolean; cancelledCount: number; error?: string }> => {
    try {
      if (!currentUser) {
        return { success: false, cancelledCount: 0, error: 'Unauthorized' };
      }

      const priest = allUsers.find(u => u.id === priestId);

      let cancelledCount = 0;
      if (override.isUnavailable) {
        const affectedBookings = bookings.filter(b => 
          b.priest_id === priestId && 
          b.date === override.date && 
          b.status === 'confirmed'
        );

        for (const booking of affectedBookings) {
          const bookedUser = allUsers.find(u => u.id === booking.user_id);
          if (bookedUser) {
            logNotification({
              userId: bookedUser.id,
              type: 'booking_force_cancelled_priest_unavailable',
              recipientEmail: bookedUser.email,
              titleEn: 'Notice: Priest Unavailable on Confession Date',
              titleAr: 'اعتذار: عدم تواجد قدس أبونا في موعد الاعتراف',
              bodyEn: `Your confession appointment with ${priest?.title_en || priest?.name} on ${booking.date} at ${booking.start_time} has been cancelled due to Father's unavailability / emergency (${override.reason || 'Monastery / Parish travel'}). Please choose another date.`,
              bodyAr: `تم إلغاء موعد الاعتراف مع ${priest?.title_ar || priest?.name} يوم ${booking.date} الساعة ${booking.start_time} لظرف طارئ / اعتذار أبونا (${override.reason || 'سفر / خلوة'}). يرجى اختيار موعد آخر.`,
              metadata: {
                bookingId: booking.id,
                date: booking.date,
                time: booking.start_time,
                reason: override.reason,
              }
            });
          }
          cancelledCount++;
        }

        setBookings(prev => prev.map(b => {
          if (b.priest_id === priestId && b.date === override.date && b.status === 'confirmed') {
            return {
              ...b,
              status: 'cancelled',
              cancellation_reason: 'priest_unavailable',
              cancelled_by: currentUser.id,
              cancelled_at: new Date().toISOString(),
            };
          }
          return b;
        }));
      }

      const targetProfile = priestProfiles.find(p => p.priest_id === priestId);
      const filteredOverrides = (targetProfile?.schedule_overrides || []).filter(o => o.date !== override.date);
      const newOverrides = [...filteredOverrides, override];

      setPriestProfiles(prev => prev.map(p => {
        if (p.priest_id === priestId) {
          return {
            ...p,
            schedule_overrides: newOverrides,
            updated_at: new Date().toISOString(),
          };
        }
        return p;
      }));

      // If Supabase is connected, update database
      if (supabase && isSupabaseConfigured) {
        await supabase
          .from('priest_profiles')
          .update({
            schedule_overrides: newOverrides,
            updated_at: new Date().toISOString(),
          })
          .eq('priest_id', priestId);

        if (override.isUnavailable) {
          await supabase
            .from('bookings')
            .update({
              status: 'cancelled',
              cancellation_reason: 'priest_unavailable',
              cancelled_by: currentUser.id,
              cancelled_at: new Date().toISOString(),
            })
            .eq('priest_id', priestId)
            .eq('date', override.date)
            .eq('status', 'confirmed');
        }
      }

      return { success: true, cancelledCount };

    } catch (err: any) {
      return { success: false, cancelledCount: 0, error: err.message || 'Failed to add override' };
    }
  }, [currentUser, allUsers, bookings, priestProfiles, logNotification]);

  const deletePriestOverride = useCallback(async (priestId: string, overrideId: string) => {
    const targetProfile = priestProfiles.find(p => p.priest_id === priestId);
    const filteredOverrides = (targetProfile?.schedule_overrides || []).filter(o => o.id !== overrideId);

    setPriestProfiles(prev => prev.map(p => {
      if (p.priest_id === priestId) {
        return {
          ...p,
          schedule_overrides: filteredOverrides,
          updated_at: new Date().toISOString(),
        };
      }
      return p;
    }));

    // If Supabase is connected, update database
    if (supabase && isSupabaseConfigured) {
      await supabase
        .from('priest_profiles')
        .update({
          schedule_overrides: filteredOverrides,
          updated_at: new Date().toISOString(),
        })
        .eq('priest_id', priestId);
    }

    return { success: true };
  }, [priestProfiles]);

  // ----------------------------------------------------------------------------
  // Priest Profile Self-Update (Avatar, Name, Titles, Bio, Church)
  // ----------------------------------------------------------------------------
  const updatePriestProfileData = useCallback(async (
    priestId: string,
    userUpdates: Partial<User>,
    profileUpdates: Partial<PriestProfile>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!currentUser || (currentUser.role !== 'priest' && currentUser.role !== 'admin')) {
        return { success: false, error: 'Unauthorized: Only priest or admin can edit this profile' };
      }

      // If Supabase is connected, update database
      if (supabase && isSupabaseConfigured) {
        if (Object.keys(userUpdates).length > 0) {
          await supabase
            .from('users')
            .update({ ...userUpdates, updated_at: new Date().toISOString() })
            .eq('id', priestId);
        }
        if (Object.keys(profileUpdates).length > 0) {
          await supabase
            .from('priest_profiles')
            .update({ ...profileUpdates, updated_at: new Date().toISOString() })
            .eq('priest_id', priestId);
        }
      }

      setAllUsers(prev => prev.map(u => {
        if (u.id === priestId) {
          const updated = { ...u, ...userUpdates, updated_at: new Date().toISOString() };
          // If editing active currentUser, keep currentUser state in sync
          if (currentUser?.id === priestId) {
            setCurrentUserState(updated);
          }
          return updated;
        }
        return u;
      }));

      setPriestProfiles(prev => prev.map(p => {
        if (p.priest_id === priestId) {
          return {
            ...p,
            ...profileUpdates,
            updated_at: new Date().toISOString(),
          };
        }
        return p;
      }));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update profile' };
    }
  }, [currentUser]);

  // ----------------------------------------------------------------------------
  // Super Admin Actions: User & Role Management
  // ----------------------------------------------------------------------------
  const createUser = useCallback(async (
    userData: Partial<User>, 
    priestProfileData?: Partial<PriestProfile>,
    password?: string
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      if (currentUser?.role !== 'admin') {
        return { success: false, error: 'Unauthorized: Only Super Admin can create accounts' };
      }

      if (!userData.email || !userData.name || !userData.role) {
        return { success: false, error: 'Name, email, and role are required' };
      }

      // Check unique email
      if (allUsers.some(u => u.email.toLowerCase() === userData.email?.toLowerCase())) {
        return { success: false, error: 'A user with this email address already exists' };
      }

      let createdId = 'usr_' + Math.random().toString(36).substring(2, 9);

      if (supabase && isSupabaseConfigured) {
        const { data: newRpcId, error: rpcError } = await supabase.rpc('admin_create_user', {
          p_email: userData.email.trim(),
          p_password: password || '123456',
          p_name: userData.name.trim(),
          p_phone: userData.phone?.trim() || null,
          p_role: userData.role,
          p_title_en: userData.title_en || userData.name,
          p_title_ar: userData.title_ar || userData.name,
          p_avatar_url: userData.avatar_url || null,
          p_assigned_priest_ids: userData.assigned_priest_ids || [],
          p_avg_duration: priestProfileData?.avg_confession_minutes || 15,
          p_church_name_en: priestProfileData?.church_name_en || 'Saint Mark Church Shobra',
          p_church_name_ar: priestProfileData?.church_name_ar || 'كنيسة الشهيد العظيم مارمرقس بشبرا',
          p_bio_en: priestProfileData?.bio_en || null,
          p_bio_ar: priestProfileData?.bio_ar || null
        });

        if (rpcError) {
          return { success: false, error: rpcError.message };
        }
        if (newRpcId) {
          createdId = newRpcId;
        }
        await fetchDatabaseFromSupabase();
      }

      const newUser: User = {
        id: createdId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || undefined,
        role: userData.role,
        title_en: userData.title_en || userData.name,
        title_ar: userData.title_ar || userData.name,
        assigned_priest_ids: userData.role === 'secretary' ? (userData.assigned_priest_ids || []) : undefined,
        avatar_url: userData.avatar_url || DEFAULT_SKELETON_AVATAR,
        created_at: new Date().toISOString(),
      };

      setAllUsers(prev => [newUser, ...prev.filter(u => u.id !== createdId)]);

      // If priest, create PriestProfile
      if (userData.role === 'priest') {
        const newProfile: PriestProfile = {
          priest_id: createdId,
          avg_confession_minutes: priestProfileData?.avg_confession_minutes || 15,
          weekly_schedule: priestProfileData?.weekly_schedule || [
            { id: 'w_' + Math.random().toString(36).substring(2, 6), dayOfWeek: 0, startTime: '12:00', endTime: '15:00' },
            { id: 'w_' + Math.random().toString(36).substring(2, 6), dayOfWeek: 3, startTime: '18:00', endTime: '21:00' },
            { id: 'w_' + Math.random().toString(36).substring(2, 6), dayOfWeek: 5, startTime: '17:00', endTime: '20:00' },
          ],
          schedule_overrides: [],
          church_name_ar: priestProfileData?.church_name_ar || 'كنيسة الشهيد العظيم مارمرقس بشبرا',
          church_name_en: priestProfileData?.church_name_en || 'Saint Mark Church Shobra',
          bio_ar: priestProfileData?.bio_ar || 'كاهن ومرشد روحي بكنيسة الشهيد العظيم مارمرقس بشبرا.',
          bio_en: priestProfileData?.bio_en || 'Parish priest & spiritual counselor at Saint Mark Church Shobra.',
          created_at: new Date().toISOString(),
        };
        setPriestProfiles(prev => [newProfile, ...prev.filter(p => p.priest_id !== createdId)]);
      }

      return { success: true, user: newUser };

    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to create user' };
    }
  }, [currentUser, allUsers, fetchDatabaseFromSupabase]);

  const adminResetPassword = useCallback(async (
    userId: string, 
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (currentUser?.role !== 'admin') {
        return { success: false, error: 'Unauthorized: Only Super Admin can reset passwords' };
      }
      if (!newPassword || newPassword.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long' };
      }

      if (supabase && isSupabaseConfigured) {
        const { error } = await supabase.rpc('admin_reset_user_password', {
          p_target_user_id: userId,
          p_new_password: newPassword
        });
        if (error) {
          return { success: false, error: error.message };
        }
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to reset password' };
    }
  }, [currentUser]);

  const updateUser = useCallback(async (
    userId: string, 
    updates: Partial<User>, 
    priestProfileData?: Partial<PriestProfile>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (currentUser?.role !== 'admin') {
        return { success: false, error: 'Unauthorized' };
      }

      setAllUsers(prev => prev.map(u => {
        if (u.id === userId) {
          const updated = {
            ...u,
            ...updates,
            updated_at: new Date().toISOString(),
          };
          if (currentUser?.id === userId) {
            setCurrentUserState(updated);
          }
          return updated;
        }
        return u;
      }));

      // If user is promoted to priest or priest profile data is passed, update/create profile
      if (updates.role === 'priest' || priestProfileData) {
        setPriestProfiles(prev => {
          const exists = prev.some(p => p.priest_id === userId);
          if (exists) {
            return prev.map(p => {
              if (p.priest_id === userId) {
                return { ...p, ...priestProfileData, updated_at: new Date().toISOString() };
              }
              return p;
            });
          }
          return [
            ...prev,
            {
              priest_id: userId,
              avg_confession_minutes: priestProfileData?.avg_confession_minutes || 15,
              weekly_schedule: [
                { id: 'w_' + Math.random().toString(36).substring(2, 6), dayOfWeek: 0, startTime: '12:00', endTime: '15:00' },
                { id: 'w_' + Math.random().toString(36).substring(2, 6), dayOfWeek: 5, startTime: '17:00', endTime: '20:00' },
              ],
              schedule_overrides: [],
              church_name_ar: priestProfileData?.church_name_ar || 'كنيسة الشهيد العظيم مارمرقس بشبرا',
              church_name_en: priestProfileData?.church_name_en || 'Saint Mark Church Shobra',
              bio_ar: priestProfileData?.bio_ar || 'كاهن ومرشد روحي.',
              bio_en: priestProfileData?.bio_en || 'Parish priest.',
              created_at: new Date().toISOString(),
            }
          ];
        });
      }

      // If Supabase is configured, persist user and profile updates
      if (supabase && isSupabaseConfigured) {
        await supabase
          .from('users')
          .update({
            name: updates.name,
            phone: updates.phone,
            role: updates.role,
            title_en: updates.title_en,
            title_ar: updates.title_ar,
            avatar_url: updates.avatar_url,
            assigned_priest_ids: updates.assigned_priest_ids,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (updates.role === 'priest' || priestProfileData) {
          await supabase
            .from('priest_profiles')
            .upsert({
              priest_id: userId,
              ...(priestProfileData || {}),
              updated_at: new Date().toISOString()
            });
        }
      }

      return { success: true };

    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update user' };
    }
  }, [currentUser]);

  const deleteUser = useCallback(async (userId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (currentUser?.role !== 'admin') {
        return { success: false, error: 'Unauthorized' };
      }

      if (currentUser.id === userId) {
        return { success: false, error: 'Cannot delete the active logged in admin account' };
      }

      if (supabase && isSupabaseConfigured) {
        await supabase.from('users').delete().eq('id', userId);
        await supabase.from('priest_profiles').delete().eq('priest_id', userId);
      }

      setAllUsers(prev => prev.filter(u => u.id !== userId));
      setPriestProfiles(prev => prev.filter(p => p.priest_id !== userId));
      setBookings(prev => prev.filter(b => b.user_id !== userId && b.priest_id !== userId));

      return { success: true };

    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to delete user' };
    }
  }, [currentUser]);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotificationLogs(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
    if (supabase && isSupabaseConfigured) {
      supabase
        .from('notification_logs')
        .update({ is_read: true })
        .eq('id', notificationId)
        .then(() => {}, () => {});
    }
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotificationLogs(prev => prev.map(n => ({ ...n, is_read: true })));
    if (supabase && isSupabaseConfigured && currentUser) {
      supabase
        .from('notification_logs')
        .update({ is_read: true })
        .eq('user_id', currentUser.id)
        .then(() => {}, () => {});
    }
  }, [currentUser]);

  const refreshData = useCallback(() => {
    fetchDatabaseFromSupabase();
    setBookings(prev => [...prev]);
  }, [fetchDatabaseFromSupabase]);

  return (
    <AppStoreContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isLoggedIn,
        login,
        loginWithEmail,
        logout,
        signIn,
        signUp,
        signOut,
        resetPassword,
        allUsers,
        priests,
        secretaries,
        generalUsers,
        priestProfiles,
        bookings,
        notificationLogs,
        unreadNotificationsCount,
        selectedPriestForBooking,
        setSelectedPriestForBooking,
        selectedPriestForSecretary,
        setSelectedPriestForSecretary,
        getPriestProfile,
        getPriestSlots,
        getUserActiveBooking,
        getUserBookings,
        getPriestBookings,
        getSecretaryAssignedPriests,
        bookSlot,
        cancelBooking,
        updateBookingAttendance,
        previewScheduleChangeImpact,
        updatePriestSchedule,
        addPriestOverride,
        deletePriestOverride,
        updatePriestProfileData,
        createUser,
        updateUser,
        deleteUser,
        adminResetPassword,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        refreshData,
      }}
    >
      {children}
    </AppStoreContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppStoreProvider');
  }
  return context;
};
