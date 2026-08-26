import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { 
  User, 
  Church, 
  Camera, 
  Upload, 
  Link as LinkIcon, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  Phone,
  Mail,
  Clock,
  BookOpen,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DEFAULT_SKELETON_AVATAR } from '../../types/database';

export const PriestProfileEditor: React.FC = () => {
  const { t, language } = useTranslation();
  const { currentUser, priestProfiles, updatePriestProfileData } = useAppStore();

  const profile = currentUser ? priestProfiles.find(p => p.priest_id === currentUser.id) : undefined;

  // Form State
  const [name, setName] = useState(currentUser?.name || '');
  const [titleEn, setTitleEn] = useState(currentUser?.title_en || '');
  const [titleAr, setTitleAr] = useState(currentUser?.title_ar || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url || DEFAULT_SKELETON_AVATAR);

  const [churchNameEn, setChurchNameEn] = useState(profile?.church_name_en || 'Saint Mark Church Shobra');
  const [churchNameAr, setChurchNameAr] = useState(profile?.church_name_ar || 'كنيسة الشهيد العظيم مارمرقس بشبرا');
  const [bioEn, setBioEn] = useState(profile?.bio_en || '');
  const [bioAr, setBioAr] = useState(profile?.bio_ar || '');

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setTitleEn(currentUser.title_en || currentUser.name);
      setTitleAr(currentUser.title_ar || currentUser.name);
      setPhone(currentUser.phone || '');
      setAvatarUrl(currentUser.avatar_url || DEFAULT_SKELETON_AVATAR);
    }
    if (profile) {
      setChurchNameEn(profile.church_name_en || '');
      setChurchNameAr(profile.church_name_ar || '');
      setBioEn(profile.bio_en || '');
      setBioAr(profile.bio_ar || '');
    }
  }, [currentUser, profile]);

  if (!currentUser) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Photo file size should be under 3MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setAvatarUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    const result = await updatePriestProfileData(
      currentUser.id,
      {
        name: name.trim(),
        title_en: titleEn.trim() || name.trim(),
        title_ar: titleAr.trim() || name.trim(),
        phone: phone.trim() || undefined,
        avatar_url: avatarUrl || undefined,
      },
      {
        church_name_en: churchNameEn.trim(),
        church_name_ar: churchNameAr.trim(),
        bio_en: bioEn.trim(),
        bio_ar: bioAr.trim(),
      }
    );

    setIsSaving(false);

    if (result.success) {
      setFeedback({
        type: 'success',
        message: t.priestFlow.profileUpdatedSuccess,
      });

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#d4af37', '#b88647', '#102a43']
        });
      } catch {}
    } else {
      setFeedback({
        type: 'error',
        message: result.error || 'Failed to update profile',
      });
    }
  };

  return (
    <form onSubmit={handleSaveProfile} className="space-y-6 animate-in fade-in">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold font-serif text-navy-950">
            {t.priestFlow.myProfileTitle}
          </h2>
          <p className="text-xs text-stone-500">
            {t.priestFlow.myProfileSubtitle}
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-navy-950 hover:bg-navy-900 text-gold-400 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition self-start sm:self-auto"
        >
          <Save className="w-4 h-4 text-gold-400" />
          <span>{isSaving ? t.common.saving : t.priestFlow.saveProfileBtn}</span>
        </button>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-sm ${
          feedback.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 1. Portrait & Avatar Customization */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-navy-950 font-serif flex items-center gap-2">
          <Camera className="w-5 h-5 text-gold-600" />
          <span>{t.adminFlow.photoLabel}</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 bg-stone-50 rounded-2xl border border-stone-200">
          <div className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-3xl ring-4 ring-gold-400 shadow-lg overflow-hidden bg-stone-100 flex items-center justify-center">
            <img
              src={avatarUrl || DEFAULT_SKELETON_AVATAR}
              alt={currentUser.name}
              className="w-full h-full object-cover object-center"
            />
          </div>

          <div className="space-y-3 flex-1 w-full">
            <div className="flex flex-wrap items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-950 hover:bg-navy-900 text-gold-400 font-bold text-xs shadow transition">
                <Upload className="w-4 h-4" />
                <span>{t.adminFlow.uploadPhoto}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>

              {avatarUrl && avatarUrl !== DEFAULT_SKELETON_AVATAR && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl(DEFAULT_SKELETON_AVATAR)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'إزالة الصورة واستخدام الصورة الافتراضية' : 'Use Default Avatar'}</span>
                </button>
              )}

              <span className="text-[11px] text-stone-500">Supports JPG, PNG, WebP up to 3MB</span>
            </div>

            <div className="relative">
              <LinkIcon className="w-4 h-4 text-stone-400 absolute start-3.5 top-3" />
              <input
                type="url"
                value={avatarUrl === DEFAULT_SKELETON_AVATAR ? '' : avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="Or paste image URL (https://...)"
                className="w-full text-xs ps-10 pe-4 py-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-gold-500"
              />
            </div>

          </div>
        </div>
      </div>

      {/* 2. Identity & Titles */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-navy-950 font-serif flex items-center gap-2">
          <Church className="w-5 h-5 text-gold-600" />
          <span>{language === 'ar' ? 'اسم الكاهن والألقاب الرعوية' : 'Priest Name & Pastoral Titles'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {language === 'ar' ? 'الاسم بالكامل في النظام *' : 'Full System Name *'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-stone-50 focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t.adminFlow.titleEn} (English)
            </label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="e.g. Fr. Athanasius Hanna"
              className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t.adminFlow.titleAr} (Arabic)
            </label>
            <input
              type="text"
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              placeholder="مثلاً: القمص أثناسيوس حنا"
              className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-gold-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {language === 'ar' ? 'رقم هاتف التواصل' : 'Contact Phone Number'}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute start-3.5 top-3.5" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 019-1001"
                className="w-full text-xs ps-10 pe-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-gold-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {language === 'ar' ? 'البريد الإلكتروني للحساب (تسجيل الدخول)' : 'Account Email (Login)'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute start-3.5 top-3.5" />
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full text-xs ps-10 pe-4 py-3 rounded-xl border border-stone-200 bg-stone-100 text-stone-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Church Affiliation */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-navy-950 font-serif">
          {language === 'ar' ? 'الكنيسة والإيبارشية التابع لها' : 'Church Parish Affiliation'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t.priestFlow.churchNameEn}
            </label>
            <input
              type="text"
              value={churchNameEn}
              onChange={(e) => setChurchNameEn(e.target.value)}
              placeholder="e.g. Saint Mark Church Shobra"
              className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t.priestFlow.churchNameAr}
            </label>
            <input
              type="text"
              value={churchNameAr}
              onChange={(e) => setChurchNameAr(e.target.value)}
              placeholder="مثلاً: كنيسة الشهيد العظيم مارمرقس بشبرا"
              className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-gold-500"
            />
          </div>
        </div>
      </div>

      {/* 4. Pastoral Counseling Bio */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-navy-950 font-serif">
          {language === 'ar' ? 'النبذة الرعوية والإرشادية' : 'Pastoral Bio & Counseling Description'}
        </h3>
        <p className="text-xs text-stone-500">
          {language === 'ar' 
            ? 'تظهر هذه النبذة لأفراد الشعب عند اختيار أب الاعتراف من الصفحة الرئيسية وصفحة حجز المواعيد.' 
            : 'This biography is shown to church members when selecting an available Spiritual Father on the homepage and booking screens.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t.priestFlow.bioEn}
            </label>
            <textarea
              rows={4}
              value={bioEn}
              onChange={(e) => setBioEn(e.target.value)}
              placeholder="Spiritual counseling, youth services, family pastoral guidance..."
              className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-gold-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t.priestFlow.bioAr}
            </label>
            <textarea
              rows={4}
              value={bioAr}
              onChange={(e) => setBioAr(e.target.value)}
              placeholder="الخدمة الرعوية، إرشاد الشباب والأسر، الإرشاد الروحي لسر الاعتراف..."
              className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-gold-500 leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* 5. Schedule Summary Box */}
      <div className="p-5 rounded-3xl bg-gold-50/70 border border-gold-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-navy-950 text-gold-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-church-900">
              {language === 'ar' 
                ? `متوسط مدة الاعتراف الحالي: ${profile?.avg_confession_minutes || 15} دقيقة` 
                : `Current Confession Duration: ${profile?.avg_confession_minutes || 15} minutes`}
            </p>
            <p className="text-[11px] text-stone-600">
              {language === 'ar'
                ? `تم ضبط ${profile?.weekly_schedule?.length || 0} فترات أسبوعية متكررة.`
                : `${profile?.weekly_schedule?.length || 0} active recurring weekly windows configured.`}
            </p>
          </div>
        </div>

        <div className="text-xs text-stone-500">
          {language === 'ar' ? (
            <span>لتعديل فترات التواجد الأسبوعية، تفضل بزيارة تبويب <strong>"جدول المواعيد"</strong>.</span>
          ) : (
            <span>To modify recurring confession windows, visit the <strong>"Weekly Schedule"</strong> tab.</span>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-navy-950 hover:bg-navy-900 text-gold-400 font-bold text-sm shadow-xl hover:shadow-2xl transition hover:scale-102"
        >
          <Save className="w-4 h-4 text-gold-400" />
          <span>{isSaving ? t.common.saving : t.priestFlow.saveProfileBtn}</span>
        </button>
      </div>

    </form>
  );
};
