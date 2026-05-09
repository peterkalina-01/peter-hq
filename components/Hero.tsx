'use client';

const visionPoints = {
  Identity: [
    'I communicate with anyone, anywhere',
    'I lead every conversation on calls',
    'I am the authority — I know exactly what to do',
    'I am Batman',
  ],
  Mindset: [
    'I take full responsibility for my actions',
    'I make decisions on my own and say them out loud',
    'I am not overthinking',
    'I always do what needs to be done — nothing gets postponed',
  ],
  Execution: [
    'I open my laptop anywhere and run client calls at the highest energy',
    'I speak with clients knowing exactly what will help them',
    'I built my agency from $10K → $30K in three months',
  ],
  Lifestyle: [
    'I take multi-day trips with my girlfriend',
    'I attend masterminds with other entrepreneurs',
  ],
};

const dailyQuote = {
  text: 'Disciplína sa rovná slobode. Cesta, ktorou kráčaš dnes, stavia impérium, v ktorom budeš žiť zajtra.',
  source: 'Denný citát · viazaný na tvoju víziu',
};

export default function Hero() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Dobré ráno' : hour < 18 ? 'Dobrý deň' : 'Dobrý večer';
  const sleepHours = '6h 42min';
  const daysToMaturita = 18;
  const time = new Date().toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 mb-9">
      {/* Greeting */}
      <div className="bg-gradient-to-b from-bg-card to-bg-elev border border-border rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div
          className="absolute -top-1/2 -right-[10%] w-[400px] h-[400px] pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(200,255,0,0.06) 0%, transparent 70%)',
          }}
        />
        <div className="relative">
          <div className="text-xs text-accent font-semibold mb-3.5 tracking-tight">
            {time} · {daysToMaturita} dní do maturity
          </div>
          <h1 className="text-[28px] md:text-[38px] font-semibold leading-[1.15] tracking-[-0.03em] mb-4">
            {greeting}, <span className="text-accent font-bold">Peter</span>.
            <br />
            Spal si {sleepHours} a si v zóne.
          </h1>
          <div className="border-l-[3px] border-accent pl-5 py-4 mt-6 bg-accent/[0.04] rounded-r-lg">
            <div className="text-[15px] leading-[1.5] mb-2 font-medium">
              „{dailyQuote.text}"
            </div>
            <div className="text-[11px] text-text-dim font-medium">{dailyQuote.source}</div>
          </div>
        </div>
      </div>

      {/* Vision card */}
      <div className="bg-bg-card border border-border rounded-2xl p-6 relative overflow-hidden">
        <div
          className="absolute -bottom-[100px] -right-[100px] w-[250px] h-[250px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,120,73,0.08) 0%, transparent 70%)',
          }}
        />
        <div className="relative">
          <div className="text-[11px] text-text-dim font-semibold mb-3.5 flex items-center gap-2 tracking-wider uppercase">
            <span className="w-1.5 h-1.5 bg-warm rounded-full" />
            Vízia · 2027
          </div>

          <div className="space-y-3 mb-5 max-h-[180px] overflow-y-auto pr-2">
            {Object.entries(visionPoints).map(([category, points]) => (
              <div key={category}>
                <div className="text-[10px] text-warm font-bold uppercase tracking-wider mb-1">
                  {category}
                </div>
                <ul className="space-y-1">
                  {points.map((point, i) => (
                    <li key={i} className="text-[12px] text-text/90 leading-[1.4] flex items-start gap-2">
                      <span className="text-warm text-[8px] mt-1.5">●</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <div>
              <div className="flex justify-between items-center text-[12px] mb-1.5">
                <span className="text-text-dim font-medium">MRR</span>
                <span className="font-bold text-sm">$1K / $30K</span>
              </div>
              <div className="h-1 bg-bg-elev rounded overflow-hidden">
                <div className="h-full bg-warm rounded" style={{ width: '3.3%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center text-[12px] mb-1.5">
                <span className="text-text-dim font-medium">Klienti</span>
                <span className="font-bold text-sm">2 / 10</span>
              </div>
              <div className="h-1 bg-bg-elev rounded overflow-hidden">
                <div className="h-full bg-cool rounded" style={{ width: '20%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
