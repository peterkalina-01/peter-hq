'use client';

import TopBar from '@/components/TopBar';
import MobileNav from '@/components/MobileNav';
import { useState } from 'react';

function SectionHeader({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-5 mt-8 first:mt-0">
      <h2 className="text-2xl font-bold tracking-[-0.025em]">{title}</h2>
      {meta && <div className="text-xs text-text-dim font-medium">{meta}</div>}
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-bg-card border border-border rounded-2xl p-6 ${className}`}>
      {children}
    </div>
  );
}

// VISION STEPS
function VisionSteps() {
  const [steps, setSteps] = useState([
    { text: '$40 into ads', done: false },
    { text: '5× Remind myself my Vision and who I am', done: false },
    { text: 'Study book and my mindset for 45min', done: false },
    { text: 'Meditation for 20min', done: false },
  ]);

  const toggle = (i: number) => {
    const copy = [...steps];
    copy[i].done = !copy[i].done;
    setSteps(copy);
  };

  const done = steps.filter(s => s.done).length;

  return (
    <Card>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold tracking-[-0.02em]">Kroky k vízii · dnes</h3>
        <span className={`text-xs font-bold px-2 py-1 rounded-md ${done === steps.length ? 'bg-accent/10 text-accent' : 'bg-bg-elev text-text-dim'}`}>
          {done} / {steps.length}
        </span>
      </div>
      <div className="space-y-0">
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className="w-full flex gap-3 py-3 border-b border-white/[0.04] last:border-b-0 items-center text-left"
          >
            <div className={`w-[18px] h-[18px] border-[1.5px] rounded-md flex-shrink-0 relative transition-all ${s.done ? 'bg-accent border-accent' : 'border-border-strong'}`}>
              {s.done && <span className="absolute inset-0 flex items-center justify-center text-bg text-[11px] font-extrabold">✓</span>}
            </div>
            <span className={`flex-1 text-sm font-medium ${s.done ? 'line-through text-text-subtle' : ''}`}>{s.text}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}

// SLEEP
function Sleep() {
  return (
    <Card>
      <div className="flex justify-between items-start mb-5">
        <h3 className="text-lg font-bold tracking-[-0.02em]">Spánok</h3>
        <span className="text-xs font-semibold px-2 py-1 rounded-md bg-accent/10 text-accent">Garmin live</span>
      </div>
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-5xl font-bold text-cool tracking-[-0.03em]">6:42</span>
        <span className="text-sm text-text-dim font-semibold">hod</span>
        <span className="ml-auto text-2xl font-bold text-accent">78</span>
        <span className="text-xs text-text-dim font-semibold">skóre</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden mb-4 bg-bg-elev">
        <div style={{ width: '22%', background: '#6db6ff' }} title="Light" />
        <div style={{ width: '48%', background: '#2dd4bf' }} title="Deep" />
        <div style={{ width: '18%', background: '#c8ff00' }} title="REM" />
        <div style={{ width: '12%', background: '#ff7849' }} title="Awake" />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {[
          { lbl: 'Light', val: '3h 02m', color: '#6db6ff' },
          { lbl: 'Deep', val: '1h 28m', color: '#2dd4bf' },
          { lbl: 'REM', val: '1h 12m', color: '#c8ff00' },
          { lbl: 'Awake', val: '0h 12m', color: '#ff7849' },
        ].map(s => (
          <div key={s.lbl} className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: s.color }}>{s.lbl}</span>
            <span className="text-sm font-bold">{s.val}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border flex justify-between text-xs text-text-dim font-medium">
        <span>Zaspal: 23:18</span>
        <span>Zobúdil: 06:00</span>
        <span>Resting HR: 52 bpm</span>
      </div>
    </Card>
  );
}

// SPORT
function Sport() {
  return (
    <Card>
      <div className="flex justify-between items-start mb-5">
        <h3 className="text-lg font-bold tracking-[-0.02em]">Šport dnes</h3>
        <span className="text-xs font-semibold px-2 py-1 rounded-md bg-accent/10 text-accent">Garmin live</span>
      </div>
      <div className="space-y-3">
        {[
          { icon: 'R', name: 'Ranný beh', meta: '5.2 km · 28 min · pace 5:23 · 312 kcal', val: '5.2 km', cls: 'bg-warm/15 text-warm' },
          { icon: 'G', name: 'Push workout', meta: 'Planned · 18:00 · Chest / Shoulders / Triceps', val: 'Tonight', cls: 'bg-cool/15 text-cool' },
        ].map(it => (
          <div key={it.name} className="flex justify-between items-center p-4 bg-bg-elev rounded-xl">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${it.cls}`}>{it.icon}</div>
              <div>
                <div className="text-sm font-semibold">{it.name}</div>
                <div className="text-xs text-text-dim font-medium mt-0.5">{it.meta}</div>
              </div>
            </div>
            <div className="text-base font-bold">{it.val}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// WEIGHT TRACKER
function WeightTracker() {
  const [entries, setEntries] = useState([
    { date: '7. máj', weight: '74.2' },
    { date: '8. máj', weight: '74.0' },
    { date: '9. máj', weight: '73.8' },
  ]);
  const [input, setInput] = useState('');

  const addEntry = () => {
    if (!input || isNaN(parseFloat(input))) return;
    const today = new Date().toLocaleDateString('sk-SK', { day: 'numeric', month: 'short' });
    setEntries(prev => [...prev, { date: today, weight: input }]);
    setInput('');
  };

  const weights = entries.map(e => parseFloat(e.weight));
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const first = weights[0];
  const last = weights[weights.length - 1];
  const diff = (last - first).toFixed(1);

  return (
    <Card>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold tracking-[-0.02em]">Váha</h3>
        <span className={`text-xs font-bold px-2 py-1 rounded-md ${parseFloat(diff) <= 0 ? 'bg-accent/10 text-accent' : 'bg-rose/10 text-rose'}`}>
          {parseFloat(diff) <= 0 ? '↓' : '↑'} {Math.abs(parseFloat(diff))} kg
        </span>
      </div>

      {/* Mini chart */}
      <div className="relative h-20 mb-4">
        <svg viewBox={`0 0 ${Math.max(entries.length * 60, 200)} 60`} className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c8ff00" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#c8ff00" stopOpacity="0" />
            </linearGradient>
          </defs>
          {entries.length > 1 && (
            <>
              <path
                d={`M ${entries.map((e, i) => {
                  const x = (i / (entries.length - 1)) * (Math.max(entries.length * 60, 200) - 20) + 10;
                  const y = max === min ? 30 : 50 - ((parseFloat(e.weight) - min) / (max - min)) * 40;
                  return `${x},${y}`;
                }).join(' L ')} L ${(Math.max(entries.length * 60, 200) - 10)},60 L 10,60 Z`}
                fill="url(#wg)"
              />
              <polyline
                points={entries.map((e, i) => {
                  const x = (i / (entries.length - 1)) * (Math.max(entries.length * 60, 200) - 20) + 10;
                  const y = max === min ? 30 : 50 - ((parseFloat(e.weight) - min) / (max - min)) * 40;
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="#c8ff00"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </>
          )}
        </svg>
      </div>

      {/* Last entries */}
      <div className="space-y-2 mb-4 max-h-36 overflow-y-auto">
        {[...entries].reverse().map((e, i) => (
          <div key={i} className="flex justify-between items-center text-sm py-1.5 border-b border-white/[0.04] last:border-b-0">
            <span className="text-text-dim font-medium">{e.date}</span>
            <span className="font-bold">{e.weight} kg</span>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="number"
          step="0.1"
          placeholder="74.5 kg"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addEntry()}
          className="flex-1 bg-bg-elev border border-border rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-accent transition-colors text-text placeholder:text-text-dim font-[inherit]"
        />
        <button
          onClick={addEntry}
          className="bg-accent text-bg px-5 py-3 rounded-xl text-sm font-bold hover:bg-accent-dim transition-colors"
        >
          + Pridať
        </button>
      </div>
    </Card>
  );
}

// MEDITATION
function Meditation() {
  const [logged, setLogged] = useState(false);
  const [minutes, setMinutes] = useState('20');

  return (
    <Card>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold tracking-[-0.02em]">Meditácia</h3>
        <span className="text-xs font-semibold px-2 py-1 rounded-md bg-bg-elev text-text-dim">Streak · 14 dní</span>
      </div>
      <div className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all mb-4 ${logged ? 'bg-accent/[0.04] border-accent/30' : 'bg-bg-elev border-border hover:border-border-strong'}`}
        onClick={() => setLogged(!logged)}>
        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl transition-all ${logged ? 'bg-accent border-accent text-bg' : 'border-border-strong text-text-dim'}`}>
          {logged ? '✓' : '🧘'}
        </div>
        <div>
          <div className="text-sm font-bold">{logged ? 'Hotovo · ' + minutes + ' min' : 'Ešte nespravené'}</div>
          <div className="text-xs text-text-dim font-medium">Cieľ · 20 min denne</div>
        </div>
      </div>
      <div className="flex gap-2">
        <input
          type="number"
          value={minutes}
          onChange={e => setMinutes(e.target.value)}
          className="w-24 bg-bg-elev border border-border rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-accent transition-colors text-text font-[inherit]"
        />
        <span className="flex items-center text-sm text-text-dim font-medium">minút</span>
      </div>
    </Card>
  );
}

// SKINCARE
function Skincare() {
  const [done, setDone] = useState(false);
  const products = ['Moisturizer', 'Vitamin C sérum + gua sha', 'Hydrating cream'];
  return (
    <Card>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold tracking-[-0.02em]">Skincare · AM</h3>
        <span className={`text-xs font-bold px-2 py-1 rounded-md ${done ? 'bg-accent/10 text-accent' : 'bg-bg-elev text-text-dim'}`}>
          {done ? 'Hotovo' : 'Ranná'}
        </span>
      </div>
      <button
        onClick={() => setDone(!done)}
        className={`w-full flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all mb-4 ${done ? 'bg-accent/[0.04] border-accent/30' : 'bg-bg-elev border-border hover:border-border-strong'}`}
      >
        <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center text-xl flex-shrink-0 transition-all ${done ? 'bg-accent border-accent text-bg' : 'border-border-strong text-text-dim'}`}>
          {done ? '✓' : '○'}
        </div>
        <div className="text-left">
          <div className="text-sm font-bold">{done ? 'Hotovo · ranná rutina' : 'Ešte nespravené'}</div>
          <div className="text-xs text-text-dim font-medium">{done ? 'Klikni pre reset' : 'Klikni keď máš hotovo'}</div>
        </div>
      </button>
      <div className="bg-bg-elev rounded-xl p-4">
        <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-3">Produkty</div>
        {products.map((p, i) => (
          <div key={i} className="text-xs font-medium py-1 text-text/85 pl-3 relative">
            <span className="absolute left-0 text-warm font-bold">·</span>{p}
          </div>
        ))}
      </div>
    </Card>
  );
}

// STUDY TRACKER
function Study() {
  const [hours, setHours] = useState('');
  const [subject, setSubject] = useState('Matematika');
  const [log, setLog] = useState([
    { subject: 'Matematika', hours: '1.5', date: 'Dnes' },
    { subject: 'Slovenčina', hours: '2.0', date: 'Včera' },
  ]);

  const add = () => {
    if (!hours) return;
    setLog(prev => [{ subject, hours, date: 'Dnes' }, ...prev]);
    setHours('');
  };

  const totalHours = log.reduce((a, b) => a + parseFloat(b.hours), 0).toFixed(1);

  return (
    <Card>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold tracking-[-0.02em]">Štúdium · Maturita</h3>
        <span className="text-xs font-semibold px-2 py-1 rounded-md bg-bg-elev text-text-dim">18 dní</span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-bg-elev rounded-xl p-4">
          <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1">Celkom doteraz</div>
          <div className="text-2xl font-bold tracking-[-0.025em]">{totalHours}<span className="text-sm text-text-dim font-semibold ml-1">h</span></div>
        </div>
        <div className="bg-bg-elev rounded-xl p-4">
          <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1">Dnes</div>
          <div className="text-2xl font-bold tracking-[-0.025em] text-accent">
            {log.filter(l => l.date === 'Dnes').reduce((a, b) => a + parseFloat(b.hours), 0).toFixed(1)}
            <span className="text-sm text-text-dim font-semibold ml-1">h</span>
          </div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        {log.slice(0, 4).map((l, i) => (
          <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-white/[0.04] last:border-b-0">
            <div>
              <span className="font-semibold">{l.subject}</span>
              <span className="text-text-dim ml-2 text-xs">{l.date}</span>
            </div>
            <span className="font-bold">{l.hours}h</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <select
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className="bg-bg-elev border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-accent text-text font-[inherit] flex-1"
        >
          {['Matematika', 'Slovenčina', 'Angličtina', 'Fyzika', 'Biológia', 'Chémia', 'Dejepis'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input
          type="number"
          step="0.5"
          placeholder="1.5h"
          value={hours}
          onChange={e => setHours(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          className="w-20 bg-bg-elev border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-accent text-text font-[inherit]"
        />
        <button onClick={add} className="bg-accent text-bg px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-accent-dim transition-colors">+</button>
      </div>
    </Card>
  );
}

// TRACKERS ROW
function MiniTrackers() {
  const [caffeine, setCaffeine] = useState(240);
  const [screenPC, setScreenPC] = useState(4.0);
  const [screenPhone, setScreenPhone] = useState(1.4);
  const [english, setEnglish] = useState(47);
  const [dates, setDates] = useState(4);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {[
        { label: 'Kofeín', value: caffeine, unit: 'mg', max: 400, color: '#ff7849', set: setCaffeine, step: 80, desc: `${Math.round(caffeine / 80)} espresso` },
        { label: 'Screen · PC', value: screenPC, unit: 'h', max: 10, color: '#6db6ff', set: setScreenPC, step: 0.5, desc: `${(10 - screenPC).toFixed(1)}h zostatok` },
        { label: 'Screen · Phone', value: screenPhone, unit: 'h', max: 4, color: '#ff5d7a', set: setScreenPhone, step: 0.5, desc: `Cieľ max 4h` },
        { label: 'Angličtina', value: english, unit: 'min', max: 120, color: '#4ade80', set: setEnglish, step: 15, desc: 'Cieľ 120 min' },
        { label: 'Dates', value: dates, unit: 'h', max: 10, color: '#a78bfa', set: setDates, step: 1, desc: 'Tento týždeň' },
      ].map(t => (
        <div key={t.label} className="bg-bg-card border border-border rounded-2xl p-5">
          <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-3">{t.label}</div>
          <div className="text-2xl font-bold tracking-[-0.025em] mb-1">
            {t.value}<span className="text-sm text-text-dim font-semibold ml-1">{t.unit}</span>
          </div>
          <div className="text-[10px] text-text-dim font-medium mb-3">{t.desc}</div>
          <div className="h-1 bg-bg-elev rounded-full overflow-hidden mb-3">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min((t.value / t.max) * 100, 100)}%`, background: t.color }} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => t.set(v => Math.max(0, +(v - t.step).toFixed(1)))} className="flex-1 bg-bg-elev rounded-lg py-1.5 text-sm font-bold hover:bg-bg-hover transition-colors">−</button>
            <button onClick={() => t.set(v => +(v + t.step).toFixed(1))} className="flex-1 bg-bg-elev rounded-lg py-1.5 text-sm font-bold hover:bg-bg-hover transition-colors">+</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// TIMELINE
function Timeline() {
  const [events] = useState([
    { time: '07:42', label: 'Wake up', color: '#6db6ff' },
    { time: '08:00', label: 'Skincare rutina', color: '#a78bfa' },
    { time: '08:15', label: 'Beh 5.2 km', color: '#ff7849' },
    { time: '09:30', label: 'Deep work · UGC scripty', color: '#c8ff00' },
    { time: '11:00', label: 'Call · Texas Land Co', color: '#4ade80' },
    { time: '12:30', label: 'Obed', color: '#ff5d7a' },
    { time: '13:30', label: 'Štúdium · matematika', color: '#6db6ff' },
    { time: '15:00', label: 'Meditácia 20min', color: '#2dd4bf' },
  ]);

  return (
    <Card>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold tracking-[-0.02em]">Timeline dňa</h3>
        <span className="text-xs text-text-dim font-medium">Hodinový log</span>
      </div>
      <div className="space-y-0">
        {events.map((e, i) => (
          <div key={i} className="grid grid-cols-[64px_1fr] gap-3 py-3 border-b border-white/[0.04] last:border-b-0 items-center">
            <div className="text-xs text-text-dim font-semibold">{e.time}</div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: e.color }} />
              {e.label}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function PersonalPage() {
  return (
    <>
      <TopBar />
      <main className="px-4 md:px-8 py-6 md:py-8 max-w-[1400px] mx-auto pb-24 lg:pb-8">

        <SectionHeader title="Kroky k vízii" meta="Denné" />
        <VisionSteps />

        <SectionHeader title="Telo · Spánok & Šport" meta="Garmin sync" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Sleep />
          <Sport />
        </div>

        <SectionHeader title="Váha" meta="Denný záznam" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <WeightTracker />
          <Skincare />
        </div>

        <SectionHeader title="Myseľ & Štúdium" meta="Manuálny tracker" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Meditation />
          <Study />
        </div>

        <SectionHeader title="Denné metriky" meta="Manuálny tracker" />
        <MiniTrackers />

        <SectionHeader title="Timeline dňa" meta="Čo si robil hodinu po hodine" />
        <Timeline />

      </main>
      <MobileNav />
    </>
  );
}
