import React from 'react';
import { Users, Sparkles, PhoneCall, Award, UserX } from 'lucide-react';

export default function StatCards({ leads = [], onSelectStatus, activeStatus }) {
  const total = leads.length;
  const newCount = leads.filter(l => l.status === 'new').length;
  const inProgressCount = leads.filter(l => l.status === 'contacted' || l.status === 'qualified').length;
  const wonCount = leads.filter(l => l.status === 'won').length;
  const lostCount = leads.filter(l => l.status === 'lost').length;

  const cards = [
    {
      id: '',
      title: 'Jami Leadlar',
      count: total,
      icon: Users,
      bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    },
    {
      id: 'new',
      title: 'Yangi',
      count: newCount,
      icon: Sparkles,
      bg: 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-400',
    },
    {
      id: 'contacted',
      title: "Aloqada",
      count: inProgressCount,
      icon: PhoneCall,
      bg: 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400',
    },
    {
      id: 'won',
      title: 'Yutildi (Mijoz)',
      count: wonCount,
      icon: Award,
      bg: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400',
    },
    {
      id: 'lost',
      title: "Yo'qotildi",
      count: lostCount,
      icon: UserX,
      bg: 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeStatus === card.id;

        return (
          <button
            key={card.title}
            onClick={() => onSelectStatus(card.id)}
            className={`p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
              isSelected
                ? 'bg-white dark:bg-slate-900 border-emerald-500 dark:border-emerald-500 shadow-md ring-2 ring-emerald-500/20 dark:ring-emerald-500/40'
                : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{card.title}</span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${card.bg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{card.count}</div>
          </button>
        );
      })}
    </div>
  );
}
