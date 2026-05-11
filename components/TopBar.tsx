'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/personal', label: 'Osobné' },
  { href: '/business', label: 'Biznis' },
  { href: '/finance', label: 'Financie' },
  { href: '/report', label: 'Report' },
  { href: '/mentor', label: 'Mentor' },
  { href: '/sales', label: 'Sales' },
];

function MetricPill({ label, value, color = '#ff7849', alert = false }: {
  label: string; value: string; color?: string; alert?: boolean;
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
      {/* Main nav row */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 bg-accent rounded-[8px] flex items-center justify-center font-extrabold text-[16px] text-bg">P</div>
          <div className="hidden sm:flex flex-col leading-tight">
            <div className="text-[14px] font-bold tracking-tight">Peter HQ</div>
            <div className="text-[10px] text-text-dim">LeadsFlow Media</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex gap-1 bg-bg-elev p-1 rounded-xl border border-border">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`px-3 py-2 text-[12px] font-semibold rounded-lg transition-all tracking-tight ${
                  active ? 'bg-bg-card text-text shadow-[0_1px_0_rgba(255,255,255,0.04)]' : 'text-text-dim hover:text-text'
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

      {/* Metrics strip - scrollable on mobile */}
      <div className="flex items-center gap-1.5 px-3 md:px-6 pb-2 overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <MetricPill label="Spánok" value="6h·78" color="#6db6ff" />
        <MetricPill label="Workout" value="Push ✓" color="#ff7849" />
        <MetricPill label="Kofeín" value="143mg" color="#ff7849" />
        <MetricPill label="Work" value="3.5h" color="#c8ff00" />
        <MetricPill label="Meditácia" value="✓" color="#2dd4bf" />
        <MetricPill label="MRR" value="$1K" color="#c8ff00" />
        <MetricPill label="Calls" value="3" color="#a78bfa" />
      </div>
    </div>
  );
}
