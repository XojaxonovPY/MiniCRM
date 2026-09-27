import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Share2,
  FileText,
  Clock,
  History as HistoryIcon,
  Edit3,
  Check,
  AlertCircle,
  Save,
  CheckCircle2,
} from 'lucide-react';
import StatusBadge, { STATUS_CONFIG } from './StatusBadge';
import { leadsApi } from '../api/leads';

export default function LeadDetailModal({
  leadId,
  isOpen,
  onClose,
  onUpdateSuccess,
  canEdit = true,
}) {
  const [lead, setLead] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'history'
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    phone_number: '',
    email: '',
    source: '',
    note: '',
    status: '',
  });

  const loadLeadData = async () => {
    if (!leadId) return;
    setLoading(true);
    setError('');
    try {
      const [leadData, historyData] = await Promise.all([
        leadsApi.getLeadById(leadId),
        leadsApi.getLeadHistory(leadId).catch(() => []),
      ]);

      setLead(leadData);
      setHistory(historyData);
      setEditForm({
        name: leadData.name || '',
        phone_number: leadData.phone_number || '',
        email: leadData.email || '',
        source: leadData.source || '',
        note: leadData.note || '',
        status: leadData.status || 'new',
      });
    } catch (err) {
      setError(err.message || "Lead ma'lumotlarini yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && leadId) {
      setIsEditing(false);
      setSuccessMsg('');
      loadLeadData();
    }
  }, [isOpen, leadId]);

  if (!isOpen) return null;

  // Quick status update
  const handleQuickStatusChange = async (newStatus) => {
    if (newStatus === lead.status) return;
    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      await leadsApi.updateLead(lead.id, { status: newStatus });
      setSuccessMsg(`Status "${STATUS_CONFIG[newStatus]?.label}" ga o'zgartirildi`);
      await loadLeadData();
      if (onUpdateSuccess) onUpdateSuccess();
    } catch (err) {
      setError(err.message || "Statusni o'zgartirishda xatolik");
    } finally {
      setSaving(false);
    }
  };

  // Full form save
  const handleSaveForm = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      const patchData = {
        name: editForm.name,
        source: editForm.source,
        note: editForm.note,
        status: editForm.status,
      };
      if (editForm.phone_number) patchData.phone_number = editForm.phone_number;
      if (editForm.email) patchData.email = editForm.email;

      await leadsApi.updateLead(lead.id, patchData);
      setSuccessMsg("Lead muvaffaqiyatli yangilandi");
      setIsEditing(false);
      await loadLeadData();
      if (onUpdateSuccess) onUpdateSuccess();
    } catch (err) {
      setError(err.message || 'Saqlashda xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-lg border border-slate-200 dark:border-slate-700">
              {lead?.name ? lead.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{lead?.name || 'Yuklanmoqda...'}</h3>
                {lead && <StatusBadge status={lead.status} />}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">ID: #{lead?.id} • Manba: {lead?.source || '-'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'details'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Ma'lumotlar va Status
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <HistoryIcon className="w-4 h-4" />
            Harakatlar Tarixi ({history.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">Ma'lumotlar yuklanmoqda...</div>
          ) : activeTab === 'details' ? (
            <>
              {/* Quick Status Buttons */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <span className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                  Statusni tezkor boshqarish:
                </span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STATUS_CONFIG).map(([stKey, cfg]) => {
                    const isCurrent = lead?.status === stKey;
                    return (
                      <button
                        key={stKey}
                        onClick={() => handleQuickStatusChange(stKey)}
                        disabled={saving || !canEdit}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                        } disabled:opacity-50`}
                      >
                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`}></span>
                        {cfg.label}
                        {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* View / Edit section */}
              {isEditing ? (
                <form onSubmit={handleSaveForm} className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Ma'lumotlarni tahrirlash
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline cursor-pointer"
                    >
                      Bekor qilish
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Ism</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Manba (Qo'lda kiritish)</label>
                      <input
                        type="text"
                        value={editForm.source}
                        onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                        placeholder="Masalan: Instagram, Telegram, Sayt..."
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefon</label>
                      <input
                        type="text"
                        value={editForm.phone_number}
                        onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Izoh</label>
                    <textarea
                      rows={3}
                      value={editForm.note}
                      onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {saving ? 'Saqlanmoqda...' : 'O\'zgarishlarni saqlash'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Asosiy Ma'lumotlar
                    </h4>
                    {canEdit && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Tahrirlash
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500">Telefon raqami</div>
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {lead?.phone_number ? `+${lead.phone_number}` : 'Kiritilmagan'}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500">Email</div>
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {lead?.email || 'Kiritilmagan'}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                      <Share2 className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500">Kelgan Manbasi</div>
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{lead?.source || '-'}</div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500">Yaratilgan vaqti</div>
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {lead?.created_at ? new Date(lead.created_at).toLocaleString('uz-UZ') : '-'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Note block */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                      Mijoz Izohi / Ehtiyoji
                    </div>
                    <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {lead?.note || 'Izoh mavjud emas'}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* History Tab */
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
                  Hali hech qanday harakat qayd etilmagan.
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                  {history.map((item) => (
                    <div key={item.id} className="relative">
                      <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-xs"></div>
                      <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {item.user?.full_name || 'Xodim'}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            {new Date(item.created_at).toLocaleString('uz-UZ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
