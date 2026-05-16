'use client';

import TopBar from '@/components/TopBar';
import MobileNav from '@/components/MobileNav';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { getDailyCalls, updateDailyCalls, getCallsHistory, setOverride, clearOverride } from '@/lib/supabase';
import { fmtMoney } from '@/lib/format';

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
    <span onClick={start} title="Click to edit" className={`cursor-pointer relative group ${className}`}>
      {overridden && <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-warm rounded-full"/>}
      {prefix}{value}{suffix}
      <span className="absolute -top-6 left-0 hidden group-hover:block text-[9px] bg-bg-elev border border-border px-2 py-0.5 rounded text-text-dim whitespace-nowrap z-20">✏ click to edit</span>
    </span>
  );
}

function useOv(key: string, real: number) {
  const [v, setV] = useState(real);
  const [ov, setOv] = useState(false);

  useEffect(() => {
    supabase.from('overrides').select('value').eq('key', `biz_${key}`).single()
      .then(({ data }) => {
        if (data?.value) { setV(JSON.parse(data.value)); setOv(true); }
        else setV(real);
      });
  }, [key]); // eslint-disable-line

  const save = async (str: string) => {
    const n = parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
    setV(n); setOv(true);
    await setOverride(`biz_${key}`, JSON.stringify(n));
  };

  const clear = async () => {
    setV(real); setOv(false);
    await clearOverride(`biz_${key}`);
  };

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
    <Card><div className="text-xs text-text-dim animate-pulse py-6 text-center">Loading pipeline from GHL...</div></Card>
  );

  if (!ghl || !ghl.stages?.length) return (
    <Card>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold">Pipeline</h3>
        <span className="text-xs text-text-dim">GHL unavailable</span>
      </div>
      <div className="text-xs text-text-dim text-center py-6">Check GHL API key and Location ID</div>
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
          <div className="text-[10px] text-text-dim">active value</div>
        </div>
      </div>

      {/* Stages — sorted by position, skip DQ */}
      {ghl.stages.filter(s => !s.name.toLowerCase().includes('dq')).map((stage, idx) => {
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
              <div className="text-xs text-text-subtle py-1 pl-4">Empty stage</div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ─── CALLS TRACKER ───────────────────────────────────────────────────────────
const CALL_METRICS = [
  { key: 'dials', label: 'Dials', color: '#888894' },
  { key: 'calls', label: 'Calls', color: '#6db6ff' },
  { key: 'setts', label: 'Setts', color: '#ff7849' },
  { key: 'closing', label: 'Closing', color: '#a78bfa' },
  { key: 'closed', label: 'Closed', color: '#4ade80' },
];

function CallsSection({ ghl, loading }: { ghl: GhlData | null; loading: boolean }) {
  const [metrics, setMetrics] = useState({ dials: 0, calls: 0, setts: 0, closing: 0, closed: 0 });
  const [history, setHistory] = useState<({ date: string; dials: number; calls: number; setts: number; closing: number; closed: number })[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load today + history
    Promise.all([
      getDailyCalls(),
      getCallsHistory(14),
    ]).then(([todayData, hist]) => {
      setMetrics(todayData);
      setHistory(hist);
    });
  }, []);

  const update = async (key: string, delta: number) => {
    const newMetrics = { ...metrics, [key]: Math.max(0, (metrics[key as keyof typeof metrics] || 0) + delta) };
    setMetrics(newMetrics);
    setSaving(true);
    await updateDailyCalls(newMetrics);
    setSaving(false);
    // Refresh history
    getCallsHistory(14).then(setHistory);
  };

  // Percentages
  const pickupRate = metrics.dials > 0 ? ((metrics.calls / metrics.dials) * 100).toFixed(0) : '—';
  const settRate = metrics.calls > 0 ? ((metrics.setts / metrics.calls) * 100).toFixed(0) : '—';
  const closeRate = metrics.closing > 0 ? ((metrics.closed / metrics.closing) * 100).toFixed(0) : '—';
  const dialToClose = metrics.dials > 0 && metrics.closed > 0 ? (metrics.dials / metrics.closed).toFixed(1) : '—';

  // History totals
  const histTotals = history.reduce((acc, d) => ({
    dials: acc.dials + d.dials,
    calls: acc.calls + d.calls,
    setts: acc.setts + d.setts,
    closing: acc.closing + d.closing,
    closed: acc.closed + d.closed,
  }), { dials: 0, calls: 0, setts: 0, closing: 0, closed: 0 });

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold">Cally · today</h3>
          {saving && <span className="text-[10px] text-text-dim">Saving...</span>}
        </div>
        <button onClick={() => setExpanded(!expanded)}
          className="text-xs font-bold px-2.5 py-1 rounded-lg bg-bg-elev border border-border text-text-dim hover:border-accent hover:text-accent transition-all">
          {expanded ? '← Close' : 'Stats →'}
        </button>
      </div>

      {/* Main counters */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {CALL_METRICS.map(m => (
          <div key={m.key} className="text-center">
            <div className="text-[9px] font-bold uppercase tracking-wider mb-2 leading-tight" style={{ color: m.color }}>
              {m.label}
            </div>
            <div className="text-2xl font-bold mb-2" style={{ color: m.color }}>
              {metrics[m.key as keyof typeof metrics] || 0}
            </div>
            <div className="flex flex-col gap-1">
              <button onClick={() => update(m.key, 1)}
                className="w-full py-1.5 rounded-lg text-xs font-bold text-bg transition-all hover:opacity-90"
                style={{ background: m.color }}>+</button>
              <button onClick={() => update(m.key, -1)}
                className="w-full py-1.5 rounded-lg text-xs font-bold border border-border text-text-dim bg-bg-elev">−</button>
            </div>
          </div>
        ))}
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-border pt-4 space-y-5">

          {/* Today percentages */}
          <div>
            <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-3">Conversions · today</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Pickup rate', value: `${pickupRate}%`, sub: 'Calls / Dials', color: '#6db6ff' },
                { label: 'Sett rate', value: `${settRate}%`, sub: 'Setts / Calls', color: '#ff7849' },
                { label: 'Close rate', value: `${closeRate}%`, sub: 'Closed / Closing', color: '#4ade80' },
                { label: 'Dials / deal', value: dialToClose, sub: 'Efficiency', color: '#a78bfa' },
              ].map(s => (
                <div key={s.label} className="bg-bg-elev rounded-xl p-3">
                  <div className="text-[10px] text-text-dim mb-1">{s.label}</div>
                  <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[10px] text-text-dim">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Funnel */}
          <div>
            <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-2">Funnel · today</div>
            <div className="space-y-1.5">
              {CALL_METRICS.map(m => {
                const val = metrics[m.key as keyof typeof metrics] || 0;
                const pct = metrics.dials > 0 ? Math.min((val / metrics.dials) * 100, 100) : 0;
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
          </div>

          {/* 14-day history totals */}
          {history.length > 1 && (
            <div>
              <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-3">Last 14 days · total</div>
              <div className="grid grid-cols-5 gap-2 mb-3">
                {CALL_METRICS.map(m => (
                  <div key={m.key} className="text-center bg-bg-elev rounded-xl p-2">
                    <div className="text-[9px] text-text-dim mb-1">{m.label}</div>
                    <div className="text-base font-bold" style={{ color: m.color }}>
                      {histTotals[m.key as keyof typeof histTotals]}
                    </div>
                  </div>
                ))}
              </div>
              {/* History rows */}
              <div className="space-y-0 max-h-48 overflow-y-auto">
                {[...history].reverse().map((d, i) => (
                  <div key={i} className="grid grid-cols-[80px_repeat(5,1fr)] gap-2 py-2 border-b border-white/[0.04] last:border-b-0 text-xs items-center">
                    <span className="text-text-dim">{new Date(d.date).toLocaleDateString('sk-SK', { day: 'numeric', month: 'short' })}</span>
                    {CALL_METRICS.map(m => (
                      <span key={m.key} className="text-center font-bold" style={{ color: (d[m.key as keyof typeof d] as number) > 0 ? m.color : '#555566' }}>
                        {d[m.key as keyof typeof d] as number}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GHL appointments */}
          {ghl?.appointments?.length ? (
            <div>
              <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-2">GHL · recent events</div>
              {ghl.appointments.slice(0, 4).map((a, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-white/[0.04] last:border-b-0 text-xs">
                  <div>
                    <div className="font-semibold">{a.title}</div>
                    <div className="text-text-dim">{a.contact}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${a.status === 'confirmed' ? 'bg-green2/10 text-green2' : 'bg-bg-elev text-text-dim'}`}>
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
    { label: 'MRR', ov: mrrOv, goal: 30000, prefix: '$', suffix: '', note: `Remaining $${(30000 - mrrOv.v).toLocaleString()}`, color: '#c8ff00' },
    { label: 'Active clients', ov: clientsOv, goal: 10, prefix: '', suffix: '', note: `${10 - clientsOv.v} remaining`, color: '#6db6ff' },
    { label: 'Close rate', ov: rateOv, goal: 40, prefix: '', suffix: '%', note: 'Goal 40%', color: '#ff7849' },
    { label: 'Weekly calls', ov: callsOv, goal: 25, prefix: '', suffix: '', note: 'Goal 25/week', color: '#4ade80' },
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
type Task = { id: string; text: string; tag: string; done: boolean; source: 'biznis' | 'osobne' };

const TAG_COLORS: Record<string, string> = {
  Growth: '#c8ff00', Ads: '#ff7849', Pipeline: '#6db6ff',
  Content: '#a78bfa', Sales: '#2dd4bf', Task: '#888894', Personal: '#4ade80',
};

async function loadTasks(date: string): Promise<Task[]> {
  const { data } = await supabase.from('daily_tasks').select('*').eq('date', date).order('created_at');
  return (data || []) as Task[];
}

function DailyTasks({ source }: { source: 'biznis' | 'osobne' }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newTag, setNewTag] = useState('Task');
  const [loading, setLoading] = useState(true);
  const date = new Date().toISOString().split('T')[0];

  useEffect(() => {
    supabase.from('daily_tasks').select('*').eq('date', date).eq('source', source).order('created_at')
      .then(({ data }) => { setTasks((data || []) as Task[]); setLoading(false); });
  }, [date, source]);

  const tags = source === 'biznis'
    ? ['Task', 'Growth', 'Ads', 'Pipeline', 'Content', 'Sales']
    : ['Task', 'Personal'];

  const add = async () => {
    if (!newTask.trim()) return;
    const { data } = await supabase.from('daily_tasks')
      .insert({ date, text: newTask.trim(), tag: newTag, done: false, source })
      .select().single();
    if (data) setTasks(prev => [...prev, data as Task]);
    setNewTask('');
  };

  const toggle = async (task: Task) => {
    await supabase.from('daily_tasks').update({ done: !task.done }).eq('id', task.id);
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: !t.done } : t));
  };

  const remove = async (id: string) => {
    await supabase.from('daily_tasks').delete().eq('id', id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const done = tasks.filter(t => t.done).length;

  if (loading) return <Card><div className="text-xs text-text-dim animate-pulse py-4 text-center">Loading...</div></Card>;

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Tasks · today</h3>
        <span className={`text-xs font-bold px-2 py-1 rounded-md ${done === tasks.length && tasks.length > 0 ? 'bg-accent/10 text-accent' : 'bg-bg-elev text-text-dim'}`}>
          {done} / {tasks.length}
        </span>
      </div>
      <div className="space-y-0 mb-4">
        {tasks.length === 0 && <div className="text-xs text-text-dim text-center py-4">No tasks — add your first</div>}
        {tasks.map(t => (
          <div key={t.id} className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-b-0 group">
            <button onClick={() => toggle(t)}
              className={`w-4 h-4 rounded border-[1.5px] flex-shrink-0 relative transition-all ${t.done ? 'bg-accent border-accent' : 'border-border-strong'}`}>
              {t.done && <span className="absolute inset-0 flex items-center justify-center text-bg text-[9px] font-extrabold">✓</span>}
            </button>
            <span className={`flex-1 text-sm font-medium ${t.done ? 'line-through text-text-subtle' : ''}`}>{t.text}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
              style={{ color: TAG_COLORS[t.tag] || '#888', background: `${TAG_COLORS[t.tag] || '#888'}18` }}>
              {t.tag}
            </span>
            <button onClick={() => remove(t.id)}
              className="opacity-0 group-hover:opacity-100 text-text-dim hover:text-rose text-xs transition-all flex-shrink-0">✕</button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <select value={newTag} onChange={e => setNewTag(e.target.value)}
          className="bg-bg-elev border border-border rounded-xl px-2 py-2.5 text-xs font-semibold outline-none focus:border-accent text-text font-[inherit]">
          {tags.map(t => <option key={t}>{t}</option>)}
        </select>
        <input value={newTask} onChange={e => setNewTask(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="New task..."
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
            <h1 className="text-3xl font-bold tracking-[-0.03em]">Business</h1>
            <p className="text-xs text-text-dim mt-1">
              {loading ? 'Loading...' : `${ghl ? '✓ GHL' : '⚠ GHL'} · ${stripe ? '✓ Stripe' : '⚠ Stripe'}`}
              <span className="ml-2 text-text-subtle">· Click any number to manually edit</span>
            </p>
          </div>
        </div>

        <SectionHeader title="Cally · today" meta="Dials → Closed"/>
        <CallsSection ghl={ghl} loading={loading}/>

        <SectionHeader title="Goals" meta="Click any number to edit"/>
        <Goals stripe={stripe} ghl={ghl}/>

        <SectionHeader title="Tasks · today"/>
        <DailyTasks source="biznis"/>

        <SectionHeader title="Pipeline · Land Clearing" meta={ghl ? `${ghl.openDeals} open · $${ghl.totalPipelineValue.toLocaleString()}` : 'loading...'}/>
        <PipelineSection ghl={ghl} loading={loading}/>

      </main>
      <MobileNav />
    </>
  );
}
