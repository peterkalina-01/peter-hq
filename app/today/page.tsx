'use client';

import TopBar from '@/components/TopBar';
import MobileNav from '@/components/MobileNav';
import { useState, useEffect, useCallback } from 'react';
import { supabase, getDailyLog, updateDailyLog } from '@/lib/supabase';

// ─── TYPES ───────────────────────────────────────────────────────────────────
type Log = Record<string, unknown>;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="text-[10px] font-bold text-text-dim uppercase tracking-[0.15em] mb-3 px-1">{title}</div>
      <div className="bg-bg-card border border-border rounded-2xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function Row({ children, last = false }: { children: React.ReactNode; last?: boolean }) {
  return (
    <div className={`flex items-center gap-4 px-5 py-4 ${!last ? 'border-b border-border' : ''}`}>
      {children}
    </div>
  );
}

// Simple check button
function CheckButton({ done, onToggle }: { done: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all ${
        done ? 'bg-accent border-accent' : 'border-border-strong hover:border-accent'
      }`}>
      {done && <span className="text-bg text-[11px] font-extrabold">✓</span>}
    </button>
  );
}

// ─── CAFFEINE QUICK ──────────────────────────────────────────────────────────
const DRINKS = [
  { name: 'Espresso', mg: 63, short: 'ESP' },
  { name: 'Cappuccino', mg: 80, short: 'CAP' },
  { name: 'Latte', mg: 75, short: 'LAT' },
  { name: 'Doppio', mg: 126, short: 'DOP' },
];

function CaffeineRow({ last }: { last?: boolean }) {
  const [entries, setEntries] = useState<{ id: string; drink: string; mg: number; time_logged: string }[]>([]);
  const [adding, setAdding] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState(DRINKS[1]);
  const [time, setTime] = useState(() => {
    const n = new Date();
    return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`;
  });

  useEffect(() => {
    const date = new Date().toISOString().split('T')[0];
    supabase.from('caffeine_log').select('*').eq('date', date).order('time_logged')
      .then(({ data }) => { if (data) setEntries(data); });
  }, []);

  const nowH = new Date().getHours() + new Date().getMinutes() / 60;
  const totalMg = entries.reduce((sum, e) => {
    const [hh, mm] = e.time_logged.split(':').map(Number);
    const entryH = hh + mm / 60;
    if (nowH < entryH) return sum;
    return sum + e.mg * Math.pow(0.5, (nowH - entryH) / 5);
  }, 0);

  const add = async () => {
    const date = new Date().toISOString().split('T')[0];
    const { data } = await supabase.from('caffeine_log')
      .insert({ date, drink: selectedDrink.name, mg: selectedDrink.mg, time_logged: time })
      .select().single();
    if (data) {
      setEntries(prev => [...prev, data].sort((a, b) => a.time_logged.localeCompare(b.time_logged)));
    }
    setAdding(false);
  };

  const remove = async (id: string) => {
    await supabase.from('caffeine_log').delete().eq('id', id);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const statusColor = totalMg > 200 ? '#ff5d7a' : totalMg > 100 ? '#ff7849' : totalMg > 10 ? '#c8ff00' : '#555566';

  return (
    <>
      <Row last={!adding && entries.length === 0 && last}>
        <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-base">☕</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold">Kofeín</div>
          <div className="text-xs font-bold mt-0.5" style={{ color: statusColor }}>
            {Math.round(totalMg)}mg aktuálne
            {entries.length > 0 && (
              <span className="text-text-dim font-normal ml-2">
                · {entries.map(e => `${e.drink.slice(0,3)} ${e.time_logged.slice(0,5)}`).join(', ')}
              </span>
            )}
          </div>
        </div>
        <button onClick={() => setAdding(!adding)}
          className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${adding ? 'bg-accent text-bg border-accent' : 'bg-bg-elev border-border text-text-dim hover:border-accent hover:text-accent'}`}>
          {adding ? '✕' : '+ Pridať'}
        </button>
      </Row>

      {adding && (
        <div className={`px-5 pb-4 ${!(entries.length === 0 && last) ? 'border-b border-border' : ''}`}>
          <div className="flex gap-1.5 mb-3">
            {DRINKS.map(d => (
              <button key={d.name} onClick={() => setSelectedDrink(d)}
                className={`flex-1 py-2 rounded-xl text-[11px] font-bold border transition-all ${selectedDrink.name === d.name ? 'bg-accent text-bg border-accent' : 'bg-bg-elev border-border text-text-dim hover:border-border-strong'}`}>
                {d.short}<br/><span className="text-[9px] opacity-70">{d.mg}mg</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              className="flex-1 bg-bg-elev border border-border rounded-xl px-3 py-2 text-sm font-semibold outline-none focus:border-accent text-text font-[inherit]"/>
            <button onClick={add} className="bg-accent text-bg px-5 py-2 rounded-xl text-sm font-bold">+ Pridať</button>
          </div>
        </div>
      )}

      {entries.length > 0 && (
        <div className={`px-5 pb-3 ${last ? '' : 'border-b border-border'}`}>
          <div className="flex flex-wrap gap-1.5">
            {entries.map(e => (
              <div key={e.id} className="flex items-center gap-1 px-2 py-1 bg-bg-elev rounded-lg border border-border text-[10px]">
                <span className="font-medium text-text-dim">{e.drink} {e.time_logged.slice(0,5)}</span>
                <button onClick={() => remove(e.id)} className="text-text-dim hover:text-rose transition-colors ml-0.5">✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ─── WORKOUT QUICK ────────────────────────────────────────────────────────────
const WORKOUT_OPTIONS = [
  { id: 'push', label: 'Push', color: '#ff7849' },
  { id: 'pull', label: 'Pull', color: '#6db6ff' },
  { id: 'legs', label: 'Legs', color: '#c8ff00' },
  { id: 'run', label: 'Beh', color: '#4ade80' },
];

function WorkoutRow({ log, update, last }: { log: Log; update: (u: Log) => void; last?: boolean }) {
  const [selecting, setSelecting] = useState(false);

  const done = !!log.workout_done;
  const type = String(log.workout_type || '');

  const select = async (w: typeof WORKOUT_OPTIONS[0]) => {
    await update({ workout_done: true, workout_type: w.label });
    setSelecting(false);
  };

  const reset = async () => {
    await update({ workout_done: false, workout_type: '' });
  };

  const wColor = WORKOUT_OPTIONS.find(w => w.label === type)?.color || '#ff7849';

  return (
    <>
      <Row last={!selecting && last}>
        <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold transition-all ${done ? 'text-bg' : 'text-text-dim border-2 border-border-strong'}`}
          style={done ? { background: wColor } : {}}>
          {done ? '✓' : '○'}
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold">Workout</div>
          {done && <div className="text-xs font-bold mt-0.5" style={{ color: wColor }}>{type}</div>}
        </div>
        {done ? (
          <button onClick={reset} className="text-[10px] text-text-dim hover:text-rose transition-colors">Reset</button>
        ) : (
          <button onClick={() => setSelecting(!selecting)}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${selecting ? 'bg-accent text-bg border-accent' : 'bg-bg-elev border-border text-text-dim hover:border-accent hover:text-accent'}`}>
            {selecting ? '✕' : '+ Zaznamenať'}
          </button>
        )}
      </Row>

      {selecting && (
        <div className={`px-5 pb-4 ${last ? '' : 'border-b border-border'}`}>
          <div className="grid grid-cols-4 gap-2">
            {WORKOUT_OPTIONS.map(w => (
              <button key={w.id} onClick={() => select(w)}
                className="py-3 rounded-xl border border-border bg-bg-elev text-center hover:border-border-strong transition-all">
                <div className="text-sm font-bold" style={{ color: w.color }}>{w.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ─── WORK TIME QUICK ─────────────────────────────────────────────────────────
function WorkTimeRow({ log, update, last }: { log: Log; update: (u: Log) => void; last?: boolean }) {
  const [adding, setAdding] = useState(false);
  const [hours, setHours] = useState('');
  const [cat, setCat] = useState('Deep work');

  const deep = (log.work_deep_hours as number) || 0;
  const calls = (log.work_calls_hours as number) || 0;
  const admin = (log.work_admin_hours as number) || 0;
  const content = (log.work_content_hours as number) || 0;
  const total = deep + calls + admin + content;

  const cats = [
    { label: 'Deep', key: 'work_deep_hours', color: '#c8ff00' },
    { label: 'Calls', key: 'work_calls_hours', color: '#ff7849' },
    { label: 'Admin', key: 'work_admin_hours', color: '#6db6ff' },
    { label: 'Content', key: 'work_content_hours', color: '#a78bfa' },
  ];

  const add = async () => {
    if (!hours) return;
    const h = parseFloat(hours);
    if (isNaN(h)) return;
    const key = cats.find(c => c.label === cat.split(' ')[0])?.key || 'work_deep_hours';
    const current = (log[key] as number) || 0;
    await update({ [key]: +(current + h).toFixed(1) });
    setHours('');
    setAdding(false);
  };

  return (
    <>
      <Row last={!adding && last}>
        <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-base">💼</div>
        <div className="flex-1">
          <div className="text-sm font-semibold">Work time</div>
          <div className="flex gap-2 mt-0.5 flex-wrap">
            {cats.map(c => {
              const val = (log[c.key] as number) || 0;
              if (val === 0) return null;
              return <span key={c.key} className="text-[10px] font-bold" style={{ color: c.color }}>{c.label} {val}h</span>;
            })}
            {total === 0 && <span className="text-[10px] text-text-dim">0h dnes</span>}
          </div>
        </div>
        <button onClick={() => setAdding(!adding)}
          className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${adding ? 'bg-accent text-bg border-accent' : 'bg-bg-elev border-border text-text-dim hover:border-accent hover:text-accent'}`}>
          {adding ? '✕' : `+ ${total > 0 ? total.toFixed(1)+'h' : 'Pridať'}`}
        </button>
      </Row>

      {adding && (
        <div className={`px-5 pb-4 ${last ? '' : 'border-b border-border'}`}>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {cats.map(c => (
              <button key={c.key} onClick={() => setCat(c.label)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${cat === c.label ? 'text-bg border-transparent' : 'bg-bg-elev border-border text-text-dim hover:border-border-strong'}`}
                style={cat === c.label ? { background: c.color, borderColor: c.color } : {}}>
                {c.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="number" step="0.5" placeholder="1.5h" value={hours}
              onChange={e => setHours(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && add()}
              className="flex-1 bg-bg-elev border border-border rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-accent text-text font-[inherit]"/>
            <button onClick={add} className="bg-accent text-bg px-5 py-2.5 rounded-xl text-sm font-bold">+ Pridať</button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── SIMPLE COUNTER ROW ───────────────────────────────────────────────────────
function fmtMin(mins: number): string {
  const m = Math.round(mins);
  if (m === 0) return '0min';
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem === 0 ? `${h}h` : `${h}h ${rem}min`;
}

function CounterRow({ icon, label, logKey, unit, step, max, log, update, last, color = '#c8ff00', screenMode = false }: {
  icon: string; label: string; logKey: string; unit: string; step: number; max: number;
  log: Log; update: (u: Log) => void; last?: boolean; color?: string; screenMode?: boolean;
}) {
  const raw = (log[logKey] as number) || 0;
  // screenMode: raw stored as hours, display as minutes
  const valMins = screenMode ? Math.round(raw * 60) : raw;
  const pct = Math.min((valMins / max) * 100, 100);
  const displayVal = screenMode ? fmtMin(valMins) : (unit === 'min' && raw >= 60 ? fmtMin(raw) : `${raw}${unit}`);

  const increment = async () => {
    if (screenMode) {
      await update({ [logKey]: +((valMins + step) / 60).toFixed(4) });
    } else {
      await update({ [logKey]: +(raw + step).toFixed(1) });
    }
  };
  const decrement = async () => {
    if (screenMode) {
      const newMins = Math.max(0, valMins - step);
      await update({ [logKey]: +(newMins / 60).toFixed(4) });
    } else {
      if (raw <= 0) return;
      await update({ [logKey]: Math.max(0, +(raw - step).toFixed(1)) });
    }
  };

  return (
    <Row last={last}>
      <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-base">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">{label}</div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1 bg-bg-elev rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }}/>
          </div>
          <span className="text-xs font-bold text-text-dim flex-shrink-0">{displayVal}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={decrement} className="w-8 h-8 bg-bg-elev rounded-xl text-sm font-bold border border-border hover:border-border-strong transition-all">−</button>
        <button onClick={increment} className="w-8 h-8 rounded-xl text-sm font-bold text-bg transition-all" style={{ background: color }}>+</button>
      </div>
    </Row>
  );
}

// ─── CHECK ROW ────────────────────────────────────────────────────────────────
function CheckRow({ icon, label, logKey, sub, log, update, last }: {
  icon: string; label: string; logKey: string; sub?: string;
  log: Log; update: (u: Log) => void; last?: boolean;
}) {
  const done = !!log[logKey];
  return (
    <Row last={last}>
      <CheckButton done={done} onToggle={() => update({ [logKey]: !done })}/>
      <div className="flex-1">
        <div className={`text-sm font-semibold transition-all ${done ? 'line-through text-text-subtle' : ''}`}>{label}</div>
        {sub && <div className="text-xs text-text-dim mt-0.5">{sub}</div>}
      </div>
      {done && <span className="text-[10px] text-accent font-bold">✓</span>}
    </Row>
  );
}

// ─── PROGRESS RING (small) ────────────────────────────────────────────────────
function MiniRing({ pct, color, size = 28 }: { pct: number; color: string; size?: number }) {
  const stroke = 3;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(pct, 100) / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#242430" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"/>
    </svg>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function TodayPage() {
  const [log, setLog] = useState<Log>({});
  const [loading, setLoading] = useState(true);

  const loadLog = useCallback(async () => {
    const data = await getDailyLog();
    if (data) setLog(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadLog(); }, [loadLog]);

  const update = async (updates: Log) => {
    setLog(prev => ({ ...prev, ...updates }));
    await updateDailyLog(updates);
  };

  const visionKeys = ['vision_step_1', 'vision_step_2', 'vision_step_3'];
  const visionTexts = ['$40 into ads', '5× Remind myself my Vision', 'Study mindset 45min'];
  const visionDone = visionKeys.filter(k => log[k]).length;
  const visionPct = (visionDone / 3) * 100;

  const workTotal = ((log.work_deep_hours as number) || 0) + ((log.work_calls_hours as number) || 0) + ((log.work_admin_hours as number) || 0) + ((log.work_content_hours as number) || 0);

  const today = new Date().toLocaleDateString('sk-SK', { weekday: 'long', day: 'numeric', month: 'long' });

  if (loading) return (
    <>
      <TopBar />
      <main className="flex items-center justify-center h-[60vh]">
        <div className="text-text-dim text-sm animate-pulse">Načítavam...</div>
      </main>
      <MobileNav />
    </>
  );

  return (
    <>
      <TopBar />
      <main className="px-3 sm:px-4 md:px-6 py-5 max-w-2xl mx-auto pb-28 lg:pb-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-[11px] font-bold text-accent uppercase tracking-wider mb-1 capitalize">{today}</div>
            <h1 className="text-3xl font-bold tracking-[-0.03em]">Dnes</h1>
          </div>
          {/* Overall progress ring */}
          <div className="relative">
            <MiniRing pct={visionPct} color="#ff7849" size={52}/>
            <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-accent">{visionDone}/3</div>
          </div>
        </div>

        {/* ── VÍZIA ── */}
        <Section title="Vízia · denné kroky">
          {visionKeys.map((key, i) => (
            <CheckRow key={key} icon="" label={visionTexts[i]} logKey={key} log={log} update={update} last={i === 2}/>
          ))}
        </Section>

        {/* ── TELO ── */}
        <Section title="Telo">
          <CheckRow icon="🧴" label="Skincare AM" logKey="skincare_am" sub="Moisturizer · Vit C · Hydrating" log={log} update={update}/>
          <CheckRow icon="🧘" label="Meditácia" logKey="meditation_done" sub="Cieľ: 20 min" log={log} update={update}/>
          <WorkoutRow log={log} update={update}/>
          <CaffeineRow last/>
        </Section>

        {/* ── PRÁCA ── */}
        <Section title="Práca">
          <WorkTimeRow log={log} update={update}/>
          <CheckRow icon="🧹" label="Clean up pipeline" logKey="pipeline_cleaned" sub="GHL · Aktualizuj všetky deals" log={log} update={update} last/>
        </Section>

        {/* ── VEČER ── */}
        <Section title="Večer">
          <CounterRow icon="💜" label="Dates" logKey="dates_minutes" unit="min" step={30} max={300} log={log} update={update} color="#a78bfa"/>
          <CounterRow icon="🇬🇧" label="Angličtina" logKey="english_minutes" unit="min" step={15} max={120} log={log} update={update} color="#4ade80"/>
          <CounterRow icon="💻" label="Screen · PC" logKey="screen_pc_hours" unit="min" step={15} max={600} log={log} update={update} color="#6db6ff" screenMode/>
          <CounterRow icon="📱" label="Screen · Phone" logKey="screen_phone_hours" unit="min" step={15} max={240} log={log} update={update} color="#ff5d7a" last screenMode/>
        </Section>

        {/* ── ZHRNUTIE ── */}
        <div className="bg-bg-card border border-border rounded-2xl p-5">
          <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-4">Dnešné zhrnutie</div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Vízia', val: `${visionDone}/3`, pct: visionPct, color: '#ff7849' },
              { label: 'Work', val: `${workTotal.toFixed(1)}h`, pct: (workTotal / 8) * 100, color: '#c8ff00' },
              { label: 'Dates', val: `${((log.dates_minutes as number) || 0)}min`, pct: ((log.dates_minutes as number) || 0) / 3, color: '#a78bfa' },
              { label: 'Angličtina', val: `${(log.english_minutes as number) || 0}min`, pct: ((log.english_minutes as number) || 0) / 1.2, color: '#4ade80' },
            ].map(s => (
              <div key={s.label} className="bg-bg-elev rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <MiniRing pct={s.pct} color={s.color} size={24}/>
                  <span className="text-[10px] text-text-dim font-semibold">{s.label}</span>
                </div>
                <div className="text-base font-bold tracking-tight" style={{ color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>

      </main>
      <MobileNav />
    </>
  );
}
