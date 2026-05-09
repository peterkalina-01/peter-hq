'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/personal', label: 'Osobné' },
  { href: '/business', label: 'Biznis' },
  { href: '/finance', label: 'Financie' },
  { href: '/mentor', label: 'Mentor' },
  { href: '/sales', label: 'Sales' },
];

export default function TopBar() {
  const pathname = usePathname();
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const today = new Date().toLocaleDateString('sk-SK', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const todayCap = today.charAt(0).toUpperCase() + today.slice(1);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('peter_avatar');
      if (saved) setAvatarSrc(saved);
    } catch {}
  }, []);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setAvatarSrc(src);
      try {
        localStorage.setItem('peter_avatar', src);
      } catch {}
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-8 py-4 border-b border-border backdrop-blur-xl bg-bg/85">
      <Link href="/" className="flex items-center gap-3">
        <div className="w-9 h-9 bg-accent rounded-[10px] flex items-center justify-center font-extrabold text-[18px] text-bg tracking-tight">
          P
        </div>
        <div className="flex flex-col leading-tight">
          <div className="text-[15px] font-semibold tracking-tight">Command Center</div>
          <div className="text-[11px] text-text-dim mt-0.5">Peter Kalina · LeadsFlow</div>
        </div>
      </Link>

      <nav className="hidden lg:flex gap-1 bg-bg-elev p-[5px] rounded-xl border border-border">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-[9px] text-[13px] font-medium rounded-lg transition-all tracking-tight ${
                active
                  ? 'bg-bg-card text-text shadow-[0_1px_0_rgba(255,255,255,0.05)]'
                  : 'text-text-dim hover:text-text'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-4">
        <div className="hidden md:block text-[13px] text-text-dim font-medium">{todayCap}</div>
        <button
          onClick={handleAvatarClick}
          title="Klikni pre nahranie fotky"
          className="w-9 h-9 rounded-full overflow-hidden border-2 border-transparent hover:border-accent transition-all flex items-center justify-center font-bold text-[13px] text-bg tracking-tight"
          style={
            avatarSrc
              ? { backgroundImage: `url(${avatarSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { background: 'linear-gradient(135deg, #ff7849, #ff5d7a)' }
          }
        >
          {!avatarSrc && 'PK'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
