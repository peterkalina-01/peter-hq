'use client';

import TopBar from '@/components/TopBar';
import MobileNav from '@/components/MobileNav';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

// ─── TYPES ───────────────────────────────────────────────────────────────────
type GhlDeal = {
  id: string; name: string; status: string; value: number;
  stageId: string; stageName: string; stagePosition: number;
  contact: string; phone?: string; updatedAt: string;
};
type GhlData = {
  pipelineName: string;
  pipelineId: string;
  stages: { id: string; name: string }[];
  deals: GhlDeal[];
  activeDeals: GhlDeal[];
  byStage: Record<string, { stageName: string; stagePosition: number; deals: GhlDeal[]; total: number; isTerminal: boolean }>;
  totalPipelineValue: number;
  totalAllValue: number;
  totalContacts: number;
  appointments: { id: string; title: string; status: string; startTime: string; contact: string }[];
  wonDeals: number;
  lostDeals: number;
  openDeals: number;
};
type StripeData = { mrr: number; revenue7d: number; activeCustomers: number };

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-bg-card border border-border rounded-2xl p-5 ${className}`}>{children}</div>;
}

function SectionHeader({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-4 mt-7 first:mt-0">
      <h2 className="text-xl font-bold tracking-[-0.025em]">{title}</h2>
      {meta && <div className="text-xs text-text-dim font-medium">{meta}</div>}
    </div>
  );
}

// Inline editable number — click to override
function Editable({ value, onSave, className = '', prefix = '', suffix = '', overridden = false }: {
  value: string | number; onSave: (v: string) => void;
  className?: string; prefix?: string; suffix?: string; overridden?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState('');
  const ref = useRef<HTMLInputElement>(null);

  const start = () => { setInput(String(value)); setEditing(true); setTimeout(() => ref.current?.select(), 30); };
  const save = () => { if (input.trim()) onSave(input.trim()); setEditing(false); };

  if (editing) return (
    <span className="inline-flex items-center gap-0.5">
      {prefix}
      <input ref={ref} value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
        onBlur={save}
        className="bg-bg-elev border border-accent rounded px-1.5 text-accent font-bold outline-none"
        style={{ width: `${Math.max(input.length + 1, 3)}ch`, fontSize: 'inherit' }}
      />
      {suffix}
    </span>
  );

  return (
    <span onClick={start} title="Klikni pre manuálnu úpravu" className={`cursor-pointer relative group ${className}`}>
      {overridden && <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-warm rounded-full"/>}
      {prefix}{value}{suffix}
      <span className="absolute -top-6 left-0 hidden group-hover:block text-[9px] bg-bg-elev border border-border px-2 py-0.5 rounded text-text-dim whitespace-nowrap z-20">✏ klikni pre úpravu</span>
    </span>
  );
}

function useOv(key: string, real: number) {
  const [v, setV] = useState(real);
  const [ov, setOv] = useState(false);
  useEffect(() => {
    try {
      const s = localStorage.getItem(`biz_${key}`);
      if (s !== null) { setV(JSON.parse(s)); setOv(true); } else setV(real);
    } catch {}
  }, [key, real]);
  const save = (str: string) => {
    const n = parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
    setV(n); setOv(true);
    try { localStorage.setItem(`biz_${key}`, JSON.stringify(n)); } catch {};
  };
  const clear = () => { setV(real); setOv(false); try { localStorage.removeItem(`biz_${key}`); } catch {} };
  return { v, ov, save, clear };
}

// ─── PIPELINE WITH STAGES ────────────────────────────────────────────────────
function DealRow({ deal, color }: { deal: GhlDeal; color: string }) {
  const dealOv = useOv(`deal_${deal.id}`, deal.value);
  return (
    <div className="flex justify-between items-center p-2.5 bg-bg-elev rounded-lg">
      <div className="min-w-0 mr-3">
        <div className="text-xs font-semibold truncate">{deal.name}</div>
        {deal.contact && <div className="text-[10px] text-text-dim truncate">{deal.contact}</div>}
      </div>
      <span style={{ color }} className="text-sm font-bold flex-shrink-0">
        <Editable value={`$${Number(dealOv.v).toLocaleString()}`} onSave={dealOv.save} overridden={dealOv.ov}/>
      </span>
    </div>
  );
}

function PipelineSection({ ghl, loading }: { ghl: GhlData | null; loading: boolean }) {
  const totalOv = useOv('pipeline_total', ghl?.totalPipelineValue || 0);

  if (loading) return (
    <Card><div className="text-xs text-text-dim animate-pulse py-6 text-center">Načítavam pipeline z GHL...</div></Card>
  );

  if (!ghl || !ghl.stages?.length) return (
    <Card>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold">Pipeline</h3>
        <span className="text-xs text-text-dim">GHL nedostupný</span>
      </div>
      <div className="text-xs text-text-dim text-center py-6">Skontroluj GHL API key a Location ID</div>
    </Card>
  );

  const stageColors: Record<string, string> = {
    active: '#ff7849',
    mid: '#c8ff00',
    late: '#6db6ff',
    terminal: '#888894',
  };

  const totalStages = ghl.stages.length;

  return (
    <div className="space-y-3">
      {/* Pipeline header */}
      <div className="flex justify-between items-center px-1">
        <div>
          <div className="text-xs font-bold text-text-dim uppercase tracking-wider">{ghl.pipelineName}</div>
          <div className="text-[10px] text-text-subtle mt-0.5">
            {ghl.openDeals} open · {ghl.wonDeals} won · {ghl.lostDeals} lost
          </div>
        </div>
        <div className="text-right">
          <Editable value={`$${Number(totalOv.v).toLocaleString()}`} onSave={totalOv.save} overridden={totalOv.ov}
            className="text-base font-bold text-accent"/>
          <div className="text-[10px] text-text-dim">aktívna hodnota</div>
        </div>
      </div>

      {/* Stages — sorted by position */}
      {ghl.stages.map((stage, idx) => {
        const stageData = ghl.byStage[stage.id];
        if (!stageData) return null;

        const pct = idx / Math.max(totalStages - 1, 1);
        const color = stageData.isTerminal ? stageColors.terminal
          : pct < 0.33 ? stageColors.active
          : pct < 0.66 ? stageColors.mid
          : stageColors.late;

        const hasDeals = stageData.deals.length > 0;

        return (
          <Card key={stage.id} className={`p-4 ${!hasDeals ? 'opacity-50' : ''}`}>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }}/>
                <span className="text-sm font-bold">{stage.name}</span>
                <span className="text-xs text-text-dim">{stageData.deals.length}</span>
                {stageData.isTerminal && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-bg-elev text-text-dim uppercase tracking-wider">closed</span>
                )}
              </div>
              {stageData.total > 0 && (
                <span className="text-sm font-bold" style={{ color }}>
                  ${stageData.total.toLocaleString()}
                </span>
              )}
            </div>

            {hasDeals ? (
              <div className="space-y-1.5">
                {stageData.deals.map(deal => (
                  <DealRow key={deal.id} deal={deal} color={color} />
                ))}
              </div>
            ) : (
              <div className="text-xs text-text-subtle py-1 pl-4">Prázdna fáza</div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ─── CALLS TRACKER ───────────────────────────────────────────────────────────
const CALL_METRICS = [
  { key: 'dials', label: 'Dials', color: '#888894', desc: 'Celkový počet vytočení' },
  { key: 'calls', label: 'Calls', color: '#6db6ff', desc: 'Hovor nadviazaný' },
  { key: 'setts', label: 'Setts', color: '#ff7849', desc: 'Dohodnutý ďalší call' },
  { key: 'closing', label: 'Closing Calls', color: '#a78bfa', desc: 'Closing call prebehol' },
  { key: 'closed', label: 'Closed', color: '#4ade80', desc: 'Deal podpísaný' },
];

function CallsSection({ ghl, loading }: { ghl: GhlData | null; loading: boolean }) {
  const today = new Date().toISOString().split('T')[0];
  const storageKey = `calls_${today}`;

  const [metrics, setMetrics] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : { dials: 0, calls: 0, setts: 0, closing: 0, closed: 0 };
    } catch { return { dials: 0, calls: 0, setts: 0, closing: 0, closed: 0 }; }
  });
  const [expanded, setExpanded] = useState(false);

  const update = (key: string, delta: number) => {
    setMetrics(prev => {
      const next = { ...prev, [key]: Math.max(0, (prev[key] || 0) + delta) };
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // Percentages
  const pickupRate = metrics.dials > 0 ? ((metrics.calls / metrics.dials) * 100).toFixed(0) : '—';
  const settRate = metrics.calls > 0 ? ((metrics.setts / metrics.calls) * 100).toFixed(0) : '—';
  const closeRate = metrics.closing > 0 ? ((metrics.closed / metrics.closing) * 100).toFixed(0) : '—';
  const dialToClose = metrics.dials > 0 && metrics.closed > 0 ? (metrics.dials / metrics.closed).toFixed(1) : '—';

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Cally · dnes</h3>
        <div className="flex items-center gap-2">
          {ghl && <span className="text-[10px] text-text-dim">GHL sync</span>}
          <button onClick={() => setExpanded(!expanded)}
            className="text-xs font-bold px-2.5 py-1 rounded-lg bg-bg-elev border border-border text-text-dim hover:border-accent hover:text-accent transition-all">
            {expanded ? '← Zavrieť' : 'Štatistiky →'}
          </button>
        </div>
      </div>

      {/* Main metric counters */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {CALL_METRICS.map(m => (
          <div key={m.key} className="text-center">
            <div className="text-[9px] font-bold uppercase tracking-wider mb-2 leading-tight" style={{ color: m.color }}>
              {m.label.split(' ')[0]}<br/>{m.label.split(' ')[1] || ''}
            </div>
            <div className="text-xl font-bold mb-2" style={{ color: m.color }}>{metrics[m.key] || 0}</div>
            <div className="flex flex-col gap-1">
              <button onClick={() => update(m.key, 1)}
                className="w-full py-1.5 rounded-lg text-xs font-bold text-bg transition-all hover:opacity-90"
                style={{ background: m.color }}>+</button>
              <button onClick={() => update(m.key, -1)}
                className="w-full py-1.5 rounded-lg text-xs font-bold border border-border text-text-dim hover:border-border-strong transition-all bg-bg-elev">−</button>
            </div>
          </div>
        ))}
      </div>

      {/* Expanded stats */}
      {expanded && (
        <div className="border-t border-border pt-4">
          <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-3">Konverzné percentá</div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: 'Pickup rate', value: `${pickupRate}%`, sub: 'Calls / Dials', color: '#6db6ff' },
              { label: 'Sett rate', value: `${settRate}%`, sub: 'Setts / Calls', color: '#ff7849' },
              { label: 'Close rate', value: `${closeRate}%`, sub: 'Closed / Closing', color: '#4ade80' },
              { label: 'Dials to close', value: `${dialToClose}`, sub: 'Dials per deal', color: '#a78bfa' },
            ].map(s => (
              <div key={s.label} className="bg-bg-elev rounded-xl p-3">
                <div className="text-[10px] text-text-dim mb-1">{s.label}</div>
                <div className="text-xl font-bold mb-0.5" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] text-text-dim">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Funnel viz */}
          <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-2">Funnel</div>
          <div className="space-y-1.5">
            {CALL_METRICS.map((m, i) => {
              const base = metrics.dials || 1;
              const val = metrics[m.key] || 0;
              const pct = Math.min((val / base) * 100, 100);
              return (
                <div key={m.key}>
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span style={{ color: m.color }}>{m.label}</span>
                    <span className="text-text-dim font-bold">{val}</span>
                  </div>
                  <div className="h-1.5 bg-bg-card rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: m.color }}/>
                  </div>
                </div>
              );
            })}
          </div>

          {/* GHL appointments */}
          {ghl?.appointments?.length ? (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-2">GHL · posledné eventy</div>
              {ghl.appointments.slice(0, 4).map((a, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-white/[0.04] last:border-b-0 text-xs">
                  <div>
                    <div className="font-semibold">{a.title}</div>
                    <div className="text-text-dim">{a.contact} · {a.startTime ? new Date(a.startTime).toLocaleDateString('sk-SK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-bold ${a.status === 'confirmed' ? 'bg-green2/10 text-green2' : a.status === 'cancelled' ? 'bg-rose/10 text-rose' : 'bg-bg-elev text-text-dim'}`}>
                    {a.status || 'pending'}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </Card>
  );
}

