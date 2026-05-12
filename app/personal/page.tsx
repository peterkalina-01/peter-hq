'use client';

import TopBar from '@/components/TopBar';
import MobileNav from '@/components/MobileNav';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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

// ─── VISION STEPS ────────────────────────────────────────────────────────────
function VisionSteps() {
  const [steps, setSteps] = useState([
    { text: '$40 into ads', done: false },
    { text: '5× Remind myself my Vision and who I am', done: false },
    { text: 'Study book and my mindset for 45min', done: false },
    { text: 'Meditation for 20min', done: false },
  ]);
  const toggle = (i: number) => {
    const c = [...steps]; c[i].done = !c[i].done; setSteps(c);
  };
  const done = steps.filter(s => s.done).length;
  return (
    <Card>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold tracking-[-0.02em]">Kroky k vízii · dnes</h3>
        <span className={`text-xs font-bold px-2 py-1 rounded-md ${done === steps.length ? 'bg-accent/10 text-accent' : 'bg-bg-elev text-text-dim'}`}>{done} / {steps.length}</span>
      </div>
      {steps.map((s, i) => (
        <button key={i} onClick={() => toggle(i)} className="w-full flex gap-3 py-3 border-b border-white/[0.04] last:border-b-0 items-center text-left">
          <div className={`w-[18px] h-[18px] border-[1.5px] rounded-md flex-shrink-0 relative transition-all ${s.done ? 'bg-accent border-accent' : 'border-border-strong'}`}>
            {s.done && <span className="absolute inset-0 flex items-center justify-center text-bg text-[11px] font-extrabold">✓</span>}
          </div>
          <span className={`flex-1 text-sm font-medium ${s.done ? 'line-through text-text-subtle' : ''}`}>{s.text}</span>
        </button>
      ))}
    </Card>
  );
}

// ─── SLEEP ───────────────────────────────────────────────────────────────────
function Sleep() {
  return (
    <Card>
      <div className="flex justify-between items-start mb-5">
        <h3 className="text-lg font-bold tracking-[-0.02em]">Spánok</h3>
        <span className="text-xs font-semibold px-2 py-1 rounded-md bg-bg-elev text-text-dim">Garmin · čoskoro</span>
      </div>
      <div className="flex items-center justify-center py-8 text-center">
        <div>
          <div className="text-3xl mb-2 opacity-30">🌙</div>
          <div className="text-sm text-text-dim font-medium">Garmin integrácia čoskoro</div>
          <div className="text-xs text-text-subtle mt-1">Spánok, HRV, RHR — automaticky</div>
        </div>
      </div>
    </Card>
  );
}

// ─── CAFFEINE TRACKER ────────────────────────────────────────────────────────
const DRINKS = [
  { name: 'Espresso', mg: 63 },
  { name: 'Cappuccino', mg: 80 },
  { name: 'Latte', mg: 75 },
  { name: 'Doppio', mg: 126 },
];

