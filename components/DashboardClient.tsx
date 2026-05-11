'use client';

import { useState, useEffect } from 'react';
import { getDailyQuote } from '@/lib/quotes';
import Link from 'next/link';

// ─── RING ────────────────────────────────────────────────────────────────────
function Ring({ pct, color, size = 72, stroke = 6, children }: {
  pct: number; color: string; size?: number; stroke?: number; children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(pct, 100) / 100) * circ;
  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#242430" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

// ─── VISION MODAL ────────────────────────────────────────────────────────────
const visionPoints = {
  Identity: [
    'I communicate with anyone, anywhere',
    'I lead every conversation on calls',
    'I am the authority — I know exactly what to do',
    'I am Batman',
  ],
  Mindset: [
    'I take full responsibility for my actions',
    'I make decisions on my own and say them out loud',
    'I am not overthinking',
    'I always do what needs to be done — nothing gets postponed',
  ],
  Execution: [
    'I open my laptop anywhere and run client calls at the highest energy',
    'I speak with clients knowing exactly what will help them',
    'I built my agency from $10K → $30K in three months',
  ],
  Lifestyle: [
    'I take multi-day trips with my girlfriend',
    'I attend masterminds with other entrepreneurs',
  ],
};

function VisionModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border border-border"
        style={{
          background: 'linear-gradient(160deg, #1a1208 0%, #0f0f14 40%, #0a0f0a 100%)',
          boxShadow: '0 0 80px rgba(255, 120, 73, 0.12)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle on mobile */}
        <div className="flex justify-center pt-3 pb-0 sm:hidden">
          <div className="w-10 h-1 bg-border-strong rounded-full"/>
        </div>

        {/* Notebook lines */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-t-3xl sm:rounded-2xl" style={{
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #ff7849 31px, #ff7849 32px)',
          backgroundPositionY: '48px',
        }}/>

        <div className="relative p-6 sm:p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-[10px] font-bold text-accent/70 uppercase tracking-[0.2em] mb-2">My Vision · 2027</div>
              <div className="w-10 h-0.5 bg-accent opacity-40 rounded-full"/>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-bg-elev border border-border text-text-dim flex items-center justify-center text-sm">✕</button>
          </div>

          <div className="space-y-7">
            {Object.entries(visionPoints).map(([category, points]) => (
              <div key={category}>
                <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] mb-3" style={{
                  color: category === 'Identity' ? '#ff7849' :
                         category === 'Mindset' ? '#c8ff00' :
                         category === 'Execution' ? '#6db6ff' : '#a78bfa'
                }}>
                  {category}
                </div>
                <div className="space-y-2.5">
                  {points.map((point, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-[10px] text-text-dim font-mono mt-1 flex-shrink-0 opacity-40">{String(i + 1).padStart(2, '0')}</span>
                      <p className="text-sm sm:text-base font-medium leading-relaxed text-text/90">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="pt-4 border-t border-white/[0.06]">
              <div className="text-[10px] text-text-dim">Peter Kalina · LeadsFlow Media</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CAFFEINE GRAPH ───────────────────────────────────────────────────────────
function CaffeinePeakGraph() {
  const now = new Date();
  const nowH = now.getHours() + now.getMinutes() / 60;
  const W = 300; const H = 56;
  const coffees = [{ h: 9.0, mg: 80 }, { h: 12.0, mg: 63 }];
  const halfLifeH = 5;
  const points = Array.from({ length: 73 }, (_, i) => {
    const h = 5 + i * (17 / 72);
    const mg = coffees.reduce((sum, c) => h < c.h ? sum : sum + c.mg * Math.pow(0.5, (h - c.h) / halfLifeH), 0);
    return { h, mg };
  });
  const maxMg = 160;
  const toX = (h: number) => ((h - 5) / 17) * W;
  const toY = (mg: number) => H - (mg / maxMg) * H * 0.85 - 2;
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.h).toFixed(1)},${toY(p.mg).toFixed(1)}`).join(' ');
  const areaD = pathD + ` L${toX(points[points.length-1].h)},${H} L${toX(points[0].h)},${H} Z`;
  const cutoffX = toX(16);
  const nowX = toX(Math.min(nowH, 22));
  const currentMg = points.reduce((closest, p) => Math.abs(p.h - nowH) < Math.abs(closest.h - nowH) ? p : closest).mg;

  return (
    <div className="bg-bg-elev rounded-xl p-3 border border-border">
      <div className="flex justify-between items-center mb-2">
        <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider">Kofeín peak</div>
        <div className="text-xs font-bold" style={{ color: currentMg > 100 ? '#ff7849' : currentMg > 40 ? '#c8ff00' : '#888894' }}>
          {Math.round(currentMg)}mg now
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 56 }}>
        <defs>
          <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff7849" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#ff7849" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#cg)"/>
        <path d={pathD} fill="none" stroke="#ff7849" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1={cutoffX} y1="0" x2={cutoffX} y2={H} stroke="#ff5d7a" strokeWidth="1" strokeDasharray="2,2" opacity="0.6"/>
        {nowH >= 5 && nowH <= 22 && (
          <>
            <line x1={nowX} y1="0" x2={nowX} y2={H} stroke="#c8ff00" strokeWidth="1" strokeDasharray="1,2" opacity="0.4"/>
            <circle cx={nowX} cy={toY(currentMg)} r="3" fill="#c8ff00"/>
          </>
        )}
      </svg>
      <div className="flex justify-between text-[9px] text-text-dim mt-1">
        <span>05:00</span><span style={{color:'#ff5d7a'}}>cutoff 16:00</span><span>22:00</span>
      </div>
    </div>
  );
}

// ─── DATES TRACKER ───────────────────────────────────────────────────────────
function DatesTracker() {
  const [minutes, setMinutes] = useState(0);
  const hours = (minutes / 60).toFixed(1);
  return (
    <div className="bg-bg-card border border-border rounded-xl p-4">
      <div className="flex justify-between items-center mb-3">
        <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider">Dates · týždeň</div>
        <div className="text-sm font-bold text-violet">{hours}h</div>
      </div>
      <div className="h-1 bg-bg-elev rounded-full overflow-hidden mb-3">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min((minutes / 300) * 100, 100)}%`, background: '#a78bfa' }}/>
      </div>
      <div className="grid grid-cols-4 gap-1.5 mb-2">
        {[30, 60, 90, 120].map(m => (
          <button key={m} onClick={() => setMinutes(prev => prev + m)}
            className="py-2 bg-bg-elev rounded-lg text-[11px] font-bold text-text-dim hover:text-violet border border-border transition-all">
            +{m}m
          </button>
        ))}
      </div>
      <button
        onClick={() => setMinutes(prev => Math.max(0, prev - 30))}
        className="w-full py-2 bg-bg-elev rounded-lg text-[11px] font-bold text-text-dim hover:text-rose border border-border transition-all">
        − 30min
      </button>
    </div>
  );
}

