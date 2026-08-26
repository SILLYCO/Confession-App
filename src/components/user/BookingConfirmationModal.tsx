import React, { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { Slot, User } from '../../types/database';
import { X, Calendar, Clock, CheckCircle, ShieldCheck, User as UserIcon } from 'lucide-react';

interface BookingConfirmationModalProps {
  slot: Slot;
  priest: User;
  targetUser: User;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  slot,
  priest,
  targetUser,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { t, language, formatDate, formatTime } = useTranslation();
  const { bookSlot, currentUser } = useAppStore();

  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    const result = await bookSlot(slot.id, targetUser.id, notes);
    setIsSubmitting(false);

    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMsg(result.error || 'Failed to confirm booking');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200">
        
        {/* Header */}
        <div className="bg-navy-900 text-white p-6 flex items-center justify-between border-b border-navy-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500 text-navy-950 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif">{t.userFlow.bookSlotTitle}</h3>
              <p className="text-xs text-gold-300">
                {language === 'ar' ? (priest.title_ar || priest.name) : (priest.title_en || priest.name)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-300 hover:text-white hover:bg-navy-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Slot Summary Card */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-500 pb-2 border-b border-stone-200">
              <span className="font-semibold">{t.common.priest}</span>
              <span className="font-bold text-stone-800">{priest.name}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-500 pb-2 border-b border-stone-200">
              <span className="font-semibold">{t.common.user}</span>
              <span className="font-bold text-navy-900">{targetUser.name}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-500 pb-2 border-b border-stone-200">
              <span className="font-semibold">{t.common.date}</span>
              <span className="font-bold text-stone-800">{formatDate(slot.date)}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="font-semibold">{t.common.time}</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
              </span>
            </div>
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              {t.common.notes}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Regular confession, fasting confession, marriage counsel..."
              rows={2}
              className="w-full text-xs rounded-xl border border-stone-300 p-3 focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          {/* Notice */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
            <p className="font-bold">⚠️ {t.common.notice}</p>
            <p>
              By confirming, this slot will be exclusively reserved for you. An email confirmation will be dispatched automatically.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition"
            >
              {t.common.cancel}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-navy-950 hover:bg-navy-900 text-gold-400 text-xs font-bold shadow-md hover:shadow-lg transition"
            >
              <CheckCircle className="w-4 h-4 text-gold-400" />
              <span>{isSubmitting ? t.common.saving : t.common.confirm}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
