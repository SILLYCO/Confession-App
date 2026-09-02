import React, { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { 
  ParishAnnouncement, 
  AnnouncementPriority, 
  AnnouncementAudience 
} from '../../types/database';
import { 
  Megaphone, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Bell, 
  Calendar, 
  Users, 
  Flame, 
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export const SuperAdminAnnouncements: React.FC = () => {
  const { t, language, formatDate } = useTranslation();
  const { 
    announcements, 
    createAnnouncement, 
    updateAnnouncement, 
    deleteAnnouncement, 
    toggleAnnouncementActive 
  } = useAppStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [contentAr, setContentAr] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>('normal');
  const [targetAudience, setTargetAudience] = useState<AnnouncementAudience>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setTitleAr('');
    setTitleEn('');
    setContentAr('');
    setContentEn('');
    setPriority('normal');
    setTargetAudience('all');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setIsActive(true);
    setIsModalOpen(true);
    setFeedback(null);
  };

  const handleOpenEditModal = (ann: ParishAnnouncement) => {
    setEditingId(ann.id);
    setTitleAr(ann.title_ar);
    setTitleEn(ann.title_en);
    setContentAr(ann.content_ar);
    setContentEn(ann.content_en);
    setPriority(ann.priority);
    setTargetAudience(ann.target_audience);
    setStartDate(ann.start_date || '');
    setEndDate(ann.end_date || '');
    setIsActive(ann.is_active);
    setIsModalOpen(true);
    setFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleAr.trim() && !titleEn.trim()) {
      setFeedback({ type: 'error', message: language === 'ar' ? 'يرجى إدخال عنوان التنبيه' : 'Please enter announcement title' });
      return;
    }
    if (!contentAr.trim() && !contentEn.trim()) {
      setFeedback({ type: 'error', message: language === 'ar' ? 'يرجى إدخال نص التنبيه' : 'Please enter announcement content' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    if (editingId) {
      const result = await updateAnnouncement(editingId, {
        title_ar: titleAr.trim() || titleEn.trim(),
        title_en: titleEn.trim() || titleAr.trim(),
        content_ar: contentAr.trim() || contentEn.trim(),
        content_en: contentEn.trim() || contentAr.trim(),
        priority,
        target_audience: targetAudience,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        is_active: isActive,
      });

      setIsSubmitting(false);

      if (result.success) {
        setFeedback({ type: 'success', message: t.announcements.announcementUpdated });
        setIsModalOpen(false);
      } else {
        setFeedback({ type: 'error', message: result.error || 'Failed to update' });
      }
    } else {
      const result = await createAnnouncement({
        title_ar: titleAr.trim() || titleEn.trim(),
        title_en: titleEn.trim() || titleAr.trim(),
        content_ar: contentAr.trim() || contentEn.trim(),
        content_en: contentEn.trim() || contentAr.trim(),
        priority,
        target_audience: targetAudience,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        is_active: isActive,
      });

      setIsSubmitting(false);

      if (result.success) {
        setFeedback({ type: 'success', message: t.announcements.announcementCreated });
        setIsModalOpen(false);
      } else {
        setFeedback({ type: 'error', message: result.error || 'Failed to create' });
      }
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    const result = await deleteAnnouncement(deletingId);
    setDeletingId(null);
    if (result.success) {
      setFeedback({ type: 'success', message: t.announcements.announcementDeleted });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 p-6 sm:p-8 text-white shadow-xl border border-gold-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 text-xs font-bold border border-gold-400/30">
              <Megaphone className="w-4 h-4 text-gold-400" />
              <span>Parish Broadcasts & Announcements Center</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-serif font-bold text-white">
              {t.announcements.title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              {t.announcements.subtitle}
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gold-500 hover:bg-gold-600 text-navy-950 text-xs font-bold shadow-lg hover:shadow-xl transition-all scale-100 hover:scale-105 self-start md:self-auto"
          >
            <Plus className="w-4 h-4 text-navy-950" />
            <span>{t.announcements.createBtn}</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-2.5 ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-stone-400 hover:text-stone-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Announcements List */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden divide-y divide-stone-100">
        {announcements.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-400">
            {t.announcements.noAnnouncements}
          </div>
        ) : (
          announcements.map((ann) => {
            const title = language === 'ar' ? (ann.title_ar || ann.title_en) : (ann.title_en || ann.title_ar);
            const content = language === 'ar' ? (ann.content_ar || ann.content_en) : (ann.content_en || ann.content_ar);

            return (
              <div key={ann.id} className="p-5 sm:p-6 hover:bg-stone-50/70 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl shrink-0 mt-0.5 ${
                    ann.priority === 'emergency' 
                      ? 'bg-rose-100 text-rose-700' 
                      : ann.priority === 'important' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-blue-100 text-blue-800'
                  }`}>
                    {ann.priority === 'emergency' ? <Flame className="w-5 h-5" /> : ann.priority === 'important' ? <Bell className="w-5 h-5" /> : <Megaphone className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        ann.priority === 'emergency'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : ann.priority === 'important'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {ann.priority === 'emergency' && t.announcements.priorityEmergency}
                        {ann.priority === 'important' && t.announcements.priorityImportant}
                        {ann.priority === 'normal' && t.announcements.priorityNormal}
                      </span>

                      <span className="text-[10px] font-semibold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full">
                        {ann.target_audience === 'all' && t.announcements.audienceAll}
                        {ann.target_audience === 'general' && t.announcements.audienceGeneral}
                        {ann.target_audience === 'priest' && t.announcements.audiencePriest}
                        {ann.target_audience === 'secretary' && t.announcements.audienceSecretary}
                      </span>

                      {ann.is_active ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {t.announcements.activeStatus}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                          {t.announcements.archivedStatus}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-navy-950 font-serif">
                      {title}
                    </h4>

                    <p className="text-xs text-stone-600 leading-relaxed max-w-3xl">
                      {content}
                    </p>

                    {ann.end_date && (
                      <p className="text-[11px] text-stone-400 flex items-center gap-1 pt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{t.announcements.endDate}: {ann.end_date}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
                  
                  {/* Toggle Active */}
                  <button
                    onClick={() => toggleAnnouncementActive(ann.id)}
                    className={`p-2 rounded-xl border text-xs font-semibold transition ${
                      ann.is_active 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                        : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'
                    }`}
                    title="Toggle Active"
                  >
                    {ann.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleOpenEditModal(ann)}
                    className="p-2 rounded-xl text-stone-600 hover:text-navy-950 hover:bg-stone-100 transition border border-stone-200"
                    title={t.common.edit}
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => setDeletingId(ann.id)}
                    className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition border border-stone-200"
                    title={t.common.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* CREATE / EDIT ANNOUNCEMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
            <div className="bg-navy-950 text-white p-6 flex items-center justify-between border-b border-navy-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-500 text-navy-950 flex items-center justify-center font-bold">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif">
                    {editingId ? t.announcements.editBtn : t.announcements.createBtn}
                  </h3>
                  <p className="text-xs text-stone-300">
                    {language === 'ar' ? 'نشر وإذاعة تنبيه رسمي عبر المنظومة' : 'Publish interactive announcement banner'}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              
              {/* Priority Selector */}
              <div>
                <label className="block text-xs font-bold text-navy-950 mb-1.5">
                  {t.announcements.priorityLabel} *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPriority('normal')}
                    className={`p-2.5 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      priority === 'normal' ? 'bg-navy-950 text-gold-400 border-navy-950 ring-2 ring-gold-400' : 'bg-stone-50 border-stone-200 text-stone-700'
                    }`}
                  >
                    <Megaphone className="w-3.5 h-3.5" />
                    <span>{t.announcements.priorityNormal}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPriority('important')}
                    className={`p-2.5 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      priority === 'important' ? 'bg-amber-500 text-navy-950 border-amber-600 ring-2 ring-amber-400 shadow' : 'bg-stone-50 border-stone-200 text-stone-700'
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>{t.announcements.priorityImportant}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPriority('emergency')}
                    className={`p-2.5 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      priority === 'emergency' ? 'bg-rose-600 text-white border-rose-700 ring-2 ring-rose-400 shadow' : 'bg-stone-50 border-stone-200 text-stone-700'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>{t.announcements.priorityEmergency}</span>
                  </button>
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-xs font-bold text-navy-950 mb-1.5">
                  {t.announcements.audienceLabel} *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { key: 'all', label: t.announcements.audienceAll },
                    { key: 'general', label: t.announcements.audienceGeneral },
                    { key: 'priest', label: t.announcements.audiencePriest },
                    { key: 'secretary', label: t.announcements.audienceSecretary },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTargetAudience(key as any)}
                      className={`p-2 rounded-xl border text-xs font-bold transition ${
                        targetAudience === key ? 'bg-navy-950 text-gold-400 border-navy-950 ring-2 ring-gold-400' : 'bg-stone-50 border-stone-200 text-stone-700'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Titles (Ar & En) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy-950 mb-1">
                    {t.announcements.titleArLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    placeholder="عنوان التنبيه بالعربية..."
                    className="w-full text-xs rounded-xl border border-stone-300 p-2.5 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-950 mb-1">
                    {t.announcements.titleEnLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="English title..."
                    className="w-full text-xs rounded-xl border border-stone-300 p-2.5 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Body (Ar & En) */}
              <div>
                <label className="block text-xs font-bold text-navy-950 mb-1">
                  {t.announcements.contentArLabel} *
                </label>
                <textarea
                  rows={2}
                  required
                  value={contentAr}
                  onChange={(e) => setContentAr(e.target.value)}
                  placeholder="نص التنبيه والإرشادات بالعربية..."
                  className="w-full text-xs rounded-xl border border-stone-300 p-2.5 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-950 mb-1">
                  {t.announcements.contentEnLabel} *
                </label>
                <textarea
                  rows={2}
                  required
                  value={contentEn}
                  onChange={(e) => setContentEn(e.target.value)}
                  placeholder="Announcement body in English..."
                  className="w-full text-xs rounded-xl border border-stone-300 p-2.5 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>

              {/* Expiry Dates & Active Checkbox */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-navy-950 mb-1">
                    {t.announcements.endDate}
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-stone-300 p-2 focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <label className="flex items-center gap-2 text-xs font-bold text-navy-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-gold-600 focus:ring-gold-500 w-4 h-4"
                    />
                    <span>{t.announcements.activeStatus}</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-600 text-navy-950 text-xs font-bold shadow"
                >
                  {isSubmitting ? t.common.saving : t.common.save}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h4 className="text-base font-bold text-navy-950">{t.common.delete}</h4>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              {language === 'ar' ? 'هل أنت متأكد من رغبتك في حذف هذا التنبيه الإذاعي؟' : 'Are you sure you want to delete this announcement?'}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow"
              >
                {t.common.delete}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