// ─── GOALS ───────────────────────────────────────────────────────────────────
function Goals({ stripe, ghl }: { stripe: StripeData | null; ghl: GhlData | null }) {
  const mrrOv = useOv('goal_mrr', stripe?.mrr || 0);
  const clientsOv = useOv('goal_clients', stripe?.activeCustomers || 0);
  const rateOv = useOv('goal_rate', ghl ? Math.round((ghl.wonDeals / Math.max(ghl.appointments?.length || 1, 1)) * 100) : 0);
  const callsOv = useOv('goal_calls', ghl?.appointments?.length || 0);

  const goals = [
    { label: 'MRR', ov: mrrOv, goal: 30000, prefix: '$', suffix: '', note: `Zostáva $${(30000 - mrrOv.v).toLocaleString()}`, color: '#c8ff00' },
    { label: 'Aktívni klienti', ov: clientsOv, goal: 10, prefix: '', suffix: '', note: `${10 - clientsOv.v} zostáva`, color: '#6db6ff' },
    { label: 'Close rate', ov: rateOv, goal: 40, prefix: '', suffix: '%', note: 'Cieľ 40%', color: '#ff7849' },
    { label: 'Weekly calls', ov: callsOv, goal: 25, prefix: '', suffix: '', note: 'Cieľ 25/týždeň', color: '#4ade80' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {goals.map(g => {
        const pct = Math.min((g.ov.v / g.goal) * 100, 100);
        return (
          <div key={g.label} className="bg-bg-elev border border-border rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-text-dim uppercase tracking-wider">{g.label}</span>
              <span className="text-xs font-bold" style={{ color: g.color }}>{pct.toFixed(0)}%</span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <Editable value={`${g.prefix}${Number(g.ov.v).toLocaleString()}${g.suffix}`} onSave={g.ov.save} overridden={g.ov.ov}
                className="text-2xl font-bold tracking-tight"/>
              <span className="text-sm text-text-dim">/ {g.prefix}{g.goal.toLocaleString()}{g.suffix}</span>
            </div>
            <div className="h-1.5 bg-bg-card rounded-full overflow-hidden my-2">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: g.color }}/>
            </div>
            <div className="text-xs text-text-dim">{g.note}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── DAILY TASKS ─────────────────────────────────────────────────────────────
function DailyTasks() {
  const [tasks, setTasks] = useState([
    { text: 'Outreach · 30 land clearing firiem', tag: 'Growth', done: false },
    { text: '$40 into ads · skontrolovať kampane', tag: 'Ads', done: false },
    { text: 'Napísať 3 nové UGC hooky', tag: 'Content', done: false },
    { text: 'Roleplay session · 2×', tag: 'Sales', done: false },
  ]);
  const [newTask, setNewTask] = useState('');

  const tagColors: Record<string, string> = {
    Growth: '#c8ff00', Ads: '#ff7849', Pipeline: '#6db6ff',
    Content: '#a78bfa', Sales: '#2dd4bf', Task: '#888894',
  };

  const add = () => {
    if (!newTask.trim()) return;
    setTasks(prev => [...prev, { text: newTask.trim(), tag: 'Task', done: false }]);
    setNewTask('');
  };

  const done = tasks.filter(t => t.done).length;

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Úlohy · dnes</h3>
        <span className={`text-xs font-bold px-2 py-1 rounded-md ${done === tasks.length ? 'bg-accent/10 text-accent' : 'bg-bg-elev text-text-dim'}`}>
          {done} / {tasks.length}
        </span>
      </div>
      <div className="space-y-0 mb-4">
        {tasks.map((t, i) => (
          <button key={i} onClick={() => setTasks(prev => { const c = [...prev]; c[i].done = !c[i].done; return c; })}
            className="w-full flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-b-0 text-left">
            <div className={`w-4 h-4 rounded border-[1.5px] flex-shrink-0 relative transition-all ${t.done ? 'bg-accent border-accent' : 'border-border-strong'}`}>
              {t.done && <span className="absolute inset-0 flex items-center justify-center text-bg text-[10px] font-extrabold">✓</span>}
            </div>
            <span className={`flex-1 text-sm font-medium ${t.done ? 'line-through text-text-subtle' : ''}`}>{t.text}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ color: tagColors[t.tag] || '#888', background: `${tagColors[t.tag] || '#888'}18` }}>
              {t.tag}
            </span>
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={newTask} onChange={e => setNewTask(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Nová úloha..."
          className="flex-1 bg-bg-elev border border-border rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:border-accent text-text placeholder:text-text-dim font-[inherit]"/>
        <button onClick={add} className="bg-accent text-bg px-4 py-2.5 rounded-xl text-sm font-bold">+</button>
      </div>
    </Card>
  );
}

// ─── SCRIPTS TRACKER ─────────────────────────────────────────────────────────
function ScriptsTracker() {
  const scripts = [
    { name: 'Land Clearing · Hook A', status: 'Live', ctr: '2.4%', color: '#c8ff00' },
    { name: 'Land Clearing · Hook B', status: 'Testing', ctr: '1.8%', color: '#ff7849' },
    { name: 'Tree Service · Hook A', status: 'Draft', ctr: '—', color: '#888894' },
  ];
  return (
    <Card>
      <h3 className="text-lg font-bold mb-4">Scripty · tracker</h3>
      <div className="space-y-0">
        {scripts.map((s, i) => (
          <div key={i} className="flex justify-between items-center py-3 border-b border-white/[0.04] last:border-b-0">
            <div className="text-sm font-semibold">{s.name}</div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-text-dim">{s.ctr}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ color: s.color, background: `${s.color}18` }}>{s.status}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function BusinessPage() {
  const [ghl, setGhl] = useState<GhlData | null>(null);
  const [stripe, setStripe] = useState<StripeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/ghl').then(r => r.json()).catch(() => null),
      fetch('/api/stripe').then(r => r.json()).catch(() => null),
    ]).then(([g, s]) => {
      if (g && !g.error) setGhl(g);
      if (s && !s.error) setStripe(s);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <TopBar />
      <main className="px-4 md:px-6 py-5 max-w-[1400px] mx-auto pb-24 lg:pb-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-[-0.03em]">Biznis</h1>
            <p className="text-xs text-text-dim mt-1">
              {loading ? 'Načítavam...' : `${ghl ? '✓ GHL' : '⚠ GHL'} · ${stripe ? '✓ Stripe' : '⚠ Stripe'}`}
              <span className="ml-2 text-text-subtle">· Klikni na číslo pre manuálnu úpravu</span>
            </p>
          </div>
        </div>

        <SectionHeader title="Cally · dnes" meta="Dials → Closed"/>
        <CallsSection ghl={ghl} loading={loading}/>

        <SectionHeader title="Ciele" meta="Klikni na číslo → úprava"/>
        <Goals stripe={stripe} ghl={ghl}/>

        <SectionHeader title="Úlohy · dnes"/>
        <DailyTasks/>

        <SectionHeader title="Pipeline · Land Clearing" meta={ghl ? `${ghl.openDeals} open · $${ghl.totalPipelineValue.toLocaleString()}` : 'načítavam...'}/>
        <PipelineSection ghl={ghl} loading={loading}/>

      </main>
      <MobileNav />
    </>
  );
}
