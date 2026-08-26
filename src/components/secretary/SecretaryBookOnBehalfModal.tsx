import React, { useState, useMemo } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { Slot } from '../../types/database';
import { format, addDays } from 'date-fns';
import { X, UserPlus, CheckCircle, AlertTriangle } from 'lucide-react';

interface SecretaryBookOnBehalfModalProps {
  isOpen: boolean;
  initialPriestId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const SecretaryBookOnBehalfModal: React.FC<SecretaryBookOnBehalfModalProps> = ({
  isOpen,
  initialPriestId,
  onClose,
  onSuccess,
}) => {
  const { t, language, formatDate, formatTime, getDayName } = useTranslation();
  const { 
    generalUsers, 
    priests, 
    getPriestSlots, 
    bookSlot, 
    getUserActiveBooking 
  } = useAppStore();

  const [selectedUserId, setSelectedUserId] = useState<string>(generalUsers[0]?.id || '');
  const [selectedPriestId, setSelectedPriestId] = useState<string>(initialPriestId || priests[0]?.id || '');
  
  // 14 days
  const rollingDays = useMemo(() => {
    const days: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      days.push(addDays(today, i));
    }
    return days;
  }, []);

  const [selectedDate, setSelectedDate] = useState<Date>(rollingDays[0]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetUser = generalUsers.find(u => u.id === selectedUserId);
  const userActiveBooking = targetUser ? getUserActiveBooking(targetUser.id) : undefined;

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const priestSlots = selectedPriestId ? getPriestSlots(selectedPriestId, new Date(), 14) : [];
  const daySlots = priestSlots.filter(s => s.date === selectedDateStr && s.status === 'available');

  const handleConfirm = async () => {
    if (!selectedSlot || !selectedUserId) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    const result = await bookSlot(selectedSlot.id, selectedUserId, notes || 'Booked via Church Secretary Office');
    setIsSubmitting(false);

    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMsg(result.error || 'Failed to book slot');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-navy-950 text-white p-6 flex items-center justify-between border-b border-navy-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif">{t.secretaryFlow.bookOnBehalf}</h3>
              <p className="text-xs text-stone-300">{t.secretaryFlow.bookOnBehalfDesc}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-navy-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* User Selection */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              1. {t.secretaryFlow.selectUserToBook}
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => {
                setSelectedUserId(e.target.value);
                setSelectedSlot(null);
              }}
              className="w-full text-xs font-semibold p-3 rounded-xl border border-stone-300 bg-stone-50 focus:ring-2 focus:ring-purple-500"
            >
              {generalUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {language === 'ar' ? (u.title_ar || u.name) : (u.title_en || u.name)} ({u.email})
                </option>
              ))}
            </select>

            {userActiveBooking && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">
                    {language === 'ar' ? 'يوجد حجز نشط بالفعل لهذا المعترف:' : 'Member Already Has an Active Booking:'}
                  </p>
                  <p>• {formatDate(userActiveBooking.date)} at {formatTime(userActiveBooking.start_time)}</p>
                  <p className="text-[11px] text-amber-800 mt-1">
                    {language === 'ar' 
                      ? 'لحجز موعد آخر، يجب إلغاء حجزه الحالي أولاً من لوحة المواعيد.' 
                      : 'To book a different slot, cancel their existing booking first from the dashboard.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Priest Selection */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              2. {language === 'ar' ? 'اختر أب الاعتراف' : 'Select Priest'}
            </label>
            <select
              value={selectedPriestId}
              onChange={(e) => {
                setSelectedPriestId(e.target.value);
                setSelectedSlot(null);
              }}
              className="w-full text-xs font-semibold p-3 rounded-xl border border-stone-300 bg-stone-50 focus:ring-2 focus:ring-purple-500"
            >
              {priests.map((p) => (
                <option key={p.id} value={p.id}>
                  {language === 'ar' ? (p.title_ar || p.name) : (p.title_en || p.name)}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              3. {language === 'ar' ? 'اختر التاريخ (خلال 14 يوماً)' : 'Select Date (14-Day Horizon)'}
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {rollingDays.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const isSelected = format(selectedDate, 'yyyy-MM-dd') === dateStr;
                const availCount = priestSlots.filter(s => s.date === dateStr && s.status === 'available').length;

                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => {
                      setSelectedDate(day);
                      setSelectedSlot(null);
                    }}
                    className={`shrink-0 p-2.5 rounded-xl border text-center min-w-[70px] transition ${
                      isSelected
                        ? 'bg-purple-700 text-white border-purple-800 shadow-md font-bold'
                        : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700'
                    }`}
                  >
                    <span className="text-[10px] block opacity-80">{getDayName(day.getDay())}</span>
                    <span className="text-sm font-bold">{format(day, 'd MMM')}</span>
                    <span className="text-[10px] block mt-0.5 text-emerald-600 font-semibold">
                      {availCount} {language === 'ar' ? 'متاح' : 'open'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Available Slots */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              4. {language === 'ar' ? `اختر موعداً متاحاً في ${formatDate(selectedDate)}` : `Pick an Available Slot on ${formatDate(selectedDate)}`}
            </label>

            {daySlots.length === 0 ? (
              <p className="text-xs text-stone-400 p-4 bg-stone-50 rounded-xl text-center">
                {language === 'ar' ? 'لا توجد مواعيد متاحة لقدس أبونا في هذا اليوم.' : 'No open slots for this priest on this date.'}
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {daySlots.map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition text-center ${
                        isSelected
                          ? 'bg-purple-900 text-white border-purple-950 ring-2 ring-purple-400'
                          : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      <span>{formatTime(slot.start_time)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t.common.notes}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={language === 'ar' ? 'مثلاً: حجز هاتفي بناءً على طلب المعترف' : 'e.g. Phone reservation requested by member'}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-300"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition"
          >
            {t.common.cancel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting || !selectedSlot || Boolean(userActiveBooking)}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white text-xs font-bold shadow transition"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isSubmitting ? t.common.saving : (language === 'ar' ? 'تأكيد الحجز نيابة عن المعترف' : 'Confirm Booking on Behalf')}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
