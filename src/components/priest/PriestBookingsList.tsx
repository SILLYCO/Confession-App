import React, { useState, useMemo } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { Badge } from '../common/Badge';
import { Booking, BookingStatus, DEFAULT_SKELETON_AVATAR } from '../../types/database';
import { format } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  Phone, 
  CheckCircle2, 
  UserX, 
  Check, 
  Lock, 
  FileText, 
  Filter, 
  UserCheck, 
  Eye
} from 'lucide-react';
import { PriestMemberDetailsModal } from './PriestMemberDetailsModal';

export const PriestBookingsList: React.FC = () => {
  const { t, language, formatDate, formatTime } = useTranslation();
  const { currentUser, getPriestBookings, allUsers, updateBookingAttendance } = useAppStore();

  const priestBookings = currentUser ? getPriestBookings(currentUser.id) : [];

  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'all'>('confirmed');
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [selectedBookingForModal, setSelectedBookingForModal] = useState<Booking | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);

  const filteredBookings = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return priestBookings
      .filter((b) => {
        if (showTodayOnly && b.date !== todayStr) return false;
        if (filterStatus !== 'all' && b.status !== filterStatus) return false;
        return true;
      })
      .sort((a, b) => (a.date + a.start_time).localeCompare(b.date + b.start_time));
  }, [priestBookings, filterStatus, showTodayOnly]);

  const todayBookingsCount = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return priestBookings.filter(b => b.date === todayStr && b.status === 'confirmed').length;
  }, [priestBookings]);

  const confirmedCount = useMemo(() => priestBookings.filter(b => b.status === 'confirmed').length, [priestBookings]);
  const completedCount = useMemo(() => priestBookings.filter(b => b.status === 'completed').length, [priestBookings]);
  const noShowCount = useMemo(() => priestBookings.filter(b => b.status === 'no_show').length, [priestBookings]);
  const cancelledCount = useMemo(() => priestBookings.filter(b => b.status === 'cancelled').length, [priestBookings]);

  const handleMarkAttendance = async (bookingId: string, status: 'completed' | 'no_show') => {
    setIsProcessingId(bookingId);
    const result = await updateBookingAttendance(bookingId, status);
    setIsProcessingId(null);

    if (result.success) {
      setFeedbackNotice(
        status === 'completed'
          ? t.priestFlow.markCompletedSuccess
          : t.priestFlow.markNoShowSuccess
      );
      setTimeout(() => setFeedbackNotice(null), 4000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header & Stats */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-serif text-navy-950">
              {t.priestFlow.upcomingConfessions}
            </h2>
            <p className="text-xs text-stone-500">
              {language === 'ar' 
                ? 'مواعيد الاعتراف المحجوزة من قبل أفراد الشعب لنوال الرعاية والإرشاد الروحي.' 
                : 'Confessions reserved by congregation members for your pastoral care.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="px-3.5 py-1.5 rounded-2xl bg-gold-50 border border-gold-300 text-center">
              <span className="block text-[10px] text-church-700 font-bold uppercase tracking-wider">
                {t.priestFlow.totalSlotsToday}
              </span>
              <span className="text-base font-bold text-navy-950">
                {todayBookingsCount}
              </span>
            </div>

            <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-center">
              <span className="block text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                {language === 'ar' ? 'المؤكد' : 'Confirmed'}
              </span>
              <span className="text-base font-bold text-emerald-950">
                {confirmedCount}
              </span>
            </div>

            <div className="px-3.5 py-1.5 rounded-2xl bg-sky-50 border border-sky-300 text-center">
              <span className="block text-[10px] text-sky-700 font-bold uppercase tracking-wider">
                {t.priestFlow.totalCompleted}
              </span>
              <span className="text-base font-bold text-sky-950">
                {completedCount}
              </span>
            </div>

            <div className="px-3.5 py-1.5 rounded-2xl bg-stone-100 border border-stone-300 text-center">
              <span className="block text-[10px] text-stone-600 font-bold uppercase tracking-wider">
                {t.priestFlow.totalNoShow}
              </span>
              <span className="text-base font-bold text-stone-800">
                {noShowCount}
              </span>
            </div>
          </div>
        </div>

        {feedbackNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackNotice}</span>
          </div>
        )}
      </div>

      {/* Filter Tabs & "Show Today Only" Checkbox */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(['confirmed', 'completed', 'no_show', 'cancelled', 'all'] as const).map((status) => {
            let label = t.common.all;
            let count = priestBookings.length;

            if (status === 'confirmed') {
              label = t.status.confirmed;
              count = confirmedCount;
            } else if (status === 'completed') {
              label = t.status.completed;
              count = completedCount;
            } else if (status === 'no_show') {
              label = t.status.no_show;
              count = noShowCount;
            } else if (status === 'cancelled') {
              label = t.status.cancelled;
              count = cancelledCount;
            }

            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition whitespace-nowrap flex items-center gap-1.5 ${
                  filterStatus === status
                    ? 'bg-navy-950 text-gold-400 border-navy-950 shadow-sm'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border-stone-200'
                }`}
              >
                <span>{label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  filterStatus === status ? 'bg-gold-500/30 text-gold-300' : 'bg-stone-200 text-stone-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* "Show Today's Appointments Only" Checkbox */}
        <label className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gold-50 hover:bg-gold-100/80 border border-gold-300 text-church-950 cursor-pointer shadow-sm transition select-none text-xs font-bold shrink-0 self-start sm:self-auto">
          <input
            type="checkbox"
            checked={showTodayOnly}
            onChange={(e) => setShowTodayOnly(e.target.checked)}
            className="w-4 h-4 rounded text-gold-600 focus:ring-gold-500 accent-gold-600 cursor-pointer"
          />
          <span className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-gold-600" />
            <span>{t.priestFlow.showTodayOnly}</span>
          </span>
        </label>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-sm text-stone-400 space-y-2">
          <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30 text-stone-600" />
          <p className="text-sm font-medium">{t.priestFlow.noAppointmentsScheduled}</p>
          {showTodayOnly && (
            <p className="text-xs text-stone-400">
              {language === 'ar' ? 'لا توجد مواعيد مسجلة لتاريخ اليوم. يمكنك إلغاء فلتر اليوم لعرض كافة المواعيد.' : 'No appointments scheduled for today. Uncheck the today filter to view all.'}
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBookings.map((b) => {
            const member = allUsers.find(u => u.id === b.user_id);
            const isBookingToday = b.date === format(new Date(), 'yyyy-MM-dd');
            const isProcessing = isProcessingId === b.id;

            return (
              <div
                key={b.id}
                className={`rounded-3xl p-5 border transition-all shadow-sm flex flex-col justify-between hover:shadow-md ${
                  isBookingToday && b.status === 'confirmed'
                    ? 'bg-gold-50/60 border-gold-300 ring-1 ring-gold-400'
                    : b.status === 'completed'
                    ? 'bg-sky-50/40 border-sky-200'
                    : b.status === 'no_show'
                    ? 'bg-stone-50/80 border-stone-300'
                    : 'bg-white border-stone-200'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Row: Member Info + Status Badge */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-stone-100">
                    <div 
                      onClick={() => setSelectedBookingForModal(b)}
                      className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
                    >
                      <img
                        src={member?.avatar_url || DEFAULT_SKELETON_AVATAR}
                        alt={member?.name}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-stone-200 group-hover:ring-gold-400 transition shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-navy-950 group-hover:text-gold-700 transition truncate">
                          {language === 'ar' ? (member?.title_ar || member?.name) : (member?.title_en || member?.name)}
                        </h4>
                        <p className="text-xs text-stone-500 truncate">
                          {member?.email}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <Badge status={b.status} size="sm" />
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-stone-600">
                    <div className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-xl">
                      <Calendar className="w-3.5 h-3.5 text-church-600 shrink-0" />
                      <span className="font-semibold">{formatDate(b.date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-xl">
                      <Clock className="w-3.5 h-3.5 text-church-600 shrink-0" />
                      <span className="font-semibold">{formatTime(b.start_time)} - {formatTime(b.end_time)}</span>
                    </div>
                  </div>

                  {/* Member Phone */}
                  {member?.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 px-1">
                      <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{member.phone}</span>
                    </div>
                  )}

                  {/* Member's Reservation Notes */}
                  {b.notes && (
                    <div className="p-2.5 rounded-xl bg-stone-100/70 border border-stone-200/60 text-xs text-stone-700">
                      <span className="font-bold block text-[10px] text-stone-500 uppercase">{t.common.notes}:</span>
                      <p className="italic">"{b.notes}"</p>
                    </div>
                  )}

                  {/* Confidential Notes Indicator */}
                  {b.priest_private_notes && (
                    <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1 font-bold">
                        <Lock className="w-3 h-3 text-amber-600" />
                        <span>{language === 'ar' ? 'ملاحظات سرية مسجلة بقدسك' : 'Confidential Notes Saved'}</span>
                      </span>
                      <span className="text-[10px] text-amber-700 italic truncate max-w-[180px]">
                        "{b.priest_private_notes}"
                      </span>
                    </div>
                  )}

                  {b.status === 'completed' && b.completed_at && (
                    <div className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>
                        {language === 'ar' 
                          ? `تم نوال سر الاعتراف بنجاح (${formatTime(new Date(b.completed_at).toTimeString().substring(0, 5))})`
                          : `Confession completed (${formatTime(new Date(b.completed_at).toTimeString().substring(0, 5))})`}
                      </span>
                    </div>
                  )}

                  {b.status === 'no_show' && (
                    <div className="p-2 rounded-xl bg-stone-100 border border-stone-300 text-xs text-stone-700 flex items-center gap-1.5">
                      <UserX className="w-4 h-4 text-stone-500 shrink-0" />
                      <span>{language === 'ar' ? 'لم يحضر المعترف في الموعد المحدد' : 'Member did not attend appointment (No-Show)'}</span>
                    </div>
                  )}

                  {b.cancellation_reason && b.status === 'cancelled' && (
                    <div className="p-2 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-700">
                      <span className="font-bold">
                        {language === 'ar' ? 'سبب الإلغاء: ' : 'Cancellation Reason: '}
                      </span>
                      <span>
                        {t.cancellationReasons[b.cancellation_reason as keyof typeof t.cancellationReasons] || b.cancellation_reason}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="mt-4 pt-3 border-t border-stone-100 space-y-2">
                  <div className="flex items-center gap-2">
                    {/* View Profile & Notes Modal Trigger */}
                    <button
                      type="button"
                      onClick={() => setSelectedBookingForModal(b)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-navy-950 text-gold-400 hover:bg-navy-900 text-xs font-bold shadow-sm transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{t.priestFlow.viewSpiritualProfile}</span>
                    </button>
                  </div>

                  {/* Attendance Actions for Confirmed Bookings */}
                  {b.status === 'confirmed' && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleMarkAttendance(b.id, 'completed')}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t.priestFlow.markCompletedBtn}</span>
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleMarkAttendance(b.id, 'no_show')}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold border border-stone-300 transition disabled:opacity-50"
                      >
                        <UserX className="w-3.5 h-3.5 text-stone-500" />
                        <span>{t.priestFlow.markNoShowBtn}</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Priest Member Spiritual Profile & Confidential Notes Modal */}
      {selectedBookingForModal && (
        <PriestMemberDetailsModal
          booking={selectedBookingForModal}
          isOpen={Boolean(selectedBookingForModal)}
          onClose={() => setSelectedBookingForModal(null)}
          onStatusChanged={() => {
            setSelectedBookingForModal(null);
          }}
        />
      )}

    </div>
  );
};

