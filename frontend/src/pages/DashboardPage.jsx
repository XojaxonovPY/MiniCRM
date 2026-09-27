import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StatCards from '../components/StatCards';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import LeadCreateModal from '../components/LeadCreateModal';
import LeadDetailModal from '../components/LeadDetailModal';
import { leadsApi } from '../api/leads';
import { Phone, Mail, Clock, Eye, AlertCircle, RefreshCw, FolderSearch } from 'lucide-react';

const PAGE_SIZE = 15;

export default function DashboardPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('-created_at');
  const [offset, setOffset] = useState(0);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setOffset(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const sortedByList = sortField ? [sortField] : [];
      const res = await leadsApi.getLeads({
        search: debouncedSearch,
        status: statusFilter,
        limit: PAGE_SIZE,
        offset,
        sorted_by: sortedByList,
      });

      setLeads(res.data || []);
    } catch (err) {
      setError(err.message || 'Leadlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, sortField, offset]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Quick stat filter click
  const handleStatSelect = (st) => {
    setStatusFilter(st);
    setOffset(0);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setSortField('-created_at');
    setOffset(0);
  };

  const handleOpenDetail = (leadId) => {
    setSelectedLeadId(leadId);
    setIsDetailOpen(true);
  };

  const canCreate = user?.is_admin === true; // Backend PermissionChecker requires admin

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-150">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome banner */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Leadlar Boshqaruvi
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Kompaniyaning barcha arizalari, aloqa jarayonlari va mijozlar holati
            </p>
          </div>

          <button
            onClick={fetchLeads}
            disabled={loading}
            className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''}`} />
            Yangilash
          </button>
        </div>

        {/* Stat Summary Cards */}
        <StatCards
          leads={leads}
          activeStatus={statusFilter}
          onSelectStatus={handleStatSelect}
        />

        {/* Filter Bar */}
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          status={statusFilter}
          onStatusChange={(val) => { setStatusFilter(val); setOffset(0); }}
          sort={sortField}
          onSortChange={setSortField}
          onReset={handleResetFilters}
          onOpenCreate={() => setIsCreateOpen(true)}
          canCreate={canCreate}
        />

        {/* Error notice */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Table / List Container */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors duration-150">
          {loading && leads.length === 0 ? (
            <div className="py-20 text-center text-slate-400 dark:text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-500 opacity-60" />
              <p className="text-sm font-medium">Leadlar yuklanmoqda...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-3">
                <FolderSearch className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Hech qanday lead topilmadi</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                Qidiruv so'rovingizga yoki tanlangan statusga mos keluvchi arizalar mavjud emas.
              </p>
              {(search || statusFilter) && (
                <button
                  onClick={handleResetFilters}
                  className="mt-4 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors cursor-pointer"
                >
                  Filtrlarni tozalash
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-xs tracking-wider uppercase">
                    <th className="py-3 px-4 sm:px-6">Mijoz Ismi</th>
                    <th className="py-3 px-4">Aloqa</th>
                    <th className="py-3 px-4">Manba</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 hidden md:table-cell">Izoh</th>
                    <th className="py-3 px-4 hidden lg:table-cell">Sana</th>
                    <th className="py-3 px-4 text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => handleOpenDetail(lead.id)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    >
                      {/* Name */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {lead.name}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">ID: #{lead.id}</div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        {lead.phone_number && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>+{lead.phone_number}</span>
                          </div>
                        )}
                        {lead.email && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{lead.email}</span>
                          </div>
                        )}
                        {!lead.phone_number && !lead.email && (
                          <span className="text-xs text-slate-400 italic">Mavjud emas</span>
                        )}
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-700">
                          {lead.source || '-'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={lead.status} />
                      </td>

                      {/* Note */}
                      <td className="py-3.5 px-4 hidden md:table-cell max-w-xs truncate text-xs text-slate-500 dark:text-slate-400">
                        {lead.note || '-'}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 hidden lg:table-cell text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {lead.created_at
                              ? new Date(lead.created_at).toLocaleDateString('uz-UZ')
                              : '-'}
                          </span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(lead.id);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Ko'rish</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {leads.length > 0 && (
            <Pagination
              limit={PAGE_SIZE}
              offset={offset}
              currentCount={leads.length}
              onPageChange={setOffset}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      <LeadCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          fetchLeads();
        }}
      />

      <LeadDetailModal
        leadId={selectedLeadId}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedLeadId(null);
        }}
        onUpdateSuccess={() => {
          fetchLeads();
        }}
        canEdit={canCreate}
      />
    </div>
  );
}
