'use client';

import { useState } from 'react';

function Module({
  title,
  badge,
  badgeLive,
  children,
}: {
  title: string;
  badge?: string;
  badgeLive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-bg-card border border-border rounded-2xl p-[22px] transition-all hover:border-border-strong">
      <div className="flex justify-between items-start mb-[18px]">
        <h3 className="text-base font-bold tracking-[-0.015em]">{title}</h3>
        {badge && (
          <span
            className={`text-[11px] font-semibold px-[9px] py-1 rounded-md ${
              badgeLive ? 'text-accent bg-accent/10' : 'text-text-dim bg-bg-elev'
            }`}
          >
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function SleepModule() {
  return (
    <Module title="Spánok" badge="Garmin" badgeLive>
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-[42px] font-bold leading-none text-cool tracking-[-0.03em]">6:42</span>
        <span className="text-[13px] text-text-dim font-semibold">hod</span>
      </div>
      <div className="flex h-1.5 rounded-md overflow-hidden mb-3.5 bg-bg-elev">
        <div style={{ width: '22%', background: '#6db6ff' }} />
        <div style={{ width: '48%', background: '#2dd4bf' }} />
        <div style={{ width: '18%', background: '#c8ff00' }} />
        <div style={{ width: '12%', background: '#ff7849' }} />
      </div>
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-text-dim font-semibold uppercase tracking-wider">Deep</span>
          <span className="text-sm font-bold">1h 28m</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-text-dim font-semibold uppercase tracking-wider">REM</span>
          <span className="text-sm font-bold">1h 12m</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-text-dim font-semibold uppercase tracking-wider">Skóre</span>
          <span className="text-sm font-bold text-accent">78</span>
        </div>
      </div>
    </Module>
  );
}

function SportModule() {
  const items = [
    { icon: 'R', name: 'Ranný beh', meta: '5.2 km · 28 min · pace 5:23', value: '5.2 km', cls: 'bg-warm/15 text-warm' },
    { icon: 'G', name: 'Push workout', meta: '42 min · plánované 18:00', value: 'later', cls: 'bg-cool/15 text-cool' },
    { icon: '♥', name: 'Resting HR', meta: '7-day average', value: '52 bpm', cls: 'bg-rose/15 text-rose' },
  ];
  return (
    <Module title="Šport dnes" badge="Garmin" badgeLive>
      <div className="flex flex-col gap-3.5">
        {items.map((it) => (
          <div key={it.name} className="flex justify-between items-center p-3.5 bg-bg-elev rounded-xl">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[13px] ${it.cls}`}>
                {it.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-semibold">{it.name}</span>
                <span className="text-[11px] text-text-dim font-medium">{it.meta}</span>
              </div>
            </div>
            <span className="text-base font-bold whitespace-nowrap">{it.value}</span>
          </div>
        ))}
      </div>
    </Module>
  );
}

function TimelineModule() {
  const events = [
    { time: '07:42', label: 'Wake + meditácia 12min', color: '#6db6ff' },
    { time: '08:00', label: 'Skincare rutina', color: '#a78bfa' },
    { time: '08:15', label: 'Beh 5.2 km', color: '#ff7849' },
    { time: '09:30', label: 'Deep work · UGC scripty', color: '#c8ff00' },
    { time: '11:00', label: 'Call · Texas Land Co', color: '#4ade80' },
    { time: '12:30', label: 'Lunch + štúdium', color: '#ff5d7a' },
  ];
  return (
    <Module title="Timeline dňa" badge="07:42 → teraz">
      <div className="space-y-0">
        {events.map((e, i) => (
          <div
            key={i}
            className="grid grid-cols-[56px_1fr] gap-3 py-2.5 items-center border-b border-white/[0.04] last:border-b-0"
          >
            <div className="text-xs text-text-dim font-semibold">{e.time}</div>
            <div className="flex items-center gap-2 text-[13px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: e.color }} />
              {e.label}
            </div>
          </div>
        ))}
      </div>
    </Module>
  );
}

function SkincareModule() {
  const [done, setDone] = useState(false);
  const products = ['Moisturizer', 'Vitamin C sérum + gua sha', 'Hydrating cream'];

  return (
    <Module title="Skincare" badge={done ? 'Spravené' : 'Ranná'} badgeLive={done}>
      <div className="flex flex-col gap-4">
        <button
          onClick={() => setDone(!done)}
          className={`flex items-center gap-3.5 p-[18px] rounded-xl cursor-pointer border transition-all w-full text-left ${
            done
              ? 'bg-accent/[0.04] border-accent/30'
              : 'bg-bg-elev border-border hover:border-border-strong'
          }`}
        >
          <div
            className={`w-11 h-11 rounded-full border-2 flex items-center justify-center text-xl flex-shrink-0 transition-all ${
              done
                ? 'bg-accent border-accent text-bg'
                : 'border-border-strong text-text-dim'
            }`}
          >
            {done ? '✓' : '○'}
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold mb-0.5 tracking-[-0.01em]">
              {done ? 'Hotovo · ranná rutina' : 'Ešte nespravené'}
            </div>
            <div className="text-[11px] text-text-dim font-medium">
              {done ? 'Klikni pre reset' : 'Klikni keď máš hotovo'}
            </div>
          </div>
        </button>
        <div className="p-3.5 bg-bg-elev rounded-xl">
          <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-2">
            Body
          </div>
          {products.map((p, i) => (
            <div
              key={i}
              className="text-xs font-medium py-1 text-text/85 pl-3 relative"
            >
              <span className="absolute left-0 text-warm font-bold">·</span>
              {p}
            </div>
          ))}
        </div>
      </div>
    </Module>
  );
}

function CallsModule() {
  return (
    <Module title="Cally" badge="3 dnes · 2 zajtra">
      <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-border">
        <div>
          <div className="text-2xl font-bold leading-none mb-1.5 tracking-[-0.025em]">14</div>
          <div className="text-[11px] text-text-dim font-semibold">Týždeň</div>
        </div>
        <div>
          <div className="text-2xl font-bold leading-none mb-1.5 text-accent tracking-[-0.025em]">4</div>
          <div className="text-[11px] text-text-dim font-semibold">Closed</div>
        </div>
        <div>
          <div className="text-2xl font-bold leading-none mb-1.5 tracking-[-0.025em]">28%</div>
          <div className="text-[11px] text-text-dim font-semibold">Close rate</div>
        </div>
      </div>
      <div className="space-y-0">
        {[
          { name: 'Texas Land Co · 11:00', score: 'A · 87', cls: 'bg-accent/12 text-accent' },
          { name: 'Pine Ridge Clearing', score: 'B · 71', cls: 'bg-warm/12 text-warm' },
          { name: 'DeepRoot Services', score: 'A · 82', cls: 'bg-accent/12 text-accent' },
        ].map((c, i) => (
          <div
            key={i}
            className="text-[13px] py-2.5 flex justify-between items-center border-b border-white/[0.04] last:border-b-0"
          >
            <span className="font-semibold">{c.name}</span>
            <span className={`text-[11px] px-2 py-1 rounded font-bold ${c.cls}`}>{c.score}</span>
          </div>
        ))}
      </div>
    </Module>
  );
}

function PipelineModule() {
  const items = [
    { name: 'Lonestar Land Group', meta: 'Hot · proposal · 3 dni', value: '$8,400', cls: 'border-l-accent' },
    { name: 'Cypress Tree Pro', meta: 'Warm · 2. call · piatok', value: '$6,200', cls: 'border-l-warm' },
    { name: 'Brushhog Brothers', meta: 'Warm · čaká referencie', value: '$5,400', cls: 'border-l-warm' },
    { name: 'Iron Oak Excavation', meta: 'Cold · 1. kontakt', value: '$4,800', cls: 'border-l-cool' },
  ];
  return (
    <Module title="Pipeline" badge="$32,800">
      <div className="space-y-2.5">
        {items.map((p) => (
          <div
            key={p.name}
            className={`grid grid-cols-[1fr_auto] gap-3 p-3.5 bg-bg-elev rounded-xl border-l-[3px] items-center ${p.cls}`}
          >
            <div>
              <div className="text-[13px] font-semibold mb-0.5">{p.name}</div>
              <div className="text-[11px] text-text-dim font-medium">{p.meta}</div>
            </div>
            <div className="text-base font-bold text-accent tracking-[-0.02em]">{p.value}</div>
          </div>
        ))}
      </div>
    </Module>
  );
}

function VisionStepsModule() {
  const [tasks, setTasks] = useState([
    { text: 'Outreach · 30 firiem', tag: 'Vízia', done: true },
    { text: 'UGC script · 3 nové hooky', tag: 'Vízia', done: true },
    { text: 'Roleplay · 2 sessions', tag: 'Sales', done: true },
    { text: 'Edit case study · Pine Ridge', tag: 'Vízia', done: false },
    { text: 'Maturita · matematika 2h', tag: 'Štúdium', done: false },
  ]);

  const toggle = (i: number) => {
    const copy = [...tasks];
    copy[i].done = !copy[i].done;
    setTasks(copy);
  };

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <Module title="Kroky k vízii · dnes" badge={`${doneCount} / ${tasks.length}`}>
      <div className="space-y-0">
        {tasks.map((t, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className="w-full flex gap-3 py-3 border-b border-white/[0.04] last:border-b-0 items-center text-left"
          >
            <div
              className={`w-[18px] h-[18px] border-[1.5px] rounded-md flex-shrink-0 transition-all relative ${
                t.done ? 'bg-accent border-accent' : 'border-border-strong'
              }`}
            >
              {t.done && (
                <span className="absolute inset-0 flex items-center justify-center text-bg text-[11px] font-extrabold">
                  ✓
                </span>
              )}
            </div>
            <div className={`flex-1 text-[13px] font-medium ${t.done ? 'line-through text-text-subtle' : ''}`}>
              {t.text}
            </div>
            <span className="text-[10px] text-text-dim font-bold px-2 py-1 bg-bg-elev rounded">
              {t.tag}
            </span>
          </button>
        ))}
      </div>
    </Module>
  );
}

export default function DayModules() {
  return (
    <>
      <div className="flex items-baseline justify-between mb-5 mt-3">
        <h2 className="text-2xl font-bold tracking-[-0.025em]">Dnešný deň</h2>
        <div className="text-xs text-text-dim font-medium">Osobné · Biznis · Šport</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[18px] mb-9">
        <SleepModule />
        <SportModule />
        <TimelineModule />
        <SkincareModule />
        <CallsModule />
        <PipelineModule />
        <VisionStepsModule />
      </div>
    </>
  );
}
