'use client';

const kpis = [
  {
    label: 'MRR',
    value: '1,000',
    currency: '$',
    trend: '↑ Začíname',
    trendColor: 'text-accent',
    spark: 'M0,20 L10,18 L20,17 L30,15 L40,14 L50,12 L60,10',
    sparkColor: '#c8ff00',
  },
  {
    label: 'Tržby (7d)',
    value: '420',
    currency: '$',
    trend: 'První prospekti',
    trendColor: 'text-accent',
    spark: 'M0,18 L10,17 L20,15 L30,16 L40,13 L50,11 L60,9',
    sparkColor: '#c8ff00',
  },
  {
    label: 'Ads Spend / ROAS',
    value: '—',
    currency: '',
    trend: 'Pripoj Meta Ads',
    trendColor: 'text-text-dim',
    spark: 'M0,12 L60,12',
    sparkColor: '#ff7849',
  },
  {
    label: 'Pipeline',
    value: '8,400',
    currency: '$',
    trend: '3 deals · 1 hot',
    trendColor: 'text-cool',
    spark: 'M0,20 L10,18 L20,17 L30,15 L40,12 L50,10 L60,8',
    sparkColor: '#6db6ff',
  },
];

export default function KpiStrip() {
  return (
    <>
      <div className="flex items-baseline justify-between mb-5 mt-3">
        <h2 className="text-2xl font-bold tracking-[-0.025em]">Biznis dnes</h2>
        <div className="text-xs text-text-dim font-medium">
          Stripe · SuperFaktúra · GHL · Meta
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-9">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="bg-bg-card border border-border rounded-2xl p-5 md:p-[22px] relative transition-all hover:border-border-strong hover:-translate-y-0.5"
          >
            <div className="text-xs text-text-dim font-semibold mb-3.5">{k.label}</div>
            <div className="text-[28px] md:text-[32px] font-bold leading-none tracking-[-0.03em] mb-2.5">
              {k.currency && <span className="text-[18px] text-text-dim font-semibold mr-1">{k.currency}</span>}
              {k.value}
            </div>
            <div className={`text-xs font-semibold ${k.trendColor}`}>{k.trend}</div>
            <svg
              className="absolute bottom-4 right-4 w-[60px] h-6 opacity-70"
              viewBox="0 0 60 24"
            >
              <path d={k.spark} fill="none" stroke={k.sparkColor} strokeWidth="1.5" />
            </svg>
          </div>
        ))}
      </div>
    </>
  );
}
