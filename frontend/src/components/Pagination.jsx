import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ limit, offset, currentCount, onPageChange }) {
  const currentPage = Math.floor(offset / limit) + 1;
  const hasNext = currentCount === limit;
  const hasPrev = offset > 0;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 sm:px-6 rounded-b-xl transition-colors duration-150">
      <div className="text-xs text-slate-500 dark:text-slate-400">
        Ko'rsatilmoqda: <span className="font-semibold text-slate-800 dark:text-white">{offset + 1}</span> -{' '}
        <span className="font-semibold text-slate-800 dark:text-white">{offset + currentCount}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(0, offset - limit))}
          disabled={!hasPrev}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            hasPrev
              ? 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer'
              : 'border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Oldingi
        </button>

        <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-md border border-emerald-200 dark:border-emerald-800">
          {currentPage} - sahifa
        </span>

        <button
          onClick={() => onPageChange(offset + limit)}
          disabled={!hasNext}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            hasNext
              ? 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer'
              : 'border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
          }`}
        >
          Keyingi
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
