import React, { useState, useMemo } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { User, UserRole, DEFAULT_SKELETON_AVATAR } from '../../types/database';
import { Badge } from '../common/Badge';
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
  Users
} from 'lucide-react';

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
  const [editRole, setEditRole] = useState<UserRole>('general');
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editTitleEn, setEditTitleEn] = useState('');
  const [editTitleAr, setEditTitleAr] = useState('');
  const [editAssignedPriests, setEditAssignedPriests] = useState<string[]>([]);

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
                          onClick={() => setSelectedUserForDetails(user)}
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

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
            <div className="bg-navy-950 text-white p-6 flex items-center justify-between border-b border-navy-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-500 text-navy-950 flex items-center justify-center font-bold">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif">{t.adminFlow.editUserTitle}</h3>
                  <p className="text-xs text-stone-300">{editingUser.email}</p>
                </div>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy-950 mb-1">
                    {t.adminFlow.userName}
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full text-xs rounded-xl border border-stone-300 p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-950 mb-1">
                    {t.adminFlow.userPhone}
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full text-xs rounded-xl border border-stone-300 p-2.5"
                  />
                </div>
              </div>

              {editRole === 'secretary' && (
                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
                  <label className="block text-xs font-bold text-purple-950">
                    {t.adminFlow.assignPriestsLabel}
                  </label>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {priests.map((priest) => {
                      const isAssigned = editAssignedPriests.includes(priest.id);
                      return (
                        <label
                          key={priest.id}
                          className="flex items-center gap-2 text-xs text-stone-700 bg-white p-2 rounded-xl border border-purple-100 cursor-pointer"
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

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
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
      <UserDetailsModal
        user={selectedUserForDetails}
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

    </div>
  );
};
