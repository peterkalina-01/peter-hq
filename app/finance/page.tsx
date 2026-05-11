'use client';

import TopBar from '@/components/TopBar';
import MobileNav from '@/components/MobileNav';
import { useState } from 'react';

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-bg-card border border-border rounded-2xl p-6 ${className}`}>{children}</div>;
}

function SectionHeader({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-5 mt-8">
      <h2 className="text-2xl font-bold tracking-[-0.025em]">{title}</h2>
      {meta && <div className="text-xs text-text-dim font-medium">{meta}</div>}
    </div>
  );
}

const periodData: Record<string, { revenue: number; expenses: number; profit: number; margin: number }> = {
  'Dnes': { revenue: 2400, expenses: 186, profit: 2214, margin: 92.3 },
  '7d': { revenue: 4235, expenses: 820, profit: 3415, margin: 80.6 },
  '30d': { revenue: 18420, expenses: 6840, profit: 11580, margin: 62.9 },
  '90d': { revenue: 42000, expenses: 18200, profit: 23800, margin: 56.7 },
  'YTD': { revenue: 68000, expenses: 28400, profit: 39600, margin: 58.2 },
};

export default function FinancePage() {
  const [period, setPeriod] = useState('30d');
  const [txTab, setTxTab] = useState('Transakcie');
  const d = periodData[period];

  const txs = [
    { icon: '↓', type: 'in', name: 'Texas Land Co — UGC retainer', meta: '9. máj · Stripe', amount: '+$2,400' },
    { icon: '↑', type: 'out', name: 'Meta Ads — land clearing TX', meta: '9. máj · Meta', amount: '-$186' },
    { icon: '↓', type: 'in', name: 'Pine Ridge Clearing — faktúra #042', meta: '8. máj · SuperFaktúra', amount: '+$1,800' },
    { icon: '↑', type: 'out', name: 'Editor Marek — strih 8 reklám', meta: '7. máj · Bank', amount: '-$480' },
    { icon: '↑', type: 'out', name: 'ElevenLabs · Claude · GHL · iné', meta: '7. máj · predplatné', amount: '-$284' },
    { icon: '↓', type: 'in', name: 'DeepRoot Services — onboarding', meta: '6. máj · Stripe', amount: '+$800' },
  ];

  const invoices = [
    { num: '#2026-044', client: 'Texas Land Co', amount: '$2,400', status: 'Zaplatená', date: '9. máj' },
    { num: '#2026-043', client: 'Pine Ridge Clearing', amount: '$1,800', status: 'Zaplatená', date: '8. máj' },
    { num: '#2026-042', client: 'DeepRoot Services', amount: '$800', status: 'Zaplatená', date: '6. máj' },
    { num: '#2026-041', client: 'Brushhog Brothers', amount: '$1,200', status: 'Čaká', date: '4. máj' },
  ];

  const expenses = [
    { name: 'Meta Ads spend', amount: 3720, pct: 54, color: '#ff7849' },
    { name: 'Editori + creators', amount: 1800, pct: 26, color: '#6db6ff' },
    { name: 'Software / SaaS', amount: 684, pct: 10, color: '#a78bfa' },
    { name: 'Osobné výdavky', amount: 420, pct: 6, color: '#ff5d7a' },
    { name: 'Iné', amount: 216, pct: 4, color: '#2dd4bf' },
  ];

  const subs = [
    { name: 'Claude Max', price: '$100', renews: '18. máj' },
    { name: 'GHL Pro', price: '$97', renews: '1. jún' },
    { name: 'Veo 3', price: '$30', renews: '14. máj' },
    { name: 'ElevenLabs', price: '$22', renews: '9. máj' },
    { name: 'ChatGPT Plus', price: '$20', renews: '12. máj' },
    { name: 'CapCut Pro', price: '$15', renews: '22. máj' },
    { name: 'SuperFaktúra', price: '€15', renews: '1. jún' },
  ];

  return (
    <>
      <TopBar />
      <main className="px-4 md:px-8 py-6 md:py-8 max-w-[1400px] mx-auto pb-24 lg:pb-8">

        {/* Header + period toggle */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-[-0.03em]">Financie</h1>
            <p className="text-sm text-text-dim font-medium mt-1">Stripe · SuperFaktúra · Manuálne</p>
          </div>
          <div className="flex gap-1 bg-bg-elev border border-border rounded-xl p-1">
            {['Dnes', '7d', '30d', '90d', 'YTD'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-2 text-xs font-bold rounded-lg transition-all ${period === p ? 'bg-bg-card text-text' : 'text-text-dim hover:text-text'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Tržby firmy', value: `$${d.revenue.toLocaleString()}`, color: 'border-l-accent', trend: '↑ 12.4%' },
            { label: 'Náklady', value: `$${d.expenses.toLocaleString()}`, color: 'border-l-warm', trend: '↑ 4.2%' },
            { label: 'Čistý zisk', value: `$${d.profit.toLocaleString()}`, color: 'border-l-cool', trend: '↑ 18.2%' },
            { label: 'Marža', value: `${d.margin}%`, color: 'border-l-violet', trend: '↑ 3.1pp' },
          ].map(s => (
            <div key={s.label} className={`bg-bg-card border border-border border-l-[3px] ${s.color} rounded-2xl p-5`}>
              <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-3">{s.label}</div>
              <div className="text-2xl font-bold tracking-[-0.025em] mb-2">{s.value}</div>
              <div className="text-xs font-semibold text-accent">{s.trend}</div>
            </div>
          ))}
        </div>

        {/* Breakdown + Subscriptions */}
        <SectionHeader title="Náklady · Predplatné" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <h3 className="text-base font-bold mb-5">Breakdown nákladov</h3>
            <div className="space-y-4">
              {expenses.map(it => (
                <div key={it.name}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="flex items-center gap-2 font-medium">
                      <span className="w-2 h-2 rounded-full" style={{ background: it.color }} />{it.name}
                    </span>
                    <span className="font-bold">${it.amount.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-bg-elev rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${it.pct}%`, background: it.color }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold">Predplatné</h3>
              <span className="text-lg font-bold text-accent">$284 / mes</span>
            </div>
            <div className="space-y-2">
              {subs.map(s => (
                <div key={s.name} className="flex justify-between items-center p-3 bg-bg-elev rounded-xl">
                  <div>
                    <div className="text-sm font-semibold">{s.name}</div>
                    <div className="text-xs text-text-dim font-medium">{s.renews}</div>
                  </div>
                  <div className="text-sm font-bold">{s.price}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Transactions */}
        <SectionHeader title="Transakcie · Faktúry" meta="Stripe · SuperFaktúra" />
        <Card>
          <div className="flex justify-between items-center mb-5">
            <div className="flex gap-4">
              {['Transakcie', 'Faktúry'].map(t => (
                <button key={t} onClick={() => setTxTab(t)}
                  className={`text-sm font-bold pb-1 border-b-2 transition-all ${txTab === t ? 'text-text border-accent' : 'text-text-dim border-transparent'}`}>
                  {t}
                </button>
              ))}
            </div>
            <button className="text-xs text-accent font-bold">Export pre účtovníčku →</button>
          </div>

          {txTab === 'Transakcie' && txs.map((t, i) => (
            <div key={i} className="grid grid-cols-[auto_1fr_auto] gap-4 py-3 border-b border-white/[0.04] last:border-b-0 items-center">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${t.type === 'in' ? 'bg-accent/10 text-accent' : 'bg-warm/10 text-warm'}`}>{t.icon}</div>
              <div>
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="text-xs text-text-dim font-medium">{t.meta}</div>
              </div>
              <span className={`text-sm font-bold ${t.type === 'in' ? 'text-accent' : 'text-text'}`}>{t.amount}</span>
            </div>
          ))}

          {txTab === 'Faktúry' && invoices.map((inv, i) => (
            <div key={i} className="grid grid-cols-[auto_1fr_auto_auto] gap-4 py-3 border-b border-white/[0.04] last:border-b-0 items-center">
              <span className="text-xs font-bold text-text-dim bg-bg-elev px-2 py-1 rounded">{inv.num}</span>
              <div>
                <div className="text-sm font-semibold">{inv.client}</div>
                <div className="text-xs text-text-dim">{inv.date}</div>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded ${inv.status === 'Zaplatená' ? 'bg-accent/10 text-accent' : 'bg-warm/10 text-warm'}`}>{inv.status}</span>
              <span className="text-sm font-bold">{inv.amount}</span>
            </div>
          ))}
        </Card>

      </main>
      <MobileNav />
    </>
  );
}
