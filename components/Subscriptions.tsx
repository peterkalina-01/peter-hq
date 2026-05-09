'use client';

const subs = [
  { name: 'ChatGPT Plus', meta: 'Obnovuje 12. máj', price: '$20' },
  { name: 'Claude Max', meta: 'Obnovuje 18. máj', price: '$100' },
  { name: 'GHL Pro', meta: 'Obnovuje 1. jún', price: '$97' },
  { name: 'CapCut Pro', meta: 'Obnovuje 22. máj', price: '$15' },
  { name: 'ElevenLabs', meta: 'Obnovuje 9. máj', price: '$22' },
  { name: 'Veo 3', meta: 'Obnovuje 14. máj', price: '$30' },
  { name: 'SuperFaktúra', meta: 'Obnovuje 1. jún', price: '€15' },
];

export default function Subscriptions() {
  return (
    <div className="bg-bg-card border border-border rounded-2xl p-6 mb-9">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold tracking-[-0.02em]">Predplatné · mesačné</h3>
        <div className="text-[22px] font-bold text-accent tracking-[-0.025em]">$284 / mes</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {subs.map((s) => (
          <div
            key={s.name}
            className="bg-bg-elev border border-border rounded-xl p-3.5 flex justify-between items-center"
          >
            <div>
              <div className="text-[13px] font-semibold">{s.name}</div>
              <div className="text-[10px] text-text-dim font-medium mt-0.5">{s.meta}</div>
            </div>
            <div className="text-sm font-bold">{s.price}</div>
          </div>
        ))}
        <button className="bg-transparent border border-dashed border-border-strong rounded-xl p-3.5 flex justify-between items-center hover:border-accent transition-all">
          <div>
            <div className="text-[13px] font-semibold text-text-dim">+ Pridať predplatné</div>
            <div className="text-[10px] text-text-dim font-medium mt-0.5">Manuálne</div>
          </div>
        </button>
      </div>
    </div>
  );
}
