'use client';

import TopBar from '@/components/TopBar';
import MobileNav from '@/components/MobileNav';
import { useState } from 'react';

type Period = 'Deň' | 'Týždeň' | 'Mesiac';

// ─── RING ────────────────────────────────────────────────────────────────────
function Ring({ pct, color, size = 90, stroke = 8, children }: {
  pct: number; color: string; size?: number; stroke?: number; children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(pct, 100) / 100) * circ;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#242430" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

// ─── LINE CHART ──────────────────────────────────────────────────────────────
function LineChart({ data, color, height = 60, label }: {
  data: number[]; color: string; height?: number; label?: string;
}) {
  if (data.length < 2) return null;
  const W = 300; const H = height;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const toX = (i: number) => (i / (data.length - 1)) * W;
  const toY = (v: number) => H - ((v - min) / range) * H * 0.8 - H * 0.1;
  const pts = data.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`);
  const pathD = `M ${pts.join(' L ')}`;
  const areaD = `M ${pts[0]} L ${pts.join(' L ')} L ${toX(data.length-1)},${H} L 0,${H} Z`;

  return (
    <div>
      {label && <div className="text-[10px] text-text-dim font-semibold uppercase tracking-wider mb-2">{label}</div>}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
        <defs>
          <linearGradient id={`lg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#lg-${color.replace('#','')})`}/>
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        {data.map((v, i) => (
          <circle key={i} cx={toX(i)} cy={toY(v)} r="3" fill={color}/>
        ))}
      </svg>
    </div>
  );
}

// ─── BAR CHART ───────────────────────────────────────────────────────────────
function BarChart({ data, color, labels }: {
  data: number[]; color: string; labels?: string[];
}) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-t-sm transition-all" style={{
            height: `${Math.max((v / max) * 56, 2)}px`,
            background: color,
            opacity: i === data.length - 1 ? 1 : 0.5,
          }}/>
          {labels && <div className="text-[8px] text-text-dim font-medium">{labels[i]}</div>}
        </div>
      ))}
    </div>
  );
}

// ─── DATA ────────────────────────────────────────────────────────────────────
const reportData = {
  'Deň': {
    sleep: { hours: 6.7, score: 78, deep: 1.5, rem: 1.2, trend: [7.2, 6.5, 7.8, 6.2, 7.5, 6.0, 6.7] },
    workout: { done: true, type: 'Push', sessions: 1, weekSessions: 4 },
    caffeine: { total: 143, entries: 2, cutoffOk: true, trend: [240, 180, 200, 143, 0, 0, 0] },
    workTime: { total: 3.5, deep: 2.0, calls: 1.5, goal: 8, trend: [4.5, 6.2, 5.8, 7.1, 4.2, 0, 3.5] },
    meditation: { done: true, minutes: 20, streak: 14 },
    vision: { done: 3, total: 4 },
    weight: { current: 73.8, change: -0.4, trend: [74.5, 74.2, 74.0, 73.8] },
    dates: { minutes: 90, hours: 1.5 },
    screen: { pc: 4.0, phone: 1.4 },
    mrr: 1000,
    calls: { total: 3, closed: 1, closeRate: 28 },
  },
  'Týždeň': {
    sleep: { hours: 7.1, score: 81, deep: 1.6, rem: 1.3, trend: [7.2, 6.5, 7.8, 6.2, 7.5, 6.0, 6.7] },
    workout: { done: true, type: '4/7 dní', sessions: 4, weekSessions: 4 },
    caffeine: { total: 1240, entries: 14, cutoffOk: true, trend: [240, 180, 200, 290, 180, 0, 150] },
    workTime: { total: 31.3, deep: 18.5, calls: 8.2, goal: 56, trend: [4.5, 6.2, 5.8, 7.1, 4.2, 3.5, 4.0] },
    meditation: { done: true, minutes: 140, streak: 14 },
    vision: { done: 22, total: 28 },
    weight: { current: 73.8, change: -0.7, trend: [74.5, 74.2, 74.0, 73.8] },
    dates: { minutes: 270, hours: 4.5 },
    screen: { pc: 28, phone: 9.8 },
    mrr: 1000,
    calls: { total: 14, closed: 4, closeRate: 28 },
  },
  'Mesiac': {
    sleep: { hours: 7.0, score: 79, deep: 1.5, rem: 1.25, trend: [7.1, 6.8, 7.3, 7.0, 6.5, 7.4, 6.9] },
    workout: { done: true, type: '16/30 dní', sessions: 16, weekSessions: 16 },
    caffeine: { total: 4800, entries: 58, cutoffOk: false, trend: [200, 220, 180, 250, 190, 170, 210] },
    workTime: { total: 124, deep: 72, calls: 32, goal: 240, trend: [4.2, 3.8, 5.1, 4.6, 3.9, 4.8, 4.3] },
    meditation: { done: true, minutes: 560, streak: 14 },
    vision: { done: 88, total: 120 },
    weight: { current: 73.8, change: -1.2, trend: [75.0, 74.5, 74.0, 73.8] },
    dates: { minutes: 1080, hours: 18 },
    screen: { pc: 112, phone: 39 },
    mrr: 1000,
    calls: { total: 52, closed: 14, closeRate: 27 },
  },
};

