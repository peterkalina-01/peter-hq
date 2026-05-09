'use client';

const metrics = [
  { label: 'Meditácia', value: '12', unit: 'min', meta: 'Streak · 14 dní' },
  { label: 'Deep work', value: '3.2', unit: 'h', meta: 'Cieľ · 5h · 64%' },
  { label: 'Anglický jazyk', value: '47', unit: 'min', meta: '2 cally + roleplay' },
  { label: 'Kofeín', value: '240', unit: 'mg', meta: '2 espresso · v limite' },
  { label: 'Štúdium · maturita', value: '1.5', unit: 'h', meta: '18 dní · matematika' },
  { label: 'Screen time', value: '5.4', unit: 'h', meta: 'PC 4h · Phone 1.4h' },
  { label: 'Skripty / Roleplay', value: '7', unit: '×', meta: 'Tento týždeň' },
  { label: 'Dates · čas', value: '4', unit: 'h', meta: 'Tento týždeň · 1 date' },
];

export default function FooterMetrics() {
  return (
    <div className="mb-24 lg:mb-9">
      <div className="flex items-baseline justify-between mb-5 mt-3">
        <h2 className="text-2xl font-bold tracking-[-0.025em]">Osobné metriky</h2>
        <div className="text-xs text-text-dim font-medium">Manuálny + Garmin sync</div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-bg-card border border-border rounded-2xl p-5">
            <div className="text-[11px] text-text-dim font-semibold mb-3 uppercase tracking-wider">
              {m.label}
            </div>
            <div className="text-2xl md:text-[26px] font-bold leading-none mb-2 tracking-[-0.025em]">
              {m.value}
              <span className="text-sm text-text-dim font-semibold ml-0.5">{m.unit}</span>
            </div>
            <div className="text-[11px] text-text-dim font-medium">{m.meta}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
