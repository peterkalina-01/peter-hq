'use client';

import TopBar from '@/components/TopBar';
import MobileNav from '@/components/MobileNav';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type Period = 'Deň' | 'Week' | 'Month';

type DayLog = {
  date: string;
  vision_step_1: boolean; vision_step_2: boolean; vision_step_3: boolean; vision_step_4: boolean;
  skincare_am: boolean;
  meditation_done: boolean; meditation_minutes: number;
  work_deep_hours: number; work_calls_hours: number; work_admin_hours: number; work_content_hours: number;
  workout_done: boolean; workout_type: string;
  screen_pc_hours: number; screen_phone_hours: number;
  english_minutes: number; dates_minutes: number;
  weight_kg: number | null;
};

function Ring({ pct, color, size = 80, stroke = 7, children }: {
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

function LineChart({ data, color, height = 50 }: { data: number[]; color: string; height?: number }) {
  if (data.length < 2) return <div className="h-12 bg-bg-elev rounded-lg flex items-center justify-center text-xs text-text-dim">Málo dát</div>;
  const W = 300; const H = height;
  const min = Math.min(...data); const max = Math.max(...data);
  const range = max - min || 1;
  const toX = (i: number) => (i / (data.length - 1)) * W;
  const toY = (v: number) => H - ((v - min) / range) * H * 0.8 - H * 0.1;
  const pts = data.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`);
  const pathD = `M ${pts.join(' L ')}`;
  const areaD = `${pathD} L ${toX(data.length-1)},${H} L 0,${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`lg${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#lg${color.replace('#','')})`}/>
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {data.map((v, i) => <circle key={i} cx={toX(i)} cy={toY(v)} r="2.5" fill={color}/>)}
    </svg>
  );
}

function MetricCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-bg-card border border-border rounded-2xl p-5 ${className}`}>
      <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-4">{title}</div>
      {children}
    </div>
  );
}

function SummaryRow({ type, text }: { type: 'good' | 'warn' | 'bad'; text: string }) {
  const cfg = {
    good: { icon: '✓', color: '#c8ff00', bg: 'rgba(200,255,0,0.06)', border: 'rgba(200,255,0,0.15)' },
    warn: { icon: '↑', color: '#ff7849', bg: 'rgba(255,120,73,0.06)', border: 'rgba(255,120,73,0.15)' },
    bad: { icon: '⚠', color: '#ff5d7a', bg: 'rgba(255,93,122,0.06)', border: 'rgba(255,93,122,0.15)' },
  }[type];
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border" style={{ background: cfg.bg, borderColor: cfg.border }}>
      <span className="text-xs font-bold mt-0.5 flex-shrink-0" style={{ color: cfg.color }}>{cfg.icon}</span>
      <span className="text-sm font-medium text-text/90">{text}</span>
    </div>
  );
}

export default function ReportPage() {
  const [period, setPeriod] = useState<Period>('Deň');
  const [logs, setLogs] = useState<DayLog[]>([]);
  const [caffeineToday, setCaffeineToday] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stripe, setStripe] = useState<{ mrr: number; revenue7d: number; activeCustomers: number } | null>(null);
  const [ghl, setGhl] = useState<{ totalPipelineValue: number; wonDeals: number; appointments: { id: string }[] } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const today = new Date().toISOString().split('T')[0];
      const monthAgo = new Date(Date.now() - 30 * 24 * 3600000).toISOString().split('T')[0];

      const [logsRes, cafRes, stripeRes, ghlRes] = await Promise.all([
        supabase.from('daily_logs').select('*').gte('date', monthAgo).order('date', { ascending: true }),
        supabase.from('caffeine_log').select('mg, time_logged').eq('date', today),
        fetch('/api/stripe').then(r => r.json()).catch(() => null),
        fetch('/api/ghl').then(r => r.json()).catch(() => null),
      ]);

      if (logsRes.data) setLogs(logsRes.data as DayLog[]);
      if (cafRes.data) {
        const nowH = new Date().getHours() + new Date().getMinutes() / 60;
        const total = cafRes.data.reduce((sum, e) => {
          const [hh, mm] = e.time_logged.split(':').map(Number);
          const entryH = hh + mm / 60;
          if (nowH < entryH) return sum;
          return sum + e.mg * Math.pow(0.5, (nowH - entryH) / 5);
        }, 0);
        setCaffeineToday(Math.round(total));
      }
      if (stripeRes && !stripeRes.error) setStripe(stripeRes);
      if (ghlRes && !ghlRes.error) setGhl(ghlRes);
      setLoading(false);
    };
    loadData();
  }, []);

  // Filter logs by period
  const now = new Date();
  const filteredLogs = logs.filter(l => {
    const d = new Date(l.date);
    if (period === 'Deň') return l.date === now.toISOString().split('T')[0];
    if (period === 'Week') return (now.getTime() - d.getTime()) <= 7 * 24 * 3600000;
    return true;
  });

  const today = filteredLogs[filteredLogs.length - 1];
  const count = filteredLogs.length || 1;

  // Aggregated stats
  const visionDone = filteredLogs.reduce((s, l) => s + [l.vision_step_1, l.vision_step_2, l.vision_step_3, l.vision_step_4].filter(Boolean).length, 0);
  const visionTotal = count * 4;
  const visionPct = visionTotal > 0 ? (visionDone / visionTotal) * 100 : 0;

  const workoutDays = filteredLogs.filter(l => l.workout_done).length;
  const workoutGoal = period === 'Deň' ? 1 : period === 'Week' ? 5 : 20;
  const workoutPct = Math.min((workoutDays / workoutGoal) * 100, 100);

  const totalWork = filteredLogs.reduce((s, l) => s + (l.work_deep_hours || 0) + (l.work_calls_hours || 0) + (l.work_admin_hours || 0) + (l.work_content_hours || 0), 0);
  const workGoal = period === 'Deň' ? 8 : period === 'Week' ? 56 : 240;
  const workPct = Math.min((totalWork / workGoal) * 100, 100);

  const meditationDays = filteredLogs.filter(l => l.meditation_done).length;
  const meditationMins = filteredLogs.reduce((s, l) => s + (l.meditation_minutes || 0), 0);
  const meditationGoal = period === 'Deň' ? 20 : period === 'Week' ? 140 : 600;
  const meditationPct = Math.min((meditationMins / meditationGoal) * 100, 100);

  const weights = logs.filter(l => l.weight_kg).map(l => ({ date: l.date, kg: l.weight_kg as number }));
  const weightDiff = weights.length >= 2 ? (weights[weights.length-1].kg - weights[0].kg).toFixed(1) : null;

  const avgPCScreen = filteredLogs.reduce((s, l) => s + (l.screen_pc_hours || 0), 0) / count;
  const avgPhoneScreen = filteredLogs.reduce((s, l) => s + (l.screen_phone_hours || 0), 0) / count;
  const totalDates = filteredLogs.reduce((s, l) => s + (l.dates_minutes || 0), 0);

  // Work trend
  const workTrend = filteredLogs.slice(-7).map(l => (l.work_deep_hours || 0) + (l.work_calls_hours || 0));

  // Skincare days
  const skincareDays = filteredLogs.filter(l => l.skincare_am).length;

  // Generate AI summary
  const summaries: { type: 'good' | 'warn' | 'bad'; text: string }[] = [];
  if (visionPct >= 75) summaries.push({ type: 'good', text: `Steps k vízii ${Math.round(visionPct)}% — konzistentný. Keep going.` });
  else summaries.push({ type: 'warn', text: `Steps k vízii len ${Math.round(visionPct)}%. Every day 4/4 je základ.` });
  if (workoutDays >= workoutGoal * 0.8) summaries.push({ type: 'good', text: `Workout ${workoutDays}/${workoutGoal} days — cieľ splnený.` });
  else summaries.push({ type: 'warn', text: `Workout ${workoutDays}/${workoutGoal} days. Remaining ${workoutGoal - workoutDays} tréningov.` });
  if (workPct >= 70) summaries.push({ type: 'good', text: `Work time ${totalWork.toFixed(1)}h / ${workGoal}h — dobrý výkon.` });
  else summaries.push({ type: 'warn', text: `Work time ${totalWork.toFixed(1)}h of ${workGoal}h goal. Add more deep work blocks in the morning.` });
  if (meditationPct >= 80) summaries.push({ type: 'good', text: `Meditation ${meditationMins} min — streak funguje.` });
  else summaries.push({ type: 'bad', text: `Meditation ${meditationMins} min / ${meditationGoal} min goal. Add 20 min before bed.` });

  if (loading) return (
    <>
      <TopBar />
      <main className="flex items-center justify-center h-[60vh]">
        <div className="text-text-dim text-sm animate-pulse">Loading data from Supabase...</div>
      </main>
      <MobileNav />
    </>
  );

  return (
    <>
      <TopBar />
      <main className="px-4 md:px-6 py-5 max-w-[1400px] mx-auto pb-24 lg:pb-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-[-0.03em]">Report</h1>
            <p className="text-xs text-text-dim mt-1">{logs.length} days of data · Supabase live</p>
          </div>
          <div className="flex gap-1 bg-bg-elev border border-border rounded-xl p-1">
            {(['Deň', 'Week', 'Month'] as Period[]).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${period === p ? 'bg-accent text-bg' : 'text-text-dim hover:text-text'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {logs.length === 0 && (
          <div className="bg-bg-card border border-border rounded-2xl p-8 text-center mb-6">
            <div className="text-4xl mb-3 opacity-20">📊</div>
            <div className="text-base font-bold mb-1">No data yet</div>
            <div className="text-sm text-text-dim">Start logging activities on the Personal page — data will appear here automatically.</div>
          </div>
        )}

        {/* Rings */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <MetricCard title="Steps k vízii">
            <div className="flex items-center gap-3">
              <Ring pct={visionPct} color="#ff7849" size={72} stroke={6}>
                <span className="text-sm font-bold text-accent">{Math.round(visionPct)}%</span>
              </Ring>
              <div>
                <div className="text-lg font-bold">{visionDone}/{visionTotal}</div>
                <div className="text-xs text-text-dim">completed</div>
                <div className="text-xs mt-1" style={{ color: visionPct >= 75 ? '#c8ff00' : '#ff7849' }}>
                  {visionPct >= 75 ? '✓ Good performance' : '↑ Improve'}
                </div>
              </div>
            </div>
          </MetricCard>

          <MetricCard title="Workout">
            <div className="flex items-center gap-3">
              <Ring pct={workoutPct} color="#ff7849" size={72} stroke={6}>
                <span className="text-sm font-bold text-accent">{workoutDays}</span>
              </Ring>
              <div>
                <div className="text-lg font-bold">{workoutDays}/{workoutGoal}</div>
                <div className="text-xs text-text-dim">days</div>
                <div className="text-xs mt-1" style={{ color: workoutPct >= 80 ? '#c8ff00' : '#ff7849' }}>
                  {workoutPct >= 80 ? '✓ Goal' : '↑ Keep going'}
                </div>
              </div>
            </div>
          </MetricCard>

          <MetricCard title="Work time">
            <div className="flex items-center gap-3">
              <Ring pct={workPct} color="#c8ff00" size={72} stroke={6}>
                <span className="text-sm font-bold" style={{ color: '#c8ff00' }}>{Math.round(workPct)}%</span>
              </Ring>
              <div>
                <div className="text-lg font-bold">{totalWork.toFixed(1)}h</div>
                <div className="text-xs text-text-dim">/ {workGoal}h</div>
              </div>
            </div>
            {workTrend.length > 1 && <div className="mt-3"><LineChart data={workTrend} color="#c8ff00" height={35}/></div>}
          </MetricCard>

          <MetricCard title="Meditation">
            <div className="flex items-center gap-3">
              <Ring pct={meditationPct} color="#2dd4bf" size={72} stroke={6}>
                <span className="text-sm font-bold text-teal">{meditationMins}m</span>
              </Ring>
              <div>
                <div className="text-lg font-bold">{meditationDays}</div>
                <div className="text-xs text-text-dim">days / {count}</div>
                <div className="text-xs text-teal mt-1">{meditationPct >= 80 ? '✓ Streak' : '↑ Every day'}</div>
              </div>
            </div>
          </MetricCard>
        </div>

        {/* Second row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">

          <MetricCard title="Weight">
            {weights.length >= 2 ? (
              <>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <div className="text-2xl font-bold">{weights[weights.length-1].kg} kg</div>
                    <div className="text-xs" style={{ color: parseFloat(weightDiff!) <= 0 ? '#c8ff00' : '#ff5d7a' }}>
                      {parseFloat(weightDiff!) <= 0 ? '↓' : '↑'} {Math.abs(parseFloat(weightDiff!))} kg · {period}
                    </div>
                  </div>
                </div>
                <LineChart data={weights.slice(-10).map(w => w.kg)} color="#c8ff00" height={50}/>
              </>
            ) : (
              <div className="text-xs text-text-dim text-center py-6">Log weight on Personal page</div>
            )}
          </MetricCard>

          <MetricCard title="Caffeine · today">
            <div className="flex justify-between items-center mb-3">
              <div className="text-2xl font-bold" style={{ color: caffeineToday > 200 ? '#ff5d7a' : caffeineToday > 100 ? '#ff7849' : '#c8ff00' }}>
                {caffeineToday}mg
              </div>
              <div className="text-xs text-text-dim">Currently active</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs"><span className="text-text-dim">Skincare days</span><span className="font-bold">{skincareDays}/{count}</span></div>
              <div className="flex justify-between text-xs"><span className="text-text-dim">English</span><span className="font-bold">{filteredLogs.reduce((s, l) => s + (l.english_minutes || 0), 0)} min</span></div>
              <div className="flex justify-between text-xs"><span className="text-text-dim">Dates</span><span className="font-bold">{(totalDates / 60).toFixed(1)}h</span></div>
            </div>
          </MetricCard>

          <MetricCard title="Screen time">
            <div className="space-y-3">
              {[
                { label: 'PC avg', val: avgPCScreen, goal: 10, color: '#6db6ff' },
                { label: 'Phone avg', val: avgPhoneScreen, goal: 4, color: '#ff5d7a' },
              ].map(s => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-text-dim">{s.label}</span>
                    <span className="font-bold">{s.val.toFixed(1)}h</span>
                  </div>
                  <div className="h-2 bg-bg-elev rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min((s.val / s.goal) * 100, 100)}%`, background: s.color }}/>
                  </div>
                </div>
              ))}
              <div className="text-[10px] text-text-dim mt-2">Log screen time manually on Personal page</div>
            </div>
          </MetricCard>

          <MetricCard title="Business">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'MRR', value: stripe ? `$${stripe.mrr.toLocaleString()}` : '—', color: '#ff7849' },
                { label: 'Clients', value: stripe ? `${stripe.activeCustomers}` : '—', color: '#c8ff00' },
                { label: 'Pipeline', value: ghl ? `$${ghl.totalPipelineValue.toLocaleString()}` : '—', color: '#6db6ff' },
                { label: 'Closed', value: ghl ? `${ghl.wonDeals}` : '—', color: '#4ade80' },
              ].map(k => (
                <div key={k.label} className="bg-bg-elev rounded-xl p-3">
                  <div className="text-[10px] text-text-dim mb-1">{k.label}</div>
                  <div className="text-base font-bold" style={{ color: k.color }}>{k.value}</div>
                </div>
              ))}
            </div>
          </MetricCard>

          <MetricCard title="Dates" className="md:col-span-1">
            <div className="flex items-center gap-4">
              <Ring pct={Math.min((totalDates / (period === 'Deň' ? 180 : period === 'Week' ? 600 : 2400)) * 100, 100)}
                color="#a78bfa" size={72} stroke={6}>
                <span className="text-sm font-bold text-violet">{(totalDates / 60).toFixed(1)}h</span>
              </Ring>
              <div>
                <div className="text-lg font-bold">{(totalDates / 60).toFixed(1)}h</div>
                <div className="text-xs text-text-dim">{period}</div>
              </div>
            </div>
          </MetricCard>

        </div>

        {/* AI Summary */}
        <div className="bg-bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-bold text-sm text-bg">AI</div>
            <div>
              <div className="text-sm font-bold">Zhrnutie · {period}</div>
              <div className="text-xs text-text-dim">
                {logs.length > 0 ? 'Analysis of your real data' : 'No data yet na analýzu'}
              </div>
            </div>
          </div>
          {summaries.length > 0 ? (
            <div className="space-y-3">
              {summaries.map((s, i) => <SummaryRow key={i} type={s.type} text={s.text}/>)}
            </div>
          ) : (
            <div className="text-sm text-text-dim text-center py-4">Start logging activities — summary will appear automatically.</div>
          )}
        </div>

      </main>
      <MobileNav />
    </>
  );
}
