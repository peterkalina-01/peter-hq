'use client';

import { useState, useEffect } from 'react';
import { getDailyQuote } from '@/lib/quotes';
import Link from 'next/link';

// ─── SVG RING ────────────────────────────────────────────────────────────────
function Ring({ pct, color, size = 80, stroke = 7, children }: {
  pct: number; color: string; size?: number; stroke?: number; children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#242430" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

// ─── VISION FULLSCREEN ───────────────────────────────────────────────────────
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border"
        style={{
          background: 'linear-gradient(160deg, #1a1208 0%, #0f0f14 40%, #0a0f0a 100%)',
          boxShadow: '0 0 80px rgba(255, 120, 73, 0.15), 0 0 120px rgba(200, 255, 0, 0.05)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Notebook lines effect */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #ff7849 31px, #ff7849 32px)',
          backgroundPositionY: '48px',
        }}/>

        {/* Header */}
        <div className="relative p-8 pb-0">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-[10px] font-bold text-accent/70 uppercase tracking-[0.2em] mb-2">My Vision · 2027</div>
              <div className="w-12 h-0.5 bg-accent opacity-40 rounded-full"/>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-bg-elev border border-border text-text-dim hover:text-text transition-colors flex items-center justify-center text-sm">✕</button>
          </div>
        </div>

        {/* Vision content - notebook style */}
        <div className="relative px-8 pb-8 space-y-8">
          {Object.entries(visionPoints).map(([category, points]) => (
            <div key={category}>
              <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] mb-4" style={{
                color: category === 'Identity' ? '#ff7849' :
                       category === 'Mindset' ? '#c8ff00' :
                       category === 'Execution' ? '#6db6ff' : '#a78bfa'
              }}>
                {category}
              </div>
              <div className="space-y-3">
                {points.map((point, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="text-[10px] text-text-dim font-mono mt-1 flex-shrink-0 opacity-40">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="text-base font-medium leading-relaxed text-text/90" style={{
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                    }}>
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Signature */}
          <div className="pt-4 border-t border-white/[0.06]">
            <div className="text-[10px] text-text-dim font-medium">Peter Kalina · LeadsFlow Media</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CAFFEINE MINI GRAPH ─────────────────────────────────────────────────────
function CaffeinePeakGraph() {
  const now = new Date();
  const nowH = now.getHours() + now.getMinutes() / 60;
  const W = 400; const H = 60;

  // Simulate caffeine curve based on 2 coffees (09:00, 12:00)
  const coffees = [
    { h: 9.0, mg: 80 },
    { h: 12.0, mg: 63 },
  ];

  const halfLifeH = 5;
  const points = Array.from({ length: 73 }, (_, i) => {
    const h = 5 + i * (17 / 72);
    const mg = coffees.reduce((sum, c) => {
      if (h < c.h) return sum;
      return sum + c.mg * Math.pow(0.5, (h - c.h) / halfLifeH);
    }, 0);
    return { h, mg };
  });

  const maxMg = 160;
  const toX = (h: number) => ((h - 5) / 17) * W;
  const toY = (mg: number) => H - (mg / maxMg) * H * 0.85 - 4;

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.h).toFixed(1)},${toY(p.mg).toFixed(1)}`).join(' ');
  const areaD = pathD + ` L${toX(points[points.length-1].h)},${H} L${toX(points[0].h)},${H} Z`;
  const cutoffX = toX(16);
  const nowX = toX(Math.min(nowH, 22));
  const currentMg = points.reduce((closest, p) => Math.abs(p.h - nowH) < Math.abs(closest.h - nowH) ? p : closest).mg;

  return (
    <div className="bg-bg-elev rounded-xl p-4 border border-border">
      <div className="flex justify-between items-center mb-3">
        <div className="text-xs font-bold text-text-dim uppercase tracking-wider">Kofeín · peak window</div>
        <div className="text-sm font-bold" style={{ color: currentMg > 100 ? '#ff7849' : currentMg > 40 ? '#c8ff00' : '#888894' }}>
          {Math.round(currentMg)}mg now
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 60 }}>
        <defs>
          <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff7849" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="#ff7849" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#cg)"/>
        <path d={pathD} fill="none" stroke="#ff7849" strokeWidth="2" strokeLinecap="round"/>
        {/* Cutoff */}
        <line x1={cutoffX} y1="0" x2={cutoffX} y2={H} stroke="#ff5d7a" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.7"/>
        <text x={cutoffX + 3} y="10" fill="#ff5d7a" fontSize="8" opacity="0.7">cutoff</text>
        {/* Now */}
        {nowH >= 5 && nowH <= 22 && (
          <>
            <line x1={nowX} y1="0" x2={nowX} y2={H} stroke="#c8ff00" strokeWidth="1" strokeDasharray="2,2" opacity="0.5"/>
            <circle cx={nowX} cy={toY(currentMg)} r="3.5" fill="#c8ff00"/>
          </>
        )}
      </svg>
      <div className="flex justify-between text-[9px] text-text-dim font-medium mt-1">
        <span>05:00</span><span style={{color:'#ff5d7a'}}>16:00 cutoff</span><span>22:00</span>
      </div>
    </div>
  );
}

// ─── DATES TRACKER ───────────────────────────────────────────────────────────
function DatesTracker() {
  const [minutes, setMinutes] = useState(0);
  const hours = (minutes / 60).toFixed(1);
  const weekGoal = 300; // 5 hours per week

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4">
      <div className="flex justify-between items-center mb-3">
        <div className="text-xs font-bold text-text-dim uppercase tracking-wider">Dates · tento týždeň</div>
        <div className="text-sm font-bold text-violet">{hours}h</div>
      </div>
      <div className="h-1.5 bg-bg-elev rounded-full overflow-hidden mb-3">
        <div className="h-full rounded-full bg-violet transition-all" style={{ width: `${Math.min((minutes / weekGoal) * 100, 100)}%` }}/>
      </div>
      <div className="flex gap-2">
        {[30, 60, 90, 120].map(m => (
          <button key={m} onClick={() => setMinutes(prev => prev + m)}
            className="flex-1 py-2 bg-bg-elev rounded-lg text-xs font-bold text-text-dim hover:text-violet hover:border-violet border border-border transition-all">
            +{m}m
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
export default function DashboardClient() {
  const [visionOpen, setVisionOpen] = useState(false);
  const quote = getDailyQuote();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Vision steps
  const [steps, setSteps] = useState([
    { text: '$40 into ads', done: false },
    { text: '5× Remind myself my Vision and who I am', done: false },
    { text: 'Study book and my mindset for 45min', done: false },
    { text: 'Meditation for 20min', done: false },
  ]);
  const doneCount = steps.filter(s => s.done).length;

  // Pipeline
  const pipeline = [
    { name: 'Lonestar Land Group', status: 'Hot', value: '$3,400', color: '#ff7849' },
    { name: 'Cypress Tree Pro', status: 'Warm', value: '$2,400', color: '#c8ff00' },
    { name: 'Brushhog Brothers', status: 'Warm', value: '$1,800', color: '#c8ff00' },
    { name: 'Iron Oak Excavation', status: 'Cold', value: '$800', color: '#6db6ff' },
  ];

  return (
    <>
      {visionOpen && <VisionModal onClose={() => setVisionOpen(false)} />}

      <main className="px-4 md:px-6 py-5 max-w-[1400px] mx-auto pb-24 lg:pb-6">

        {/* ── HERO ROW ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 mb-5">

          {/* Greeting + Quote */}
          <div className="bg-bg-card border border-border rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-[0.07] pointer-events-none"
              style={{ background: 'radial-gradient(circle, #ff7849 0%, transparent 70%)' }}/>
            <div className="relative">
              <div className="text-xs text-accent font-bold mb-2 tracking-wide">
                {new Date().toLocaleDateString('sk-SK', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-[-0.03em] mb-1">
                {greeting}, <span className="text-accent">Peter.</span>
              </h1>
              <p className="text-text-dim text-sm font-medium mb-5">Spal si 6h 42min · Recovery 78</p>
              <div className="border-l-2 border-accent pl-4 py-1">
                <p className="text-sm font-medium leading-relaxed text-text/85 mb-1">„{quote.text}"</p>
                <p className="text-[11px] text-text-dim">— {quote.author}</p>
              </div>
            </div>
          </div>

          {/* Vision card - clickable */}
          <button
            onClick={() => setVisionOpen(true)}
            className="bg-bg-card border border-border rounded-2xl p-5 text-left relative overflow-hidden group hover:border-accent transition-all"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'radial-gradient(circle at 50% 0%, rgba(255,120,73,0.06) 0%, transparent 70%)' }}/>
            <div className="relative">
              <div className="flex justify-between items-start mb-4">
                <div className="text-[10px] font-bold text-text-dim uppercase tracking-[0.15em] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full"/>
                  Vízia · 2027
                </div>
                <span className="text-[10px] text-text-dim font-medium group-hover:text-accent transition-colors">Otvoriť →</span>
              </div>

              {/* Mini vision preview */}
              <div className="space-y-2 mb-5">
                {Object.entries(visionPoints).slice(0, 2).map(([cat, pts]) => (
                  <div key={cat}>
                    <div className="text-[9px] text-accent font-bold uppercase tracking-wider mb-1">{cat}</div>
                    {pts.slice(0, 2).map((p, i) => (
                      <div key={i} className="text-[11px] text-text-dim leading-relaxed">· {p}</div>
                    ))}
                  </div>
                ))}
                <div className="text-[10px] text-text-dim opacity-50 italic">+ {Object.values(visionPoints).flat().length - 4} more...</div>
              </div>

              {/* Progress */}
              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-text-dim">MRR</span>
                    <span className="font-bold">$1K / $30K</span>
                  </div>
                  <div className="h-1 bg-bg-elev rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: '3.3%' }}/>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-text-dim">Klienti</span>
                    <span className="font-bold">2 / 10</span>
                  </div>
                  <div className="h-1 bg-bg-elev rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: '20%', background: '#c8ff00' }}/>
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* ── RINGS ROW ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          {/* Sleep ring */}
          <div className="bg-bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
            <Ring pct={78} color="#6db6ff" size={72} stroke={6}>
              <span className="text-lg font-bold text-cool">78</span>
            </Ring>
            <div>
              <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1">Spánok</div>
              <div className="text-sm font-bold">6h 42m</div>
              <div className="text-[10px] text-text-dim">Deep: 1h 28m</div>
              <div className="text-[10px] text-text-dim">REM: 1h 12m</div>
            </div>
          </div>

          {/* Vision steps ring */}
          <div className="bg-bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
            <Ring pct={(doneCount / steps.length) * 100} color="#ff7849" size={72} stroke={6}>
              <span className="text-base font-bold text-accent">{doneCount}/{steps.length}</span>
            </Ring>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-2">Kroky · dnes</div>
              <div className="space-y-1">
                {steps.map((s, i) => (
                  <button key={i} onClick={() => {
                    const c = [...steps]; c[i].done = !c[i].done; setSteps(c);
                  }} className="flex items-center gap-1.5 w-full text-left">
                    <div className={`w-3 h-3 rounded-sm border flex-shrink-0 relative ${s.done ? 'bg-accent border-accent' : 'border-border-strong'}`}>
                      {s.done && <span className="absolute inset-0 flex items-center justify-center text-bg text-[8px] font-extrabold">✓</span>}
                    </div>
                    <span className={`text-[10px] font-medium truncate ${s.done ? 'line-through text-text-subtle' : 'text-text-dim'}`}>{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Work time ring */}
          <div className="bg-bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
            <Ring pct={(3.5 / 8) * 100} color="#c8ff00" size={72} stroke={6}>
              <span className="text-base font-bold" style={{ color: '#c8ff00' }}>3.5h</span>
            </Ring>
            <div>
              <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1">Work time</div>
              <div className="text-sm font-bold">3.5h / 8h</div>
              <div className="text-[10px] text-text-dim">Deep: 2h</div>
              <div className="text-[10px] text-text-dim">Calls: 1.5h</div>
            </div>
          </div>

          {/* MRR ring */}
          <div className="bg-bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
            <Ring pct={3.3} color="#ff7849" size={72} stroke={6}>
              <div className="text-center">
                <div className="text-[10px] font-bold text-accent">3.3%</div>
              </div>
            </Ring>
            <div>
              <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1">MRR Goal</div>
              <div className="text-sm font-bold">$1,000</div>
              <div className="text-[10px] text-text-dim">Target: $30K</div>
              <div className="text-[10px] text-accent font-semibold">↑ Growing</div>
            </div>
          </div>
        </div>

        {/* ── CAFFEINE PEAK ── */}
        <div className="mb-5">
          <CaffeinePeakGraph />
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">

          {/* KPI Strip */}
          <div className="bg-bg-card border border-border rounded-2xl p-5">
            <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-4">Biznis dnes</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'MRR', value: '$1,000', color: '#ff7849', up: true },
                { label: 'Tržby 7d', value: '$420', color: '#c8ff00', up: true },
                { label: 'Pipeline', value: '$8,400', color: '#6db6ff', up: true },
                { label: 'Ads', value: '—', color: '#888894', up: false },
              ].map(k => (
                <div key={k.label} className="bg-bg-elev rounded-xl p-3">
                  <div className="text-[10px] text-text-dim font-semibold mb-1">{k.label}</div>
                  <div className="text-base font-bold tracking-tight" style={{ color: k.color }}>{k.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Calls */}
          <div className="bg-bg-card border border-border rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider">Cally</div>
              <span className="text-xs text-text-dim">3 dnes · 2 zajtra</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { n: '14', l: 'Týždeň', c: '' },
                { n: '4', l: 'Closed', c: 'text-accent' },
                { n: '28%', l: 'Close rate', c: '' },
              ].map(s => (
                <div key={s.l} className="bg-bg-elev rounded-lg p-2.5 text-center">
                  <div className={`text-lg font-bold ${s.c}`}>{s.n}</div>
                  <div className="text-[9px] text-text-dim font-semibold">{s.l}</div>
                </div>
              ))}
            </div>
            {[
              { name: 'Texas Land Co', score: 87, grade: 'A' },
              { name: 'Pine Ridge', score: 71, grade: 'B' },
              { name: 'DeepRoot', score: 82, grade: 'A' },
            ].map((c, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-white/[0.04] last:border-b-0 text-xs">
                <span className="font-medium">{c.name}</span>
                <span className={`px-1.5 py-0.5 rounded font-bold ${c.grade === 'A' ? 'bg-lime/10 text-lime' : 'bg-accent/10 text-accent'}`}
                  style={{ color: c.grade === 'A' ? '#c8ff00' : '#ff7849' }}>
                  {c.grade}·{c.score}
                </span>
              </div>
            ))}
          </div>

          {/* Pipeline */}
          <div className="bg-bg-card border border-border rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider">Pipeline</div>
              <span className="text-sm font-bold text-accent">$8,400</span>
            </div>
            <div className="space-y-2.5">
              {pipeline.map((p, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-bg-elev rounded-xl border-l-2" style={{ borderLeftColor: p.color }}>
                  <div>
                    <div className="text-xs font-semibold">{p.name}</div>
                    <div className="text-[10px] text-text-dim">{p.status}</div>
                  </div>
                  <div className="text-sm font-bold" style={{ color: p.color }}>{p.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Skincare */}
          <div className="bg-bg-card border border-border rounded-2xl p-5">
            <SkincareQuick />
          </div>

          {/* Dates */}
          <DatesTracker />

          {/* Meditation + Workout quick */}
          <div className="bg-bg-card border border-border rounded-2xl p-5">
            <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-4">Aktivity dnes</div>
            <div className="space-y-3">
              <ActivityRow label="Meditácia" done={false} meta="Cieľ: 20min" color="#2dd4bf"/>
              <ActivityRow label="Workout" done={false} meta="Push day" color="#ff7849"/>
              <ActivityRow label="Beh" done={true} meta="5.2km ✓" color="#c8ff00"/>
            </div>
          </div>
        </div>

        {/* ── AI SECTION ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {[
            { icon: 'M', title: 'Mentor', desc: 'Pozná tvoj celý kontext', href: '/mentor', color: '#ff7849' },
            { icon: 'S', title: 'Sales coach', desc: 'Analyzuj call transcript', href: '/sales', color: '#c8ff00' },
            { icon: 'R', title: 'Roleplay', desc: 'Realtime prospekt bot', href: '/sales', color: '#6db6ff' },
          ].map(c => (
            <Link key={c.title} href={c.href}
              className="bg-bg-card border border-border rounded-2xl p-5 hover:border-accent transition-all group flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-bg text-sm flex-shrink-0"
                style={{ background: c.color }}>
                {c.icon}
              </div>
              <div>
                <div className="text-sm font-bold group-hover:text-accent transition-colors">{c.title}</div>
                <div className="text-xs text-text-dim">{c.desc}</div>
              </div>
              <div className="ml-auto text-text-dim group-hover:text-accent transition-colors text-sm">→</div>
            </Link>
          ))}
        </div>

        {/* ── SUBSCRIPTIONS ── */}
        <div className="bg-bg-card border border-border rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider">Predplatné</div>
            <div className="text-sm font-bold text-accent">$284 / mes</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'Claude Max', price: '$100' },
              { name: 'GHL Pro', price: '$97' },
              { name: 'Veo 3', price: '$30' },
              { name: 'ElevenLabs', price: '$22' },
              { name: 'ChatGPT', price: '$20' },
              { name: 'CapCut', price: '$15' },
              { name: 'SuperFaktúra', price: '€15' },
            ].map(s => (
              <div key={s.name} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-bg-elev border border-border rounded-lg">
                <span className="text-xs font-semibold">{s.name}</span>
                <span className="text-[10px] text-text-dim font-bold">{s.price}</span>
              </div>
            ))}
          </div>
        </div>

      </main>
    </>
  );
}

// ─── SKINCARE QUICK ──────────────────────────────────────────────────────────
function SkincareQuick() {
  const [done, setDone] = useState(false);
  return (
    <>
      <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-4">Skincare AM</div>
      <button onClick={() => setDone(!done)}
        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${done ? 'bg-accent/[0.04] border-accent/30' : 'bg-bg-elev border-border'}`}>
        <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-base ${done ? 'bg-accent border-accent text-bg' : 'border-border-strong text-text-dim'}`}>
          {done ? '✓' : '○'}
        </div>
        <div className="text-left">
          <div className="text-sm font-bold">{done ? 'Hotovo' : 'Nespravené'}</div>
          <div className="text-[10px] text-text-dim">Moisturizer · Vit C · Hydrating</div>
        </div>
      </button>
    </>
  );
}

// ─── ACTIVITY ROW ─────────────────────────────────────────────────────────────
function ActivityRow({ label, done, meta, color }: { label: string; done: boolean; meta: string; color: string }) {
  const [isDone, setIsDone] = useState(done);
  return (
    <button onClick={() => setIsDone(!isDone)} className="w-full flex items-center gap-3 text-left">
      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-bold transition-all ${isDone ? 'text-bg border-transparent' : 'text-text-dim border-border'}`}
        style={{ background: isDone ? color : 'transparent' }}>
        {isDone ? '✓' : '○'}
      </div>
      <div className="flex-1">
        <div className={`text-xs font-semibold ${isDone ? 'line-through text-text-subtle' : ''}`}>{label}</div>
        <div className="text-[10px] text-text-dim">{meta}</div>
      </div>
    </button>
  );
}
