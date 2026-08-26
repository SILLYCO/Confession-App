import React, { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { Booking } from '../../types/database';
import { X, XCircle, ShieldAlert } from 'lucide-react';

interface SecretaryCancelModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SecretaryCancelModal: React.FC<SecretaryCancelModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t, language, formatDate, formatTime } = useTranslation();
  const { cancelBooking, currentUser, allUsers } = useAppStore();

  const [reason, setReason] = useState(language === 'ar' ? 'طلب المعترف الإلغاء عبر اتصال هاتفي بمكتب السكرتارية' : 'Member called church office to cancel');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const priest = allUsers.find(u => u.id === booking.priest_id);
  const member = allUsers.find(u => u.id === booking.user_id);

  const handleConfirmCancel = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    const result = await cancelBooking(booking.id, currentUser.id, reason || 'secretary_cancelled');
    setIsSubmitting(false);

    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMsg(result.error || (language === 'ar' ? 'فشل إلغاء الموعد' : 'Failed to cancel appointment'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 p-6 space-y-4">
        
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2.5 text-rose-600">
            <ShieldAlert className="w-6 h-6" />
            <h3 className="text-base font-bold text-navy-950 font-serif">
              {t.secretaryFlow.cancelOnBehalfTitle}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1 text-stone-700">
          <p><strong>{t.common.user}:</strong> {language === 'ar' ? (member?.title_ar || member?.name) : (member?.title_en || member?.name)} ({member?.email})</p>
          <p><strong>{t.common.priest}:</strong> {language === 'ar' ? (priest?.title_ar || priest?.name) : (priest?.title_en || priest?.name)}</p>
          <p><strong>{t.common.date}:</strong> {formatDate(booking.date)}</p>
          <p><strong>{t.common.time}:</strong> {formatTime(booking.start_time)} - {formatTime(booking.end_time)}</p>
        </div>

        <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-[11px] text-purple-900">
          ℹ️ {t.secretaryFlow.emergencyOverrideNote}
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">
            {t.secretaryFlow.cancelReason}
          </label>
          <input
            type="text"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={language === 'ar' ? 'مثلاً: ظرف طارئ للمعترف، عذر مرضي، اعتذار من أبونا' : 'e.g. Member emergency, medical excuse, priest reschedule'}
            className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200 transition"
          >
            {t.common.cancel}
          </button>
          <button
            type="button"
            onClick={handleConfirmCancel}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow transition"
          >
            <XCircle className="w-4 h-4" />
            <span>{isSubmitting ? t.common.saving : 'Confirm Cancellation'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