// ─── METRIC CARD ─────────────────────────────────────────────────────────────
function MetricCard({ title, children, className = '' }: {
  title: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`bg-bg-card border border-border rounded-2xl p-5 ${className}`}>
      <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-4">{title}</div>
      {children}
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function ReportPage() {
  const [period, setPeriod] = useState<Period>('Týždeň');
  const d = reportData[period];

  const sleepPct = Math.min((d.sleep.hours / 9) * 100, 100);
  const visionPct = (d.vision.done / d.vision.total) * 100;
  const workPct = (d.workTime.total / d.workTime.goal) * 100;
  const meditationPct = period === 'Deň' ? (d.meditation.minutes / 20) * 100 : period === 'Týždeň' ? (d.meditation.minutes / 140) * 100 : (d.meditation.minutes / 600) * 100;

  return (
    <>
      <TopBar />
      <main className="px-4 md:px-6 py-5 max-w-[1400px] mx-auto pb-24 lg:pb-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-[-0.03em]">Report</h1>
            <p className="text-sm text-text-dim font-medium mt-1">Vyhodnotenie tvojich aktivít</p>
          </div>
          <div className="flex gap-1 bg-bg-elev border border-border rounded-xl p-1">
            {(['Deň', 'Týždeň', 'Mesiac'] as Period[]).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${period === p ? 'bg-accent text-bg' : 'text-text-dim hover:text-text'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* ── TOP RINGS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <MetricCard title="Spánok">
            <div className="flex items-center gap-4">
              <Ring pct={sleepPct} color="#6db6ff" size={80} stroke={7}>
                <span className="text-sm font-bold text-cool">{d.sleep.score}</span>
              </Ring>
              <div>
                <div className="text-lg font-bold">{d.sleep.hours}h</div>
                <div className="text-[10px] text-text-dim">Deep: {d.sleep.deep}h</div>
                <div className="text-[10px] text-text-dim">REM: {d.sleep.rem}h</div>
              </div>
            </div>
            <div className="mt-3">
              <LineChart data={d.sleep.trend} color="#6db6ff" height={40}/>
            </div>
          </MetricCard>

          <MetricCard title="Kroky k vízii">
            <div className="flex items-center gap-4">
              <Ring pct={visionPct} color="#ff7849" size={80} stroke={7}>
                <div className="text-center">
                  <div className="text-sm font-bold text-accent">{Math.round(visionPct)}%</div>
                </div>
              </Ring>
              <div>
                <div className="text-lg font-bold">{d.vision.done}/{d.vision.total}</div>
                <div className="text-[10px] text-text-dim">splnené</div>
                <div className="text-[10px] mt-1" style={{ color: visionPct >= 75 ? '#c8ff00' : '#ff7849' }}>
                  {visionPct >= 75 ? '✓ Dobrý výkon' : '↑ Zlepšiť'}
                </div>
              </div>
            </div>
          </MetricCard>

          <MetricCard title="Work time">
            <div className="flex items-center gap-4">
              <Ring pct={workPct} color="#c8ff00" size={80} stroke={7}>
                <div className="text-center">
                  <div className="text-sm font-bold" style={{ color: '#c8ff00' }}>{Math.round(workPct)}%</div>
                </div>
              </Ring>
              <div>
                <div className="text-lg font-bold">{d.workTime.total}h</div>
                <div className="text-[10px] text-text-dim">Deep: {d.workTime.deep}h</div>
                <div className="text-[10px] text-text-dim">Calls: {d.workTime.calls}h</div>
              </div>
            </div>
            <div className="mt-3">
              <LineChart data={d.workTime.trend} color="#c8ff00" height={40}/>
            </div>
          </MetricCard>

          <MetricCard title="Meditácia">
            <div className="flex items-center gap-4">
              <Ring pct={Math.min(meditationPct, 100)} color="#2dd4bf" size={80} stroke={7}>
                <div className="text-center">
                  <div className="text-sm font-bold text-teal">{d.meditation.minutes}m</div>
                </div>
              </Ring>
              <div>
                <div className="text-lg font-bold">{d.meditation.streak}</div>
                <div className="text-[10px] text-text-dim">day streak</div>
                <div className="text-[10px] text-teal font-semibold mt-1">🔥 Idúci</div>
              </div>
            </div>
          </MetricCard>
        </div>

        {/* ── SECOND ROW ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">

          {/* Kofeín */}
          <MetricCard title="Kofeín">
            <div className="flex justify-between items-center mb-3">
              <div>
                <div className="text-2xl font-bold tracking-tight">{period === 'Deň' ? d.caffeine.total : d.caffeine.total}mg</div>
                <div className="text-xs text-text-dim">{d.caffeine.entries} nápojov · {period}</div>
              </div>
              <div className={`px-2 py-1 rounded-lg text-xs font-bold ${d.caffeine.cutoffOk ? 'bg-lime/10 text-lime' : 'bg-rose/10 text-rose'}`}
                style={{ color: d.caffeine.cutoffOk ? '#c8ff00' : '#ff5d7a' }}>
                {d.caffeine.cutoffOk ? 'Cutoff OK' : 'Po cutoff!'}
              </div>
            </div>
            <BarChart
              data={d.caffeine.trend}
              color="#ff7849"
              labels={['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne']}
            />
          </MetricCard>

          {/* Workout */}
          <MetricCard title="Workout">
            <div className="flex items-center gap-4 mb-4">
              <Ring pct={(d.workout.sessions / (period === 'Deň' ? 1 : period === 'Týždeň' ? 5 : 20)) * 100}
                color="#ff7849" size={72} stroke={6}>
                <span className="text-sm font-bold text-accent">{d.workout.sessions}</span>
              </Ring>
              <div>
                <div className="text-base font-bold">{d.workout.type}</div>
                <div className="text-xs text-text-dim">{period === 'Deň' ? 'Dnes' : period === 'Týždeň' ? 'Tento týždeň' : 'Tento mesiac'}</div>
                <div className="text-[10px] mt-1" style={{ color: '#c8ff00' }}>
                  {d.workout.sessions >= (period === 'Deň' ? 1 : period === 'Týždeň' ? 4 : 16) ? '✓ Cieľ splnený' : '↑ Pokračuj'}
                </div>
              </div>
            </div>
            <BarChart
              data={[1, 0, 1, 1, 0, 1, 0].slice(0, period === 'Deň' ? 1 : 7).map(v => v * 100)}
              color="#ff7849"
              labels={['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'].slice(0, period === 'Deň' ? 1 : 7)}
            />
          </MetricCard>

          {/* Váha */}
          <MetricCard title="Váha">
            <div className="flex justify-between items-center mb-3">
              <div>
                <div className="text-2xl font-bold">{d.weight.current} kg</div>
                <div className="text-xs" style={{ color: d.weight.change <= 0 ? '#c8ff00' : '#ff5d7a' }}>
                  {d.weight.change <= 0 ? '↓' : '↑'} {Math.abs(d.weight.change)} kg · {period}
                </div>
              </div>
              <div className="text-xs text-text-dim">Trend</div>
            </div>
            <LineChart data={d.weight.trend} color="#c8ff00" height={50}/>
          </MetricCard>

          {/* Biznis */}
          <MetricCard title="Biznis" className="md:col-span-2 lg:col-span-1">
            <div className="grid grid-cols-2 gap-3 mb-3">
              {[
                { label: 'MRR', value: `$${d.mrr.toLocaleString()}`, color: '#ff7849' },
                { label: 'Close rate', value: `${d.calls.closeRate}%`, color: '#c8ff00' },
                { label: 'Cally', value: d.calls.total.toString(), color: '#6db6ff' },
                { label: 'Closed', value: d.calls.closed.toString(), color: '#c8ff00' },
              ].map(k => (
                <div key={k.label} className="bg-bg-elev rounded-xl p-3">
                  <div className="text-[10px] text-text-dim font-semibold mb-1">{k.label}</div>
                  <div className="text-base font-bold" style={{ color: k.color }}>{k.value}</div>
                </div>
              ))}
            </div>
          </MetricCard>

          {/* Screen time */}
          <MetricCard title="Screen time">
            <div className="space-y-3">
              {[
                { label: 'PC', value: d.screen.pc, max: period === 'Deň' ? 10 : period === 'Týždeň' ? 70 : 300, color: '#6db6ff', unit: 'h' },
                { label: 'Phone', value: d.screen.phone, max: period === 'Deň' ? 4 : period === 'Týždeň' ? 28 : 120, color: '#ff5d7a', unit: 'h' },
              ].map(s => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-text-dim font-medium">{s.label}</span>
                    <span className="font-bold">{s.value}h</span>
                  </div>
                  <div className="h-2 bg-bg-elev rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${Math.min((s.value / s.max) * 100, 100)}%`,
                      background: s.color,
                    }}/>
                  </div>
                </div>
              ))}
            </div>
          </MetricCard>

          {/* Dates */}
          <MetricCard title="Dates">
            <div className="flex items-center gap-4">
              <Ring pct={Math.min((d.dates.hours / (period === 'Deň' ? 3 : period === 'Týždeň' ? 10 : 40)) * 100, 100)}
                color="#a78bfa" size={72} stroke={6}>
                <span className="text-sm font-bold text-violet">{d.dates.hours}h</span>
              </Ring>
              <div>
                <div className="text-lg font-bold">{d.dates.hours} hodín</div>
                <div className="text-xs text-text-dim">{period}</div>
                <div className="text-[10px] text-violet font-semibold mt-1">
                  {d.dates.hours >= (period === 'Deň' ? 1 : period === 'Týždeň' ? 5 : 20) ? '✓ Dobrý čas' : '↑ Viac času'}
                </div>
              </div>
            </div>
          </MetricCard>
        </div>

        {/* ── AI SUMMARY ── */}
        <div className="bg-bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-bold text-sm text-bg">AI</div>
            <div>
              <div className="text-sm font-bold">AI Zhrnutie · {period}</div>
              <div className="text-xs text-text-dim">Automatická analýza tvojich dát</div>
            </div>
          </div>
          <div className="space-y-3">
            {period === 'Deň' && (
              <>
                <SummaryRow type="good" text="Spal si 6h 42min s dobrým recovery skóre 78 — telo je pripravené na výkon." />
                <SummaryRow type="good" text="Kofeín pod cutoff — spánok dnes bude čistý." />
                <SummaryRow type="warn" text="3/4 krokov k vízii splnené — chýba meditácia. Daj jej 20 minút pred spaním." />
                <SummaryRow type="warn" text="Work time 3.5h z 8h — zostáva 4.5h. Záver dňa je tvoj najproduktívnejší čas." />
              </>
            )}
            {period === 'Týždeň' && (
              <>
                <SummaryRow type="good" text="22/28 krokov k vízii splnené (78%) — konzistentný týždeň, pokračuj." />
                <SummaryRow type="good" text="4 workouty za týždeň — presne podľa cieľa. Streak funguje." />
                <SummaryRow type="warn" text="Work time 31.3h / 56h cieľ — 56%. Viac deep work blokov ráno pred callmi." />
                <SummaryRow type="bad" text="Spánok pod 7h v 3 dňoch. Skús ísť spať o 30 minút skôr, pomôže to aj výkonu na calloch." />
              </>
            )}
            {period === 'Mesiac' && (
              <>
                <SummaryRow type="good" text="Váha −1.2kg za mesiac — progres bez extrémov, zdravé tempo." />
                <SummaryRow type="good" text="16 workoutov — dobrá konzistencia. Cieľ na budúci mesiac: 20." />
                <SummaryRow type="warn" text="Close rate 27% — priemer, ale dá sa zvýšiť. Viac roleplay sessions pred callmi." />
                <SummaryRow type="bad" text="Kofeín po cutoff v niektorých dňoch — priamo ovplyvňuje kvalitu spánku a recovery." />
              </>
            )}
          </div>
        </div>

      </main>
      <MobileNav />
    </>
  );
}

function SummaryRow({ type, text }: { type: 'good' | 'warn' | 'bad'; text: string }) {
  const config = {
    good: { icon: '✓', color: '#c8ff00', bg: 'rgba(200,255,0,0.06)', border: 'rgba(200,255,0,0.15)' },
    warn: { icon: '↑', color: '#ff7849', bg: 'rgba(255,120,73,0.06)', border: 'rgba(255,120,73,0.15)' },
    bad: { icon: '⚠', color: '#ff5d7a', bg: 'rgba(255,93,122,0.06)', border: 'rgba(255,93,122,0.15)' },
  }[type];
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border" style={{ background: config.bg, borderColor: config.border }}>
      <span className="text-xs font-bold mt-0.5 flex-shrink-0" style={{ color: config.color }}>{config.icon}</span>
      <span className="text-sm font-medium text-text/90">{text}</span>
    </div>
  );
}
