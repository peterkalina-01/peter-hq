'use client';

import TopBar from '@/components/TopBar';
import MobileNav from '@/components/MobileNav';
import { useState, useEffect } from 'react';

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
        <span className="text-xs font-semibold px-2 py-1 rounded-md bg-accent/10 text-accent">Garmin live</span>
      </div>
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-5xl font-bold text-cool tracking-[-0.03em]">6:42</span>
        <span className="text-sm text-text-dim font-semibold">hod</span>
        <span className="ml-auto text-2xl font-bold text-accent">78</span>
        <span className="text-xs text-text-dim font-semibold">skóre</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden mb-4 bg-bg-elev">
        <div style={{ width: '22%', background: '#6db6ff' }} />
        <div style={{ width: '48%', background: '#2dd4bf' }} />
        <div style={{ width: '18%', background: '#c8ff00' }} />
        <div style={{ width: '12%', background: '#ff7849' }} />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {[
          { lbl: 'Light', val: '3h 02m', color: '#6db6ff' },
          { lbl: 'Deep', val: '1h 28m', color: '#2dd4bf' },
          { lbl: 'REM', val: '1h 12m', color: '#c8ff00' },
          { lbl: 'Awake', val: '12m', color: '#ff7849' },
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
        <span>RHR: 52 bpm</span>
      </div>
    </Card>
  );
}

// ─── CAFFEINE TRACKER ────────────────────────────────────────────────────────
type CaffeineEntry = { drink: string; mg: number; time: string; timestamp: number };

const DRINKS = [
  { name: 'Espresso', mg: 63, emoji: '☕' },
  { name: 'Cappuccino', mg: 80, emoji: '☕' },
  { name: 'Latte', mg: 75, emoji: '🥛' },
  { name: 'Doppio', mg: 126, emoji: '☕' },
];

