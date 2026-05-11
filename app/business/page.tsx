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

// GOALS
function Goals() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {[
        { label: 'MRR', current: 1000, goal: 30000, color: '#c8ff00', prefix: '$', suffix: '', note: 'Zostáva $29,000 · cieľ 2027' },
        { label: 'Aktívni klienti', current: 2, goal: 10, color: '#6db6ff', prefix: '', suffix: '', note: '8 klientov zostáva' },
        { label: 'Close rate', current: 28, goal: 40, color: '#ff7849', prefix: '', suffix: '%', note: 'Priemer z posledných 30 callov' },
        { label: 'Weekly calls', current: 14, goal: 25, color: '#4ade80', prefix: '', suffix: '', note: 'Tento týždeň' },
      ].map(g => {
        const pct = Math.min((g.current / g.goal) * 100, 100);
        return (
          <div key={g.label} className="bg-bg-card border border-border rounded-2xl p-5">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold text-text-dim uppercase tracking-wider">{g.label}</span>
              <span className="text-xs font-bold" style={{ color: g.color }}>{pct.toFixed(0)}%</span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold tracking-[-0.03em]">{g.prefix}{g.current.toLocaleString()}{g.suffix}</span>
              <span className="text-sm text-text-dim font-medium">/ {g.prefix}{g.goal.toLocaleString()}{g.suffix}</span>
            </div>
            <div className="h-1.5 bg-bg-elev rounded-full overflow-hidden my-3">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: g.color }} />
            </div>
            <div className="text-xs text-text-dim font-medium">{g.note}</div>
          </div>
        );
      })}
    </div>
  );
}

