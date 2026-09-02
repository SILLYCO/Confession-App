import React, { useMemo } from 'react';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { DEFAULT_SKELETON_AVATAR } from '../../types/database';
import { Badge } from '../common/Badge';
import { 
  Users, 
  Church, 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  UserPlus, 
  Activity, 
  TrendingUp, 
  ArrowRight,
  Shield,
  Layers,
  Check
} from 'lucide-react';

interface SuperAdminMonitoringDashboardProps {
  onOpenPriestWizard: () => void;
  onOpenCreateUserModal: () => void;
  onNavigateToUserDirectory: () => void;
}

export const SuperAdminMonitoringDashboard: React.FC<SuperAdminMonitoringDashboardProps> = ({
  onOpenPriestWizard,
  onOpenCreateUserModal,
  onNavigateToUserDirectory,
}) => {
  const { t, language, formatDate, formatTime } = useTranslation();
  const { 
    allUsers, 
    priests, 
    secretaries, 
    generalUsers, 
    bookings, 
    priestProfiles, 
    getPriestSlots 
  } = useAppStore();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 0 }); // Sunday
  const weekEnd = endOfWeek(now, { weekStartsOn: 0 });

  // Confession KPIs
  const bookingsToday = useMemo(() => {
    return bookings.filter(b => b.date === todayStr);
  }, [bookings, todayStr]);

  const bookingsThisWeek = useMemo(() => {
    return bookings.filter(b => {
      try {
        const bookingDate = parseISO(b.date);
        return isWithinInterval(bookingDate, { start: weekStart, end: weekEnd });
      } catch {
        return false;
      }
    });
  }, [bookings, weekStart, weekEnd]);

  const confirmedBookingsCount = useMemo(() => bookings.filter(b => b.status === 'confirmed').length, [bookings]);
  const completedBookingsCount = useMemo(() => bookings.filter(b => b.status === 'completed').length, [bookings]);
  const noShowBookingsCount = useMemo(() => bookings.filter(b => b.status === 'no_show').length, [bookings]);
  const cancelledBookingsCount = useMemo(() => bookings.filter(b => b.status === 'cancelled').length, [bookings]);

  const totalPastOrCompleted = completedBookingsCount + noShowBookingsCount;
  const completionRate = totalPastOrCompleted > 0 
    ? Math.round((completedBookingsCount / totalPastOrCompleted) * 100) 
    : 100;

  // Priest Capacities
  const priestCapacities = useMemo(() => {
    return priests.map((priest) => {
      const profile = priestProfiles.find(p => p.priest_id === priest.id);
      const slots = getPriestSlots(priest.id, new Date(), 14);
      const totalSlots = slots.length;
      const bookedSlots = slots.filter(s => s.status === 'booked').length;
      const availableSlots = slots.filter(s => s.status === 'available').length;
      const utilizationRate = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;
      const windowsCount = profile?.weekly_schedule?.length || 0;

      return {
        priest,
        profile,
        windowsCount,
        avgMinutes: profile?.avg_confession_minutes || 15,
        totalSlots,
        bookedSlots,
        availableSlots,
        utilizationRate,
      };
    });
  }, [priests, priestProfiles, getPriestSlots]);

  // Recent Parish Activity Feed
  const recentActivities = useMemo(() => {
    const sorted = [...bookings].sort((a, b) => {
      const timeA = a.created_at || a.date;
      const timeB = b.created_at || b.date;
      return timeB.localeCompare(timeA);
    }).slice(0, 8);

    return sorted.map((b) => {
      const member = allUsers.find(u => u.id === b.user_id);
      const priest = allUsers.find(u => u.id === b.priest_id);
      return {
        booking: b,
        member,
        priest,
      };
    });
  }, [bookings, allUsers]);

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Super Admin Top Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-church-950 p-6 sm:p-8 text-white shadow-xl border border-gold-500/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 text-xs font-bold border border-gold-400/30">
              <Shield className="w-4 h-4 text-gold-400" />
              <span>Super Administrator • Holy Sacrament Oversight</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-serif font-bold text-white">
              {t.adminFlow.monitoringTitle}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              {t.adminFlow.monitoringSubtitle}
            </p>
          </div>

          {/* Quick Action Buttons Header */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenPriestWizard}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gold-500 hover:bg-gold-600 text-navy-950 text-xs font-bold shadow-lg hover:shadow-xl transition-all scale-100 hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-navy-950" />
              <span>{t.adminFlow.addPriestWizard}</span>
            </button>

            <button
              onClick={onOpenCreateUserModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition"
            >
              <UserPlus className="w-4 h-4 text-gold-400" />
              <span>{t.adminFlow.addSecretaryOrUser}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Parishioners */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              {t.adminFlow.totalMembers}
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-navy-950">{generalUsers.length}</span>
            <p className="text-[10px] text-stone-400 mt-0.5">{language === 'ar' ? 'مسجلين بالمنظومة' : 'Registered members'}</p>
          </div>
        </div>

        {/* Priests */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              {t.adminFlow.totalPriests}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Church className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-navy-950">{priests.length}</span>
            <p className="text-[10px] text-stone-400 mt-0.5">{language === 'ar' ? 'آباء كهنة متاحون' : 'Active Fathers'}</p>
          </div>
        </div>

        {/* Secretaries */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              {t.adminFlow.totalSecretaries}
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-navy-950">{secretaries.length}</span>
            <p className="text-[10px] text-stone-400 mt-0.5">{language === 'ar' ? 'أمانة سر الكنيسة' : 'Operations staff'}</p>
          </div>
        </div>

        {/* Bookings Today */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              {t.adminFlow.todayBookings}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-emerald-950">{bookingsToday.length}</span>
            <p className="text-[10px] text-emerald-600 font-medium mt-0.5">{formatDate(now)}</p>
          </div>
        </div>

        {/* Bookings This Week */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              {t.adminFlow.weekBookings}
            </span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-sky-950">{bookingsThisWeek.length}</span>
            <p className="text-[10px] text-stone-400 mt-0.5">{language === 'ar' ? 'حجوزات أسبوعية' : 'Rolling week'}</p>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              {t.adminFlow.attendanceRate}
            </span>
            <div className="p-2 rounded-xl bg-gold-50 text-church-800">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-navy-950">{completionRate}%</span>
            <p className="text-[10px] text-church-700 font-medium mt-0.5">{completedBookingsCount} {language === 'ar' ? 'نالوا السر' : 'completed'}</p>
          </div>
        </div>

      </div>

      {/* Grid: Priests Confession Capacity & Live Parish Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 spans): Priests Confession Capacity & Schedule Overview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold font-serif text-navy-950">
                {t.adminFlow.priestCapacitiesTitle}
              </h3>
              <p className="text-xs text-stone-500">
                {t.adminFlow.priestCapacitiesDesc}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden divide-y divide-stone-100">
            {priestCapacities.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400">
                {language === 'ar' ? 'لا يوجد آباء كهنة مسجلين حالياً.' : 'No priests registered in the system.'}
              </div>
            ) : (
              priestCapacities.map(({ priest, profile, windowsCount, avgMinutes, totalSlots, bookedSlots, availableSlots, utilizationRate }) => (
                <div key={priest.id} className="p-5 sm:p-6 hover:bg-stone-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  <div className="flex items-center gap-3.5">
                    <img
                      src={priest.avatar_url || DEFAULT_SKELETON_AVATAR}
                      alt={priest.name}
                      className="w-13 h-13 rounded-2xl object-cover ring-2 ring-gold-400/80 shadow bg-stone-100 shrink-0"
                    />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-navy-950">
                        {language === 'ar' ? (priest.title_ar || priest.name) : (priest.title_en || priest.name)}
                      </h4>
                      <p className="text-xs text-stone-500">
                        {language === 'ar' ? profile?.church_name_ar : profile?.church_name_en}
                      </p>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-[11px] font-bold bg-gold-100 text-church-900 px-2.5 py-0.5 rounded-full border border-gold-300">
                          ⏱ {avgMinutes} {t.common.minutes}
                        </span>
                        <span className="text-[11px] font-semibold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full">
                          {windowsCount} {language === 'ar' ? 'فترات أسبوعية' : 'weekly windows'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-1.5 shrink-0 bg-stone-50 sm:bg-transparent p-3 sm:p-0 rounded-2xl">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-navy-950">{bookedSlots}</span>
                      <span className="text-stone-400">/</span>
                      <span className="text-stone-600 font-semibold">{totalSlots} {language === 'ar' ? 'موعد إجمالي (14 يوم)' : 'total slots (14d)'}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full sm:w-36 bg-stone-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          utilizationRate > 80 ? 'bg-rose-500' : utilizationRate > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, utilizationRate)}%` }}
                      />
                    </div>

                    <span className="text-[10px] text-stone-500 font-medium">
                      {availableSlots} {t.status.available} ({utilizationRate}% {language === 'ar' ? 'محجوز' : 'booked'})
                    </span>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column (1 span): Live Activity Stream & Fast Navigation */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold font-serif text-navy-950">
                {t.adminFlow.recentActivityTitle}
              </h3>
              <p className="text-xs text-stone-500">
                {t.adminFlow.recentActivityDesc}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3 max-h-[480px] overflow-y-auto">
            {recentActivities.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-400">
                {language === 'ar' ? 'لا توجد أنشطة مسجلة حتى الآن.' : 'No recent activities recorded yet.'}
              </div>
            ) : (
              recentActivities.map(({ booking, member, priest }) => (
                <div 
                  key={booking.id}
                  className="p-3 rounded-2xl bg-stone-50 border border-stone-100 hover:border-stone-200 transition space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy-950">
                      {member?.name || 'Congregation Member'}
                    </span>
                    <Badge status={booking.status} size="sm" />
                  </div>

                  <p className="text-stone-500 text-[11px]">
                    {language === 'ar' ? `مع ${priest?.title_ar || priest?.name}` : `with ${priest?.title_en || priest?.name}`}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-200/60">
                    <span>{formatDate(booking.date)} • {formatTime(booking.start_time)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* User Directory Quick Link Card */}
          <div className="bg-gradient-to-br from-purple-50 to-stone-50 rounded-3xl p-5 border border-purple-200/80 shadow-sm flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-navy-950 font-serif">
                {t.adminFlow.openUserDirectory}
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                {language === 'ar' ? 'إدارة المستخدمين، الأدوار، وتعيين كلمات المرور.' : 'Manage accounts, roles, and reset credentials.'}
              </p>
            </div>
            <button
              onClick={onNavigateToUserDirectory}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-950 hover:bg-navy-900 text-gold-400 text-xs font-bold shadow shrink-0 transition"
            >
              <span>{t.common.actions}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
