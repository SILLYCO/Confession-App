import React, { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { ScheduleOverride } from '../../types/database';
import { format, addDays } from 'date-fns';
import { 
  CalendarOff, 
  Plus, 
  Trash2, 
  AlertOctagon, 
  CheckCircle2
} from 'lucide-react';

export const PriestOverridesEditor: React.FC = () => {
  const { t, language, formatDate, formatTime } = useTranslation();
  const { 
    currentUser, 
    priestProfiles, 
    addPriestOverride, 
    deletePriestOverride 
  } = useAppStore();

  const profile = currentUser ? priestProfiles.find(p => p.priest_id === currentUser.id) : undefined;
  const overrides = profile?.schedule_overrides || [];

  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [overrideDate, setOverrideDate] = useState(format(addDays(new Date(), 2), 'yyyy-MM-dd'));
  const [isUnavailable, setIsUnavailable] = useState(true);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('14:00');
  const [overrideDuration, setOverrideDuration] = useState<number>(profile?.avg_confession_minutes || 15);
  const [reason, setReason] = useState('Monastery Retreat / Travel');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSaving(true);
    setFeedback(null);

    const newOverride: ScheduleOverride = {
      id: 'ovr_' + Math.random().toString(36).substring(2, 7),
      date: overrideDate,
      isUnavailable,
      startTime: isUnavailable ? undefined : startTime,
      endTime: isUnavailable ? undefined : endTime,
      avg_confession_minutes: isUnavailable ? undefined : overrideDuration,
      reason: reason.trim() || undefined,
    };

    const result = await addPriestOverride(currentUser.id, newOverride);
    setIsSaving(false);

    if (result.success) {
      setFeedback({
        type: 'success',
        message: language === 'ar'
          ? `تمت إضافة الاستثناء لتاريخ ${overrideDate}. ${result.cancelledCount > 0 ? `تم إلغاء ${result.cancelledCount} موعد متعارض وإشعار أصحابها بالبريد الإلكتروني.` : ''}`
          : `Override added for ${overrideDate}. ${result.cancelledCount > 0 ? `${result.cancelledCount} conflicting booking(s) were cancelled and members notified.` : ''}`
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
        <form onSubmit={handleSubmit} className="bg-stone-50 rounded-3xl p-6 border border-stone-300 shadow-sm space-y-4 animate-in fade-in">
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
                placeholder={language === 'ar' ? 'مثلاً: سفر، قداس عيد، خلوة بالدير' : 'e.g. Travel, Feast Liturgy, Monastery visit'}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-gold-500"
              />
            </div>

          </div>

          {/* Is Unavailable / Blackout checkbox */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-2">
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
            <p className="text-[11px] text-rose-700 ps-6">
              ⚠️ {t.priestFlow.blackoutDateNotice} (Core Rule 4)
            </p>
          </div>

          {/* Custom Time Windows & Duration if NOT complete blackout */}
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
            {overrides.map((ovr) => (
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
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ovr.isUnavailable ? 'bg-rose-200 text-rose-800' : 'bg-emerald-200 text-emerald-800'
                    }`}>
                      {ovr.isUnavailable 
                        ? (language === 'ar' ? 'غير متاح (اعتذار كامل)' : 'Unavailable (Blackout)') 
                        : (language === 'ar' ? 'مواعيد مخصصة' : 'Custom Hours')}
                    </span>
                  </div>

                  {!ovr.isUnavailable && ovr.startTime && (
                    <p className="text-xs text-stone-600 mt-1">
                      {formatTime(ovr.startTime)} - {formatTime(ovr.endTime || '')}
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
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
