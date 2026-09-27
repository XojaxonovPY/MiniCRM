import React from 'react';
import { Search, Plus, RotateCcw } from 'lucide-react';
import { STATUS_CONFIG } from './StatusBadge';

export default function FilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  onReset,
  onOpenCreate,
  canCreate = true,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs mb-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between transition-colors duration-150">
      {/* Search & Filters */}
      <div className="flex flex-1 flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Ism, telefon yoki email bo'yicha qidirish..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Status Dropdown */}
        <div className="relative min-w-[150px]">
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
          >
            <option value="">Barcha statuslar</option>
            {Object.entries(STATUS_CONFIG).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="relative min-w-[140px]">
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
          >
            <option value="-created_at">Eng yangilari</option>
            <option value="created_at">Eng eskilari</option>
            <option value="name">Alifbo bo'yicha</option>
          </select>
        </div>

        {/* Reset button */}
        {(search || status || sort !== '-created_at') && (
          <button
            onClick={onReset}
            title="Filtrlarni tozalash"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Tozalash</span>
          </button>
        )}
      </div>

      {/* Action: Create Lead */}
      <div>
        <button
          onClick={onOpenCreate}
          disabled={!canCreate}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            canCreate
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shadow-emerald-600/30'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-700'
          }`}
          title={!canCreate ? "Faqat Admin foydalanuvchilar yangi lead yarata oladi" : "Yangi lead qo'shish"}
        >
          <Plus className="w-4 h-4" />
          Yangi Lead
        </button>
      </div>
    </div>
  );
}
