'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/personal', label: 'Osobné' },
  { href: '/business', label: 'Biznis' },
  { href: '/finance', label: 'Financie' },
  { href: '/report', label: 'Report' },
  { href: '/mentor', label: 'Mentor' },
  { href: '/sales', label: 'Sales' },
];

function MetricPill({ value, color = '#ff7849', alert = false }: {
  value: string; color?: string; alert?: boolean;
}) {
  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg flex-shrink-0 ${alert ? 'bg-rose/10' : 'bg-bg-elev'} border ${alert ? 'border-rose/20' : 'border-border'}`}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: alert ? '#ff5d7a' : color }} />
      <span className="text-[10px] font-bold whitespace-nowrap" style={{ color: alert ? '#ff5d7a' : color }}>{value}</span>
    </div>
  );
}

export default function TopBar() {
  const pathname = usePathname();
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [time, setTime] = useState('');
  const [metrics, setMetrics] = useState({
    caffeine: 0,
    workHours: 0,
    workoutDone: false,
    workoutType: '',
    meditationDone: false,
    mrr: null as number | null,
  });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' }));
    };
    tick();
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('peter_avatar');
      if (saved) setAvatarSrc(saved);
    } catch {}
  }, []);

  // Load live metrics
  useEffect(() => {
    const date = new Date().toISOString().split('T')[0];
    const nowH = new Date().getHours() + new Date().getMinutes() / 60;

    Promise.all([
      supabase.from('daily_logs').select('work_deep_hours,work_calls_hours,work_admin_hours,work_content_hours,workout_done,workout_type,meditation_done').eq('date', date).single(),
      supabase.from('caffeine_log').select('mg,time_logged').eq('date', date),
      fetch('/api/stripe').then(r => r.json()).catch(() => null),
    ]).then(([logRes, cafRes, stripeRes]) => {
      const log = logRes.data;
      const cafEntries = cafRes.data || [];

      // Caffeine decay
      const caffeine = cafEntries.reduce((sum: number, e: { mg: number; time_logged: string }) => {
        const [hh, mm] = e.time_logged.split(':').map(Number);
        const entryH = hh + mm / 60;
        if (nowH < entryH) return sum;
        return sum + e.mg * Math.pow(0.5, (nowH - entryH) / 5);
      }, 0);

      const workHours = log ? (log.work_deep_hours || 0) + (log.work_calls_hours || 0) + (log.work_admin_hours || 0) + (log.work_content_hours || 0) : 0;

      setMetrics({
        caffeine: Math.round(caffeine),
        workHours,
        workoutDone: !!log?.workout_done,
        workoutType: log?.workout_type || '',
        meditationDone: !!log?.meditation_done,
        mrr: stripeRes && !stripeRes.error ? stripeRes.mrr : null,
      });
    }).catch(() => {});
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setAvatarSrc(src);
      try { localStorage.setItem('peter_avatar', src); } catch {}
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="sticky top-0 z-50 border-b border-border backdrop-blur-xl bg-bg/90">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        <Link href="/" className="flex items-center flex-shrink-0">
          <div className="flex flex-col leading-tight">
            <div className="text-[14px] font-bold tracking-tight">Peter HQ</div>
            <div className="text-[10px] text-text-dim">LeadsFlow Media</div>
          </div>
        </Link>

        <nav className="hidden lg:flex gap-1 bg-bg-elev p-1 rounded-xl border border-border">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`px-3 py-2 text-[12px] font-semibold rounded-lg transition-all tracking-tight ${
                  active ? 'bg-bg-card text-text' : 'text-text-dim hover:text-text'
                }`}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="text-[11px] text-text-dim font-medium hidden sm:block">{time}</div>
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Klikni pre nahranie fotky"
            className="w-8 h-8 rounded-full overflow-hidden border-2 border-transparent hover:border-accent transition-all flex items-center justify-center font-bold text-[12px] text-bg"
            style={avatarSrc
              ? { backgroundImage: `url(${avatarSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { background: 'linear-gradient(135deg, #ff7849, #ff5d7a)' }
            }
          >
            {!avatarSrc && 'PK'}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden"/>
        </div>
      </div>

      {/* Live metrics strip */}
      <div className="flex items-center gap-1.5 px-3 md:px-6 pb-2 overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <MetricPill value={`☕ ${metrics.caffeine}mg`} color={metrics.caffeine > 200 ? '#ff5d7a' : metrics.caffeine > 100 ? '#ff7849' : '#888894'} />
        <MetricPill value={`Work ${metrics.workHours.toFixed(1)}h`} color="#c8ff00" />
        <MetricPill value={metrics.workoutDone ? `✓ ${metrics.workoutType || 'Workout'}` : '○ Workout'} color={metrics.workoutDone ? '#ff7849' : '#888894'} />
        <MetricPill value={metrics.meditationDone ? '✓ Meditácia' : '○ Meditácia'} color={metrics.meditationDone ? '#2dd4bf' : '#888894'} />
        {metrics.mrr !== null && <MetricPill value={`MRR $${metrics.mrr.toLocaleString()}`} color="#c8ff00" />}
      </div>
    </div>
  );
}
