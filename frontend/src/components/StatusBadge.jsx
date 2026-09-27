import React from 'react';

const STATUS_CONFIG = {
  new: {
    label: 'Yangi',
    classes: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 ring-blue-600/20',
    dot: 'bg-blue-500',
  },
  contacted: {
    label: "Bog'lanildi",
    classes: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 ring-amber-600/20',
    dot: 'bg-amber-500',
  },
  qualified: {
    label: 'Saralangan',
    classes: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 ring-purple-600/20',
    dot: 'bg-purple-500',
  },
  won: {
    label: 'Yutildi (Mijoz)',
    classes: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 ring-emerald-600/20',
    dot: 'bg-emerald-500',
  },
  lost: {
    label: "Yo'qotildi",
    classes: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 ring-rose-600/20',
    dot: 'bg-rose-500',
  },
};

export default function StatusBadge({ status, className = '' }) {
  const normalizedStatus = (status || 'new').toLowerCase();
  const config = STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG.new;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.classes} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  );
}

export { STATUS_CONFIG };
