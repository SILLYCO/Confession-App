import React from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { Badge } from '../common/Badge';
import { UserActiveBookingCard } from './UserActiveBookingCard';
import { Calendar, History } from 'lucide-react';

export const UserBookingsHistory: React.FC = () => {
  const { t, language, formatDate, formatTime } = useTranslation();
  const { currentUser, getUserActiveBooking, getUserBookings, allUsers } = useAppStore();

  const activeBooking = currentUser ? getUserActiveBooking(currentUser.id) : undefined;
  const allUserBookings = currentUser ? getUserBookings(currentUser.id) : [];
  const pastOrCancelledBookings = allUserBookings.filter(b => b.id !== activeBooking?.id);

  const getReasonLabel = (reason?: string) => {
    if (!reason) return '';
    const key = reason as keyof typeof t.cancellationReasons;
    return t.cancellationReasons[key] || reason;
  };

  return (
    <div className="space-y-8">
      
      {/* Active Appointment Section */}
      <div>
        <h2 className="text-xl font-bold font-serif text-navy-950 mb-4">
          {t.userFlow.upcomingAppointment}
        </h2>
        {activeBooking ? (
          <UserActiveBookingCard booking={activeBooking} />
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 shadow-sm text-stone-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-stone-300" />
            <p className="text-sm font-medium">{t.userFlow.noUpcomingAppointments}</p>
            <p className="text-xs text-stone-400 mt-1">
              {language === 'ar' 
                ? 'اختر أحد الآباء الكهنة من الصفحة الرئيسية لحجز موعد اعترافك القادم.' 
                : 'Select a priest on the main page to reserve your next confession slot.'}
            </p>
          </div>
        )}
      </div>

      {/* Past and Cancelled Bookings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-church-700" />
          <h3 className="text-lg font-bold text-navy-950 font-serif">
            {t.userFlow.pastAppointments}
          </h3>
        </div>

        {pastOrCancelledBookings.length === 0 ? (
          <div className="bg-stone-50 rounded-2xl p-6 text-center border border-stone-200 text-stone-400 text-xs">
            {language === 'ar' 
              ? 'لا توجد مواعيد سابقة أو ملغاة في سجلك.' 
              : 'No past or cancelled appointments in your history.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastOrCancelledBookings.map((b) => {
              const priest = allUsers.find(u => u.id === b.priest_id);

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-navy-950">
                      {language === 'ar' ? (priest?.title_ar || priest?.name) : (priest?.title_en || priest?.name)}
                    </h4>
                    <Badge status={b.status} size="sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <div>
                      <span className="text-stone-400 block text-[10px]">{t.common.date}</span>
                      <span className="font-medium">{formatDate(b.date)}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">{t.common.time}</span>
                      <span className="font-medium">{formatTime(b.start_time)}</span>
                    </div>
                  </div>

                  {b.status === 'completed' && (
                    <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-[11px] text-sky-900 font-medium">
                      <span>✓ {language === 'ar' ? 'تم نوال سر الاعتراف المقدس بنجاح.' : 'Confession sacrament completed successfully.'}</span>
                    </div>
                  )}

                  {b.status === 'no_show' && (
                    <div className="p-2.5 rounded-xl bg-stone-100 border border-stone-200 text-[11px] text-stone-700 font-medium">
                      <span>{language === 'ar' ? 'لم يتم الحضور في الموعد المحدد.' : 'Member did not attend appointment.'}</span>
                    </div>
                  )}

                  {b.status === 'cancelled' && b.cancellation_reason && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-[11px] text-rose-800">
                      <span className="font-bold">
                        {language === 'ar' ? 'السبب: ' : 'Reason: '}
                      </span>
                      <span>{getReasonLabel(b.cancellation_reason)}</span>
                    </div>
                  )}

                  {b.notes && (
                    <p className="text-xs italic text-stone-500">
                      "{b.notes}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
