import React from 'react';
import { clsx } from 'clsx';
import { useTranslation } from '../../lib/i18n';
import { SlotStatus, BookingStatus, UserRole } from '../../types/database';

interface BadgeProps {
  status?: SlotStatus | BookingStatus;
  role?: UserRole;
  children?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, role, children, className, size = 'md' }) => {
  const { t } = useTranslation();

  let colorClasses = 'bg-stone-100 text-stone-700 border-stone-200';
  let label = children;

  if (status) {
    switch (status) {
      case 'available':
        colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
        label = label || t.status.available;
        break;
      case 'booked':
        colorClasses = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
        label = label || t.status.booked;
        break;
      case 'unavailable':
        colorClasses = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
        label = label || t.status.unavailable;
        break;
      case 'confirmed':
        colorClasses = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-medium';
        label = label || t.status.confirmed;
        break;
      case 'cancelled':
        colorClasses = 'bg-rose-100 text-rose-800 border-rose-300 font-medium';
        label = label || t.status.cancelled;
        break;
      case 'completed':
        colorClasses = 'bg-sky-100 text-sky-900 border-sky-300 font-semibold';
        label = label || t.status.completed;
        break;
      case 'no_show':
        colorClasses = 'bg-stone-200 text-stone-800 border-stone-300 font-medium';
        label = label || t.status.no_show;
        break;
    }
  }

  if (role) {
    switch (role) {
      case 'admin':
        colorClasses = 'bg-navy-900 text-gold-400 border-navy-800 font-bold';
        label = label || t.roles.admin;
        break;
      case 'priest':
        colorClasses = 'bg-gold-100 text-church-900 border-gold-300 font-semibold';
        label = label || t.roles.priest;
        break;
      case 'secretary':
        colorClasses = 'bg-purple-100 text-purple-900 border-purple-300 font-medium';
        label = label || t.roles.secretary;
        break;
      case 'general':
        colorClasses = 'bg-sky-100 text-sky-900 border-sky-300 font-medium';
        label = label || t.roles.general;
        break;
    }
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full border transition-colors',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs sm:text-sm',
        colorClasses,
        className
      )}
    >
      {label}
    </span>
  );
};
