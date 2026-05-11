'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: 'Home', icon: '◆' },
  { href: '/personal', label: 'Osobné', icon: '◉' },
  { href: '/business', label: 'Biznis', icon: '▲' },
  { href: '/finance', label: '$', icon: '$' },
  { href: '/report', label: 'Report', icon: '◈' },
  { href: '/mentor', label: 'Mentor', icon: '✦' },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-elev/95 backdrop-blur-xl border-t border-border">
      <div className="flex justify-around items-center px-2 py-2 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all ${active ? 'text-accent' : 'text-text-dim'}`}>
              <span className="text-sm font-bold">{item.icon}</span>
              <span className="text-[9px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
