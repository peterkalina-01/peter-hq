'use client';

import Link from 'next/link';

const cards = [
  {
    icon: 'M',
    title: 'Mentor',
    desc: 'Pozná tvoju víziu, tvoj týždeň, tvoj spánok aj cally. Hovor s ním ako s človekom — text alebo hlas.',
    href: '/mentor',
    cta: 'Otvoriť rozhovor',
  },
  {
    icon: 'S',
    title: 'Sales coach',
    desc: 'Hodíš transcript callu, dostaneš detailný breakdown — štruktúra, námietky, čo si mohol povedať inak.',
    href: '/sales',
    cta: 'Analyzovať call',
  },
  {
    icon: 'R',
    title: 'Roleplay',
    desc: 'Realtime hlasový prospekt. Vyber profil, predávaj, bot reaguje ako reálny majiteľ.',
    href: '/sales',
    cta: 'Spustiť session',
  },
];

export default function MentorSection() {
  return (
    <div className="mb-9">
      <div className="flex items-baseline justify-between mb-5 mt-3">
        <h2 className="text-2xl font-bold tracking-[-0.025em]">AI vrstva</h2>
        <div className="text-xs text-text-dim font-medium">Realtime · pamäť tvojho života</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link
            key={c.title}
            href={c.href}
            className="block bg-gradient-to-br from-bg-card to-bg-elev border border-border rounded-2xl p-[26px] relative overflow-hidden cursor-pointer transition-all hover:border-accent hover:-translate-y-[3px]"
          >
            <div
              className="absolute top-0 right-0 w-[120px] h-[120px] pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(200,255,0,0.06) 0%, transparent 70%)',
              }}
            />
            <div className="relative">
              <div className="w-[46px] h-[46px] rounded-xl bg-bg-elev border border-border flex items-center justify-center mb-4 text-xl font-bold text-accent">
                {c.icon}
              </div>
              <h3 className="text-[19px] font-bold mb-2 tracking-[-0.02em]">{c.title}</h3>
              <p className="text-[13px] text-text-dim leading-[1.5] mb-[18px] font-medium">
                {c.desc}
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs text-accent font-bold">
                {c.cta} →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
