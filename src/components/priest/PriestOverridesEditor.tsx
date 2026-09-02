import React, { useState, useMemo } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { ScheduleOverride } from '../../types/database';
import { format, addDays } from 'date-fns';
import { 
  CalendarOff, 
  Plus, 
  Trash2, 
  AlertOctagon, 
  CheckCircle2,
  CalendarCheck,
  CalendarX,
  X
} from 'lucide-react';

export const PriestOverridesEditor: React.FC = () => {
  const { t, language, formatDate, formatTime } = useTranslation();
  const { 
    currentUser, 
    priestProfiles, 
    addPriestOverride, 
    deletePriestOverride,
    bookings,
    allUsers
  } = useAppStore();

  const profile = currentUser ? priestProfiles.find(p => p.priest_id === currentUser.id) : undefined;
  const overrides = profile?.schedule_overrides || [];

  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [overrideDate, setOverrideDate] = useState(format(addDays(new Date(), 2), 'yyyy-MM-dd'));
  const [isUnavailable, setIsUnavailable] = useState(true);
  const [isFullDay, setIsFullDay] = useState(true);
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('19:00');
  const [overrideDuration, setOverrideDuration] = useState<number>(profile?.avg_confession_minutes || 15);
  const [reason, setReason] = useState('Pastoral duty / Meeting');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Compute affected and preserved bookings for the current form values
  const impact = useMemo(() => {
    if (!currentUser) return { affectedBookings: [], preservedBookings: [] };

    const dateBookings = bookings.filter(b => 
      b.priest_id === currentUser.id && 
      b.date === overrideDate && 
      b.status === 'confirmed'
    );

    if (!isUnavailable) {
      return { affectedBookings: [], preservedBookings: dateBookings };
    }

    if (isFullDay) {
      return { affectedBookings: dateBookings, preservedBookings: [] };
    }

    // Partial window
    const affected: typeof bookings = [];
    const preserved: typeof bookings = [];

    for (const b of dateBookings) {
      const overlaps = (b.start_time < endTime && b.end_time > startTime);
      if (overlaps) {
        affected.push(b);
      } else {
        preserved.push(b);
      }
    }

    return { affectedBookings: affected, preservedBookings: preserved };
  }, [currentUser, bookings, overrideDate, isUnavailable, isFullDay, startTime, endTime]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (isUnavailable) {
      setConfirmModalOpen(true);
    } else {
      executeSaveOverride();
    }
  };

  const executeSaveOverride = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    setFeedback(null);
    setConfirmModalOpen(false);

    const newOverride: ScheduleOverride = {
      id: 'ovr_' + Math.random().toString(36).substring(2, 7),
      date: overrideDate,
      isUnavailable,
      isFullDay: isUnavailable ? isFullDay : undefined,
      startTime: (!isUnavailable || !isFullDay) ? startTime : undefined,
      endTime: (!isUnavailable || !isFullDay) ? endTime : undefined,
      avg_confession_minutes: !isUnavailable ? overrideDuration : undefined,
      reason: reason.trim() || undefined,
    };

    const result = await addPriestOverride(currentUser.id, newOverride);
    setIsSaving(false);

    if (result.success) {
      setFeedback({
        type: 'success',
        message: language === 'ar'
          ? `تمت إضافة الاستثناء لتاريخ ${overrideDate}. ${result.cancelledCount > 0 ? `تم إلغاء ${result.cancelledCount} موعد متعارض وإشعار أصحابها بالبريد الإلكتروني.` : 'تم الحفاظ على باقي مواعيد اليوم دون تعارض.'}`
          : `Override added for ${overrideDate}. ${result.cancelledCount > 0 ? `${result.cancelledCount} conflicting booking(s) were cancelled and members notified.` : 'Non-overlapping bookings preserved.'}`
      });
      setShowAddForm(false);
    } else {
      setFeedback({
        type: 'error',
        message: result.error || (language === 'ar' ? 'فشل إضافة الاستثناء' : 'Failed to add override')
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!currentUser) return;
    await deletePriestOverride(currentUser.id, id);
    setFeedback({
      type: 'success',
      message: language === 'ar'
        ? 'تم حذف الاستثناء بنجاح واستعادة الجدول الأسبوعي الاعتيادي لهذا اليوم.'
        : 'Date override removed. Regular weekly schedule restored for that day.'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-navy-900 text-gold-400">
              <CalendarOff className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-navy-950">
                {t.priestFlow.scheduleOverridesTitle}
              </h2>
              <p className="text-xs text-stone-500">
                {t.priestFlow.scheduleOverridesDesc}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-navy-950 text-gold-400 text-xs font-bold shadow hover:bg-navy-900 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? t.common.close : t.priestFlow.addOverrideBtn}</span>
          </button>
        </div>

        {feedback && (
          <div className={`mt-4 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertOctagon className="w-4 h-4 text-rose-600" />}
            <span>{feedback.message}</span>
          </div>
        )}
      </div>

      {/* Add Override Form */}
      {showAddForm && (
        <form onSubmit={handleFormSubmit} className="bg-stone-50 rounded-3xl p-6 border border-stone-300 shadow-sm space-y-4 animate-in fade-in">
          <h3 className="text-sm font-bold text-navy-950 pb-2 border-b border-stone-200">
            {t.priestFlow.addOverrideBtn}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t.priestFlow.overrideDate}
              </label>
              <input
                type="date"
                required
                value={overrideDate}
                onChange={(e) => setOverrideDate(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-gold-500"
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t.priestFlow.overrideReason}
              </label>
              <input
                type="text"
                placeholder={language === 'ar' ? 'مثلاً: سفر، خلوة بالدير، اجتماع رعوي طارئ' : 'e.g. Travel, Monastery visit, Pastoral meeting'}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-gold-500"
              />
            </div>

          </div>

          {/* Is Unavailable / Blackout checkbox */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isUnavailable}
                onChange={(e) => setIsUnavailable(e.target.checked)}
                className="w-4 h-4 text-gold-500 rounded focus:ring-gold-400"
              />
              <span className="text-xs font-bold text-navy-950">
                {t.priestFlow.isUnavailableCheckbox}
              </span>
            </label>

            {/* Scope Selection: All Day vs Specific Time Window */}
            {isUnavailable && (
              <div className="ps-6 space-y-3 pt-2 border-t border-stone-100">
                <label className="block text-[11px] font-bold text-stone-600 uppercase">
                  {t.priestFlow.unavailabilityType}
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFullDay(true)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                      isFullDay
                        ? 'bg-rose-100 border-rose-300 text-rose-900 shadow-sm'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    📅 {t.priestFlow.fullDayBlackout}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFullDay(false)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                      !isFullDay
                        ? 'bg-rose-100 border-rose-300 text-rose-900 shadow-sm'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    ⏱️ {t.priestFlow.partialDayBlackout}
                  </button>
                </div>

                {/* Partial Blackout Time Range Inputs */}
                {!isFullDay && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 mb-1">
                        {t.priestFlow.unavailStartTime}
                      </label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl border border-stone-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 mb-1">
                        {t.priestFlow.unavailEndTime}
                      </label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl border border-stone-300 bg-white"
                      />
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-rose-700 leading-relaxed">
                  {isFullDay ? `⚠️ ${t.priestFlow.blackoutDateNotice}` : `⚡ ${t.priestFlow.partialBlackoutNotice}`}
                </p>
              </div>
            )}
          </div>

          {/* Custom Time Windows & Duration if Extra Availability (NOT unavailable) */}
          {!isUnavailable && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-white border border-stone-200">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {language === 'ar' ? 'وقت البدء المخصص' : 'Custom Start Time'}
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-stone-300"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {language === 'ar' ? 'وقت الانتهاء المخصص' : 'Custom End Time'}
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-stone-300"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.priestFlow.windowDurationLabel}
                </label>
                <select
                  value={overrideDuration}
                  onChange={(e) => setOverrideDuration(parseInt(e.target.value))}
                  className="w-full text-xs p-2 rounded-xl border border-gold-300 bg-gold-50/50 text-navy-950 font-semibold focus:ring-2 focus:ring-gold-500"
                >
                  {[10, 15, 20, 30, 45, 60].map((mins) => (
                    <option key={mins} value={mins}>
                      {mins} {t.common.minutes}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-navy-950 hover:bg-navy-900 text-gold-400 text-xs font-bold shadow transition"
            >
              {isSaving ? t.common.saving : t.common.confirm}
            </button>
          </div>

        </form>
      )}

      {/* Overrides List */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-navy-950">
          {language === 'ar' ? `الاستثناءات المسجلة (${overrides.length})` : `Active Date Overrides (${overrides.length})`}
        </h3>

        {overrides.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-stone-200 shadow-sm text-stone-400 text-xs">
            {language === 'ar' 
              ? 'لا توجد استثناءات أو اعتذارات مسجلة. يسري جدولك الأسبوعي بشكل منتظم.' 
              : 'No date overrides configured. Your regular weekly schedule applies continuously.'}
          </div>
        ) : (
          <div className="space-y-3">
            {overrides.map((ovr) => {
              const isFullDayUnavail = ovr.isUnavailable && (ovr.isFullDay !== false && !ovr.startTime);
              const isPartialUnavail = ovr.isUnavailable && Boolean(ovr.startTime && ovr.endTime);

              return (
                <div
                  key={ovr.id}
                  className={`rounded-2xl p-4 border flex items-center justify-between gap-4 transition shadow-sm ${
                    ovr.isUnavailable
                      ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{formatDate(ovr.date)}</span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        ovr.isUnavailable ? 'bg-rose-200 text-rose-800' : 'bg-emerald-200 text-emerald-800'
                      }`}>
                        {isFullDayUnavail && (language === 'ar' ? '🚫 غير متاح (يوم كامل)' : '🚫 All-Day Blackout')}
                        {isPartialUnavail && (language === 'ar' ? `🚫 اعتذار جزئي (${formatTime(ovr.startTime || '')} - ${formatTime(ovr.endTime || '')})` : `🚫 Partial Blackout (${formatTime(ovr.startTime || '')} - ${formatTime(ovr.endTime || '')})`)}
                        {!ovr.isUnavailable && (language === 'ar' ? '✨ مواعيد إضافية مخصصة' : '✨ Custom Hours')}
                      </span>
                    </div>

                    {!ovr.isUnavailable && ovr.startTime && (
                      <p className="text-xs text-stone-600 mt-1">
                        {formatTime(ovr.startTime)} - {formatTime(ovr.endTime || '')} ({ovr.avg_confession_minutes || profile?.avg_confession_minutes || 15} {t.common.minutes})
                      </p>
                    )}

                    {isPartialUnavail && (
                      <p className="text-[11px] text-stone-500 mt-1">
                        {language === 'ar' ? 'المواعيد خارج هذه الفترة تبقى متاحة للحجز كالمعتاد.' : 'Slots outside this window remain bookable as scheduled.'}
                      </p>
                    )}

                    {ovr.reason && (
                      <p className="text-xs text-stone-500 italic mt-0.5">
                        {language === 'ar' ? `ملاحظة: ${ovr.reason}` : `Note: ${ovr.reason}`}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(ovr.id)}
                    className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-100 rounded-xl transition"
                    title={t.common.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* IMPACT PRE-CONFIRMATION MODAL */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-stone-200 space-y-5 max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                  <AlertOctagon className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-950 font-serif">
                    {t.priestFlow.overrideImpactTitle}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {t.priestFlow.overrideImpactDesc}
                  </p>
                </div>
              </div>
              <button onClick={() => setConfirmModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 text-xs">
              
              {/* Target Date & Scope Summary */}
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-navy-950">
                  <span>📅 {formatDate(overrideDate)}</span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                    {isFullDay ? t.priestFlow.fullDayBlackout : `${formatTime(startTime)} – ${formatTime(endTime)}`}
                  </span>
                </div>
                {reason && (
                  <p className="text-[11px] text-stone-500 italic">
                    {language === 'ar' ? `السبب: ${reason}` : `Reason: ${reason}`}
                  </p>
                )}
              </div>

              {/* Cancelled Bookings List with Member Names */}
              {impact.affectedBookings.length > 0 ? (
                <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-950 flex items-center gap-1.5">
                      <CalendarX className="w-4 h-4 text-rose-600" />
                      <span>{t.priestFlow.affectedAppointmentsTitle} ({impact.affectedBookings.length})</span>
                    </span>
                    <span className="text-[10px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full font-bold">
                      {language === 'ar' ? 'إلغاء وإشعار' : 'Cancellation Required'}
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-800 leading-relaxed">
                    {t.priestFlow.affectedAppointmentsDesc}
                  </p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pt-1">
                    {impact.affectedBookings.map(b => {
                      const user = allUsers.find(u => u.id === b.user_id);
                      return (
                        <div key={b.id} className="p-2.5 rounded-xl bg-white border border-rose-100 flex items-center justify-between text-[11px] shadow-sm">
                          <div className="space-y-0.5">
                            <div className="font-bold text-navy-950 flex items-center gap-1">
                              <span>👤</span>
                              <span>{language === 'ar' ? (user?.title_ar || user?.name || 'مخدوم') : (user?.title_en || user?.name || 'Member')}</span>
                            </div>
                            {user?.phone && (
                              <div className="text-[10px] text-stone-500">
                                📞 {user.phone}
                              </div>
                            )}
                          </div>
                          <div className="text-end">
                            <span className="text-rose-700 font-mono font-bold">
                              ⏱ {formatTime(b.start_time)} - {formatTime(b.end_time)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{t.priestFlow.noAffectedAppointments}</span>
                </div>
              )}

              {/* Preserved Active Bookings (if partial window and there are active bookings outside window) */}
              {!isFullDay && impact.preservedBookings.length > 0 && (
                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <CalendarCheck className="w-4 h-4 text-emerald-600" />
                      <span>{t.priestFlow.preservedAppointmentsTitle} ({impact.preservedBookings.length})</span>
                    </span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                      {language === 'ar' ? 'محتفظ بها' : 'Kept Active'}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    {t.priestFlow.preservedAppointmentsDesc}
                  </p>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pt-1">
                    {impact.preservedBookings.map(b => {
                      const user = allUsers.find(u => u.id === b.user_id);
                      return (
                        <div key={b.id} className="p-2 rounded-xl bg-white border border-emerald-100 flex items-center justify-between text-[11px]">
                          <span className="font-bold text-navy-950">
                            👤 {language === 'ar' ? (user?.title_ar || user?.name || 'مخدوم') : (user?.title_en || user?.name || 'Member')}
                          </span>
                          <span className="text-emerald-700 font-mono font-bold">
                            ⏱ {formatTime(b.start_time)} - {formatTime(b.end_time)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 shrink-0">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 transition"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={executeSaveOverride}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg transition"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>{isSaving ? t.common.saving : t.priestFlow.confirmBlackoutBtn}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