function CaffeineTracker() {
  const [entries, setEntries] = useState<CaffeineEntry[]>([]);
  const [selectedDrink, setSelectedDrink] = useState(DRINKS[0]);
  const [customTime, setCustomTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  });
  const [sleepTime, setSleepTime] = useState('22:00');
  const [now, setNow] = useState(Date.now());

  // Live clock for graph updates
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Calculate current caffeine level using half-life model (5h = 300min)
  const halfLifeMin = 300;
  const getCaffeineAt = (timestamp: number, atTime: number) => {
    const minutesPassed = (atTime - timestamp) / 60000;
    if (minutesPassed < 0) return 0;
    return Math.exp(-Math.log(2) / halfLifeMin * minutesPassed);
  };

  const totalNow = entries.reduce((sum, e) => sum + e.mg * getCaffeineAt(e.timestamp, now), 0);

  // Build decay graph — 24 points across today
  const todayStart = new Date(); todayStart.setHours(6, 0, 0, 0);
  const graphPoints = Array.from({ length: 97 }, (_, i) => {
    const t = todayStart.getTime() + i * 15 * 60000; // every 15min
    const mg = entries.reduce((sum, e) => sum + e.mg * getCaffeineAt(e.timestamp, t), 0);
    return { t, mg };
  });
  const maxMg = Math.max(...graphPoints.map(p => p.mg), 200);

  // Cutoff time
  const [cutoffH, cutoffM] = sleepTime.split(':').map(Number);
  const sleepTs = new Date(); sleepTs.setHours(cutoffH - 6, cutoffM, 0, 0); // 6h before sleep
  const sleepActual = new Date(); sleepActual.setHours(cutoffH, cutoffM, 0, 0);
  const mgAtSleep = entries.reduce((sum, e) => sum + e.mg * getCaffeineAt(e.timestamp, sleepActual.getTime()), 0);

  // SVG graph helpers
  const W = 400; const H = 80;
  const toX = (t: number) => ((t - todayStart.getTime()) / (16 * 3600000)) * W;
  const toY = (mg: number) => H - (mg / maxMg) * H * 0.9;
  const pathD = graphPoints.filter(p => p.mg > 0.5).map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.t).toFixed(1)},${toY(p.mg).toFixed(1)}`).join(' ');
  const areaD = pathD + ` L${toX(graphPoints[graphPoints.length-1].t)},${H} L${toX(graphPoints.find(p=>p.mg>0.5)?.t||todayStart.getTime())},${H} Z`;

  const addEntry = () => {
    const [h, m] = customTime.split(':').map(Number);
    const ts = new Date(); ts.setHours(h, m, 0, 0);
    setEntries(prev => [...prev, {
      drink: selectedDrink.name,
      mg: selectedDrink.mg,
      time: customTime,
      timestamp: ts.getTime(),
    }].sort((a, b) => a.timestamp - b.timestamp));
  };

  const statusColor = totalNow > 300 ? '#ff5d7a' : totalNow > 150 ? '#ff7849' : '#c8ff00';
  const statusText = totalNow > 300 ? 'High — consider cutting' : totalNow > 150 ? 'Moderate' : totalNow < 20 ? 'Clear' : 'Good';

  // Cutoff warning
  const cutoffTs = new Date(); cutoffTs.setHours(cutoffH - 6, cutoffM, 0, 0);
  const nowHour = new Date().getHours() + new Date().getMinutes() / 60;
  const cutoffHour = cutoffH - 6;
  const pastCutoff = nowHour > cutoffHour;

  return (
    <Card>
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="text-lg font-bold tracking-[-0.02em]">Kofeín</h3>
          <div className="text-xs text-text-dim font-medium mt-0.5">Poločas rozpadu: 5 hodín</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold tracking-[-0.025em]" style={{ color: statusColor }}>{Math.round(totalNow)}<span className="text-sm font-semibold ml-1 text-text-dim">mg</span></div>
          <div className="text-xs font-bold" style={{ color: statusColor }}>{statusText}</div>
        </div>
      </div>

      {/* Decay graph */}
      {entries.length > 0 && (
        <div className="mb-5 bg-bg-elev rounded-xl p-3 relative overflow-hidden">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-16">
            <defs>
              <linearGradient id="caffGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff7849" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#ff7849" stopOpacity="0"/>
              </linearGradient>
            </defs>
            {/* Cutoff line */}
            {cutoffHour > 6 && cutoffHour < 22 && (
              <line
                x1={toX(cutoffTs.getTime())} y1="0"
                x2={toX(cutoffTs.getTime())} y2={H}
                stroke="#ff5d7a" strokeWidth="1.5" strokeDasharray="3,3"
              />
            )}
            {/* Now line */}
            <line
              x1={toX(now)} y1="0"
              x2={toX(now)} y2={H}
              stroke="#c8ff00" strokeWidth="1" strokeDasharray="2,2" opacity="0.5"
            />
            {pathD && <>
              <path d={areaD} fill="url(#caffGrad)"/>
              <path d={pathD} fill="none" stroke="#ff7849" strokeWidth="2" strokeLinecap="round"/>
            </>}
          </svg>
          <div className="flex justify-between text-[10px] text-text-dim font-medium mt-1">
            <span>06:00</span>
            <span className="text-rose text-[10px]">✕ cutoff {String(cutoffH-6).padStart(2,'0')}:{String(cutoffM).padStart(2,'0')}</span>
            <span>22:00</span>
          </div>
        </div>
      )}

      {/* Past cutoff warning */}
      {pastCutoff && (
        <div className="mb-4 px-4 py-3 bg-rose/10 border border-rose/20 rounded-xl text-xs font-semibold text-rose">
          ⚠️ Past cutoff — ďalší kofeín ovplyvní spánok. Pri {sleepTime} budeš mať ~{Math.round(mgAtSleep)}mg v tele.
        </div>
      )}

      {/* Log entries */}
      {entries.length > 0 && (
        <div className="space-y-0 mb-4">
          {[...entries].reverse().map((e, i) => (
            <div key={i} className="flex justify-between items-center py-2.5 border-b border-white/[0.04] last:border-b-0 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-base">☕</span>
                <div>
                  <span className="font-semibold">{e.drink}</span>
                  <span className="text-text-dim ml-2 text-xs">{e.time}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-dim">{e.mg}mg</span>
                <button onClick={() => setEntries(prev => prev.filter((_, j) => j !== entries.length - 1 - i))}
                  className="text-text-dim hover:text-rose text-xs transition-colors">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add drink */}
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {DRINKS.map(d => (
            <button
              key={d.name}
              onClick={() => setSelectedDrink(d)}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${selectedDrink.name === d.name ? 'bg-warm/10 border-warm text-warm' : 'bg-bg-elev border-border text-text-dim hover:border-border-strong hover:text-text'}`}
            >
              {d.name}<br/>
              <span className="text-[10px] opacity-70">{d.mg}mg</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1.5">Čas</div>
            <input
              type="time"
              value={customTime}
              onChange={e => setCustomTime(e.target.value)}
              className="w-full bg-bg-elev border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-accent text-text font-[inherit]"
            />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1.5">Spánok o</div>
            <input
              type="time"
              value={sleepTime}
              onChange={e => setSleepTime(e.target.value)}
              className="w-full bg-bg-elev border border-border rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-accent text-text font-[inherit]"
            />
          </div>
          <div className="flex flex-col justify-end">
            <button onClick={addEntry} className="bg-warm text-bg px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-colors">+ Pridať</button>
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
  const [history, setHistory] = useState<WorkoutLog[]>([
    {
      type: 'Push',
      date: 'Včera',
      duration: 52,
      exercises: [
        { name: 'Bench Press', sets: [{ reps: 8, weight: 80 }, { reps: 7, weight: 80 }, { reps: 6, weight: 80 }] },
        { name: 'Overhead Press', sets: [{ reps: 10, weight: 50 }, { reps: 8, weight: 50 }] },
      ],
    },
  ]);
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
  const [entries, setEntries] = useState([
    { date: '7. máj', weight: 74.2 },
    { date: '8. máj', weight: 74.0 },
    { date: '9. máj', weight: 73.8 },
  ]);
  const [input, setInput] = useState('');

  const addEntry = () => {
    if (!input || isNaN(parseFloat(input))) return;
    const today = new Date().toLocaleDateString('sk-SK', { day: 'numeric', month: 'short' });
    setEntries(prev => [...prev, { date: today, weight: parseFloat(input) }]);
    setInput('');
  };

  const weights = entries.map(e => e.weight);
  const min = Math.min(...weights) - 0.5;
  const max = Math.max(...weights) + 0.5;
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
      <div className="relative h-20 mb-4 bg-bg-elev rounded-xl p-2">
        <svg viewBox={`0 0 300 60`} className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c8ff00" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#c8ff00" stopOpacity="0"/>
            </linearGradient>
          </defs>
          {entries.length > 1 && (() => {
            const pts = entries.map((e, i) => ({
              x: (i / (entries.length - 1)) * 280 + 10,
              y: 50 - ((e.weight - min) / (max - min)) * 40,
            }));
            const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
            const area = line + ` L${pts[pts.length-1].x},60 L${pts[0].x},60 Z`;
            return (<>
              <path d={area} fill="url(#wg)"/>
              <path d={line} fill="none" stroke="#c8ff00" strokeWidth="2" strokeLinecap="round"/>
              {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#c8ff00"/>)}
            </>);
          })()}
        </svg>
      </div>
      <div className="space-y-0 mb-4 max-h-28 overflow-y-auto">
        {[...entries].reverse().map((e, i) => (
          <div key={i} className="flex justify-between text-sm py-2 border-b border-white/[0.04] last:border-b-0">
            <span className="text-text-dim font-medium">{e.date}</span>
            <span className="font-bold">{e.weight} kg</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="number" step="0.1" placeholder="74.5"
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addEntry()}
          className="flex-1 bg-bg-elev border border-border rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-accent text-text placeholder:text-text-dim font-[inherit]"
        />
        <button onClick={addEntry} className="bg-accent text-bg px-5 py-3 rounded-xl text-sm font-bold hover:bg-accent-dim">+ Pridať</button>
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
  const [log, setLog] = useState([
    { category: 'Deep work', hours: '3.5', date: 'Dnes' },
    { category: 'Calls', hours: '1.5', date: 'Dnes' },
    { category: 'Deep work', hours: '4.0', date: 'Včera' },
  ]);

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
  const events = [
    { time: '07:42', label: 'Wake up', color: '#6db6ff' },
    { time: '08:00', label: 'Skincare rutina', color: '#a78bfa' },
    { time: '08:15', label: 'Beh 5.2 km', color: '#ff7849' },
    { time: '09:00', label: 'Espresso ☕', color: '#ff7849' },
    { time: '09:30', label: 'Deep work · UGC scripty', color: '#c8ff00' },
    { time: '11:00', label: 'Call · Texas Land Co', color: '#4ade80' },
    { time: '12:30', label: 'Obed', color: '#ff5d7a' },
    { time: '13:30', label: 'Work time · ads', color: '#c8ff00' },
    { time: '15:00', label: 'Meditácia 20min', color: '#2dd4bf' },
  ];
  return (
    <Card>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold tracking-[-0.02em]">Timeline dňa</h3>
        <span className="text-xs text-text-dim font-medium">Hodinový log</span>
      </div>
      {events.map((e, i) => (
        <div key={i} className="grid grid-cols-[64px_1fr] gap-3 py-3 border-b border-white/[0.04] last:border-b-0 items-center">
          <div className="text-xs text-text-dim font-semibold">{e.time}</div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: e.color }}/>
            {e.label}
          </div>
        </div>
      ))}
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
