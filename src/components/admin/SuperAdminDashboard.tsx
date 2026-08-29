import React, { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { SuperAdminMonitoringDashboard } from './SuperAdminMonitoringDashboard';
import { SuperAdminUserDirectory } from './SuperAdminUserDirectory';
import { SuperAdminAuditLog } from './SuperAdminAuditLog';
import { CreatePriestWizardModal } from './CreatePriestWizardModal';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface SuperAdminDashboardProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  activeTab = 'admin_overview',
  setActiveTab,
}) => {
  const { t } = useTranslation();
  const { allUsers } = useAppStore();

  const [isPriestWizardOpen, setIsPriestWizardOpen] = useState(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handlePriestCreatedSuccess = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main View based on Tab */}
      {activeTab === 'admin_overview' && (
        <SuperAdminMonitoringDashboard
          onOpenPriestWizard={() => setIsPriestWizardOpen(true)}
          onOpenCreateUserModal={() => {
            if (setActiveTab) setActiveTab('admin_users');
            setIsCreateUserModalOpen(true);
          }}
          onNavigateToUserDirectory={() => {
            if (setActiveTab) setActiveTab('admin_users');
          }}
        />
      )}

      {activeTab === 'admin_users' && (
        <SuperAdminUserDirectory
          onOpenPriestWizard={() => setIsPriestWizardOpen(true)}
          isCreateModalOpen={isCreateUserModalOpen}
          setIsCreateModalOpen={setIsCreateUserModalOpen}
        />
      )}

      {activeTab === 'admin_audit_logs' && (
        <SuperAdminAuditLog />
      )}

      {/* Comprehensive Priest Setup Wizard Modal */}
      <CreatePriestWizardModal
        isOpen={isPriestWizardOpen}
        onClose={() => setIsPriestWizardOpen(false)}
        onSuccess={handlePriestCreatedSuccess}
      />

    </div>
  );
};
