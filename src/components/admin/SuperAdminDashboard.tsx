import React, { useState, useMemo } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { User, UserRole, PriestProfile } from '../../types/database';
import { Badge } from '../common/Badge';
import { 
  ShieldCheck, 
  UserPlus, 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Church, 
  Clock, 
  Crown,
  Sparkles,
  Camera,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon
} from 'lucide-react';

const PRESET_AVATARS = [
  { label: 'Father (Portrait 1)', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300' },
  { label: 'Father (Portrait 2)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300' },
  { label: 'Father (Portrait 3)', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300' },
  { label: 'Father (Portrait 4)', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300' },
  { label: 'Archdeacon / Admin', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300' },
  { label: 'Secretary (Sister)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300' },
  { label: 'Member (Brother)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300' },
  { label: 'Member (Sister)', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300' },
];

export const SuperAdminDashboard: React.FC = () => {
  const { t, language } = useTranslation();
  const { 
    allUsers, 
    priests, 
    secretaries, 
    generalUsers, 
    priestProfiles, 
    createUser, 
    updateUser, 
    deleteUser 
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | UserRole>('all');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Feedback alerts
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Create user form state
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createRole, setCreateRole] = useState<UserRole>('general');
  const [createTitleEn, setCreateTitleEn] = useState('');
  const [createTitleAr, setCreateTitleAr] = useState('');
  const [createAvatarUrl, setCreateAvatarUrl] = useState(PRESET_AVATARS[0].url);
  const [createAvgDuration, setCreateAvgDuration] = useState(15);
  const [createChurchNameEn, setCreateChurchNameEn] = useState('Saint Mark Church Shobra');
  const [createChurchNameAr, setCreateChurchNameAr] = useState('كنيسة الشهيد العظيم مارمرقس بشبرا');
  const [createBioEn, setCreateBioEn] = useState('');
  const [createBioAr, setCreateBioAr] = useState('');
  const [createAssignedPriests, setCreateAssignedPriests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit user form state
  const [editRole, setEditRole] = useState<UserRole>('general');
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editTitleEn, setEditTitleEn] = useState('');
  const [editTitleAr, setEditTitleAr] = useState('');
  const [editAssignedPriests, setEditAssignedPriests] = useState<string[]>([]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => {
      if (selectedRoleFilter !== 'all' && u.role !== selectedRoleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = u.name.toLowerCase().includes(q) || (u.title_en?.toLowerCase().includes(q)) || (u.title_ar?.includes(q));
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchRole = u.role.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchRole) return false;
      }
      return true;
    });
  }, [allUsers, selectedRoleFilter, searchQuery]);

  const handleOpenCreateModal = () => {
    setCreateName('');
    setCreateEmail('');
    setCreatePhone('');
    setCreateRole('general');
    setCreateTitleEn('');
    setCreateTitleAr('');
    setCreateAvatarUrl(PRESET_AVATARS[0].url);
    setCreateAvgDuration(15);
    setCreateChurchNameEn('Saint Mark Church Shobra');
    setCreateChurchNameAr('كنيسة الشهيد العظيم مارمرقس بشبرا');
    setCreateBioEn('');
    setCreateBioAr('');
    setCreateAssignedPriests(priests.map(p => p.id));
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditName(user.name);
    setEditPhone(user.phone || '');
    setEditAvatarUrl(user.avatar_url || '');
    setEditTitleEn(user.title_en || user.name);
    setEditTitleAr(user.title_ar || user.name);
    setEditAssignedPriests(user.assigned_priest_ids || priests.map(p => p.id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 3MB for base64 storage)
    if (file.size > 3 * 1024 * 1024) {
      alert('Photo file size should be under 3MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setter(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const result = await createUser(
      {
        name: createName.trim(),
        email: createEmail.trim(),
        phone: createPhone.trim() || undefined,
        role: createRole,
        avatar_url: createAvatarUrl || undefined,
        title_en: createTitleEn.trim() || createName.trim(),
        title_ar: createTitleAr.trim() || createName.trim(),
        assigned_priest_ids: createRole === 'secretary' ? createAssignedPriests : undefined,
      },
      createRole === 'priest' ? {
        avg_confession_minutes: createAvgDuration,
        church_name_en: createChurchNameEn,
        church_name_ar: createChurchNameAr,
        bio_en: createBioEn || 'Parish priest serving holy confessions & spiritual counseling.',
        bio_ar: createBioAr || 'كاهن ومرشد روحي لسر الاعتراف.',
      } : undefined
    );

    setIsSubmitting(false);

    if (result.success) {
      setFeedback({ type: 'success', message: t.adminFlow.userCreatedSuccess });
      setIsCreateModalOpen(false);
    } else {
      setFeedback({ type: 'error', message: result.error || 'Failed to create user' });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    setFeedback(null);

    const result = await updateUser(editingUser.id, {
      name: editName.trim(),
      phone: editPhone.trim() || undefined,
      role: editRole,
      avatar_url: editAvatarUrl || undefined,
      title_en: editTitleEn.trim() || editName.trim(),
      title_ar: editTitleAr.trim() || editName.trim(),
      assigned_priest_ids: editRole === 'secretary' ? editAssignedPriests : undefined,
    });

    setIsSubmitting(false);

    if (result.success) {
      setFeedback({ type: 'success', message: t.adminFlow.userUpdatedSuccess });
      setEditingUser(null);
    } else {
      setFeedback({ type: 'error', message: result.error || 'Failed to update user' });
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUserId) return;
    const result = await deleteUser(deletingUserId);
    setDeletingUserId(null);

    if (result.success) {
      setFeedback({ type: 'success', message: t.adminFlow.userDeletedSuccess });
    } else {
      setFeedback({ type: 'error', message: result.error || 'Failed to delete user' });
    }
  };

  const togglePriestAssignment = (priestId: string, currentList: string[], setter: (list: string[]) => void) => {
    if (currentList.includes(priestId)) {
      setter(currentList.filter(id => id !== priestId));
    } else {
      setter([...currentList, priestId]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 p-6 sm:p-8 text-white shadow-xl border border-gold-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 text-xs font-bold border border-gold-400/30">
              <Crown className="w-4 h-4 text-gold-400" />
              <span>{language === 'ar' ? 'بوابة مدير النظام (سوبر أدمن)' : 'Super Administrator Portal'}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-serif font-bold text-white">
              {t.adminFlow.title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              {t.adminFlow.subtitle}
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs sm:text-sm font-bold shadow-lg shadow-gold-900/40 hover:scale-105 transition self-start md:self-auto"
          >
            <UserPlus className="w-5 h-5" />
            <span>{t.adminFlow.createUserBtn}</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-2 shadow-sm ${
          feedback.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            {t.adminFlow.totalUsers}
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-navy-950 mt-1">
            {allUsers.length}
          </p>
        </div>

        <div className="bg-gold-50/70 rounded-2xl p-5 border border-gold-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-church-800">
            ⛪ {t.adminFlow.totalPriests}
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-navy-950 mt-1">
            {priests.length}
          </p>
        </div>

        <div className="bg-purple-50/70 rounded-2xl p-5 border border-purple-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-800">
            📋 {t.adminFlow.totalSecretaries}
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-navy-950 mt-1">
            {secretaries.length}
          </p>
        </div>

        <div className="bg-sky-50/70 rounded-2xl p-5 border border-sky-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-800">
            👤 {t.adminFlow.totalMembers}
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-navy-950 mt-1">
            {generalUsers.length}
          </p>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute start-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.adminFlow.searchUsers}
              className="w-full text-xs ps-10 pe-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div className="w-full sm:w-56">
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value as any)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:ring-2 focus:ring-gold-500"
            >
              <option value="all">{t.adminFlow.filterRole} (All Roles)</option>
              <option value="admin">Super Admin</option>
              <option value="priest">{t.roles.priest}</option>
              <option value="secretary">{t.roles.secretary}</option>
              <option value="general">{t.roles.general}</option>
            </select>
          </div>

        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <h3 className="font-bold text-base text-navy-950 font-serif">
            {t.adminFlow.allUsersTable} ({filteredUsers.length})
          </h3>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-stone-400 text-sm">
            {language === 'ar' ? 'لا يوجد مستخدمون مطابقون لمعايير البحث الحالية.' : 'No users found matching current filters.'}
          </div>
        ) : (
          <div className="divide-y divide-stone-200 overflow-x-auto">
            {filteredUsers.map((user) => {
              const priestProfile = priestProfiles.find(p => p.priest_id === user.id);
              const assignedPriestsList = user.role === 'secretary'
                ? (user.assigned_priest_ids && user.assigned_priest_ids.length > 0
                    ? priests.filter(p => user.assigned_priest_ids?.includes(p.id))
                    : priests)
                : [];

              return (
                <div
                  key={user.id}
                  className="p-5 hover:bg-stone-50/80 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-2xl ring-2 ring-stone-200 overflow-hidden bg-stone-100 flex items-center justify-center">
                      <img
                        src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
                        alt={user.name}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-navy-950">
                          {language === 'ar' ? (user.title_ar || user.name) : (user.title_en || user.name)}
                        </span>
                        <Badge role={user.role} size="sm" />
                      </div>

                      <p className="text-xs text-stone-500">
                        {user.email} {user.phone && `• ${user.phone}`}
                      </p>

                      {user.role === 'priest' && priestProfile && (
                        <div className="flex items-center gap-2 text-xs text-church-800 pt-1">
                          <span className="bg-gold-50 px-2 py-0.5 rounded border border-gold-200">
                            {language === 'ar' 
                              ? `⏱ متوسط ${priestProfile.avg_confession_minutes} دقيقة` 
                              : `⏱ ${priestProfile.avg_confession_minutes} mins avg duration`}
                          </span>
                          <span className="bg-stone-100 px-2 py-0.5 rounded text-stone-600">
                            {language === 'ar'
                              ? `${priestProfile.weekly_schedule?.length || 0} فترات أسبوعية`
                              : `${priestProfile.weekly_schedule?.length || 0} recurring windows`}
                          </span>
                        </div>
                      )}

                      {user.role === 'secretary' && (
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-purple-900 pt-1">
                          <span className="font-semibold text-stone-500">
                            {language === 'ar' ? 'الآباء المسندون:' : 'Assigned Priests:'}
                          </span>
                          {assignedPriestsList.map(p => (
                            <span key={p.id} className="bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-[11px] font-medium">
                              ⛪ {language === 'ar' ? (p.title_ar || p.name) : (p.title_en || p.name)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(user)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition"
                    >
                      <Edit className="w-3.5 h-3.5 text-stone-500" />
                      <span>{t.adminFlow.editRoleBtn}</span>
                    </button>

                    {user.role !== 'admin' && (
                      <button
                        onClick={() => setDeletingUserId(user.id)}
                        className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title={t.common.delete}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE USER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[90vh]">
            
            <div className="bg-navy-950 text-white p-6 flex items-center justify-between border-b border-navy-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-500 text-navy-950 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif">{t.adminFlow.createUserTitle}</h3>
                  <p className="text-xs text-stone-300">
                    {language === 'ar' ? 'إضافة حساب جديد وتحديد الصورة الشخصية وصلاحيات الدور' : 'Add an account, portrait photo, and role permissions'}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1 rounded-lg text-stone-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              
              {/* PHOTO / AVATAR UPLOAD & SELECTION SECTION */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <label className="block font-bold text-stone-800 text-xs">
                  {t.adminFlow.photoLabel}
                </label>

                <div className="flex items-center gap-4">
                  <div className="shrink-0 w-16 h-16 rounded-2xl ring-2 ring-gold-400 shadow-md overflow-hidden bg-stone-200 flex items-center justify-center">
                    <img
                      src={createAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                      alt="Preview"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-950 hover:bg-navy-900 text-gold-400 font-bold text-xs shadow-sm transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{t.adminFlow.uploadPhoto}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, setCreateAvatarUrl)}
                        />
                      </label>
                      <span className="text-[10px] text-stone-400">
                        {language === 'ar' ? 'PNG, JPG حتى 3 ميجابايت' : 'PNG, JPG up to 3MB'}
                      </span>
                    </div>

                    <div className="relative">
                      <LinkIcon className="w-3.5 h-3.5 text-stone-400 absolute start-3 top-2.5" />
                      <input
                        type="url"
                        value={createAvatarUrl}
                        onChange={(e) => setCreateAvatarUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/... or paste image URL"
                        className="w-full text-xs ps-8 pe-3 py-1.5 rounded-xl border border-stone-300 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Preset Avatar Gallery */}
                <div className="pt-2 border-t border-stone-200">
                  <span className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                    {t.adminFlow.presetPhotos}
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {PRESET_AVATARS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCreateAvatarUrl(preset.url)}
                        className={`shrink-0 p-1 rounded-xl border-2 transition ${
                          createAvatarUrl === preset.url
                            ? 'border-gold-500 bg-gold-100/50 scale-105'
                            : 'border-transparent hover:border-stone-300'
                        }`}
                        title={preset.label}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-9 h-9 rounded-lg object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">{t.adminFlow.userName} *</label>
                <input
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder={language === 'ar' ? 'مثلاً: القس كيرلس بولس، مارك يسى...' : 'e.g. Fr. Cyril Boles, Mark Yassa...'}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">{t.adminFlow.userEmail} *</label>
                  <input
                    type="email"
                    required
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    placeholder="user@church.org"
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">{t.adminFlow.userPhone}</label>
                  <input
                    type="text"
                    value={createPhone}
                    onChange={(e) => setCreatePhone(e.target.value)}
                    placeholder="+1 555-0199"
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">{t.adminFlow.userRole} *</label>
                <select
                  value={createRole}
                  onChange={(e) => {
                    const r = e.target.value as UserRole;
                    setCreateRole(r);
                    if (r === 'priest' && !createTitleEn) {
                      setCreateTitleEn(createName ? `Fr. ${createName}` : 'Fr.');
                      setCreateTitleAr(createName ? `القمص ${createName}` : 'أبونا');
                    }
                  }}
                  className="w-full font-semibold p-2.5 rounded-xl border border-stone-300 bg-stone-50"
                >
                  <option value="general">{t.roles.general} ({language === 'ar' ? 'شعب الكنيسة' : 'Church Member'})</option>
                  <option value="priest">{t.roles.priest} ({language === 'ar' ? 'أب اعتراف' : 'Father / Confessor'})</option>
                  <option value="secretary">{t.roles.secretary} ({language === 'ar' ? 'سكرتارية الكنيسة' : 'Church Ops'})</option>
                  <option value="admin">{t.roles.admin} (Super Admin)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">{t.adminFlow.titleEn}</label>
                  <input
                    type="text"
                    value={createTitleEn}
                    onChange={(e) => setCreateTitleEn(e.target.value)}
                    placeholder="e.g. Fr. Cyril Boles"
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">{t.adminFlow.titleAr}</label>
                  <input
                    type="text"
                    value={createTitleAr}
                    onChange={(e) => setCreateTitleAr(e.target.value)}
                    placeholder="مثلاً: القس كيرلس بولس"
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              {/* Priest Specific Config */}
              {createRole === 'priest' && (
                <div className="p-4 bg-gold-50/70 rounded-2xl border border-gold-200 space-y-3">
                  <h4 className="font-bold text-church-900 flex items-center gap-1.5">
                    <Church className="w-4 h-4 text-gold-600" />
                    <span>{language === 'ar' ? 'إعدادات الملف الرعوي لأبونا' : 'Priest Pastoral Profile Settings'}</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        {language === 'ar' ? 'اسم الكنيسة (بالإنجليزية)' : 'Church Name (EN)'}
                      </label>
                      <input
                        type="text"
                        value={createChurchNameEn}
                        onChange={(e) => setCreateChurchNameEn(e.target.value)}
                        className="w-full p-2 rounded-xl border border-stone-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        {language === 'ar' ? 'اسم الكنيسة (بالعربية)' : 'Church Name (AR)'}
                      </label>
                      <input
                        type="text"
                        value={createChurchNameAr}
                        onChange={(e) => setCreateChurchNameAr(e.target.value)}
                        className="w-full p-2 rounded-xl border border-stone-300 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">{t.adminFlow.priestDurationLabel}</label>
                    <input
                      type="number"
                      min={5}
                      max={120}
                      value={createAvgDuration}
                      onChange={(e) => setCreateAvgDuration(parseInt(e.target.value) || 15)}
                      className="w-32 p-2 rounded-xl border border-stone-300 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        {language === 'ar' ? 'النبذة الرعوية (بالإنجليزية)' : 'Pastoral Bio (EN)'}
                      </label>
                      <textarea
                        value={createBioEn}
                        onChange={(e) => setCreateBioEn(e.target.value)}
                        placeholder="Pastoral counseling and spiritual guidance bio..."
                        rows={2}
                        className="w-full p-2 rounded-xl border border-stone-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        {language === 'ar' ? 'النبذة الرعوية (بالعربية)' : 'Pastoral Bio (AR)'}
                      </label>
                      <textarea
                        value={createBioAr}
                        onChange={(e) => setCreateBioAr(e.target.value)}
                        placeholder="نبذة رعوية وإرشادية عن خدمة أبونا..."
                        rows={2}
                        className="w-full p-2 rounded-xl border border-stone-300 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Secretary Specific Priest Assignment */}
              {createRole === 'secretary' && (
                <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-2">
                  <h4 className="font-bold text-purple-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>{t.adminFlow.assignPriestsLabel}</span>
                  </h4>
                  <p className="text-[11px] text-stone-500">{t.adminFlow.assignPriestsHelper}</p>
                  
                  <div className="space-y-1.5 pt-1">
                    {priests.map((p) => {
                      const isChecked = createAssignedPriests.includes(p.id);
                      return (
                        <label key={p.id} className="flex items-center gap-2 p-2 rounded-xl bg-white border border-purple-100 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePriestAssignment(p.id, createAssignedPriests, setCreateAssignedPriests)}
                            className="w-4 h-4 text-purple-600 rounded"
                          />
                          <span className="font-bold text-navy-950">
                            {language === 'ar' ? (p.title_ar || p.name) : (p.title_en || p.name)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 font-semibold"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-navy-950 text-gold-400 font-bold shadow"
                >
                  {isSubmitting ? t.common.saving : t.common.confirm}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* EDIT USER ROLE & SETTINGS MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 p-6 space-y-4 max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 shrink-0">
              <div className="flex items-center gap-2.5">
                <Edit className="w-5 h-5 text-gold-600" />
                <h3 className="text-base font-bold text-navy-950 font-serif">
                  {t.adminFlow.editUserTitle}
                </h3>
              </div>
              <button onClick={() => setEditingUser(null)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs overflow-y-auto flex-1">
              
              {/* Photo Edit */}
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <label className="block font-bold text-stone-800">
                  {t.adminFlow.photoLabel}
                </label>
                <div className="flex items-center gap-3">
                  <div className="shrink-0 w-14 h-14 rounded-2xl ring-2 ring-gold-400 shadow-md overflow-hidden bg-stone-200 flex items-center justify-center">
                    <img
                      src={editAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
                      alt="Preview"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-navy-950 text-gold-400 font-bold text-[11px]">
                      <Upload className="w-3 h-3" />
                      <span>{t.adminFlow.uploadPhoto}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, setEditAvatarUrl)}
                      />
                    </label>
                    <input
                      type="url"
                      value={editAvatarUrl}
                      onChange={(e) => setEditAvatarUrl(e.target.value)}
                      placeholder="Image URL..."
                      className="w-full text-xs p-1.5 rounded-lg border border-stone-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">{t.adminFlow.userName}</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">{t.adminFlow.titleEn}</label>
                  <input
                    type="text"
                    value={editTitleEn}
                    onChange={(e) => setEditTitleEn(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">{t.adminFlow.titleAr}</label>
                  <input
                    type="text"
                    value={editTitleAr}
                    onChange={(e) => setEditTitleAr(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">{t.adminFlow.userRole}</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full font-semibold p-2.5 rounded-xl border border-stone-300 bg-stone-50"
                >
                  <option value="general">{t.roles.general} ({language === 'ar' ? 'شعب الكنيسة' : 'Church Member'})</option>
                  <option value="priest">{t.roles.priest} ({language === 'ar' ? 'أب اعتراف' : 'Father / Confessor'})</option>
                  <option value="secretary">{t.roles.secretary} ({language === 'ar' ? 'سكرتارية الكنيسة' : 'Church Ops'})</option>
                  <option value="admin">{t.roles.admin} (Super Admin)</option>
                </select>
              </div>

              {editRole === 'secretary' && (
                <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-2">
                  <h4 className="font-bold text-purple-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>{t.adminFlow.assignPriestsLabel}</span>
                  </h4>
                  <div className="space-y-1.5 pt-1">
                    {priests.map((p) => {
                      const isChecked = editAssignedPriests.includes(p.id);
                      return (
                        <label key={p.id} className="flex items-center gap-2 p-2 rounded-xl bg-white border border-purple-100 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePriestAssignment(p.id, editAssignedPriests, setEditAssignedPriests)}
                            className="w-4 h-4 text-purple-600 rounded"
                          />
                          <span className="font-bold text-navy-950">
                            {language === 'ar' ? (p.title_ar || p.name) : (p.title_en || p.name)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 font-semibold"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-navy-950 text-gold-400 font-bold shadow"
                >
                  {isSubmitting ? t.common.saving : t.common.save}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-7 h-7" />
              <h3 className="text-lg font-bold text-navy-950">
                {language === 'ar' ? 'حذف الحساب نهائياً' : 'Delete Account'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {t.adminFlow.deleteUserConfirm}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingUserId(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow"
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