// ─── ACTIVITY ROW ────────────────────────────────────────────────────────────
function ActivityRow({ label, done: initialDone, meta, color }: {
  label: string; done: boolean; meta: string; color: string;
}) {
  const [isDone, setIsDone] = useState(initialDone);
  return (
    <button onClick={() => setIsDone(!isDone)} className="w-full flex items-center gap-3 text-left py-1">
      <div className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${isDone ? 'text-bg border-transparent' : 'text-text-dim border-border'}`}
        style={{ background: isDone ? color : 'transparent' }}>
        {isDone ? '✓' : '○'}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-semibold truncate ${isDone ? 'line-through text-text-subtle' : ''}`}>{label}</div>
        <div className="text-[11px] text-text-dim">{meta}</div>
      </div>
    </button>
  );
}

// ─── SKINCARE QUICK ──────────────────────────────────────────────────────────
function SkincareQuick() {
  const [done, setDone] = useState(false);
  return (
    <button onClick={() => setDone(!done)} className="w-full text-left">
      <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-3">Skincare AM</div>
      <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${done ? 'bg-accent/[0.04] border-accent/30' : 'bg-bg-elev border-border'}`}>
        <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${done ? 'bg-accent border-accent text-bg' : 'border-border-strong text-text-dim'}`}>
          {done ? '✓' : '○'}
        </div>
        <div>
          <div className="text-sm font-bold">{done ? 'Hotovo' : 'Nespravené'}</div>
          <div className="text-[10px] text-text-dim">Moisturizer · Vit C · Hydrating</div>
        </div>
      </div>
    </button>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function DashboardClient() {
  const [visionOpen, setVisionOpen] = useState(false);
  const quote = getDailyQuote();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const [steps, setSteps] = useState([
    { text: '$40 into ads', done: false },
    { text: '5× Remind myself my Vision', done: false },
    { text: 'Study mindset 45min', done: false },
    { text: 'Meditation 20min', done: false },
  ]);
  const doneCount = steps.filter(s => s.done).length;

  const pipeline = [
    { name: 'Lonestar Land Group', status: 'Hot', value: '$3,400', color: '#ff7849' },
    { name: 'Cypress Tree Pro', status: 'Warm', value: '$2,400', color: '#c8ff00' },
    { name: 'Brushhog Brothers', status: 'Warm', value: '$1,800', color: '#c8ff00' },
    { name: 'Iron Oak Excavation', status: 'Cold', value: '$800', color: '#6db6ff' },
  ];

  return (
    <>
      {visionOpen && <VisionModal onClose={() => setVisionOpen(false)} />}

      <main className="px-3 sm:px-4 md:px-6 py-4 max-w-[1400px] mx-auto pb-28 lg:pb-6">

        {/* ── HERO ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3 mb-4">

          {/* Greeting */}
          <div className="bg-bg-card border border-border rounded-2xl p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-[0.07] pointer-events-none"
              style={{ background: 'radial-gradient(circle, #ff7849 0%, transparent 70%)' }}/>
            <div className="relative">
              <div className="text-[11px] text-accent font-bold mb-1.5 tracking-wide capitalize">
                {new Date().toLocaleDateString('sk-SK', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-[-0.03em] mb-1">
                {greeting}, <span className="text-accent">Peter.</span>
              </h1>
              <p className="text-text-dim text-xs sm:text-sm font-medium mb-4">Spal si 6h 42min · Recovery 78</p>
              <div className="border-l-2 border-accent pl-3 py-0.5">
                <p className="text-xs sm:text-sm font-medium leading-relaxed text-text/85 mb-1 line-clamp-3">„{quote.text}"</p>
                <p className="text-[10px] text-text-dim">— {quote.author}</p>
              </div>
            </div>
          </div>

          {/* Vision - mobile: compact horizontal strip */}
          <button onClick={() => setVisionOpen(true)}
            className="bg-bg-card border border-border rounded-2xl p-4 text-left relative overflow-hidden group hover:border-accent transition-all lg:block">
            <div className="relative">
              {/* Mobile: horizontal layout */}
              <div className="flex items-center justify-between lg:block">
                <div className="flex items-center gap-2 mb-0 lg:mb-4">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0"/>
                  <span className="text-[10px] font-bold text-text-dim uppercase tracking-[0.15em]">Vízia · 2027</span>
                  <span className="text-[10px] text-text-dim ml-auto group-hover:text-accent transition-colors hidden sm:block">Otvoriť →</span>
                </div>
                <span className="text-[10px] text-text-dim group-hover:text-accent transition-colors sm:hidden">→</span>
              </div>

              {/* Progress bars - compact on mobile */}
              <div className="grid grid-cols-2 gap-2 mt-2 lg:mt-0 lg:block lg:space-y-2.5">
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-text-dim">MRR</span>
                    <span className="font-bold">$1K / $30K</span>
                  </div>
                  <div className="h-1 bg-bg-elev rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: '3.3%' }}/>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-text-dim">Klienti</span>
                    <span className="font-bold">2 / 10</span>
                  </div>
                  <div className="h-1 bg-bg-elev rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: '20%', background: '#c8ff00' }}/>
                  </div>
                </div>
              </div>

              {/* Vision preview - only on desktop */}
              <div className="hidden lg:block mt-4 space-y-2">
                {Object.entries(visionPoints).slice(0, 2).map(([cat, pts]) => (
                  <div key={cat}>
                    <div className="text-[9px] text-accent font-bold uppercase tracking-wider mb-1">{cat}</div>
                    {pts.slice(0, 2).map((p, i) => (
                      <div key={i} className="text-[11px] text-text-dim leading-relaxed">· {p}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </button>
        </div>

        {/* ── RINGS — 2x2 on mobile, 4 cols on desktop ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">

          {/* Sleep */}
          <div className="bg-bg-card border border-border rounded-2xl p-3 sm:p-4 flex items-center gap-3">
            <Ring pct={78} color="#6db6ff" size={60} stroke={5}>
              <span className="text-sm font-bold text-cool">78</span>
            </Ring>
            <div className="min-w-0">
              <div className="text-[9px] font-bold text-text-dim uppercase tracking-wider mb-0.5">Spánok</div>
              <div className="text-sm font-bold">6h 42m</div>
              <div className="text-[10px] text-text-dim leading-tight">Deep 1h28<br/>REM 1h12</div>
            </div>
          </div>

          {/* Vision steps */}
          <div className="bg-bg-card border border-border rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-3 mb-2">
              <Ring pct={(doneCount / steps.length) * 100} color="#ff7849" size={60} stroke={5}>
                <span className="text-sm font-bold text-accent">{doneCount}/{steps.length}</span>
              </Ring>
              <div>
                <div className="text-[9px] font-bold text-text-dim uppercase tracking-wider mb-0.5">Kroky</div>
                <div className="text-sm font-bold">dnes</div>
              </div>
            </div>
            {/* Compact checklist */}
            <div className="space-y-1.5">
              {steps.map((s, i) => (
                <button key={i} onClick={() => {
                  const c = [...steps]; c[i].done = !c[i].done; setSteps(c);
                }} className="flex items-center gap-1.5 w-full text-left min-h-[20px]">
                  <div className={`w-3.5 h-3.5 rounded border flex-shrink-0 relative ${s.done ? 'bg-accent border-accent' : 'border-border-strong'}`}>
                    {s.done && <span className="absolute inset-0 flex items-center justify-center text-bg text-[8px] font-extrabold">✓</span>}
                  </div>
                  <span className={`text-[10px] font-medium leading-tight ${s.done ? 'line-through text-text-subtle' : 'text-text-dim'}`}>{s.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Work time */}
          <div className="bg-bg-card border border-border rounded-2xl p-3 sm:p-4 flex items-center gap-3">
            <Ring pct={(3.5 / 8) * 100} color="#c8ff00" size={60} stroke={5}>
              <span className="text-sm font-bold" style={{ color: '#c8ff00' }}>44%</span>
            </Ring>
            <div className="min-w-0">
              <div className="text-[9px] font-bold text-text-dim uppercase tracking-wider mb-0.5">Work</div>
              <div className="text-sm font-bold">3.5h</div>
              <div className="text-[10px] text-text-dim leading-tight">/ 8h cieľ</div>
            </div>
          </div>

          {/* MRR */}
          <div className="bg-bg-card border border-border rounded-2xl p-3 sm:p-4 flex items-center gap-3">
            <Ring pct={3.3} color="#ff7849" size={60} stroke={5}>
              <span className="text-[10px] font-bold text-accent">3.3%</span>
            </Ring>
            <div className="min-w-0">
              <div className="text-[9px] font-bold text-text-dim uppercase tracking-wider mb-0.5">MRR</div>
              <div className="text-sm font-bold">$1K</div>
              <div className="text-[10px] text-accent font-semibold">/ $30K</div>
            </div>
          </div>
        </div>

        {/* ── CAFFEINE GRAPH ── */}
        <div className="mb-4">
          <CaffeinePeakGraph />
        </div>

        {/* ── BUSINESS KPI — horizontal scroll on mobile ── */}
        <div className="mb-4">
          <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-2 px-0.5">Biznis dnes</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'MRR', value: '$1,000', color: '#ff7849' },
              { label: 'Tržby 7d', value: '$420', color: '#c8ff00' },
              { label: 'Pipeline', value: '$8,400', color: '#6db6ff' },
              { label: 'Ads ROAS', value: '—', color: '#888894' },
            ].map(k => (
              <div key={k.label} className="bg-bg-card border border-border rounded-xl p-3">
                <div className="text-[10px] text-text-dim font-semibold mb-1">{k.label}</div>
                <div className="text-base font-bold tracking-tight" style={{ color: k.color }}>{k.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CALLS + PIPELINE — stacked on mobile ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">

          {/* Calls */}
          <div className="bg-bg-card border border-border rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider">Cally</div>
              <span className="text-[10px] text-text-dim">3 dnes · 2 zajtra</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { n: '14', l: 'Týždeň', c: '' },
                { n: '4', l: 'Closed', c: '#ff7849' },
                { n: '28%', l: 'Close %', c: '' },
              ].map(s => (
                <div key={s.l} className="bg-bg-elev rounded-lg p-2 text-center">
                  <div className="text-base font-bold" style={{ color: s.c || undefined }}>{s.n}</div>
                  <div className="text-[9px] text-text-dim">{s.l}</div>
                </div>
              ))}
            </div>
            {[
              { name: 'Texas Land Co', score: 87, grade: 'A' },
              { name: 'Pine Ridge', score: 71, grade: 'B' },
              { name: 'DeepRoot', score: 82, grade: 'A' },
            ].map((c, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-white/[0.04] last:border-b-0 text-xs">
                <span className="font-medium truncate mr-2">{c.name}</span>
                <span className="px-1.5 py-0.5 rounded font-bold flex-shrink-0"
                  style={{ color: c.grade === 'A' ? '#c8ff00' : '#ff7849', background: c.grade === 'A' ? 'rgba(200,255,0,0.1)' : 'rgba(255,120,73,0.1)' }}>
                  {c.grade}·{c.score}
                </span>
              </div>
            ))}
          </div>

          {/* Pipeline */}
          <div className="bg-bg-card border border-border rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider">Pipeline</div>
              <span className="text-sm font-bold text-accent">$8,400</span>
            </div>
            <div className="space-y-2">
              {pipeline.map((p, i) => (
                <div key={i} className="flex justify-between items-center p-2.5 bg-bg-elev rounded-lg border-l-2" style={{ borderLeftColor: p.color }}>
                  <div className="min-w-0 mr-2">
                    <div className="text-xs font-semibold truncate">{p.name}</div>
                    <div className="text-[10px] text-text-dim">{p.status}</div>
                  </div>
                  <div className="text-sm font-bold flex-shrink-0" style={{ color: p.color }}>{p.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Activities */}
          <div className="bg-bg-card border border-border rounded-2xl p-4 sm:col-span-2 lg:col-span-1">
            <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-3">Aktivity dnes</div>
            <div className="space-y-1">
              <ActivityRow label="Meditácia" done={false} meta="Cieľ: 20min" color="#2dd4bf"/>
              <ActivityRow label="Workout" done={false} meta="Push day" color="#ff7849"/>
              <ActivityRow label="Beh" done={true} meta="5.2km ✓" color="#c8ff00"/>
            </div>
          </div>
        </div>

        {/* ── PERSONAL — 2 cols on mobile ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="bg-bg-card border border-border rounded-2xl p-4">
            <SkincareQuick />
          </div>
          <DatesTracker />
        </div>

        {/* ── AI SECTION — stacked on mobile ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
          {[
            { icon: 'M', title: 'Mentor', desc: 'Pozná tvoj celý kontext', href: '/mentor', color: '#ff7849' },
            { icon: 'S', title: 'Sales coach', desc: 'Analyzuj call transcript', href: '/sales', color: '#c8ff00' },
            { icon: 'R', title: 'Roleplay', desc: 'Realtime prospekt bot', href: '/sales', color: '#6db6ff' },
          ].map(c => (
            <Link key={c.title} href={c.href}
              className="bg-bg-card border border-border rounded-xl p-3.5 hover:border-accent transition-all group flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-bg text-sm flex-shrink-0"
                style={{ background: c.color }}>
                {c.icon}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold group-hover:text-accent transition-colors">{c.title}</div>
                <div className="text-[11px] text-text-dim truncate">{c.desc}</div>
              </div>
              <div className="ml-auto text-text-dim text-sm flex-shrink-0">→</div>
            </Link>
          ))}
        </div>

        {/* ── SUBSCRIPTIONS — scrollable pills ── */}
        <div className="bg-bg-card border border-border rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider">Predplatné</div>
            <div className="text-sm font-bold text-accent">$284 / mes</div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { name: 'Claude Max', price: '$100' },
              { name: 'GHL Pro', price: '$97' },
              { name: 'Veo 3', price: '$30' },
              { name: 'ElevenLabs', price: '$22' },
              { name: 'ChatGPT', price: '$20' },
              { name: 'CapCut', price: '$15' },
              { name: 'SuperFaktúra', price: '€15' },
            ].map(s => (
              <div key={s.name} className="flex items-center gap-1 px-2 py-1 bg-bg-elev border border-border rounded-lg">
                <span className="text-[11px] font-semibold">{s.name}</span>
                <span className="text-[10px] text-text-dim font-bold">{s.price}</span>
              </div>
            ))}
          </div>
        </div>

      </main>
    </>
  );
}
