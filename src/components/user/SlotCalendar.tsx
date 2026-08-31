import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { User, Slot } from '../../types/database';
import { format, addDays, isSameDay } from 'date-fns';
import { BookingConfirmationModal } from './BookingConfirmationModal';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  AlertCircle, 
  Info,
  Sparkles,
  CheckCircle2,
  Filter
} from 'lucide-react';

interface SlotCalendarProps {
  priest: User;
  onBookingComplete?: () => void;
}

export const SlotCalendar: React.FC<SlotCalendarProps> = ({ priest, onBookingComplete }) => {
  const { t, language, formatDate, formatTime, getDayName } = useTranslation();
  const { 
    currentUser, 
    bookings,
    getPriestSlots, 
    getPriestProfile, 
    getUserActiveBooking 
  } = useAppStore();

  const profile = getPriestProfile(priest.id);
  const activeBooking = currentUser?.role === 'general' ? getUserActiveBooking() : undefined;

  // 14-day rolling horizon starting from today
  const rollingDays = useMemo(() => {
    const days: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      days.push(addDays(today, i));
    }
    return days;
  }, []);

  const [selectedDate, setSelectedDate] = useState<Date>(rollingDays[0]);
  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState<Slot | null>(null);
  const [showActiveBookingBlockedModal, setShowActiveBookingBlockedModal] = useState(false);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  // Fetch all 14-day slots for this priest
  const allSlots = useMemo(() => {
    return getPriestSlots(priest.id, new Date(), 14);
  }, [getPriestSlots, priest.id]);

  // Filter displayed days based on "Show Available Days Only" checkbox
  const displayedDays = useMemo(() => {
    if (!showAvailableOnly) return rollingDays;
    return rollingDays.filter(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const daySlots = allSlots.filter(s => s.date === dateStr && s.status !== 'unavailable');
      return daySlots.some(s => s.status === 'available');
    });
  }, [rollingDays, showAvailableOnly, allSlots]);

  // Auto-adjust selected date if current selection is filtered out by the toggle
  useEffect(() => {
    if (displayedDays.length > 0) {
      const isCurrentSelectedVisible = displayedDays.some(d => isSameDay(d, selectedDate));
      if (!isCurrentSelectedVisible) {
        setSelectedDate(displayedDays[0]);
      }
    }
  }, [displayedDays, selectedDate]);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const isSelectedToday = isSameDay(selectedDate, new Date());

  // Slots on selected date (filter out expired past slots with status 'unavailable')
  const daySlots = useMemo(() => {
    return allSlots
      .filter((s) => s.date === selectedDateStr && s.status !== 'unavailable')
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [allSlots, selectedDateStr]);

  const availableCountOnSelectedDay = daySlots.filter(s => s.status === 'available').length;

  // Helper to check if a slot is booked by current user
  const isSlotBookedByMe = (slot: Slot) => {
    if (!currentUser) return false;
    return bookings.some(b => 
      b.user_id === currentUser.id && 
      b.priest_id === priest.id && 
      b.date === slot.date && 
      b.start_time.startsWith(slot.start_time) && 
      b.status === 'confirmed'
    );
  };

  const handleSlotClick = (slot: Slot) => {
    if (slot.status !== 'available') return;

    // Check Rule 2: If current general user already has an active booking
    if (currentUser?.role === 'general' && activeBooking) {
      setShowActiveBookingBlockedModal(true);
      return;
    }

    setSelectedSlotForBooking(slot);
  };

  return (
    <div className="space-y-6">
      
      {/* Calendar Header / Priest summary & Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-navy-950">
              {language === 'ar' ? (priest.title_ar || priest.name) : (priest.title_en || priest.name)}
            </h3>
            <span className="text-xs bg-gold-100 text-church-900 px-2.5 py-0.5 rounded-full font-bold border border-gold-300">
              ⏱ {profile?.avg_confession_minutes || 15} {t.common.minutes}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {t.userFlow.selectSlotDesc}
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            <span>{t.status.available}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-stone-300 inline-block"></span>
            <span>{t.status.booked}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-gold-100 border border-gold-300 text-navy-950 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-gold-500 inline-block"></span>
            <span>{t.userFlow.yourBookedSlotBadge}</span>
          </div>
        </div>
      </div>

      {/* 14-Day Horizon Horizontal Date Picker & "Show Available Days Only" Filter */}
      <div className="relative space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 uppercase tracking-wider">
            <CalendarIcon className="w-3.5 h-3.5 text-gold-600" />
            <span>{language === 'ar' ? 'فترة الحجز المتاحة (14 يوماً)' : '14-Day Rolling Horizon'}</span>
            <span className="text-[11px] text-stone-400 font-normal ml-1">
              ({formatDate(rollingDays[0])} — {formatDate(rollingDays[13])})
            </span>
          </div>

          {/* "Show Available Days Only" Checkbox */}
          <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 cursor-pointer shadow-sm transition select-none text-xs font-bold self-start sm:self-auto">
            <input
              type="checkbox"
              checked={showAvailableOnly}
              onChange={(e) => setShowAvailableOnly(e.target.checked)}
              className="w-4 h-4 rounded text-gold-600 focus:ring-gold-500 accent-gold-600 cursor-pointer"
            />
            <span className="flex items-center gap-1">
              <Filter className="w-3 h-3 text-gold-600" />
              <span>{t.userFlow.showAvailableDaysOnly}</span>
            </span>
          </label>
        </div>

        {/* Horizontal Days Scroll */}
        {displayedDays.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-stone-200 text-center text-xs text-stone-500 space-y-1">
            <p className="font-bold text-stone-700">{t.userFlow.noAvailableDays}</p>
            <p className="text-[11px] text-stone-400">
              {language === 'ar' ? 'يمكنك إلغاء تفعيل الفلتر لعرض كامل الـ 14 يوماً.' : 'You can uncheck the filter to view all 14 days.'}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none">
            {displayedDays.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const isSelected = isSameDay(day, selectedDate);
              const slotsForThisDay = allSlots.filter(s => s.date === dateStr);
              const availCount = slotsForThisDay.filter(s => s.status === 'available').length;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(day)}
                  className={`shrink-0 flex flex-col items-center justify-center p-3 rounded-2xl min-w-[85px] border transition-all ${
                    isSelected
                      ? 'bg-navy-950 text-white border-navy-950 shadow-md scale-105 ring-2 ring-gold-400'
                      : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <span className="text-[11px] font-medium opacity-80">
                    {getDayName(day.getDay())}
                  </span>
                  <span className="text-lg font-bold my-0.5">
                    {format(day, 'd')}
                  </span>
                  <span className="text-[10px] opacity-70">
                    {format(day, 'MMM')}
                  </span>

                  {availCount > 0 ? (
                    <span className={`mt-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-gold-500 text-navy-950' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {availCount} {t.status.available}
                    </span>
                  ) : (
                    <span className="mt-1 text-[10px] text-stone-400">
                      —
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Day Slots Grid */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
          <div>
            <h4 className="text-base font-bold text-navy-950">
              {formatDate(selectedDate, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h4>
            <p className="text-xs text-stone-500 mt-0.5">
              {language === 'ar' 
                ? `${availableCountOnSelectedDay} موعد متاح (مدة كل موعد ${profile?.avg_confession_minutes || 15} دقيقة)` 
                : `${availableCountOnSelectedDay} slots available (${profile?.avg_confession_minutes || 15} mins each)`}
            </p>
          </div>

          {activeBooking && currentUser?.role === 'general' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs">
              <Info className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.userFlow.mustCancelFirst}</span>
            </div>
          )}
        </div>

        {/* Slot Buttons Grid */}
        {daySlots.length === 0 ? (
          <div className="text-center py-12 text-stone-400">
            <Clock className="w-10 h-10 mx-auto mb-2 opacity-30 text-stone-600" />
            <p className="text-sm font-medium">
              {isSelectedToday
                ? (language === 'ar' ? 'انتهت جميع فترات الاعتراف المتاحة لليوم.' : 'All confession slots for today have ended.')
                : t.userFlow.noSlotsAvailable}
            </p>
            <p className="text-xs text-stone-400 mt-1">
              {isSelectedToday
                ? (language === 'ar' ? 'يرجى اختيار تاريخ قادم من الأيام المتاحة في الأعلى لحجز موعدك.' : 'Please select an upcoming date from the calendar above.')
                : (language === 'ar' 
                  ? 'لا توجد فترات تواجد مجدولة لقدس أبونا أو تم تسجيل اعتذار في هذا اليوم.' 
                  : 'Father has no scheduled hours or has a date override on this day.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {daySlots.map((slot) => {
              const isAvailable = slot.status === 'available';
              const isMyBooking = isSlotBookedByMe(slot);

              // 1. Current user's confirmed booking slot -> Highlighted in rich liturgical gold!
              if (isMyBooking) {
                return (
                  <div
                    key={slot.id}
                    className="p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all bg-gradient-to-br from-gold-400 via-amber-400 to-gold-500 text-navy-950 font-bold border-2 border-gold-300 shadow-md ring-2 ring-gold-400/60 scale-105"
                  >
                    <div className="flex items-center gap-1 text-navy-950 mb-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-navy-950 shrink-0" />
                      <span className="text-sm font-bold">
                        {formatTime(slot.start_time)}
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold text-navy-950 bg-white/50 px-2 py-0.5 rounded-full mt-0.5">
                      {t.userFlow.yourBookedSlotBadge}
                    </span>
                  </div>
                );
              }

              // 2. Available slot -> Clickable green/stone button
              if (isAvailable) {
                return (
                  <button
                    key={slot.id}
                    onClick={() => handleSlotClick(slot)}
                    className="p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all bg-stone-50 hover:bg-gold-500 hover:text-navy-950 border border-stone-200 hover:border-gold-500 shadow-sm hover:scale-105 font-bold text-navy-950 cursor-pointer"
                  >
                    <span className="text-sm font-bold">
                      {formatTime(slot.start_time)}
                    </span>
                    <span className="text-[10px] opacity-75 mt-0.5 text-emerald-700">
                      {t.status.available}
                    </span>
                  </button>
                );
              }

              // 3. Booked by someone else -> Dimmed & line-through
              return (
                <div
                  key={slot.id}
                  className="p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed line-through opacity-70"
                >
                  <span className="text-sm font-bold">
                    {formatTime(slot.start_time)}
                  </span>
                  <span className="text-[10px] opacity-75 mt-0.5">
                    {t.status.booked}
                  </span>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Booking Confirmation Dialog Modal */}
      {selectedSlotForBooking && currentUser && (
        <BookingConfirmationModal
          slot={selectedSlotForBooking}
          priest={priest}
          targetUser={currentUser}
          isOpen={Boolean(selectedSlotForBooking)}
          onClose={() => setSelectedSlotForBooking(null)}
          onSuccess={() => {
            if (onBookingComplete) onBookingComplete();
          }}
        />
      )}

      {/* Active Booking Restriction Warning Modal */}
      {showActiveBookingBlockedModal && activeBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertCircle className="w-7 h-7" />
              <h3 className="text-lg font-bold text-navy-950">{t.userFlow.activeBookingWarning}</h3>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {t.userFlow.activeBookingDetails}
            </p>

            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-stone-800 space-y-1">
              <p><strong>{language === 'ar' ? 'حجزك النشط الحالي:' : 'Current Active Booking:'}</strong></p>
              <p>• {t.common.date}: {formatDate(activeBooking.date)}</p>
              <p>• {t.common.time}: {formatTime(activeBooking.start_time)}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowActiveBookingBlockedModal(false)}
                className="px-5 py-2.5 rounded-xl bg-navy-950 text-gold-400 text-xs font-bold hover:bg-navy-900 transition"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