function CaffeineTracker() {
  const [entries, setEntries] = useState<{ id: string; drink: string; mg: number; time_logged: string }[]>([]);
  const [selectedDrink, setSelectedDrink] = useState(DRINKS[1]);
  const [customTime, setCustomTime] = useState(() => {
    const n = new Date();
    return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`;
  });
  const [sleepTime, setSleepTime] = useState('22:00');
  const [nowTs, setNowTs] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNowTs(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Load from Supabase
  useEffect(() => {
    const date = new Date().toISOString().split('T')[0];
    supabase.from('caffeine_log').select('*').eq('date', date).order('time_logged')
      .then(({ data }) => { if (data) setEntries(data); });
  }, []);

  const halfLifeH = 5;
  const getMgAt = (timeLogged: string, atMs: number) => {
    const [hh, mm] = timeLogged.split(':').map(Number);
    const entryMs = new Date().setHours(hh, mm, 0, 0);
    const diffH = (atMs - entryMs) / 3600000;
    if (diffH < 0) return 0;
    return Math.pow(0.5, diffH / halfLifeH);
  };

  const nowH = new Date().getHours() + new Date().getMinutes() / 60;
  const totalNow = entries.reduce((sum, e) => sum + e.mg * getMgAt(e.time_logged, nowTs), 0);

  // Graph
  const W = 300; const H = 70;
  const points = Array.from({ length: 73 }, (_, i) => {
    const h = 5 + i * (17 / 72);
    const atMs = new Date().setHours(Math.floor(h), Math.round((h % 1) * 60), 0, 0);
    const mg = entries.reduce((sum, e) => sum + e.mg * getMgAt(e.time_logged, atMs), 0);
    return { h, mg };
  });
  const maxMg = Math.max(...points.map(p => p.mg), 160);
  const toX = (h: number) => ((h - 5) / 17) * W;
  const toY = (mg: number) => H - (mg / maxMg) * H * 0.85 - 2;
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.h).toFixed(1)},${toY(p.mg).toFixed(1)}`).join(' ');
  const areaD = pathD + ` L${toX(22)},${H} L${toX(5)},${H} Z`;
  const [cutoffH] = sleepTime.split(':').map(Number);
  const cutoffDrinkH = cutoffH - 6;
  const mgAtSleep = entries.reduce((sum, e) => {
    const sleepMs = new Date().setHours(cutoffH, 0, 0, 0);
    return sum + e.mg * getMgAt(e.time_logged, sleepMs);
  }, 0);

  const addEntry = async () => {
    const date = new Date().toISOString().split('T')[0];
    const { data } = await supabase.from('caffeine_log')
      .insert({ date, drink: selectedDrink.name, mg: selectedDrink.mg, time_logged: customTime })
      .select().single();
    if (data) setEntries(prev => [...prev, data].sort((a, b) => a.time_logged.localeCompare(b.time_logged)));
  };

  const removeEntry = async (id: string) => {
    await supabase.from('caffeine_log').delete().eq('id', id);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const statusColor = totalNow > 300 ? '#ff5d7a' : totalNow > 150 ? '#ff7849' : '#c8ff00';

  return (
    <Card>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold tracking-[-0.02em]">Kofeín</h3>
          <div className="text-xs text-text-dim mt-0.5">Sync s dashboardom · poločas 5h</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color: statusColor }}>{Math.round(totalNow)}<span className="text-sm text-text-dim ml-1">mg</span></div>
          {nowH > cutoffDrinkH && <div className="text-[10px] text-rose font-semibold">Po cutoff! ~{Math.round(mgAtSleep)}mg pri spánku</div>}
        </div>
      </div>

      {/* Graph */}
      <div className="bg-bg-elev rounded-xl p-3 mb-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 70 }}>
          <defs>
            <linearGradient id="cg2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff7849" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#ff7849" stopOpacity="0"/>
            </linearGradient>
          </defs>
          {entries.length > 0 && <>
            <path d={areaD} fill="url(#cg2)"/>
            <path d={pathD} fill="none" stroke="#ff7849" strokeWidth="2" strokeLinecap="round"/>
          </>}
          <line x1={toX(cutoffDrinkH)} y1="0" x2={toX(cutoffDrinkH)} y2={H} stroke="#ff5d7a" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.7"/>
          {nowH >= 5 && nowH <= 22 && (
            <>
              <line x1={toX(nowH)} y1="0" x2={toX(nowH)} y2={H} stroke="#c8ff00" strokeWidth="1" strokeDasharray="2,2" opacity="0.5"/>
              {entries.length > 0 && <circle cx={toX(nowH)} cy={toY(totalNow)} r="3.5" fill="#c8ff00"/>}
            </>
          )}
        </svg>
        <div className="flex justify-between text-[9px] text-text-dim mt-1">
          <span>05:00</span>
          <span style={{ color: '#ff5d7a' }}>cutoff {String(cutoffDrinkH).padStart(2,'0')}:00</span>
          <span>22:00</span>
        </div>
      </div>

      {/* Entries */}
      {entries.length > 0 && (
        <div className="space-y-0 mb-4">
          {[...entries].reverse().map((e) => (
            <div key={e.id} className="flex justify-between items-center py-2 border-b border-white/[0.04] last:border-b-0 text-sm">
              <div className="flex items-center gap-2">
                <span>☕</span>
                <span className="font-semibold">{e.drink}</span>
                <span className="text-text-dim text-xs">{e.time_logged.slice(0,5)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-dim">{e.mg}mg</span>
                <button onClick={() => removeEntry(e.id)} className="text-text-dim hover:text-rose transition-colors text-xs">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {DRINKS.map(d => (
            <button key={d.name} onClick={() => setSelectedDrink(d)}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${selectedDrink.name === d.name ? 'bg-warm/10 border-warm text-warm' : 'bg-bg-elev border-border text-text-dim hover:border-border-strong'}`}>
              {d.name} <span className="opacity-60">{d.mg}mg</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="text-[10px] font-bold text-text-dim uppercase mb-1">Čas</div>
            <input type="time" value={customTime} onChange={e => setCustomTime(e.target.value)}
              className="w-full bg-bg-elev border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-accent text-text font-[inherit]"/>
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-bold text-text-dim uppercase mb-1">Spánok o</div>
            <input type="time" value={sleepTime} onChange={e => setSleepTime(e.target.value)}
              className="w-full bg-bg-elev border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-accent text-text font-[inherit]"/>
          </div>
          <div className="flex flex-col justify-end">
            <button onClick={addEntry} className="bg-warm text-bg px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90">+ Pridať</button>
          </div>
        </div>
      </div>
    </Card>
  );
}


// ─── WORKOUT TRACKER ─────────────────────────────────────────────────────────
type Exercise = { name: string; sets: { reps: number; weight: number }[] };
type WorkoutLog = { type: string; exercises: Exercise[]; date: string; duration: number };

const WORKOUT_TYPES = [
  { id: 'push', label: 'Push', color: '#ff7849', desc: 'Chest · Shoulders · Triceps' },
  { id: 'pull', label: 'Pull', color: '#6db6ff', desc: 'Back · Biceps · Rear delts' },
  { id: 'legs', label: 'Legs', color: '#c8ff00', desc: 'Quads · Hamstrings · Calves' },
  { id: 'upper', label: 'Upper', color: '#a78bfa', desc: 'Full upper body' },
  { id: 'full', label: 'Full Body', color: '#2dd4bf', desc: 'Compound movements' },
  { id: 'playground', label: 'Playground', color: '#ff5d7a', desc: 'Calisthenics · Outdoor' },
];

const PRESET_EXERCISES: Record<string, string[]> = {
  push: ['Bench Press', 'Incline Dumbbell Press', 'Overhead Press', 'Lateral Raises', 'Tricep Pushdown', 'Chest Dips'],
  pull: ['Pull-ups', 'Barbell Row', 'Cable Row', 'Lat Pulldown', 'Face Pulls', 'Bicep Curls', 'Hammer Curls'],
  legs: ['Squat', 'Romanian Deadlift', 'Leg Press', 'Leg Curl', 'Leg Extension', 'Calf Raises', 'Hip Thrust'],
  upper: ['Bench Press', 'Pull-ups', 'Overhead Press', 'Cable Row', 'Lateral Raises', 'Bicep Curls'],
  full: ['Deadlift', 'Squat', 'Bench Press', 'Pull-ups', 'Overhead Press'],
  playground: ['Pull-ups', 'Dips', 'Muscle-ups', 'L-sit', 'Pike Push-ups', 'Australian Pull-ups', 'Box Jumps'],
};

function WorkoutTracker() {
  const [phase, setPhase] = useState<'select' | 'log' | 'history'>('select');
  const [selectedType, setSelectedType] = useState<typeof WORKOUT_TYPES[0] | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [customExercise, setCustomExercise] = useState('');
  const [history, setHistory] = useState<WorkoutLog[]>([]);
  const [startTime] = useState(Date.now());

  const addExercise = (name: string) => {
    if (exercises.find(e => e.name === name)) return;
    setExercises(prev => [...prev, { name, sets: [] }]);
  };

  const addSet = (exIdx: number, reps: number, weight: number) => {
    setExercises(prev => {
      const copy = [...prev];
      copy[exIdx] = { ...copy[exIdx], sets: [...copy[exIdx].sets, { reps, weight }] };
      return copy;
    });
  };

  const removeLastSet = (exIdx: number) => {
    setExercises(prev => {
      const copy = [...prev];
      copy[exIdx] = { ...copy[exIdx], sets: copy[exIdx].sets.slice(0, -1) };
      return copy;
    });
  };

  const finishWorkout = () => {
    if (!selectedType || exercises.length === 0) return;
    const log: WorkoutLog = {
      type: selectedType.label,
      exercises,
      date: 'Dnes',
      duration: Math.round((Date.now() - startTime) / 60000),
    };
    setHistory(prev => [log, ...prev]);
    setPhase('select');
    setExercises([]);
    setSelectedType(null);
  };

  // Select phase
  if (phase === 'select') {
    return (
      <Card>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold tracking-[-0.02em]">Workout</h3>
          <button onClick={() => setPhase('history')} className="text-xs font-bold text-text-dim hover:text-text transition-colors">
            História ({history.length}) →
          </button>
        </div>

        {/* Last workout summary */}
        {history.length > 0 && (
          <div className="mb-4 p-4 bg-bg-elev rounded-xl border border-border">
            <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-2">Posledný workout</div>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-bold">{history[0].type}</span>
                <span className="text-xs text-text-dim ml-2">{history[0].date} · {history[0].duration}min</span>
              </div>
              <span className="text-xs text-text-dim">{history[0].exercises.length} cvikov</span>
            </div>
          </div>
        )}

        <div className="text-xs font-bold text-text-dim uppercase tracking-wider mb-3">Vyber typ tréningu</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {WORKOUT_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => { setSelectedType(t); setPhase('log'); }}
              className="p-4 bg-bg-elev border border-border rounded-xl hover:border-border-strong transition-all text-left"
            >
              <div className="text-sm font-bold mb-0.5" style={{ color: t.color }}>{t.label}</div>
              <div className="text-[10px] text-text-dim font-medium">{t.desc}</div>
            </button>
          ))}
        </div>
      </Card>
    );
  }

  // History phase
  if (phase === 'history') {
    return (
      <Card>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold tracking-[-0.02em]">Workout história</h3>
          <button onClick={() => setPhase('select')} className="text-xs font-bold text-accent">← Späť</button>
        </div>
        <div className="space-y-3">
          {history.map((h, i) => (
            <div key={i} className="p-4 bg-bg-elev rounded-xl border border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold">{h.type}</span>
                <span className="text-xs text-text-dim">{h.date} · {h.duration}min</span>
              </div>
              <div className="space-y-1">
                {h.exercises.map((ex, j) => (
                  <div key={j} className="text-xs text-text-dim">
                    <span className="text-text font-medium">{ex.name}</span>
                    {' · '}
                    {ex.sets.map((s, k) => (
                      <span key={k}>{k > 0 ? ' · ' : ''}{s.reps}×{s.weight}kg</span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Log phase
  return (
    <Card>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-lg font-bold tracking-[-0.02em]" style={{ color: selectedType?.color }}>{selectedType?.label}</h3>
          <div className="text-xs text-text-dim font-medium">{selectedType?.desc}</div>
        </div>
        <button onClick={() => { setPhase('select'); setExercises([]); }} className="text-xs font-bold text-text-dim hover:text-text">✕ Zrušiť</button>
      </div>

      {/* Preset exercises */}
      <div className="mb-4">
        <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-2">Rýchle pridanie</div>
        <div className="flex flex-wrap gap-2">
          {(PRESET_EXERCISES[selectedType?.id || 'push'] || []).map(ex => (
            <button
              key={ex}
              onClick={() => addExercise(ex)}
              disabled={!!exercises.find(e => e.name === ex)}
              className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all ${exercises.find(e => e.name === ex) ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-bg-elev border border-border text-text-dim hover:border-border-strong hover:text-text'}`}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Custom exercise */}
      <div className="flex gap-2 mb-5">
        <input
          type="text"
          placeholder="Vlastný cvik..."
          value={customExercise}
          onChange={e => setCustomExercise(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && customExercise.trim()) { addExercise(customExercise.trim()); setCustomExercise(''); } }}
          className="flex-1 bg-bg-elev border border-border rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:border-accent text-text placeholder:text-text-dim font-[inherit]"
        />
        <button
          onClick={() => { if (customExercise.trim()) { addExercise(customExercise.trim()); setCustomExercise(''); } }}
          className="bg-bg-elev border border-border px-4 py-2.5 rounded-xl text-sm font-bold hover:border-accent transition-all"
        >+</button>
      </div>

      {/* Exercise list with sets */}
      <div className="space-y-4 mb-5">
        {exercises.map((ex, exIdx) => (
          <ExerciseLogger key={exIdx} exercise={ex} onAddSet={(r, w) => addSet(exIdx, r, w)} onRemoveSet={() => removeLastSet(exIdx)} />
        ))}
      </div>

      {exercises.length > 0 && (
        <button onClick={finishWorkout} className="w-full bg-accent text-bg py-3.5 rounded-xl text-sm font-bold hover:bg-accent-dim transition-colors">
          ✓ Dokončiť workout · {exercises.reduce((s, e) => s + e.sets.length, 0)} setov
        </button>
      )}

      {exercises.length === 0 && (
        <div className="text-center py-6 text-text-dim text-sm font-medium">Pridaj cviky vyššie →</div>
      )}
    </Card>
  );
}

function ExerciseLogger({ exercise, onAddSet, onRemoveSet }: {
  exercise: Exercise;
  onAddSet: (reps: number, weight: number) => void;
  onRemoveSet: () => void;
}) {
  const [reps, setReps] = useState(8);
  const [weight, setWeight] = useState(0);

  // Suggest based on last set
  const lastSet = exercise.sets[exercise.sets.length - 1];

  return (
    <div className="bg-bg-elev rounded-xl p-4 border border-border">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-bold">{exercise.name}</span>
        <span className="text-xs text-text-dim font-medium">{exercise.sets.length} setov</span>
      </div>

      {/* Sets display */}
      {exercise.sets.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {exercise.sets.map((s, i) => (
            <span key={i} className="text-xs bg-bg-card border border-border px-2 py-1 rounded-lg font-semibold">
              {s.reps}×{s.weight}kg
            </span>
          ))}
        </div>
      )}

      {/* Add set */}
      <div className="flex gap-2 items-center">
        <div className="flex flex-col items-center">
          <span className="text-[9px] text-text-dim font-bold uppercase mb-1">Reps</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setReps(r => Math.max(1, r - 1))} className="w-7 h-7 bg-bg-card rounded-lg text-sm font-bold hover:bg-bg-hover">−</button>
            <span className="w-8 text-center text-sm font-bold">{reps}</span>
            <button onClick={() => setReps(r => r + 1)} className="w-7 h-7 bg-bg-card rounded-lg text-sm font-bold hover:bg-bg-hover">+</button>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[9px] text-text-dim font-bold uppercase mb-1">Váha (kg)</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setWeight(w => Math.max(0, w - 2.5))} className="w-7 h-7 bg-bg-card rounded-lg text-sm font-bold hover:bg-bg-hover">−</button>
            <span className="w-12 text-center text-sm font-bold">{weight}</span>
            <button onClick={() => setWeight(w => w + 2.5)} className="w-7 h-7 bg-bg-card rounded-lg text-sm font-bold hover:bg-bg-hover">+</button>
          </div>
        </div>
        <div className="flex gap-1 ml-auto">
          <button
            onClick={() => onAddSet(reps, weight)}
            className="bg-accent text-bg px-3 py-2 rounded-lg text-xs font-bold hover:bg-accent-dim transition-colors"
          >+ Set</button>
          {exercise.sets.length > 0 && (
            <button onClick={onRemoveSet} className="bg-bg-card border border-border px-2 py-2 rounded-lg text-xs text-text-dim hover:text-rose transition-colors">✕</button>
          )}
        </div>
      </div>

      {lastSet && (
        <div className="text-[10px] text-text-dim font-medium mt-2">Posledný set: {lastSet.reps}×{lastSet.weight}kg</div>
      )}
    </div>
  );
}

// ─── WEIGHT TRACKER ──────────────────────────────────────────────────────────
function WeightTracker() {
  const [entries, setEntries] = useState<{ id: string; date: string; weight_kg: number }[]>([]);
  const [input, setInput] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  // Load from Supabase
  useEffect(() => {
    supabase.from('daily_logs')
      .select('date, weight_kg')
      .not('weight_kg', 'is', null)
      .order('date', { ascending: true })
      .then(({ data }) => {
        if (data) {
          setEntries(data.filter(d => d.weight_kg).map(d => ({
            id: d.date,
            date: d.date,
            weight_kg: d.weight_kg,
          })));
        }
        setLoading(false);
      });
  }, []);

  const addEntry = async () => {
    if (!input || isNaN(parseFloat(input))) return;
    const kg = parseFloat(input);
    await supabase.from('daily_logs').upsert({ date: selectedDate, weight_kg: kg }, { onConflict: 'date' });
    setEntries(prev => {
      const filtered = prev.filter(e => e.date !== selectedDate);
      return [...filtered, { id: selectedDate, date: selectedDate, weight_kg: kg }]
        .sort((a, b) => a.date.localeCompare(b.date));
    });
    setInput('');
  };

  const removeEntry = async (date: string) => {
    await supabase.from('daily_logs').upsert({ date, weight_kg: null }, { onConflict: 'date' });
    setEntries(prev => prev.filter(e => e.date !== date));
  };

  const weights = entries.map(e => e.weight_kg);
  const hasData = weights.length >= 2;
  const min = hasData ? Math.min(...weights) - 0.5 : 70;
  const max = hasData ? Math.max(...weights) + 0.5 : 80;
  const diff = hasData ? (weights[weights.length - 1] - weights[0]).toFixed(1) : '0';

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('sk-SK', { day: 'numeric', month: 'short' });
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold tracking-[-0.02em]">Váha</h3>
        {hasData && (
          <span className={`text-xs font-bold px-2 py-1 rounded-md ${parseFloat(diff) <= 0 ? 'bg-accent/10 text-accent' : 'bg-rose/10 text-rose'}`}>
            {parseFloat(diff) <= 0 ? '↓' : '↑'} {Math.abs(parseFloat(diff))} kg
          </span>
        )}
      </div>

      {/* Graph */}
      {hasData && (
        <div className="relative h-20 mb-4 bg-bg-elev rounded-xl p-2">
          <svg viewBox="0 0 300 60" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="wg2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c8ff00" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#c8ff00" stopOpacity="0"/>
              </linearGradient>
            </defs>
            {(() => {
              const pts = entries.map((e, i) => ({
                x: (i / (entries.length - 1)) * 280 + 10,
                y: 50 - ((e.weight_kg - min) / (max - min)) * 40,
              }));
              const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
              const area = line + ` L${pts[pts.length-1].x},60 L${pts[0].x},60 Z`;
              return (<>
                <path d={area} fill="url(#wg2)"/>
                <path d={line} fill="none" stroke="#c8ff00" strokeWidth="2" strokeLinecap="round"/>
                {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#c8ff00"/>)}
              </>);
            })()}
          </svg>
        </div>
      )}

      {/* Entries */}
      {loading ? (
        <div className="text-xs text-text-dim text-center py-4">Načítavam...</div>
      ) : entries.length === 0 ? (
        <div className="text-xs text-text-dim text-center py-4 mb-4">Zatiaľ žiadne záznamy — pridaj prvý</div>
      ) : (
        <div className="space-y-0 mb-4 max-h-36 overflow-y-auto">
          {[...entries].reverse().map((e) => (
            <div key={e.id} className="flex justify-between items-center text-sm py-2 border-b border-white/[0.04] last:border-b-0">
              <span className="text-text-dim font-medium">{formatDate(e.date)}</span>
              <div className="flex items-center gap-3">
                <span className="font-bold">{e.weight_kg} kg</span>
                <button onClick={() => removeEntry(e.date)} className="text-text-dim hover:text-rose text-xs transition-colors">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add */}
      <div className="flex gap-2">
        <div className="flex-1">
          <div className="text-[10px] font-bold text-text-dim uppercase mb-1">Dátum</div>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            className="w-full bg-bg-elev border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-accent text-text font-[inherit]"/>
        </div>
        <div className="flex-1">
          <div className="text-[10px] font-bold text-text-dim uppercase mb-1">Váha (kg)</div>
          <input type="number" step="0.1" placeholder="74.5" value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addEntry()}
            className="w-full bg-bg-elev border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-accent text-text font-[inherit]"/>
        </div>
        <div className="flex flex-col justify-end">
          <button onClick={addEntry} className="bg-accent text-bg px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-accent-dim">+ Pridať</button>
        </div>
      </div>
    </Card>
  );
}

// ─── SKINCARE ─────────────────────────────────────────────────────────────────
function Skincare() {
  const [done, setDone] = useState(false);
  return (
    <Card>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold tracking-[-0.02em]">Skincare · AM</h3>
        <span className={`text-xs font-bold px-2 py-1 rounded-md ${done ? 'bg-accent/10 text-accent' : 'bg-bg-elev text-text-dim'}`}>{done ? 'Hotovo' : 'Ranná'}</span>
      </div>
      <button onClick={() => setDone(!done)}
        className={`w-full flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all mb-4 ${done ? 'bg-accent/[0.04] border-accent/30' : 'bg-bg-elev border-border hover:border-border-strong'}`}>
        <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center text-xl flex-shrink-0 ${done ? 'bg-accent border-accent text-bg' : 'border-border-strong text-text-dim'}`}>
          {done ? '✓' : '○'}
        </div>
        <div className="text-left">
          <div className="text-sm font-bold">{done ? 'Hotovo · ranná rutina' : 'Ešte nespravené'}</div>
          <div className="text-xs text-text-dim font-medium">Klikni keď máš hotovo</div>
        </div>
      </button>
      <div className="bg-bg-elev rounded-xl p-4">
        <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-3">Produkty</div>
        {['Moisturizer', 'Vitamin C sérum + gua sha', 'Hydrating cream'].map((p, i) => (
          <div key={i} className="text-xs font-medium py-1 text-text/85 pl-3 relative">
            <span className="absolute left-0 text-warm font-bold">·</span>{p}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── MEDITATION ───────────────────────────────────────────────────────────────
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
        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl ${logged ? 'bg-accent border-accent text-bg' : 'border-border-strong text-text-dim'}`}>
          {logged ? '✓' : '🧘'}
        </div>
        <div>
          <div className="text-sm font-bold">{logged ? `Hotovo · ${minutes} min` : 'Ešte nespravené'}</div>
          <div className="text-xs text-text-dim font-medium">Cieľ · 20 min denne</div>
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <input type="number" value={minutes} onChange={e => setMinutes(e.target.value)}
          className="w-24 bg-bg-elev border border-border rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-accent text-text font-[inherit]"/>
        <span className="text-sm text-text-dim font-medium">minút</span>
      </div>
    </Card>
  );
}

// ─── WORK TIME ────────────────────────────────────────────────────────────────
function WorkTime() {
  const [hours, setHours] = useState('');
  const [category, setCategory] = useState('Deep work');
  const [log, setLog] = useState<{ category: string; hours: string; date: string }[]>([]);

  const add = () => {
    if (!hours) return;
    setLog(prev => [{ category, hours, date: 'Dnes' }, ...prev]);
    setHours('');
  };

  const totalToday = log.filter(l => l.date === 'Dnes').reduce((a, b) => a + parseFloat(b.hours), 0);

  return (
    <Card>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold tracking-[-0.02em]">Work time</h3>
        <span className="text-xs font-semibold px-2 py-1 rounded-md bg-accent/10 text-accent">{totalToday.toFixed(1)}h dnes</span>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { lbl: 'Dnes', val: `${totalToday.toFixed(1)}h`, color: 'text-accent' },
          { lbl: 'Cieľ', val: '8h', color: '' },
          { lbl: 'Progress', val: `${Math.round((totalToday / 8) * 100)}%`, color: '' },
        ].map(s => (
          <div key={s.lbl} className="bg-bg-elev rounded-xl p-3 text-center">
            <div className={`text-lg font-bold mb-0.5 ${s.color}`}>{s.val}</div>
            <div className="text-[10px] text-text-dim font-semibold uppercase">{s.lbl}</div>
          </div>
        ))}
      </div>
      <div className="h-1.5 bg-bg-elev rounded-full overflow-hidden mb-4">
        <div className="h-full bg-accent rounded-full" style={{ width: `${Math.min((totalToday / 8) * 100, 100)}%` }}/>
      </div>
      <div className="space-y-0 mb-4 max-h-28 overflow-y-auto">
        {log.slice(0, 5).map((l, i) => (
          <div key={i} className="flex justify-between py-2 border-b border-white/[0.04] last:border-b-0 text-sm">
            <div><span className="font-semibold">{l.category}</span><span className="text-text-dim ml-2 text-xs">{l.date}</span></div>
            <span className="font-bold">{l.hours}h</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="bg-bg-elev border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-accent text-text font-[inherit] flex-1">
          {['Deep work', 'Calls', 'Admin', 'Content', 'Learning', 'Ads', 'Strategy'].map(c => <option key={c}>{c}</option>)}
        </select>
        <input type="number" step="0.5" placeholder="1.5h" value={hours} onChange={e => setHours(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          className="w-20 bg-bg-elev border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-accent text-text font-[inherit]"/>
        <button onClick={add} className="bg-accent text-bg px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-accent-dim">+</button>
      </div>
    </Card>
  );
}

// ─── MINI TRACKERS ────────────────────────────────────────────────────────────
function MiniTrackers() {
  const [screenPC, setScreenPC] = useState(4.0);
  const [screenPhone, setScreenPhone] = useState(1.4);
  const [english, setEnglish] = useState(47);
  const [dates, setDates] = useState(4);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: 'Screen · PC', value: screenPC, unit: 'h', max: 10, color: '#6db6ff', set: setScreenPC, step: 0.5, desc: 'Cieľ max 10h' },
        { label: 'Screen · Phone', value: screenPhone, unit: 'h', max: 4, color: '#ff5d7a', set: setScreenPhone, step: 0.5, desc: 'Cieľ max 4h' },
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
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min((t.value / t.max) * 100, 100)}%`, background: t.color }}/>
          </div>
          <div className="flex gap-2">
            <button onClick={() => t.set((v: number) => Math.max(0, +(v - t.step).toFixed(1)))} className="flex-1 bg-bg-elev rounded-lg py-1.5 text-sm font-bold hover:bg-bg-hover">−</button>
            <button onClick={() => t.set((v: number) => +(v + t.step).toFixed(1))} className="flex-1 bg-bg-elev rounded-lg py-1.5 text-sm font-bold hover:bg-bg-hover">+</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── TIMELINE ─────────────────────────────────────────────────────────────────
function Timeline() {
  const [events, setEvents] = useState<{ time: string; label: string; color: string }[]>([]);
  const [newTime, setNewTime] = useState(() => {
    const n = new Date();
    return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`;
  });
  const [newLabel, setNewLabel] = useState('');

  const add = () => {
    if (!newLabel.trim()) return;
    setEvents(prev => [...prev, { time: newTime, label: newLabel.trim(), color: '#c8ff00' }]
      .sort((a, b) => a.time.localeCompare(b.time)));
    setNewLabel('');
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold tracking-[-0.02em]">Timeline dňa</h3>
        <span className="text-xs text-text-dim font-medium">Hodinový log</span>
      </div>
      {events.length === 0 && (
        <div className="text-xs text-text-dim text-center py-4 mb-4">Žiadne záznamy — pridaj prvý</div>
      )}
      {events.map((e, i) => (
        <div key={i} className="grid grid-cols-[64px_1fr_auto] gap-3 py-3 border-b border-white/[0.04] last:border-b-0 items-center">
          <div className="text-xs text-text-dim font-semibold">{e.time}</div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: e.color }}/>
            {e.label}
          </div>
          <button onClick={() => setEvents(prev => prev.filter((_, j) => j !== i))}
            className="text-text-dim hover:text-rose text-xs transition-colors">✕</button>
        </div>
      ))}
      <div className="flex gap-2 mt-4">
        <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
          className="w-24 bg-bg-elev border border-border rounded-xl px-2 py-2.5 text-sm font-semibold outline-none focus:border-accent text-text font-[inherit]"/>
        <input type="text" placeholder="Čo si robil..." value={newLabel} onChange={e => setNewLabel(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          className="flex-1 bg-bg-elev border border-border rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:border-accent text-text placeholder:text-text-dim font-[inherit]"/>
        <button onClick={add} className="bg-accent text-bg px-4 py-2.5 rounded-xl text-sm font-bold">+</button>
      </div>
    </Card>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function PersonalPage() {
  return (
    <>
      <TopBar />
      <main className="px-4 md:px-8 py-6 md:py-8 max-w-[1400px] mx-auto pb-24 lg:pb-8">

        <SectionHeader title="Kroky k vízii" meta="Denné" />
        <VisionSteps />

        <SectionHeader title="Spánok" meta="Garmin sync" />
        <Sleep />

        <SectionHeader title="Workout" meta="Garmin + manuálny log" />
        <WorkoutTracker />

        <SectionHeader title="Kofeín" meta="Live decay tracker" />
        <CaffeineTracker />

        <SectionHeader title="Váha · Skincare" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <WeightTracker />
          <Skincare />
        </div>

        <SectionHeader title="Meditácia · Work time" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Meditation />
          <WorkTime />
        </div>

        <SectionHeader title="Denné metriky" meta="Screen time · Angličtina · Dates" />
        <MiniTrackers />

        <SectionHeader title="Timeline dňa" />
        <Timeline />

      </main>
      <MobileNav />
    </>
  );
}
