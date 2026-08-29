import React, { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { WeeklyScheduleItem, DEFAULT_SKELETON_AVATAR } from '../../types/database';
import { 
  Church, 
  X, 
  Clock, 
  Plus, 
  Trash2, 
  KeyRound, 
  Upload, 
  CheckCircle2, 
  AlertTriangle,
  User,
  Calendar,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';

interface CreatePriestWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const CreatePriestWizardModal: React.FC<CreatePriestWizardModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t, language, getDayName } = useTranslation();
  const { createUser } = useAppStore();

  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Priest Account & Identification
  const [name, setName] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');

  // Step 2: Church & Pastoral Bio
  const [churchNameAr, setChurchNameAr] = useState('كنيسة الشهيد العظيم مارمرقس بشبرا');
  const [churchNameEn, setChurchNameEn] = useState('Saint Mark Church Shobra');
  const [bioAr, setBioAr] = useState('كاهن ومرشد روحي لسر الاعتراف بكنيسة الشهيد العظيم مارمرقس بشبرا.');
  const [bioEn, setBioEn] = useState('Parish priest & spiritual counselor serving the Sacrament of Holy Confession.');

  // Step 3: Confession Duration
  const [avgDuration, setAvgDuration] = useState<number>(15);

  // Step 4: Weekly Recurring Availability Windows
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklyScheduleItem[]>([
    { id: 'w_' + Math.random().toString(36).substring(2, 6), dayOfWeek: 0, startTime: '12:00', endTime: '15:00' }, // Sunday
    { id: 'w_' + Math.random().toString(36).substring(2, 6), dayOfWeek: 3, startTime: '18:00', endTime: '21:00' }, // Wednesday
    { id: 'w_' + Math.random().toString(36).substring(2, 6), dayOfWeek: 5, startTime: '17:00', endTime: '20:00' }, // Friday
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let pass = '';
    for (let i = 0; i < 7; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass + '@26';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert(language === 'ar' ? 'أقصى حجم للملف هو 3 ميجابايت' : 'Max file size is 3MB');
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

  const handleAddScheduleWindow = () => {
    const newItem: WeeklyScheduleItem = {
      id: 'w_' + Math.random().toString(36).substring(2, 6),
      dayOfWeek: 0,
      startTime: '17:00',
      endTime: '20:00',
    };
    setWeeklySchedule([...weeklySchedule, newItem]);
  };

  const handleRemoveScheduleWindow = (id: string) => {
    setWeeklySchedule(weeklySchedule.filter(w => w.id !== id));
  };

  const handleUpdateScheduleWindow = (id: string, field: keyof WeeklyScheduleItem, value: any) => {
    setWeeklySchedule(weeklySchedule.map(w => {
      if (w.id === id) {
        return { ...w, [field]: value };
      }
      return w;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال اسم أبونا' : 'Please enter Father\'s name');
      setActiveStep(1);
      return;
    }
    if (!email.trim()) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter email address');
      setActiveStep(1);
      return;
    }
    const finalPassword = password || generateRandomPassword();
    if (finalPassword.length < 6) {
      setErrorMsg(language === 'ar' ? 'كلمة المرور يجب ألا تقل عن 6 أحرف' : 'Password must be at least 6 characters');
      setActiveStep(1);
      return;
    }
    if (weeklySchedule.length === 0) {
      setErrorMsg(language === 'ar' ? 'يرجى إضافة فترة تواجد أسبوعية واحدة على الأقل' : 'Please add at least one weekly availability window');
      setActiveStep(4);
      return;
    }

    setIsSubmitting(true);

    const result = await createUser(
      {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        role: 'priest',
        avatar_url: avatarUrl || undefined,
        title_ar: titleAr.trim() || name.trim(),
        title_en: titleEn.trim() || name.trim(),
      },
      {
        avg_confession_minutes: avgDuration,
        church_name_ar: churchNameAr.trim(),
        church_name_en: churchNameEn.trim(),
        bio_ar: bioAr.trim(),
        bio_en: bioEn.trim(),
        weekly_schedule: weeklySchedule,
      },
      finalPassword
    );

    setIsSubmitting(false);

    if (result.success) {
      onSuccess(
        language === 'ar'
          ? `تم إنشاء حساب ${titleAr || name} بنجاح مع جدوله ومواعيده الأولية!`
          : `Father ${titleEn || name} created successfully with full schedule!`
      );
      onClose();
    } else {
      setErrorMsg(result.error || 'Failed to create priest');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-church-950 text-white p-6 flex items-center justify-between border-b border-gold-500/30">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gold-500 text-navy-950 flex items-center justify-center font-bold shadow-md">
              <Church className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-gold-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.adminFlow.addPriestWizard}</span>
              </div>
              <h3 className="text-xl font-bold font-serif leading-tight">
                {language === 'ar' ? 'إضافة وتجهيز كاهن جديد للنظام' : 'New Priest Setup & Pastoral Onboarding'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Tabs */}
        <div className="bg-stone-100 px-6 py-3 border-b border-stone-200 flex items-center justify-between gap-2 overflow-x-auto">
          {[
            { step: 1, label: t.adminFlow.wizardStep1, icon: User },
            { step: 2, label: t.adminFlow.wizardStep2, icon: Church },
            { step: 3, label: t.adminFlow.wizardStep3, icon: Clock },
            { step: 4, label: t.adminFlow.wizardStep4, icon: Calendar },
          ].map(({ step, label, icon: Icon }) => (
            <button
              key={step}
              type="button"
              onClick={() => setActiveStep(step as any)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeStep === step
                  ? 'bg-navy-900 text-gold-400 shadow-sm'
                  : 'text-stone-600 hover:bg-stone-200/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Account & Identity */}
          {activeStep === 1 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy-950 mb-1.5">
                    {language === 'ar' ? 'اسم الأب الكاهن (الرسمي)' : 'Father Full Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: أثناسيوس حنا' : 'e.g. Athanasius Hanna'}
                    className="w-full text-xs rounded-xl border border-stone-300 p-3 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-950 mb-1.5">
                    {t.auth.emailLabel} *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="fr.name@church.org"
                    className="w-full text-xs rounded-xl border border-stone-300 p-3 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-950 mb-1.5">
                    {t.adminFlow.titleAr} (بالعربية)
                  </label>
                  <input
                    type="text"
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    placeholder="مثال: القمص أثناسيوس حنا"
                    className="w-full text-xs rounded-xl border border-stone-300 p-3 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-950 mb-1.5">
                    {t.adminFlow.titleEn} (English)
                  </label>
                  <input
                    type="text"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="e.g. Fr. Athanasius Hanna"
                    className="w-full text-xs rounded-xl border border-stone-300 p-3 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-950 mb-1.5">
                    {t.auth.phoneLabel}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+20 100 000 0000"
                    className="w-full text-xs rounded-xl border border-stone-300 p-3 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-navy-950">
                      {t.adminFlow.userPassword} *
                    </label>
                    <button
                      type="button"
                      onClick={() => setPassword(generateRandomPassword())}
                      className="text-[11px] text-church-700 hover:text-church-900 font-semibold underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-gold-500" />
                      <span>{t.adminFlow.generatePassword}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-xs rounded-xl border border-stone-300 p-3 pr-10 font-mono focus:ring-2 focus:ring-gold-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Photo Upload */}
              <div className="pt-3 border-t border-stone-100">
                <label className="block text-xs font-bold text-navy-950 mb-2">
                  {t.adminFlow.photoLabel}
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={avatarUrl || DEFAULT_SKELETON_AVATAR}
                    alt="Preview"
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gold-400 shadow bg-stone-100"
                  />
                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer transition border border-stone-300">
                      <Upload className="w-4 h-4" />
                      <span>{t.adminFlow.uploadPhoto}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder={t.adminFlow.orEnterImageUrl}
                      className="w-full text-xs rounded-xl border border-stone-300 p-2 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Church & Pastoral Bio */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy-950 mb-1.5">
                    {language === 'ar' ? 'اسم الكنيسة / الإيبارشية (بالعربية)' : 'Church Name (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={churchNameAr}
                    onChange={(e) => setChurchNameAr(e.target.value)}
                    className="w-full text-xs rounded-xl border border-stone-300 p-3 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-950 mb-1.5">
                    {language === 'ar' ? 'اسم الكنيسة (بالإنجليزية)' : 'Church Name (English)'}
                  </label>
                  <input
                    type="text"
                    value={churchNameEn}
                    onChange={(e) => setChurchNameEn(e.target.value)}
                    className="w-full text-xs rounded-xl border border-stone-300 p-3 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-950 mb-1.5">
                  {language === 'ar' ? 'النبذة الرعوية والإرشادية (بالعربية)' : 'Pastoral Ministry Bio (Arabic)'}
                </label>
                <textarea
                  rows={2}
                  value={bioAr}
                  onChange={(e) => setBioAr(e.target.value)}
                  className="w-full text-xs rounded-xl border border-stone-300 p-3 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-950 mb-1.5">
                  {language === 'ar' ? 'النبذة الرعوية (بالإنجليزية)' : 'Pastoral Ministry Bio (English)'}
                </label>
                <textarea
                  rows={2}
                  value={bioEn}
                  onChange={(e) => setBioEn(e.target.value)}
                  className="w-full text-xs rounded-xl border border-stone-300 p-3 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Duration */}
          {activeStep === 3 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-navy-950">
                  {t.adminFlow.priestDurationLabel}
                </label>
                <p className="text-xs text-stone-500">
                  {language === 'ar' ? 'حدد متوسط مدة موعد الاعتراف الفردي لحساب الفترات وتوليد المواعيد تلقائياً.' : 'Set the duration for each individual confession appointment slot.'}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {[10, 15, 20, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setAvgDuration(mins)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                        avgDuration === mins
                          ? 'bg-gold-500 text-navy-950 shadow-md ring-2 ring-gold-400'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                      }`}
                    >
                      {mins} {t.common.minutes}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Weekly Availability Schedule Builder */}
          {activeStep === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-navy-950">
                    {t.adminFlow.wizardStep4}
                  </h4>
                  <p className="text-xs text-stone-500">
                    {language === 'ar' ? 'حدد فترات التواجد الأسبوعية الثابتة لأبونا (يمكن لأبونا تعديلها لاحقاً من حسابه).' : 'Set Father\'s fixed weekly schedule windows (Father can modify anytime later).' }
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddScheduleWindow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold-500 text-navy-950 text-xs font-bold shadow hover:bg-gold-600 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.adminFlow.addAvailabilityWindow}</span>
                </button>
              </div>

              {weeklySchedule.length === 0 ? (
                <div className="p-6 bg-stone-50 border border-stone-200 rounded-2xl text-center text-xs text-stone-400">
                  {t.adminFlow.noWindowsConfigured}
                </div>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {weeklySchedule.map((window, idx) => (
                    <div
                      key={window.id}
                      className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="w-6 h-6 rounded-full bg-navy-950 text-gold-400 text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <select
                          value={window.dayOfWeek}
                          onChange={(e) => handleUpdateScheduleWindow(window.id, 'dayOfWeek', parseInt(e.target.value))}
                          className="text-xs rounded-xl border border-stone-300 p-2 bg-white font-semibold text-navy-950 focus:ring-2 focus:ring-gold-500"
                        >
                          {[0, 1, 2, 3, 4, 5, 6].map((dayNum) => (
                            <option key={dayNum} value={dayNum}>
                              {getDayName(dayNum)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-stone-400 text-[10px]">من</span>
                          <input
                            type="time"
                            value={window.startTime}
                            onChange={(e) => handleUpdateScheduleWindow(window.id, 'startTime', e.target.value)}
                            className="text-xs rounded-xl border border-stone-300 p-1.5 bg-white font-mono"
                          />
                        </div>
                        <span className="text-stone-400">—</span>
                        <div className="flex items-center gap-1">
                          <span className="text-stone-400 text-[10px]">إلى</span>
                          <input
                            type="time"
                            value={window.endTime}
                            onChange={(e) => handleUpdateScheduleWindow(window.id, 'endTime', e.target.value)}
                            className="text-xs rounded-xl border border-stone-300 p-1.5 bg-white font-mono"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveScheduleWindow(window.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition ms-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls & Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-200">
            <div>
              {activeStep > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveStep((activeStep - 1) as any)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition"
                >
                  {t.common.back}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {activeStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setActiveStep((activeStep + 1) as any)}
                  className="px-5 py-2.5 rounded-xl bg-navy-950 text-gold-400 text-xs font-bold shadow hover:bg-navy-900 transition"
                >
                  {language === 'ar' ? 'المتابعة للخطوة التالية' : 'Next Step'} →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-navy-950 text-xs font-bold shadow-lg transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? t.common.saving : (language === 'ar' ? 'حفظ وإنشاء حساب أبونا' : 'Complete Priest Onboarding')}</span>
                </button>
              )}
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
