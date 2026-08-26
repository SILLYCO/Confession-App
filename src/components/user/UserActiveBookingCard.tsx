import React, { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { Booking } from '../../types/database';
import { isWithinTwoHourCutoff } from '../../lib/slotGenerator';
import { Badge } from '../common/Badge';
import { 
  Calendar, 
  Clock, 
  User as UserIcon, 
  AlertTriangle, 
  XCircle, 
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';

interface UserActiveBookingCardProps {
  booking: Booking;
}

export const UserActiveBookingCard: React.FC<UserActiveBookingCardProps> = ({ booking }) => {
  const { t, language, formatDate, formatTime } = useTranslation();
  const { currentUser, cancelBooking, allUsers } = useAppStore();
  
  const [isCancelling, setIsCancelling] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const priest = allUsers.find(u => u.id === booking.priest_id);
  const isCutoffExceeded = isWithinTwoHourCutoff(booking.date, booking.start_time);

  const handleCancel = async () => {
    if (!currentUser) return;
    setIsCancelling(true);
    setErrorMsg(null);
    const result = await cancelBooking(booking.id, currentUser.id, 'user_cancelled');
    setIsCancelling(false);
    setConfirmModalOpen(false);

    if (!result.success) {
      setErrorMsg(result.error || 'Failed to cancel');
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-gold-50/90 via-white to-stone-50 border-2 border-gold-400/80 rounded-2xl p-5 sm:p-6 shadow-lg shadow-gold-500/10">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gold-500 text-navy-950 font-bold shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-church-700 bg-gold-200/70 px-2 py-0.5 rounded-full">
                {t.userFlow.upcomingAppointment}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-navy-950 mt-0.5">
                {language === 'ar' ? (priest?.title_ar || priest?.name) : (priest?.title_en || priest?.name)}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge status={booking.status} />
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-4 text-sm">
          
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/80 border border-stone-200/70">
            <Calendar className="w-5 h-5 text-church-600 shrink-0" />
            <div>
              <p className="text-xs text-stone-500">{t.common.date}</p>
              <p className="font-semibold text-stone-900">{formatDate(booking.date)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/80 border border-stone-200/70">
            <Clock className="w-5 h-5 text-church-600 shrink-0" />
            <div>
              <p className="text-xs text-stone-500">{t.common.time}</p>
              <p className="font-semibold text-stone-900">
                {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/80 border border-stone-200/70 sm:col-span-2 md:col-span-1">
            <UserIcon className="w-5 h-5 text-church-600 shrink-0" />
            <div>
              <p className="text-xs text-stone-500">{t.common.user}</p>
              <p className="font-semibold text-stone-900">{currentUser?.name || 'Member'}</p>
            </div>
          </div>

        </div>

        {/* Rule 2 & 3 Notice Banner */}
        <div className="mt-2 p-3.5 rounded-xl bg-navy-50 border border-navy-200 text-xs text-navy-900 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-navy-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">{t.userFlow.activeBookingDetails}</p>
            {isCutoffExceeded ? (
              <p className="text-rose-700 font-semibold">
                ⚠️ {t.userFlow.contactSecretaryToCancel} ({t.userFlow.secretaryPhone} | {t.userFlow.secretaryEmail})
              </p>
            ) : (
              <p className="text-stone-600">
                {language === 'ar' 
                  ? 'ℹ️ يمكنك إلغاء هذا الموعد بنفسك حتى ساعتين قبل موعد البدء.' 
                  : 'ℹ️ You may cancel this appointment up to 2 hours before the start time.'}
              </p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gold-200/60">
          
          {errorMsg && (
            <p className="text-xs text-rose-600 font-semibold">{errorMsg}</p>
          )}

          <div className="ms-auto flex items-center gap-3 w-full sm:w-auto">
            {isCutoffExceeded ? (
              <div className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-stone-100 text-stone-500 text-xs font-semibold border border-stone-300 cursor-not-allowed">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>{t.userFlow.twoHourCutoffWarning}</span>
              </div>
            ) : (
              <button
                onClick={() => setConfirmModalOpen(true)}
                disabled={isCancelling}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition"
              >
                <XCircle className="w-4 h-4" />
                <span>{t.userFlow.cancelBookingTitle}</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Confirmation Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-stone-900">{t.userFlow.cancelBookingTitle}</h3>
            </div>

            <p className="text-sm text-stone-600 leading-relaxed">
              {t.userFlow.cancelBookingConfirm}
            </p>

            <div className="p-3 bg-stone-50 rounded-xl text-xs space-y-1 text-stone-700">
              <p><strong>{t.common.priest}:</strong> {priest?.name}</p>
              <p><strong>{t.common.date}:</strong> {formatDate(booking.date)}</p>
              <p><strong>{t.common.time}:</strong> {formatTime(booking.start_time)}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200 transition"
              >
                {t.common.back}
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition"
              >
                {isCancelling ? t.common.loading : t.userFlow.cancelBookingTitle}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
