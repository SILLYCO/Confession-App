import React, { useState, useMemo } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { User, Slot } from '../../types/database';
import { format, addDays, isSameDay } from 'date-fns';
import { BookingConfirmationModal } from './BookingConfirmationModal';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  AlertCircle, 
  Info
} from 'lucide-react';

interface SlotCalendarProps {
  priest: User;
  onBookingComplete?: () => void;
}

export const SlotCalendar: React.FC<SlotCalendarProps> = ({ priest, onBookingComplete }) => {
  const { t, language, formatDate, formatTime, getDayName } = useTranslation();
  const { 
    currentUser, 
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

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

  // Fetch all 14-day slots for this priest
  const allSlots = useMemo(() => {
    return getPriestSlots(priest.id, new Date(), 14);
  }, [getPriestSlots, priest.id]);

  const isSelectedToday = isSameDay(selectedDate, new Date());

  // Slots on selected date (filter out expired past slots with status 'unavailable')
  const daySlots = useMemo(() => {
    return allSlots
      .filter((s) => s.date === selectedDateStr && s.status !== 'unavailable')
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [allSlots, selectedDateStr]);

  const availableCountOnSelectedDay = daySlots.filter(s => s.status === 'available').length;

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
      
      {/* Calendar Header / Priest summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-stone-200 shadow-sm">
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

        <div className="flex items-center gap-3 text-xs text-stone-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            <span>{t.status.available}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span>{t.status.booked}</span>
          </div>
        </div>
      </div>

      {/* 14-Day Horizon Horizontal Date Picker */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-gold-600" />
            <span>{language === 'ar' ? 'فترة الحجز المتاحة (14 يوماً)' : '14-Day Rolling Horizon'}</span>
          </span>
          <span className="text-xs text-stone-400">
            {formatDate(rollingDays[0])} — {formatDate(rollingDays[13])}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none">
          {rollingDays.map((day) => {
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

              return (
                <button
                  key={slot.id}
                  disabled={!isAvailable}
                  onClick={() => handleSlotClick(slot)}
                  className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all ${
                    isAvailable
                      ? 'bg-stone-50 hover:bg-gold-500 hover:text-navy-950 border border-stone-200 hover:border-gold-500 shadow-sm hover:scale-105 font-bold text-navy-950 cursor-pointer'
                      : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed line-through opacity-70'
                  }`}
                >
                  <span className="text-sm font-bold">
                    {formatTime(slot.start_time)}
                  </span>
                  <span className="text-[10px] opacity-75 mt-0.5">
                    {isAvailable ? t.status.available : t.status.booked}
                  </span>
                </button>
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
