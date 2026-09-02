import React, { useState, useMemo } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { User, UserRole, DEFAULT_SKELETON_AVATAR, Gender, MaritalStatus, ChurchServiceRole } from '../../types/database';
import { Badge } from '../common/Badge';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { UserDetailsModal } from './UserDetailsModal';
import { 
  UserPlus, 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  KeyRound, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Sparkles,
  Upload,
  Church,
  ShieldCheck,
  Users,
  User as UserIcon,
  Phone,
  Mail,
  Lock,
  MapPin,
  CreditCard,
  Calendar,
  Heart,
  Briefcase,
  GraduationCap,
  Award,
  Clock
} from 'lucide-react';

const SERVED_STAGE_PRESETS_AR = [
  'حضانة',
  'المرحلة الابتدائية (١ - ٦ ابتدائي)',
  'المرحلة الإعدادية (١ - ٣ إعدادي)',
  'المرحلة الثانوية (١ - ٣ ثانوي)',
  'مرحلة الجامعة',
  'مرحلة الخريجين والشباب',
  'أخرى (تحديد يدوي)',
];

const SERVED_STAGE_PRESETS_EN = [
  'Nursery / Preschool',
  'Primary Stage (1st - 6th)',
  'Preparatory Stage (1st - 3rd Prep)',
  'Secondary Stage (1st - 3rd High School)',
  'University / College',
  'Graduates & Working Youth',
  'Other (Custom Specify)',
];

const SERVING_STAGE_PRESETS_AR = [
  'خدمة حضانة',
  'خدمة ابتدائي',
  'خدمة إعدادي',
  'خدمة ثانوي',
  'خدمة جامعة وخريجين',
  'إعداد خدام',
  'خدمة أخرى (تحديد يدوي)',
];

const SERVING_STAGE_PRESETS_EN = [
  'Nursery / Preschool Service',
  'Primary Stage Service',
  'Preparatory Stage Service',
  'Secondary Stage Service',
  'Youth & College Service',
  'Servants Preparation',
  'Other Service (Custom Specify)',
];

