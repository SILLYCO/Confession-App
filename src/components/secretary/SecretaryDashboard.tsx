import React, { useState, useMemo } from 'react';
import { format, addDays } from 'date-fns';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { Booking, User, DEFAULT_SKELETON_AVATAR } from '../../types/database';
import { Badge } from '../common/Badge';
import { SecretaryBookOnBehalfModal } from './SecretaryBookOnBehalfModal';
import { SecretaryCancelModal } from './SecretaryCancelModal';
import { 
  ShieldCheck, 
  UserPlus, 
  Search, 
  Calendar, 
  Clock, 
  XCircle, 
  Church, 
  ArrowLeft, 
  ArrowRight, 
  Lock, 
  ChevronRight, 
  Users,
  X,
  CalendarDays,
  Filter
} from 'lucide-react';

export const SecretaryDashboard: React.FC = () => {
  const { t, language, formatDate, formatTime } = useTranslation();
  const { 
    currentUser, 
    bookings, 
    priests, 
    allUsers, 
    getSecretaryAssignedPriests,
    selectedPriestForSecretary,
    setSelectedPriestForSecretary,
    refreshData 
  } = useAppStore();

  const assignedPriests = getSecretaryAssignedPriests(currentUser?.id);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'confirmed' | 'completed' | 'no_show' | 'cancelled'>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('');
  
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);

  // If a priest is selected, filter bookings specifically for this priest
  const priestBookings = useMemo(() => {
    if (!selectedPriestForSecretary) return [];
    return bookings.filter(b => b.priest_id === selectedPriestForSecretary.id);
  }, [bookings, selectedPriestForSecretary]);

  // Unique dates that have bookings for quick chips
  const uniqueBookingDates = useMemo(() => {
    const dates = Array.from(new Set(priestBookings.map(b => b.date))).sort();
    return dates;
  }, [priestBookings]);

  const filteredBookings = useMemo(() => {
    return priestBookings
      .filter((b) => {
        if (selectedStatusFilter !== 'all' && b.status !== selectedStatusFilter) {
          return false;
        }
        if (selectedDateFilter && b.date !== selectedDateFilter) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const member = allUsers.find(u => u.id === b.user_id);
          const matchUser = member?.name.toLowerCase().includes(q) || member?.email.toLowerCase().includes(q);
          if (!matchUser) return false;
        }
        return true;
      })
      .sort((a, b) => (b.date + b.start_time).localeCompare(a.date + a.start_time));
  }, [priestBookings, selectedStatusFilter, selectedDateFilter, searchQuery, allUsers]);

  // View 1: Assigned Priests Cards (Homepage View)
  if (!selectedPriestForSecretary) {
    return (
      <div className="space-y-8 animate-in fade-in">
        
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-navy-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-purple-500/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-400/30">
                <ShieldCheck className="w-4 h-4" />
                <span>Church Operations & Secretary Center</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-serif font-bold text-white">
                {t.secretaryFlow.overviewTitle}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
                {t.secretaryFlow.overviewSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Permissions Rule Note */}
        <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 text-xs text-stone-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-stone-500 shrink-0" />
            <span>
              <strong>{language === 'ar' ? 'صلاحيات الدور:' : 'Role Boundary:'}</strong> {language === 'ar' ? 'يمكن للسكرتارية حجز أو إلغاء المواعيد نيابة عن الشعب، ولا يمكن تعديل جدول فترات أو متوسط وقت أبونا.' : 'Secretary can book or cancel appointments on behalf of any member, but cannot edit Priest schedules or average durations.'}
            </span>
          </div>
          <span className="text-[11px] bg-white px-2 py-0.5 rounded border border-stone-300 shrink-0 font-medium">
            Postgres RLS Security
          </span>
        </div>

        {/* Assigned Priests Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-navy-950">
                {t.secretaryFlow.myAssignedPriestsTitle}
              </h3>
              <p className="text-xs text-stone-500">
                {t.secretaryFlow.myAssignedPriestsDesc}
              </p>
            </div>
            <span className="text-xs font-semibold bg-purple-100 text-purple-900 px-3 py-1 rounded-full border border-purple-200">
              {assignedPriests.length} {language === 'ar' ? 'آباء مسندون' : 'Assigned Fathers'}
            </span>
          </div>

          {assignedPriests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 text-stone-400 text-sm">
              {t.secretaryFlow.noAssignedPriests}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assignedPriests.map((priest) => {
                const totalPriestBookings = bookings.filter(b => b.priest_id === priest.id);
                const confirmedCount = totalPriestBookings.filter(b => b.status === 'confirmed').length;
                const todayStr = new Date().toISOString().split('T')[0];
                const todayCount = totalPriestBookings.filter(b => b.date === todayStr && b.status === 'confirmed').length;

                return (
                  <div
                    key={priest.id}
                    onClick={() => setSelectedPriestForSecretary(priest)}
                    className="group relative overflow-hidden rounded-3xl p-6 sm:p-7 border-2 border-stone-200 hover:border-purple-500 bg-white hover:bg-purple-50/20 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
                  >
                    
                    <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-start gap-4 sm:gap-5">
                      <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ring-2 ring-purple-400/80 shadow-md overflow-hidden bg-stone-100 flex items-center justify-center">
                        <img
                          src={priest.avatar_url || DEFAULT_SKELETON_AVATAR}
                          alt={priest.name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Church className="w-4 h-4 text-purple-600" />
                          <h3 className="text-base sm:text-lg font-bold text-navy-950 group-hover:text-purple-700 transition-colors">
                            {language === 'ar' ? (priest.title_ar || priest.name) : (priest.title_en || priest.name)}
                          </h3>
                        </div>

                        <p className="text-xs text-stone-500 mt-1 truncate">
                          {priest.email}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{confirmedCount} {t.status.confirmed}</span>
                          </span>

                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gold-50 text-church-900 px-2.5 py-1 rounded-full border border-gold-300">
                            <Clock className="w-3.5 h-3.5 text-church-700" />
                            <span>{todayCount} {language === 'ar' ? 'اليوم' : 'Today'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-xs text-stone-500 font-medium">
                        {language === 'ar' ? 'انقر لعرض المواعيد والحجز نيابة عن المعترفين' : 'Click to inspect appointments & book on behalf'}
                      </span>
                      
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPriestForSecretary(priest);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-700 group-hover:bg-purple-600 text-white text-xs font-bold shadow transition"
                      >
                        <span>{t.secretaryFlow.viewPriestBookingsBtn}</span>
                        <ArrowRight className="w-4 h-4 rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    );
  }

  // View 2: Dedicated Priest Bookings & Operations View
  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Top Header with Back Button and Quick Priest Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setSelectedPriestForSecretary(null)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-xs sm:text-sm font-bold text-navy-950 shadow-sm transition self-start"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{t.secretaryFlow.backToAssignedPriests}</span>
        </button>

        {/* Quick Priest Switcher */}
        {assignedPriests.length > 1 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500 font-semibold">{t.secretaryFlow.selectPriestToManage}:</span>
            <select
              value={selectedPriestForSecretary.id}
              onChange={(e) => {
                const found = assignedPriests.find(p => p.id === e.target.value);
                if (found) setSelectedPriestForSecretary(found);
              }}
              className="p-2 rounded-xl border border-stone-300 bg-white font-bold text-navy-950 focus:ring-2 focus:ring-purple-500"
            >
              {assignedPriests.map(p => (
                <option key={p.id} value={p.id}>
                  {language === 'ar' ? (p.title_ar || p.name) : (p.title_en || p.name)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Priest Details & Summary Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-navy-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-purple-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-start gap-4 sm:gap-5">
            <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ring-4 ring-purple-400 shadow-md overflow-hidden bg-stone-800 flex items-center justify-center">
              <img
                src={selectedPriestForSecretary.avatar_url || DEFAULT_SKELETON_AVATAR}
                alt={selectedPriestForSecretary.name}
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-1 border border-purple-400/30">
                <Church className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'عمليات السكرتارية لقدس أبونا' : 'Secretary Operations for Priest'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                {language === 'ar' ? (selectedPriestForSecretary.title_ar || selectedPriestForSecretary.name) : (selectedPriestForSecretary.title_en || selectedPriestForSecretary.name)}
              </h2>
              <p className="text-xs text-stone-300">
                {selectedPriestForSecretary.email}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsBookModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-900/40 hover:scale-105 transition self-start md:self-auto"
          >
            <UserPlus className="w-5 h-5" />
            <span>{t.secretaryFlow.bookOnBehalf}</span>
          </button>

        </div>
      </div>

      {/* Stats Cards for Selected Priest */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
            {t.secretaryFlow.totalBookings}
          </span>
          <p className="text-xl sm:text-2xl font-bold text-navy-950 mt-1">
            {priestBookings.length}
          </p>
        </div>

        <div className="bg-emerald-50/70 rounded-2xl p-4 sm:p-5 border border-emerald-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            {t.secretaryFlow.upcomingConfirmed}
          </span>
          <p className="text-xl sm:text-2xl font-bold text-emerald-950 mt-1">
            {priestBookings.filter(b => b.status === 'confirmed').length}
          </p>
        </div>

        <div className="bg-sky-50/70 rounded-2xl p-4 sm:p-5 border border-sky-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800">
            {t.status.completed}
          </span>
          <p className="text-xl sm:text-2xl font-bold text-sky-950 mt-1">
            {priestBookings.filter(b => b.status === 'completed').length}
          </p>
        </div>

        <div className="bg-rose-50/70 rounded-2xl p-4 sm:p-5 border border-rose-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
            {t.secretaryFlow.cancelledTotal}
          </span>
          <p className="text-xl sm:text-2xl font-bold text-rose-950 mt-1">
            {priestBookings.filter(b => b.status === 'cancelled' || b.status === 'no_show').length}
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Member Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute start-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'ar' ? 'البحث عن موعد باسم المعترف أو بريده الإلكتروني...' : 'Search appointments by member name or email...'}
              className="w-full text-xs ps-10 pe-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Date Picker Input */}
          <div className="w-full sm:w-auto flex items-center gap-1.5">
            <div className="relative flex-1 sm:w-52">
              <Calendar className="w-4 h-4 text-purple-600 absolute start-3 top-3 pointer-events-none" />
              <input
                type="date"
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                className="w-full text-xs font-semibold ps-9 pe-8 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:ring-2 focus:ring-purple-500"
                title={t.secretaryFlow.filterByDate}
              />
              {selectedDateFilter && (
                <button
                  type="button"
                  onClick={() => setSelectedDateFilter('')}
                  className="absolute end-2 top-2.5 p-0.5 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-700"
                  title={t.common.cancel}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="w-full sm:w-44">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">{t.secretaryFlow.filterByStatus} ({t.common.all})</option>
              <option value="confirmed">{t.status.confirmed}</option>
              <option value="completed">{t.status.completed}</option>
              <option value="no_show">{t.status.no_show}</option>
              <option value="cancelled">{t.status.cancelled}</option>
            </select>
          </div>

        </div>

        {/* Quick Date Shortcut Chips */}
        <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider me-1 flex items-center gap-1">
            <CalendarDays className="w-3.5 h-3.5 text-purple-600" />
            <span>{t.secretaryFlow.filterByDate}:</span>
          </span>

          <button
            type="button"
            onClick={() => setSelectedDateFilter('')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              selectedDateFilter === ''
                ? 'bg-purple-900 text-white font-bold shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {language === 'ar' ? 'جميع التواريخ' : 'All Dates'} ({priestBookings.length})
          </button>

          {/* Today Button */}
          {(() => {
            const todayStr = format(new Date(), 'yyyy-MM-dd');
            const todayCount = priestBookings.filter(b => b.date === todayStr).length;
            return (
              <button
                type="button"
                onClick={() => setSelectedDateFilter(todayStr)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  selectedDateFilter === todayStr
                    ? 'bg-purple-900 text-white font-bold shadow-sm'
                    : todayCount > 0
                    ? 'bg-gold-100 text-church-900 font-semibold border border-gold-300 hover:bg-gold-200'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {language === 'ar' ? 'اليوم' : 'Today'} ({todayCount})
              </button>
            );
          })()}

          {/* Tomorrow Button */}
          {(() => {
            const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');
            const tomorrowCount = priestBookings.filter(b => b.date === tomorrowStr).length;
            return (
              <button
                type="button"
                onClick={() => setSelectedDateFilter(tomorrowStr)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  selectedDateFilter === tomorrowStr
                    ? 'bg-purple-900 text-white font-bold shadow-sm'
                    : tomorrowCount > 0
                    ? 'bg-purple-100 text-purple-900 font-semibold border border-purple-300 hover:bg-purple-200'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {language === 'ar' ? 'غداً' : 'Tomorrow'} ({tomorrowCount})
              </button>
            );
          })()}

          {/* Unique dates with bookings */}
          {uniqueBookingDates.slice(0, 5).map((dateStr) => {
            const todayStr = format(new Date(), 'yyyy-MM-dd');
            const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');
            if (dateStr === todayStr || dateStr === tomorrowStr) return null;

            const count = priestBookings.filter(b => b.date === dateStr).length;
            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => setSelectedDateFilter(dateStr)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                  selectedDateFilter === dateStr
                    ? 'bg-purple-900 text-white font-bold shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {formatDate(dateStr)} ({count})
              </button>
            );
          })}

          {/* Clear all filters if any filter active */}
          {(selectedDateFilter || selectedStatusFilter !== 'all' || searchQuery.trim()) && (
            <button
              type="button"
              onClick={() => {
                setSelectedDateFilter('');
                setSelectedStatusFilter('all');
                setSearchQuery('');
              }}
              className="ms-auto inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-800 hover:underline font-semibold"
            >
              <X className="w-3 h-3" />
              <span>{language === 'ar' ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}</span>
            </button>
          )}

        </div>

      </div>

      {/* Bookings Table / Cards for this Priest */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-base text-navy-950 font-serif">
              {t.secretaryFlow.allBookingsTitle} {language === 'ar' ? (selectedPriestForSecretary.title_ar || selectedPriestForSecretary.name) : (selectedPriestForSecretary.title_en || selectedPriestForSecretary.name)} ({filteredBookings.length})
            </h3>
            
            {selectedDateFilter && (
              <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full text-xs font-bold border border-purple-200">
                <Calendar className="w-3 h-3 text-purple-600" />
                <span>{formatDate(selectedDateFilter)}</span>
                <button
                  type="button"
                  onClick={() => setSelectedDateFilter('')}
                  className="p-0.5 hover:text-rose-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-stone-400 text-sm">
            {selectedDateFilter
              ? (language === 'ar' ? `لا توجد مواعيد لقدس أبونا في تاريخ ${formatDate(selectedDateFilter)}.` : `No bookings found for this priest on ${formatDate(selectedDateFilter)}.`)
              : (language === 'ar' ? 'لا توجد حجوزات لقدس أبونا مطابقة لمعايير البحث الحالية.' : 'No bookings found for this priest matching current filters.')}
          </div>
        ) : (
          <div className="divide-y divide-stone-200 overflow-x-auto">
            {filteredBookings.map((b) => {
              const member = allUsers.find(u => u.id === b.user_id);

              return (
                <div
                  key={b.id}
                  className="p-5 hover:bg-stone-50/80 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={member?.avatar_url || DEFAULT_SKELETON_AVATAR}
                      alt={member?.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-stone-200 shrink-0"
                    />

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-navy-950">
                          {language === 'ar' ? (member?.title_ar || member?.name) : (member?.title_en || member?.name)}
                        </span>
                        <Badge status={b.status} size="sm" />
                      </div>

                      <p className="text-xs text-stone-500">
                        {member?.email} {member?.phone && `• ${member.phone}`}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 pt-1">
                        <span className="bg-stone-100 px-2 py-0.5 rounded font-medium">
                          <Calendar className="w-3 h-3 inline me-1 text-church-600" />
                          {formatDate(b.date)}
                        </span>
                        <span className="bg-stone-100 px-2 py-0.5 rounded font-medium">
                          <Clock className="w-3 h-3 inline me-1 text-church-600" />
                          {formatTime(b.start_time)} - {formatTime(b.end_time)}
                        </span>
                      </div>

                      {b.notes && (
                        <p className="text-xs italic text-stone-500 pt-1">
                          "{b.notes}"
                        </p>
                      )}

                      {b.cancellation_reason && (
                        <p className="text-xs text-rose-700 font-medium">
                          Reason: {b.cancellation_reason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {b.status === 'confirmed' && (
                      <button
                        onClick={() => setCancellingBooking(b)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel (Override)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Secretary Modals */}
      <SecretaryBookOnBehalfModal
        isOpen={isBookModalOpen}
        initialPriestId={selectedPriestForSecretary.id}
        onClose={() => setIsBookModalOpen(false)}
        onSuccess={refreshData}
      />

      {cancellingBooking && (
        <SecretaryCancelModal
          booking={cancellingBooking}
          isOpen={Boolean(cancellingBooking)}
          onClose={() => setCancellingBooking(null)}
          onSuccess={refreshData}
        />
      )}

    </div>
  );
};