// PIPELINE
function Pipeline() {
  const [deals, setDeals] = useState([
    { name: 'Lonestar Land Group', status: 'Hot', meta: 'Proposal sent · 3 dni', value: 3400, stage: 'hot' },
    { name: 'Cypress Tree Pro', status: 'Warm', meta: '2. call · piatok', value: 2400, stage: 'warm' },
    { name: 'Brushhog Brothers', status: 'Warm', meta: 'Čaká referencie', value: 1800, stage: 'warm' },
    { name: 'Iron Oak Excavation', status: 'Cold', meta: '1. kontakt', value: 800, stage: 'cold' },
  ]);

  const stageColor: Record<string, string> = {
    hot: 'border-l-accent',
    warm: 'border-l-warm',
    cold: 'border-l-cool',
    closed: 'border-l-green2',
  };

  const total = deals.reduce((a, b) => a + b.value, 0);

  return (
    <Card>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold tracking-[-0.02em]">Pipeline</h3>
        <span className="text-sm font-bold text-accent">${total.toLocaleString()}</span>
      </div>
      <div className="space-y-3">
        {deals.map((d, i) => (
          <div key={i} className={`flex justify-between items-center p-4 bg-bg-elev rounded-xl border-l-[3px] ${stageColor[d.stage]}`}>
            <div>
              <div className="text-sm font-semibold mb-0.5">{d.name}</div>
              <div className="text-xs text-text-dim font-medium">{d.status} · {d.meta}</div>
            </div>
            <div className="text-base font-bold text-accent">${d.value.toLocaleString()}</div>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 py-2.5 bg-bg-elev border border-dashed border-border-strong rounded-xl text-xs font-bold text-text-dim hover:border-accent hover:text-accent transition-all">
        + Pridať deal
      </button>
    </Card>
  );
}

// CALLS
function Calls() {
  const calls = [
    { name: 'Texas Land Co', time: '11:00', score: 87, grade: 'A', outcome: 'Follow-up' },
    { name: 'Pine Ridge Clearing', time: '14:00', score: 71, grade: 'B', outcome: 'Proposal' },
    { name: 'DeepRoot Services', time: '16:30', score: 82, grade: 'A', outcome: 'Closed ✓' },
  ];

  return (
    <Card>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold tracking-[-0.02em]">Cally</h3>
        <span className="text-xs text-text-dim font-medium">Dnes 3 · Zajtra 2</span>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-5 pb-5 border-b border-border">
        {[
          { num: '14', lbl: 'Tento týždeň' },
          { num: '4', lbl: 'Closed', color: 'text-accent' },
          { num: '28%', lbl: 'Close rate' },
        ].map(s => (
          <div key={s.lbl}>
            <div className={`text-2xl font-bold tracking-[-0.025em] mb-1 ${s.color || ''}`}>{s.num}</div>
            <div className="text-xs text-text-dim font-semibold">{s.lbl}</div>
          </div>
        ))}
      </div>
      <div className="space-y-0">
        {calls.map((c, i) => (
          <div key={i} className="flex justify-between items-center py-3 border-b border-white/[0.04] last:border-b-0">
            <div>
              <div className="text-sm font-semibold">{c.name}</div>
              <div className="text-xs text-text-dim font-medium">{c.time} · {c.outcome}</div>
            </div>
            <span className={`text-xs px-2 py-1 rounded font-bold ${c.grade === 'A' ? 'bg-accent/12 text-accent' : 'bg-warm/12 text-warm'}`}>
              {c.grade} · {c.score}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ADS
function Ads() {
  const campaigns = [
    { name: 'Land Clearing TX — Hook #1', spend: 420, leads: 12, cpl: 35, roas: 3.8, status: 'active' },
    { name: 'Land Clearing TX — Hook #2', spend: 280, leads: 6, cpl: 47, roas: 2.4, status: 'active' },
    { name: 'Land Clearing FL — Test', spend: 180, leads: 3, cpl: 60, roas: 1.9, status: 'paused' },
  ];

  return (
    <Card>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold tracking-[-0.02em]">Meta Ads</h3>
        <span className="text-xs font-semibold px-2 py-1 rounded-md bg-bg-elev text-text-dim">Pripoj Meta Ads</span>
      </div>
      <div className="grid grid-cols-4 gap-3 mb-5 pb-5 border-b border-border text-center">
        {[
          { lbl: 'Spend', val: '$880' },
          { lbl: 'Leads', val: '21' },
          { lbl: 'CPL', val: '$41.9' },
          { lbl: 'ROAS', val: '3.1×' },
        ].map(s => (
          <div key={s.lbl}>
            <div className="text-xl font-bold tracking-[-0.025em] mb-1">{s.val}</div>
            <div className="text-xs text-text-dim font-semibold">{s.lbl}</div>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {campaigns.map((c, i) => (
          <div key={i} className="p-3.5 bg-bg-elev rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold">{c.name}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${c.status === 'active' ? 'bg-accent/10 text-accent' : 'bg-bg-card text-text-dim'}`}>
                {c.status === 'active' ? 'Live' : 'Paused'}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div><span className="text-text-dim">Spend</span><br /><span className="font-bold">${c.spend}</span></div>
              <div><span className="text-text-dim">Leads</span><br /><span className="font-bold">{c.leads}</span></div>
              <div><span className="text-text-dim">CPL</span><br /><span className="font-bold">${c.cpl}</span></div>
              <div><span className="text-text-dim">ROAS</span><br /><span className="font-bold">{c.roas}×</span></div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// DAILY TASKS
function DailyTasks() {
  const [tasks, setTasks] = useState([
    { text: 'Outreach · 30 land clearing firiem', tag: 'Growth', done: true },
    { text: '$40 into ads · skontrolovať kampane', tag: 'Ads', done: true },
    { text: 'Follow-up · Lonestar Land Group', tag: 'Pipeline', done: false },
    { text: 'Napísať 3 nové UGC hooky', tag: 'Content', done: false },
    { text: 'Roleplay session · 2×', tag: 'Sales', done: false },
    { text: 'Aktualizovať case study · Pine Ridge', tag: 'Content', done: false },
  ]);

  const [newTask, setNewTask] = useState('');

  const toggle = (i: number) => {
    const copy = [...tasks];
    copy[i].done = !copy[i].done;
    setTasks(copy);
  };

  const add = () => {
    if (!newTask.trim()) return;
    setTasks(prev => [...prev, { text: newTask, tag: 'Task', done: false }]);
    setNewTask('');
  };

  const done = tasks.filter(t => t.done).length;

  return (
    <Card>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold tracking-[-0.02em]">Denné tasky</h3>
        <span className={`text-xs font-bold px-2 py-1 rounded-md ${done === tasks.length ? 'bg-accent/10 text-accent' : 'bg-bg-elev text-text-dim'}`}>
          {done} / {tasks.length}
        </span>
      </div>
      <div className="space-y-0 mb-4">
        {tasks.map((t, i) => (
          <button key={i} onClick={() => toggle(i)} className="w-full flex gap-3 py-3 border-b border-white/[0.04] last:border-b-0 items-center text-left">
            <div className={`w-[18px] h-[18px] border-[1.5px] rounded-md flex-shrink-0 relative transition-all ${t.done ? 'bg-accent border-accent' : 'border-border-strong'}`}>
              {t.done && <span className="absolute inset-0 flex items-center justify-center text-bg text-[11px] font-extrabold">✓</span>}
            </div>
            <span className={`flex-1 text-sm font-medium ${t.done ? 'line-through text-text-subtle' : ''}`}>{t.text}</span>
            <span className="text-[10px] text-text-dim font-bold px-2 py-1 bg-bg-elev rounded">{t.tag}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Pridať task..."
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          className="flex-1 bg-bg-elev border border-border rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-accent transition-colors text-text placeholder:text-text-dim font-[inherit]"
        />
        <button onClick={add} className="bg-accent text-bg px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-accent-dim transition-colors">+</button>
      </div>
    </Card>
  );
}

// SCRIPTS TRACKER
function ScriptsTracker() {
  const [sessions, setSessions] = useState([
    { type: 'Roleplay', profile: 'Skeptický prospekt', date: 'Dnes 11:00', score: 82 },
    { type: 'Script review', profile: 'Hook framework #3', date: 'Včera', score: null },
    { type: 'Roleplay', profile: 'Cenovo citlivý', date: 'Včera', score: 74 },
  ]);

  return (
    <Card>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold tracking-[-0.02em]">Skripty · Roleplay tracker</h3>
        <span className="text-xs text-text-dim font-medium">7× tento týždeň</span>
      </div>
      <div className="space-y-0">
        {sessions.map((s, i) => (
          <div key={i} className="flex justify-between items-center py-3 border-b border-white/[0.04] last:border-b-0">
            <div>
              <div className="text-sm font-semibold">{s.type}</div>
              <div className="text-xs text-text-dim font-medium">{s.profile} · {s.date}</div>
            </div>
            {s.score ? (
              <span className="text-xs px-2 py-1 rounded font-bold bg-accent/12 text-accent">{s.score}</span>
            ) : (
              <span className="text-xs px-2 py-1 rounded font-bold bg-bg-elev text-text-dim">Review</span>
            )}
          </div>
        ))}
      </div>
      <button className="w-full mt-4 py-2.5 bg-accent text-bg rounded-xl text-sm font-bold hover:bg-accent-dim transition-colors">
        + Logovať session
      </button>
    </Card>
  );
}

// UPGRADE TRACKER
function UpgradeTracker() {
  const [items, setItems] = useState([
    { text: 'Pridať video testimonials na website', category: 'Marketing', priority: 'High', done: false },
    { text: 'Automatizovať follow-up sekvenciu v GHL', category: 'Systém', priority: 'High', done: false },
    { text: 'Vytvoriť onboarding dokument pre nových klientov', category: 'Ops', priority: 'Medium', done: true },
    { text: 'Testovať nový hook formát — pain stack', category: 'Ads', priority: 'Medium', done: false },
    { text: 'Spraviť case study video — Pine Ridge', category: 'Marketing', priority: 'Low', done: false },
  ]);
  const [newItem, setNewItem] = useState('');
  const [newCat, setNewCat] = useState('Marketing');

  const toggle = (i: number) => {
    const copy = [...items];
    copy[i].done = !copy[i].done;
    setItems(copy);
  };

  const add = () => {
    if (!newItem.trim()) return;
    setItems(prev => [...prev, { text: newItem, category: newCat, priority: 'Medium', done: false }]);
    setNewItem('');
  };

  const priorityColor: Record<string, string> = {
    High: 'bg-rose/10 text-rose',
    Medium: 'bg-warm/10 text-warm',
    Low: 'bg-cool/10 text-cool',
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold tracking-[-0.02em]">Upgrady & Vylepšenia</h3>
        <span className="text-xs text-text-dim font-medium">
          {items.filter(i => !i.done).length} čaká
        </span>
      </div>
      <div className="space-y-0 mb-4">
        {items.map((it, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className="w-full flex gap-3 py-3 border-b border-white/[0.04] last:border-b-0 items-center text-left"
          >
            <div className={`w-[18px] h-[18px] border-[1.5px] rounded-md flex-shrink-0 relative transition-all ${it.done ? 'bg-accent border-accent' : 'border-border-strong'}`}>
              {it.done && <span className="absolute inset-0 flex items-center justify-center text-bg text-[11px] font-extrabold">✓</span>}
            </div>
            <span className={`flex-1 text-sm font-medium ${it.done ? 'line-through text-text-subtle' : ''}`}>{it.text}</span>
            <span className="text-[10px] font-bold px-2 py-1 bg-bg-elev rounded text-text-dim">{it.category}</span>
            <span className={`text-[10px] font-bold px-2 py-1 rounded ${priorityColor[it.priority]}`}>{it.priority}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Nový upgrade / nápad..."
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          className="flex-1 bg-bg-elev border border-border rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-accent transition-colors text-text placeholder:text-text-dim font-[inherit]"
        />
        <select
          value={newCat}
          onChange={e => setNewCat(e.target.value)}
          className="bg-bg-elev border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-accent text-text font-[inherit]"
        >
          {['Marketing', 'Systém', 'Ops', 'Ads', 'Sales', 'Tech', 'Iné'].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button onClick={add} className="bg-accent text-bg px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-accent-dim transition-colors">+</button>
      </div>
    </Card>
  );
}

export default function BusinessPage() {
  return (
    <>
      <TopBar />
      <main className="px-4 md:px-8 py-6 md:py-8 max-w-[1400px] mx-auto pb-24 lg:pb-8">

        <SectionHeader title="Ciele" meta="MRR · Klienti · Výkon" />
        <Goals />

        <SectionHeader title="Pipeline · Cally" meta="GHL live" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Pipeline />
          <Calls />
        </div>

        <SectionHeader title="Meta Ads" meta="Kampane · Spend · ROAS" />
        <Ads />

        <SectionHeader title="Denné tasky" meta="Čo posunie firmu vpred" />
        <DailyTasks />

        <SectionHeader title="Sales tréning" meta="Skripty · Roleplay · Sessions" />
        <ScriptsTracker />

        <SectionHeader title="Upgrady & Vylepšenia" meta="Nápady na zlepšenie firmy" />
        <UpgradeTracker />

      </main>
      <MobileNav />
    </>
  );
}