interface SuperAdminUserDirectoryProps {
  onOpenPriestWizard: () => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

export const SuperAdminUserDirectory: React.FC<SuperAdminUserDirectoryProps> = ({
  onOpenPriestWizard,
  isCreateModalOpen,
  setIsCreateModalOpen,
}) => {
  const { t, language } = useTranslation();
  const { 
    allUsers, 
    priests, 
    secretaries, 
    generalUsers, 
    createUser, 
    updateUser, 
    deleteUser,
    adminResetPassword 
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | UserRole>('all');

  // Modals state
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [resettingUser, setResettingUser] = useState<User | null>(null);

  // Feedback alerts
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Standard Create user form state (for general / secretary)
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createRole, setCreateRole] = useState<UserRole>('general');
  const [createPassword, setCreatePassword] = useState('');
  const [createConfirmPassword, setCreateConfirmPassword] = useState('');
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [createTitleEn, setCreateTitleEn] = useState('');
  const [createTitleAr, setCreateTitleAr] = useState('');
  const [createAvatarUrl, setCreateAvatarUrl] = useState('');
  const [createAssignedPriests, setCreateAssignedPriests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset password form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Edit user form state
  const [editActiveTab, setEditActiveTab] = useState<'personal' | 'contact' | 'church' | 'privileges'>('personal');
  const [editRole, setEditRole] = useState<UserRole>('general');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editSecondaryPhone, setEditSecondaryPhone] = useState('');
  const [editGender, setEditGender] = useState<Gender>('male');
  const [editDob, setEditDob] = useState('');
  const [editNationalId, setEditNationalId] = useState('');
  const [editMaritalStatus, setEditMaritalStatus] = useState<MaritalStatus>('single');
  const [editEducation, setEditEducation] = useState('');
  const [editProfession, setEditProfession] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editServiceStatus, setEditServiceStatus] = useState<ChurchServiceRole>('general_member');
  const [editServedStageSelect, setEditServedStageSelect] = useState('');
  const [editServedStageCustom, setEditServedStageCustom] = useState('');
  const [editServingStageSelect, setEditServingStageSelect] = useState('');
  const [editServingStageCustom, setEditServingStageCustom] = useState('');
  const [editOtherServices, setEditOtherServices] = useState('');
  const [editConfessionFatherId, setEditConfessionFatherId] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editTitleEn, setEditTitleEn] = useState('');
  const [editTitleAr, setEditTitleAr] = useState('');
  const [editAssignedPriests, setEditAssignedPriests] = useState<string[]>([]);
  const [editReminderInterval, setEditReminderInterval] = useState<number>(30);
  const [editReminderEnabled, setEditReminderEnabled] = useState<boolean>(true);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let pass = '';
    for (let i = 0; i < 7; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass + '@26';
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => {
      if (selectedRoleFilter !== 'all' && u.role !== selectedRoleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = u.name.toLowerCase().includes(q) || (u.title_en?.toLowerCase().includes(q)) || (u.title_ar?.includes(q));
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchPhone = u.phone?.toLowerCase().includes(q);
        const matchRole = u.role.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchRole && !matchPhone) return false;
      }
      return true;
    });
  }, [allUsers, selectedRoleFilter, searchQuery]);

  const handleOpenCreateModal = () => {
    const initialPass = generateRandomPassword();
    setCreateName('');
    setCreateEmail('');
    setCreatePhone('');
    setCreateRole('general');
    setCreatePassword(initialPass);
    setCreateConfirmPassword(initialPass);
    setShowCreatePassword(false);
    setCreateTitleEn('');
    setCreateTitleAr('');
    setCreateAvatarUrl('');
    setCreateAssignedPriests(priests.map(p => p.id));
    setIsCreateModalOpen(true);
  };

  const handleOpenResetPasswordModal = (user: User) => {
    const generated = generateRandomPassword();
    setResettingUser(user);
    setNewPassword(generated);
    setConfirmNewPassword(generated);
    setShowNewPassword(true);
    setFeedback(null);
  };

  const handleOpenEditModal = (user: User) => {
    const liveUser = allUsers.find(u => u.id === user.id) || user;
    setEditingUser(liveUser);
    setEditActiveTab('personal');
    setEditRole(liveUser.role);
    setEditName(liveUser.name);
    setEditEmail(liveUser.email);
    setEditPhone(liveUser.phone || '');
    setEditSecondaryPhone(liveUser.secondary_phone || '');
    setEditGender(liveUser.gender || 'male');
    setEditDob(liveUser.date_of_birth || '');
    setEditNationalId(liveUser.national_id || '');
    setEditMaritalStatus(liveUser.marital_status || 'single');
    setEditEducation(liveUser.education || '');
    setEditProfession(liveUser.profession || '');
    setEditAddress(liveUser.address || '');
    setEditServiceStatus(liveUser.service_status || 'general_member');

    // Parse served stage
    const served = liveUser.served_stage || '';
    const isServedPreset = SERVED_STAGE_PRESETS_AR.includes(served) || SERVED_STAGE_PRESETS_EN.includes(served);
    if (served && isServedPreset) {
      setEditServedStageSelect(served);
      setEditServedStageCustom('');
    } else if (served) {
      setEditServedStageSelect(language === 'ar' ? 'أخرى (تحديد يدوي)' : 'Other (Custom Specify)');
      setEditServedStageCustom(served);
    } else {
      setEditServedStageSelect(language === 'ar' ? 'المرحلة الثانوية (١ - ٣ ثانوي)' : 'Secondary Stage (1st - 3rd High School)');
      setEditServedStageCustom('');
    }

    // Parse serving stage
    const serving = liveUser.serving_stage || '';
    const isServingPreset = SERVING_STAGE_PRESETS_AR.includes(serving) || SERVING_STAGE_PRESETS_EN.includes(serving);
    if (serving && isServingPreset) {
      setEditServingStageSelect(serving);
      setEditServingStageCustom('');
    } else if (serving) {
      setEditServingStageSelect(language === 'ar' ? 'خدمة أخرى (تحديد يدوي)' : 'Other Service (Custom Specify)');
      setEditServingStageCustom(serving);
    } else {
      setEditServingStageSelect(language === 'ar' ? 'خدمة إعدادي' : 'Preparatory Stage Service');
      setEditServingStageCustom('');
    }

    setEditOtherServices(liveUser.other_services || '');
    setEditConfessionFatherId(liveUser.confession_father_id || priests[0]?.id || '');
    setEditAvatarUrl(liveUser.avatar_url || '');
    setEditTitleEn(liveUser.title_en || liveUser.name);
    setEditTitleAr(liveUser.title_ar || liveUser.name);
    setEditAssignedPriests(liveUser.assigned_priest_ids || priests.map(p => p.id));
    setEditReminderInterval(liveUser.confession_reminder_interval_days || 30);
    setEditReminderEnabled(liveUser.confession_reminder_enabled !== false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert(language === 'ar' ? 'حجم الملف يتجاوز 3 ميجابايت' : 'Photo file size should be under 3MB');
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
    if (createPassword.length < 6) {
      setFeedback({ type: 'error', message: t.auth.passwordMinLength });
      return;
    }
    if (createPassword !== createConfirmPassword) {
      setFeedback({ type: 'error', message: t.auth.passwordsDoNotMatch });
      return;
    }

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
      undefined,
      createPassword
    );

    setIsSubmitting(false);

    if (result.success) {
      setFeedback({ type: 'success', message: t.adminFlow.userCreatedSuccess });
      setIsCreateModalOpen(false);
    } else {
      setFeedback({ type: 'error', message: result.error || 'Failed to create user' });
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;
    if (newPassword.length < 6) {
      setFeedback({ type: 'error', message: t.auth.passwordMinLength });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setFeedback({ type: 'error', message: t.auth.passwordsDoNotMatch });
      return;
    }

    setIsResetting(true);
    setFeedback(null);

    const result = await adminResetPassword(resettingUser.id, newPassword);
    setIsResetting(false);

    if (result.success) {
      setFeedback({ type: 'success', message: t.adminFlow.passwordResetSuccess });
      setResettingUser(null);
    } else {
      setFeedback({ type: 'error', message: result.error || 'Failed to reset password' });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editName.trim()) {
      setFeedback({ type: 'error', message: t.auth.nameRequired });
      return;
    }

    if (editNationalId.trim() && !/^\d{14}$/.test(editNationalId.trim())) {
      setFeedback({ type: 'error', message: t.auth.nationalIdValidationErr });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    let finalServedStage: string | undefined = undefined;
    let finalServingStage: string | undefined = undefined;

    if (editServiceStatus === 'served') {
      finalServedStage = (editServedStageSelect.includes('أخرى') || editServedStageSelect.includes('Other'))
        ? editServedStageCustom.trim()
        : editServedStageSelect;
    } else if (editServiceStatus === 'servant') {
      finalServingStage = (editServingStageSelect.includes('أخرى') || editServingStageSelect.includes('Other'))
        ? editServingStageCustom.trim()
        : editServingStageSelect;
    }

    const updates: Partial<User> = {
      name: editName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim() || undefined,
      secondary_phone: editSecondaryPhone.trim() || undefined,
      gender: editGender,
      date_of_birth: editDob || undefined,
      national_id: editNationalId.trim() || undefined,
      marital_status: editMaritalStatus,
      education: editEducation.trim() || undefined,
      profession: editProfession.trim() || undefined,
      address: editAddress.trim() || undefined,
      service_status: editServiceStatus,
      served_stage: finalServedStage,
      serving_stage: finalServingStage,
      other_services: editOtherServices.trim() || undefined,
      confession_father_id: editConfessionFatherId || undefined,
      role: editRole,
      avatar_url: editAvatarUrl || undefined,
      title_en: editTitleEn.trim() || editName.trim(),
      title_ar: editTitleAr.trim() || editName.trim(),
      assigned_priest_ids: editRole === 'secretary' ? editAssignedPriests : undefined,
      confession_reminder_interval_days: editReminderInterval,
      confession_reminder_enabled: editReminderEnabled,
    };

    const result = await updateUser(editingUser.id, updates);

    setIsSubmitting(false);

    if (result.success) {
      setFeedback({ type: 'success', message: t.adminFlow.userUpdatedSuccess });
      if (selectedUserForDetails?.id === editingUser.id) {
        setSelectedUserForDetails(prev => prev ? { ...prev, ...updates } : null);
      }
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
    <div className="space-y-6 animate-in fade-in">
      
      {/* Action Header & Search */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold font-serif text-navy-950">
              {t.adminFlow.allUsersTable}
            </h3>
            <p className="text-xs text-stone-500">
              {language === 'ar' ? 'عرض والبحث في كافة الحسابات المسجلة وتعديل صلاحياتهم وكلمات المرور.' : 'Manage all accounts, system roles, credentials, and pastoral assignments.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenPriestWizard}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gold-500 hover:bg-gold-600 text-navy-950 text-xs font-bold shadow transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.adminFlow.addPriestWizard}</span>
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-navy-950 hover:bg-navy-900 text-gold-400 text-xs font-bold shadow transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t.adminFlow.createUserBtn}</span>
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

        {/* Filters & Search Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2">
          
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.adminFlow.searchUsers}
              className="w-full text-xs rounded-2xl border border-stone-200 bg-stone-50 py-2.5 ps-10 pe-4 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
            {(['all', 'priest', 'secretary', 'general', 'admin'] as const).map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRoleFilter(role)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition whitespace-nowrap ${
                  selectedRoleFilter === role
                    ? 'bg-navy-950 text-gold-400 border-navy-950 shadow-sm'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border-stone-200'
                }`}
              >
                {role === 'all' && `${t.common.all} (${allUsers.length})`}
                {role === 'priest' && `${t.roles.priest} (${priests.length})`}
                {role === 'secretary' && `${t.roles.secretary} (${secretaries.length})`}
                {role === 'general' && `${t.roles.general} (${generalUsers.length})`}
                {role === 'admin' && `${t.roles.admin} (${allUsers.filter(u => u.role === 'admin').length})`}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 text-start">{t.common.user}</th>
                <th className="py-3.5 px-4 text-start">{t.auth.emailLabel}</th>
                <th className="py-3.5 px-4 text-start">{t.auth.phoneLabel}</th>
                <th className="py-3.5 px-4 text-start">{t.common.status} / Role</th>
                <th className="py-3.5 px-4 text-end">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-400">
                    {language === 'ar' ? 'لا توجد نتائج مطابقة لبحثك.' : 'No users match your criteria.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    className="hover:bg-stone-50/80 transition cursor-pointer group"
                    onClick={() => setSelectedUserForDetails(user)}
                  >
                    
                    {/* User Profile */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar_url || DEFAULT_SKELETON_AVATAR}
                          alt={user.name}
                          className="w-10 h-10 rounded-2xl object-cover ring-2 ring-stone-200 group-hover:ring-gold-400 bg-stone-100 shrink-0 transition"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-navy-950 text-xs group-hover:text-church-900 transition">
                            {language === 'ar' ? (user.title_ar || user.name) : (user.title_en || user.name)}
                          </p>
                          {user.role === 'secretary' && user.assigned_priest_ids && user.assigned_priest_ids.length > 0 && (
                            <p className="text-[10px] text-purple-700 font-medium mt-0.5">
                              {user.assigned_priest_ids.length} {language === 'ar' ? 'آباء كهنة مسندين' : 'assigned priests'}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 text-stone-600 font-mono">
                      {user.email}
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-4 text-stone-600">
                      {user.phone || '—'}
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <Badge role={user.role} size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-end" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* View Profile */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedUserForDetails(user);
                          }}
                          className="p-2 rounded-xl text-stone-600 hover:text-navy-950 hover:bg-stone-100 transition border border-stone-200"
                          title={t.adminFlow.viewDetails}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Reset Password */}
                        <button
                          onClick={() => handleOpenResetPasswordModal(user)}
                          className="p-2 rounded-xl text-stone-600 hover:text-navy-950 hover:bg-stone-100 transition border border-stone-200"
                          title={t.adminFlow.resetPasswordBtn}
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Role */}
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="p-2 rounded-xl text-stone-600 hover:text-navy-950 hover:bg-stone-100 transition border border-stone-200"
                          title={t.adminFlow.editRoleBtn}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete User */}
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => setDeletingUserId(user.id)}
                            className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition border border-stone-200"
                            title={t.common.delete}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MEMBER / SECRETARY MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
            <div className="bg-navy-950 text-white p-6 flex items-center justify-between border-b border-navy-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-500 text-navy-950 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif">{t.adminFlow.createUserTitle}</h3>
                  <p className="text-xs text-stone-300">
                    {language === 'ar' ? 'إنشاء حساب عضو أو أمين سر مع كلمة مرور فورية' : 'Create direct credentials'}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-navy-950 mb-1.5">
                  {t.adminFlow.userRole}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateRole('general')}
                    className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                      createRole === 'general' ? 'bg-navy-950 text-gold-400 border-navy-950 ring-2 ring-gold-400' : 'bg-stone-50 border-stone-200 text-stone-700'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>{t.roles.general}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateRole('secretary')}
                    className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                      createRole === 'secretary' ? 'bg-navy-950 text-gold-400 border-navy-950 ring-2 ring-gold-400' : 'bg-stone-50 border-stone-200 text-stone-700'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t.roles.secretary}</span>
                  </button>
                </div>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy-950 mb-1">
                    {t.adminFlow.userName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="Full name"
                    className="w-full text-xs rounded-xl border border-stone-300 p-2.5 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-950 mb-1">
                    {t.adminFlow.userEmail} *
                  </label>
                  <input
                    type="email"
                    required
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full text-xs rounded-xl border border-stone-300 p-2.5 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Phone & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy-950 mb-1">
                    {t.adminFlow.userPhone}
                  </label>
                  <input
                    type="tel"
                    value={createPhone}
                    onChange={(e) => setCreatePhone(e.target.value)}
                    placeholder="+20 100 000 0000"
                    className="w-full text-xs rounded-xl border border-stone-300 p-2.5 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-950 mb-1">
                    {t.adminFlow.userPassword} *
                  </label>
                  <div className="relative">
                    <input
                      type={showCreatePassword ? 'text' : 'password'}
                      required
                      value={createPassword}
                      onChange={(e) => {
                        setCreatePassword(e.target.value);
                        setCreateConfirmPassword(e.target.value);
                      }}
                      className="w-full text-xs rounded-xl border border-stone-300 p-2.5 font-mono pr-8 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showCreatePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Secretary Priests Assignment */}
              {createRole === 'secretary' && (
                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
                  <label className="block text-xs font-bold text-purple-950">
                    {t.adminFlow.assignPriestsLabel}
                  </label>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {priests.map((priest) => {
                      const isAssigned = createAssignedPriests.includes(priest.id);
                      return (
                        <label
                          key={priest.id}
                          className="flex items-center gap-2 text-xs text-stone-700 bg-white p-2 rounded-xl border border-purple-100 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={() => togglePriestAssignment(priest.id, createAssignedPriests, setCreateAssignedPriests)}
                            className="rounded text-purple-600"
                          />
                          <span>{language === 'ar' ? (priest.title_ar || priest.name) : (priest.title_en || priest.name)}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
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

      {/* RESET PASSWORD MODAL */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="bg-navy-950 text-white p-6 flex items-center justify-between border-b border-navy-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-500 text-navy-950 flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif">{t.adminFlow.resetPasswordTitle}</h3>
                  <p className="text-xs text-stone-300">{resettingUser.email}</p>
                </div>
              </div>
              <button onClick={() => setResettingUser(null)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-navy-950">
                    {t.adminFlow.newPasswordLabel}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const gen = generateRandomPassword();
                      setNewPassword(gen);
                      setConfirmNewPassword(gen);
                    }}
                    className="text-[11px] text-church-700 hover:text-church-900 font-semibold underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{t.adminFlow.generatePassword}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setConfirmNewPassword(e.target.value);
                    }}
                    className="w-full text-xs rounded-xl border border-stone-300 p-2.5 font-mono pr-8 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-600 text-navy-950 text-xs font-bold shadow"
                >
                  {isResetting ? t.common.saving : t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 text-white p-6 flex items-start justify-between border-b border-gold-500/30">
              <div className="flex items-center gap-4">
                <img
                  src={editAvatarUrl || editingUser.avatar_url || DEFAULT_SKELETON_AVATAR}
                  alt={editingUser.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-gold-400 bg-stone-800 shrink-0 shadow"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge role={editRole} size="sm" />
                    <span className="text-[11px] text-stone-400 font-mono">ID: {editingUser.id.slice(0, 8)}</span>
                  </div>
                  <h3 className="text-lg font-bold font-serif leading-tight">
                    {language === 'ar' ? 'تعديل بيانات وصلاحيات العضو' : 'Edit User Profile & Permissions'}
                  </h3>
                  <p className="text-xs text-stone-300 font-mono">
                    {editingUser.email}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingUser(null)}
                className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="grid grid-cols-4 bg-stone-100 p-1.5 border-b border-stone-200 text-xs font-bold text-stone-600">
              <button
                type="button"
                onClick={() => setEditActiveTab('personal')}
                className={`py-2.5 px-1 rounded-xl transition flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  editActiveTab === 'personal'
                    ? 'bg-navy-950 text-gold-400 shadow-sm'
                    : 'hover:text-navy-950 hover:bg-stone-200/60'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[11px] truncate">{t.auth.sectionIdentity}</span>
              </button>

              <button
                type="button"
                onClick={() => setEditActiveTab('contact')}
                className={`py-2.5 px-1 rounded-xl transition flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  editActiveTab === 'contact'
                    ? 'bg-navy-950 text-gold-400 shadow-sm'
                    : 'hover:text-navy-950 hover:bg-stone-200/60'
                }`}
              >
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[11px] truncate">{t.auth.sectionContact}</span>
              </button>

              <button
                type="button"
                onClick={() => setEditActiveTab('church')}
                className={`py-2.5 px-1 rounded-xl transition flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  editActiveTab === 'church'
                    ? 'bg-navy-950 text-gold-400 shadow-sm'
                    : 'hover:text-navy-950 hover:bg-stone-200/60'
                }`}
              >
                <Church className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[11px] truncate">{t.auth.sectionChurch}</span>
              </button>

              <button
                type="button"
                onClick={() => setEditActiveTab('privileges')}
                className={`py-2.5 px-1 rounded-xl transition flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  editActiveTab === 'privileges'
                    ? 'bg-navy-950 text-gold-400 shadow-sm'
                    : 'hover:text-navy-950 hover:bg-stone-200/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[11px] truncate">{language === 'ar' ? 'الصلاحيات' : 'Role & Photo'}</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit}>
              <div className="p-6 space-y-4 max-h-[58vh] overflow-y-auto">
                
                {/* ---------------- TAB 1: PERSONAL IDENTITY ---------------- */}
                {editActiveTab === 'personal' && (
                  <div className="space-y-4 animate-in fade-in">
                    
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-navy-950 mb-1">
                        {t.auth.fullNameLabel} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-stone-400 absolute start-3.5 top-3" />
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => {
                            setEditName(e.target.value);
                            setEditTitleEn(e.target.value);
                            setEditTitleAr(e.target.value);
                          }}
                          className="w-full text-xs ps-10 pe-4 py-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-gold-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Gender Selector */}
                    <div>
                      <label className="block text-xs font-bold text-navy-950 mb-1.5">
                        {t.auth.genderLabel}
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setEditGender('male')}
                          className={`p-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 ${
                            editGender === 'male'
                              ? 'bg-navy-950 text-gold-400 border-navy-950 ring-2 ring-gold-400 shadow-sm'
                              : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <UserIcon className="w-4 h-4" />
                          <span>{t.auth.genderMale}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditGender('female')}
                          className={`p-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 ${
                            editGender === 'female'
                              ? 'bg-navy-950 text-gold-400 border-navy-950 ring-2 ring-gold-400 shadow-sm'
                              : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <UserIcon className="w-4 h-4" />
                          <span>{t.auth.genderFemale}</span>
                        </button>
                      </div>
                    </div>

                    {/* Date of Birth & National ID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-navy-950 mb-1">
                          {t.auth.dateOfBirthLabel}
                        </label>
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-stone-400 absolute start-3.5 top-3" />
                          <input
                            type="date"
                            max={new Date().toISOString().split('T')[0]}
                            value={editDob}
                            onChange={(e) => setEditDob(e.target.value)}
                            className="w-full text-xs ps-10 pe-4 py-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-gold-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-navy-950">
                            {t.auth.nationalIdLabel}
                          </label>
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                            editNationalId.length === 14 ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                          }`}>
                            {editNationalId.length}/14
                          </span>
                        </div>
                        <div className="relative">
                          <CreditCard className="w-4 h-4 text-stone-400 absolute start-3.5 top-3" />
                          <input
                            type="text"
                            maxLength={14}
                            inputMode="numeric"
                            value={editNationalId}
                            onChange={(e) => {
                              const num = e.target.value.replace(/\D/g, '');
                              setEditNationalId(num);
                            }}
                            placeholder="14 digits (الرقم القومي)"
                            className="w-full text-xs ps-10 pe-4 py-2.5 rounded-xl border border-stone-300 bg-white font-mono tracking-wider focus:ring-2 focus:ring-gold-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Marital Status */}
                    <div>
                      <label className="block text-xs font-bold text-navy-950 mb-1.5">
                        {t.auth.maritalStatusLabel}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { key: 'single', label: t.auth.maritalSingle },
                          { key: 'married', label: t.auth.maritalMarried },
                          { key: 'widowed', label: t.auth.maritalWidowed },
                          { key: 'divorced', label: t.auth.maritalDivorced },
                        ].map(({ key, label }) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setEditMaritalStatus(key as MaritalStatus)}
                            className={`p-2 rounded-xl text-xs font-bold border transition ${
                              editMaritalStatus === key
                                ? 'bg-navy-950 text-gold-400 border-navy-950 ring-2 ring-gold-400 shadow-sm'
                                : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Education & Profession */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-navy-950 mb-1">
                          {t.auth.educationLabel}
                        </label>
                        <div className="relative">
                          <GraduationCap className="w-4 h-4 text-stone-400 absolute start-3.5 top-3" />
                          <input
                            type="text"
                            value={editEducation}
                            onChange={(e) => setEditEducation(e.target.value)}
                            placeholder={t.auth.educationPlaceholder}
                            className="w-full text-xs ps-10 pe-4 py-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-gold-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-navy-950 mb-1">
                          {t.auth.professionLabel}
                        </label>
                        <div className="relative">
                          <Briefcase className="w-4 h-4 text-stone-400 absolute start-3.5 top-3" />
                          <input
                            type="text"
                            value={editProfession}
                            onChange={(e) => setEditProfession(e.target.value)}
                            placeholder={t.auth.professionPlaceholder}
                            className="w-full text-xs ps-10 pe-4 py-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-gold-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* ---------------- TAB 2: CONTACT & RESIDENCE ---------------- */}
                {editActiveTab === 'contact' && (
                  <div className="space-y-4 animate-in fade-in">
                    
                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-navy-950 mb-1">
                        {t.auth.emailLabel} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-400 absolute start-3.5 top-3" />
                        <input
                          type="email"
                          required
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full text-xs ps-10 pe-4 py-2.5 rounded-xl border border-stone-300 bg-white font-mono focus:ring-2 focus:ring-gold-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Primary & Secondary Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-navy-950 mb-1">
                          {t.auth.phoneLabel}
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-stone-400 absolute start-3.5 top-3" />
                          <input
                            type="tel"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            placeholder="01012345678"
                            className="w-full text-xs ps-10 pe-4 py-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-gold-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-navy-950 mb-1">
                          {t.auth.secondaryPhoneLabel}
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-stone-400 absolute start-3.5 top-3" />
                          <input
                            type="tel"
                            value={editSecondaryPhone}
                            onChange={(e) => setEditSecondaryPhone(e.target.value)}
                            placeholder={language === 'ar' ? 'رقم هاتف إضافي أو أرضي' : 'Secondary phone'}
                            className="w-full text-xs ps-10 pe-4 py-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-gold-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Home Address */}
                    <div>
                      <label className="block text-xs font-bold text-navy-950 mb-1">
                        {t.auth.addressLabel}
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-stone-400 absolute start-3.5 top-3" />
                        <input
                          type="text"
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          placeholder={language === 'ar' ? 'العنوان بالتفصيل، الحي، المدينة' : 'Full street address, district, city'}
                          className="w-full text-xs ps-10 pe-4 py-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-gold-500 focus:outline-none"
                        />
                      </div>
                    </div>

                  </div>
                )}

                {/* ---------------- TAB 3: CHURCH FELLOWSHIP & CONFESSION ---------------- */}
                {editActiveTab === 'church' && (
                  <div className="space-y-4 animate-in fade-in">
                    
                    {/* Service Status */}
                    <div>
                      <label className="block text-xs font-bold text-navy-950 mb-1.5">
                        {t.auth.serviceStatusLabel}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setEditServiceStatus('general_member')}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                            editServiceStatus === 'general_member'
                              ? 'bg-navy-950 text-gold-400 border-navy-950 ring-2 ring-gold-400 shadow-sm'
                              : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <Church className="w-4 h-4 shrink-0" />
                          <span>{t.auth.generalMemberOption}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditServiceStatus('served')}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                            editServiceStatus === 'served'
                              ? 'bg-navy-950 text-gold-400 border-navy-950 ring-2 ring-gold-400 shadow-sm'
                              : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <Users className="w-4 h-4 shrink-0" />
                          <span>{t.auth.servedOption}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditServiceStatus('servant')}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                            editServiceStatus === 'servant'
                              ? 'bg-navy-950 text-gold-400 border-navy-950 ring-2 ring-gold-400 shadow-sm'
                              : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <Award className="w-4 h-4 shrink-0" />
                          <span>{t.auth.servantOption}</span>
                        </button>
                      </div>
                    </div>

                    {/* Conditional: Served Stage */}
                    {editServiceStatus === 'served' && (
                      <div className="p-3.5 bg-stone-50 rounded-2xl border border-gold-300 space-y-2">
                        <label className="block text-xs font-bold text-navy-950">
                          {t.auth.servedStageLabel}
                        </label>
                        <select
                          value={editServedStageSelect}
                          onChange={(e) => setEditServedStageSelect(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white font-semibold text-stone-800"
                        >
                          {(language === 'ar' ? SERVED_STAGE_PRESETS_AR : SERVED_STAGE_PRESETS_EN).map((preset) => (
                            <option key={preset} value={preset}>{preset}</option>
                          ))}
                        </select>
                        {(editServedStageSelect.includes('أخرى') || editServedStageSelect.includes('Other')) && (
                          <input
                            type="text"
                            value={editServedStageCustom}
                            onChange={(e) => setEditServedStageCustom(e.target.value)}
                            placeholder={t.auth.servedStagePlaceholder}
                            className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white"
                          />
                        )}
                      </div>
                    )}

                    {/* Conditional: Serving Stage */}
                    {editServiceStatus === 'servant' && (
                      <div className="p-3.5 bg-stone-50 rounded-2xl border border-gold-300 space-y-2">
                        <label className="block text-xs font-bold text-navy-950">
                          {t.auth.servingStageLabel}
                        </label>
                        <select
                          value={editServingStageSelect}
                          onChange={(e) => setEditServingStageSelect(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white font-semibold text-stone-800"
                        >
                          {(language === 'ar' ? SERVING_STAGE_PRESETS_AR : SERVING_STAGE_PRESETS_EN).map((preset) => (
                            <option key={preset} value={preset}>{preset}</option>
                          ))}
                        </select>
                        {(editServingStageSelect.includes('أخرى') || editServingStageSelect.includes('Other')) && (
                          <input
                            type="text"
                            value={editServingStageCustom}
                            onChange={(e) => setEditServingStageCustom(e.target.value)}
                            placeholder={t.auth.servingStagePlaceholder}
                            className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white"
                          />
                        )}
                      </div>
                    )}

                    {/* Other Services */}
                    <div>
                      <label className="block text-xs font-bold text-navy-950 mb-1">
                        {t.auth.otherServicesLabel}
                      </label>
                      <div className="relative">
                        <Sparkles className="w-4 h-4 text-stone-400 absolute start-3.5 top-3" />
                        <input
                          type="text"
                          value={editOtherServices}
                          onChange={(e) => setEditOtherServices(e.target.value)}
                          placeholder={t.auth.otherServicesPlaceholder}
                          className="w-full text-xs ps-10 pe-4 py-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-gold-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Confession Father Selection */}
                    <div className="p-3.5 bg-gold-50/60 rounded-2xl border border-gold-300 space-y-2.5">
                      <label className="block text-xs font-bold text-church-950 flex items-center gap-1.5">
                        <Church className="w-4 h-4 text-gold-600" />
                        <span>{t.auth.confessionFatherLabel}</span>
                      </label>
                      
                      <select
                        value={editConfessionFatherId}
                        onChange={(e) => setEditConfessionFatherId(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white font-semibold text-navy-950"
                      >
                        <option value="">{language === 'ar' ? '-- بدون تحديد أب اعتراف --' : '-- No Confession Father --'}</option>
                        {priests.map((priest) => (
                          <option key={priest.id} value={priest.id}>
                            {language === 'ar' ? (priest.title_ar || priest.name) : (priest.title_en || priest.name)} ({priest.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Confession Rhythm Settings */}
                    <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-navy-950 flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-gold-600" />
                          <span>{language === 'ar' ? 'تذكير دورية الاعتراف (أيام)' : 'Confession Reminder Interval (Days)'}</span>
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editReminderEnabled}
                            onChange={(e) => setEditReminderEnabled(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-navy-950"></div>
                        </label>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {[15, 30, 45, 60].map((days) => (
                          <button
                            key={days}
                            type="button"
                            onClick={() => setEditReminderInterval(days)}
                            className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                              editReminderInterval === days
                                ? 'bg-navy-950 text-gold-400 border-navy-950'
                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                            }`}
                          >
                            {days} {language === 'ar' ? 'يوم' : 'days'}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* ---------------- TAB 4: ROLE & SYSTEM PRIVILEGES ---------------- */}
                {editActiveTab === 'privileges' && (
                  <div className="space-y-4 animate-in fade-in">
                    
                    {/* Role Selection */}
                    <div>
                      <label className="block text-xs font-bold text-navy-950 mb-1">
                        {t.adminFlow.userRole}
                      </label>
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value as UserRole)}
                        className="w-full text-xs rounded-xl border border-stone-300 p-2.5 bg-white font-semibold text-navy-950"
                      >
                        <option value="general">{t.roles.general}</option>
                        <option value="secretary">{t.roles.secretary}</option>
                        <option value="priest">{t.roles.priest}</option>
                        <option value="admin">{t.roles.admin}</option>
                      </select>
                    </div>

                    {/* Titles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-navy-950 mb-1">
                          {t.adminFlow.titleAr}
                        </label>
                        <input
                          type="text"
                          value={editTitleAr}
                          onChange={(e) => setEditTitleAr(e.target.value)}
                          placeholder="الاسم المعروض بالعربية"
                          className="w-full text-xs rounded-xl border border-stone-300 p-2.5 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-navy-950 mb-1">
                          {t.adminFlow.titleEn}
                        </label>
                        <input
                          type="text"
                          value={editTitleEn}
                          onChange={(e) => setEditTitleEn(e.target.value)}
                          placeholder="Display Name in English"
                          className="w-full text-xs rounded-xl border border-stone-300 p-2.5 bg-white"
                        />
                      </div>
                    </div>

                    {/* Avatar Photo */}
                    <div>
                      <label className="block text-xs font-bold text-navy-950 mb-1">
                        {t.adminFlow.photoLabel}
                      </label>
                      <div className="flex items-center gap-3">
                        <img
                          src={editAvatarUrl || DEFAULT_SKELETON_AVATAR}
                          alt="Avatar preview"
                          className="w-12 h-12 rounded-xl object-cover ring-2 ring-stone-200 shrink-0 shadow"
                        />
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={editAvatarUrl}
                            onChange={(e) => setEditAvatarUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full text-xs rounded-xl border border-stone-300 p-2 bg-white font-mono"
                          />
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer transition">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{t.adminFlow.uploadPhoto}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, setEditAvatarUrl)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Secretary Priests Assignment */}
                    {editRole === 'secretary' && (
                      <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
                        <label className="block text-xs font-bold text-purple-950">
                          {t.adminFlow.assignPriestsLabel}
                        </label>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto">
                          {priests.map((priest) => {
                            const isAssigned = editAssignedPriests.includes(priest.id);
                            return (
                              <label
                                key={priest.id}
                                className="flex items-center gap-2 text-xs text-stone-700 bg-white p-2 rounded-xl border border-purple-100 cursor-pointer hover:bg-purple-50/50"
                              >
                                <input
                                  type="checkbox"
                                  checked={isAssigned}
                                  onChange={() => togglePriestAssignment(priest.id, editAssignedPriests, setEditAssignedPriests)}
                                  className="rounded text-purple-600"
                                />
                                <span>{language === 'ar' ? (priest.title_ar || priest.name) : (priest.title_en || priest.name)}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-6 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {editActiveTab !== 'personal' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (editActiveTab === 'privileges') setEditActiveTab('church');
                        else if (editActiveTab === 'church') setEditActiveTab('contact');
                        else if (editActiveTab === 'contact') setEditActiveTab('personal');
                      }}
                      className="px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-700 hover:bg-stone-100 transition"
                    >
                      {language === 'ar' ? 'السابق' : 'Previous'}
                    </button>
                  )}
                  {editActiveTab !== 'privileges' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (editActiveTab === 'personal') setEditActiveTab('contact');
                        else if (editActiveTab === 'contact') setEditActiveTab('church');
                        else if (editActiveTab === 'church') setEditActiveTab('privileges');
                      }}
                      className="px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold text-navy-950 hover:bg-stone-100 transition"
                    >
                      {language === 'ar' ? 'التالي' : 'Next'}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-navy-950 hover:bg-navy-900 text-gold-400 text-xs font-bold shadow transition disabled:opacity-50"
                  >
                    {isSubmitting ? (language === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ كافة التعديلات' : 'Save All Changes')}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h4 className="text-base font-bold text-navy-950">{t.common.delete}</h4>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              {t.adminFlow.deleteUserConfirm}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingUserId(null)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow"
              >
                {t.common.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER DETAILS MODAL */}
      <ErrorBoundary fallbackTitle={language === 'ar' ? 'حدث خطأ أثناء عرض بيانات المستخدم' : 'Error displaying user details'}>
        <UserDetailsModal
          user={selectedUserForDetails ? (allUsers.find(u => u.id === selectedUserForDetails.id) || selectedUserForDetails) : null}
          isOpen={!!selectedUserForDetails}
          onClose={() => setSelectedUserForDetails(null)}
          onEditUser={(user) => {
            setSelectedUserForDetails(null);
            handleOpenEditModal(user);
          }}
          onResetPassword={(user) => {
            setSelectedUserForDetails(null);
            handleOpenResetPasswordModal(user);
          }}
        />
      </ErrorBoundary>

    </div>
  );
};
