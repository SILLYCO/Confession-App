import React, { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { WeeklyScheduleItem } from '../../types/database';
import { 
  Clock, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Save, 
  CheckCircle2,
  CalendarCheck,
  CalendarX,
  Sparkles,
  Info,
  X
} from 'lucide-react';

export const PriestScheduleEditor: React.FC = () => {
  const { t, getDayName, language } = useTranslation();
  const { 
    currentUser, 
    priestProfiles, 
    previewScheduleChangeImpact,
    updatePriestSchedule,
    allUsers
  } = useAppStore();

  const profile = currentUser ? priestProfiles.find(p => p.priest_id === currentUser.id) : undefined;

  const [avgMinutes, setAvgMinutes] = useState<number>(profile?.avg_confession_minutes || 15);
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklyScheduleItem[]>(
    profile?.weekly_schedule || []
  );

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Compute live impact diff for confirmation modal
  const impact = currentUser 
    ? previewScheduleChangeImpact(currentUser.id, avgMinutes, weeklySchedule)
    : { durationChanged: false, preservedBookings: [], cancelledBookings: [], newSlotsEstimate: 0 };

  const handleAddWindow = () => {
    const newItem: WeeklyScheduleItem = {
      id: 'w_' + Math.random().toString(36).substring(2, 7),
      dayOfWeek: 0, // Sunday
      startTime: '17:00',
      endTime: '20:00',
    };
    setWeeklySchedule([...weeklySchedule, newItem]);
  };

  const handleRemoveWindow = (id: string) => {
    setWeeklySchedule(weeklySchedule.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof WeeklyScheduleItem, value: any) => {
    setWeeklySchedule(weeklySchedule.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleOpenConfirmModal = () => {
    setConfirmModalOpen(true);
  };

  const handleSaveConfirmed = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    setConfirmModalOpen(false);

    const result = await updatePriestSchedule(currentUser.id, avgMinutes, weeklySchedule);
    setIsSaving(false);

    if (result.success) {
      if (result.cancelledCount === 0) {
        setSuccessMessage(
          language === 'ar'
            ? `تم تحديث الجدول بنجاح! تم الحفاظ على ${result.preservedCount} موعد مؤكد وتوليد المواعيد الجديدة.`
            : `Schedule updated successfully! ${result.preservedCount} existing booking(s) preserved and new slots generated.`
        );
      } else {
        setSuccessMessage(
          language === 'ar'
            ? `تم تحديث الجدول بنجاح! تم الحفاظ على ${result.preservedCount} موعد، وإلغاء وإشعار ${result.cancelledCount} موعد متأثر.`
            : `Schedule updated! ${result.preservedCount} booking(s) preserved, and ${result.cancelledCount} affected booking(s) cancelled with email notices sent.`
        );
      }
    } else {
      setErrorMessage(result.error || 'Failed to update schedule');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-navy-900 text-gold-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-serif text-navy-950">
              {t.priestFlow.manageSchedule}
            </h2>
            <p className="text-xs text-stone-500">
              {t.priestFlow.manageScheduleDesc}
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Average Confession Duration Config */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-3">
        <label className="block text-sm font-bold text-navy-950">
          {t.priestFlow.avgDurationLabel}
        </label>
        <p className="text-xs text-stone-500">
          {t.priestFlow.avgDurationHelper}
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          {[10, 15, 20, 30, 45, 60].map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => setAvgMinutes(mins)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                avgMinutes === mins
                  ? 'bg-gold-500 text-navy-950 shadow-md ring-2 ring-gold-400'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
              }`}
            >
              {mins} {t.common.minutes}
            </button>
          ))}

          <div className="flex items-center gap-2 ms-2">
            <input
              type="number"
              min={5}
              max={120}
              value={avgMinutes}
              onChange={(e) => setAvgMinutes(Math.max(5, parseInt(e.target.value) || 15))}
              className="w-20 p-2 text-xs font-bold rounded-xl border border-stone-300 bg-stone-50 text-center"
            />
            <span className="text-xs text-stone-500">{t.common.minutes}</span>
          </div>
        </div>
      </div>

      {/* Weekly Schedule Windows */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
          <div>
            <h3 className="text-base font-bold text-navy-950 font-serif">
              {t.priestFlow.weeklyRecurringSchedule}
            </h3>
            <p className="text-xs text-stone-500">
              Add recurring presence windows for confession (e.g. Sundays 17:00 – 20:00).
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddWindow}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-bold shadow transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{t.priestFlow.addTimeWindow}</span>
          </button>
        </div>

        {weeklySchedule.length === 0 ? (
          <div className="p-8 text-center bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 text-stone-400 text-xs space-y-2">
            <p>No weekly availability windows added yet.</p>
            <button
              type="button"
              onClick={handleAddWindow}
              className="text-gold-600 font-bold hover:underline"
            >
              + Click here to add your first window
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {weeklySchedule.map((item, index) => (
              <div
                key={item.id || index}
                className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center gap-3 hover:border-gold-300 transition"
              >
                
                {/* Day of Week */}
                <div className="w-full sm:w-48">
                  <label className="block text-[10px] font-bold text-stone-500 mb-1 uppercase">
                    {t.priestFlow.dayOfWeek}
                  </label>
                  <select
                    value={item.dayOfWeek}
                    onChange={(e) => handleUpdateItem(item.id, 'dayOfWeek', parseInt(e.target.value))}
                    className="w-full text-xs font-semibold p-2 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-gold-500"
                  >
                    {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                      <option key={day} value={day}>
                        {getDayName(day)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start Time */}
                <div className="w-full sm:w-36">
                  <label className="block text-[10px] font-bold text-stone-500 mb-1 uppercase">
                    {t.priestFlow.startTime}
                  </label>
                  <input
                    type="time"
                    value={item.startTime}
                    onChange={(e) => handleUpdateItem(item.id, 'startTime', e.target.value)}
                    className="w-full text-xs font-semibold p-2 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                {/* End Time */}
                <div className="w-full sm:w-36">
                  <label className="block text-[10px] font-bold text-stone-500 mb-1 uppercase">
                    {t.priestFlow.endTime}
                  </label>
                  <input
                    type="time"
                    value={item.endTime}
                    onChange={(e) => handleUpdateItem(item.id, 'endTime', e.target.value)}
                    className="w-full text-xs font-semibold p-2 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                {/* Delete Button */}
                <div className="sm:ms-auto pt-2 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => handleRemoveWindow(item.id)}
                    className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title={t.common.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Smart Differential Update Banner & Save Action */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 rounded-3xl p-6 text-white shadow-xl border border-gold-500/30 space-y-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-6 h-6 text-gold-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Smart Differential Slot Generator</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Non-Destructive Preservation
              </span>
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              When adding new days or time windows, the system <strong>preserves all your existing appointments</strong> on unchanged days. Only removed or shortened windows will be selectively cancelled.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleOpenConfirmModal}
            disabled={isSaving}
            className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition hover:scale-102"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? t.common.saving : t.priestFlow.saveScheduleBtn}</span>
          </button>
        </div>
      </div>

      {/* SMART IMPACT ANALYSIS CONFIRMATION MODAL */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-stone-200 space-y-5 max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-100 text-gold-800 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5 text-gold-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-950 font-serif">
                    {t.priestFlow.smartUpdateTitle}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {t.priestFlow.smartUpdateDesc}
                  </p>
                </div>
              </div>
              <button onClick={() => setConfirmModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 text-xs">
              
              {/* Duration Change Warning (if duration changed) */}
              {impact.durationChanged && (
                <div className="p-4 bg-amber-50 border border-amber-300 text-amber-950 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Duration Boundary Shift</span>
                  </div>
                  <p className="text-xs leading-relaxed text-amber-900/90">
                    {t.priestFlow.durationChangeWarning}
                  </p>
                </div>
              )}

              {/* Preserved Bookings Section */}
              {impact.preservedBookings.length > 0 && (
                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <CalendarCheck className="w-4 h-4 text-emerald-600" />
                      <span>{t.priestFlow.preservedBookingsCount} ({impact.preservedBookings.length})</span>
                    </span>
                    <span className="text-[10px] bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                      Kept Confirmed
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    These appointments fall inside unchanged schedule windows and will remain fully confirmed:
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto pt-1">
                    {impact.preservedBookings.map(b => {
                      const user = allUsers.find(u => u.id === b.user_id);
                      return (
                        <div key={b.id} className="p-2 rounded-xl bg-white border border-emerald-100 flex items-center justify-between text-[11px]">
                          <span className="font-bold text-navy-950">👤 {user?.name || 'Member'}</span>
                          <span className="text-stone-500 font-mono">📅 {b.date} • ⏱ {b.start_time} - {b.end_time}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cancelled Bookings Section */}
              {impact.cancelledBookings.length > 0 ? (
                <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-950 flex items-center gap-1.5">
                      <CalendarX className="w-4 h-4 text-rose-600" />
                      <span>{t.priestFlow.cancelledBookingsCount} ({impact.cancelledBookings.length})</span>
                    </span>
                    <span className="text-[10px] bg-rose-200/60 text-rose-900 px-2 py-0.5 rounded-full font-bold">
                      Email Notice Required
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-800">
                    These appointments fall inside removed/shortened windows and will be automatically cancelled with notification emails sent:
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto pt-1">
                    {impact.cancelledBookings.map(b => {
                      const user = allUsers.find(u => u.id === b.user_id);
                      return (
                        <div key={b.id} className="p-2 rounded-xl bg-white border border-rose-100 flex items-center justify-between text-[11px]">
                          <span className="font-bold text-navy-950">👤 {user?.name || 'Member'}</span>
                          <span className="text-rose-600 font-mono">❌ {b.date} • {b.start_time}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-sky-50/80 border border-sky-200 rounded-2xl flex items-center gap-2.5 text-sky-950">
                  <Info className="w-4 h-4 text-sky-600 shrink-0" />
                  <p className="text-xs leading-relaxed font-medium">
                    {t.priestFlow.noBookingsAffectedNotice}
                  </p>
                </div>
              )}

              {/* New Slots Estimated Generation */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-[11px] text-stone-600 flex items-center justify-between">
                <span>14-Day Rolling Horizon Estimate:</span>
                <span className="font-bold text-navy-950 bg-stone-200/80 px-2.5 py-1 rounded-lg">
                  ~{impact.newSlotsEstimate} available slots generated
                </span>
              </div>

            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 shrink-0">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200 transition"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleSaveConfirmed}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-navy-950 text-gold-400 text-xs font-bold hover:bg-navy-900 transition shadow"
              >
                {isSaving ? t.common.saving : t.priestFlow.confirmScheduleUpdateBtn}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
