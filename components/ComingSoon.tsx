'use client';

export default function ComingSoon({
  title,
  description,
  features,
}: {
  title: string;
  description: string;
  features: string[];
}) {
  return (
    <div className="px-4 md:px-8 py-12 max-w-[900px] mx-auto">
      <div className="bg-bg-card border border-border rounded-2xl p-8 md:p-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
          <span className="text-[11px] text-accent font-bold uppercase tracking-wider">
            V príprave
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-[-0.03em] mb-4">{title}</h1>
        <p className="text-base md:text-lg text-text-dim leading-relaxed mb-8 font-medium">
          {description}
        </p>
        <div className="space-y-2.5">
          <div className="text-[11px] font-bold text-text-dim uppercase tracking-wider mb-3">
            Bude obsahovať
          </div>
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <span className="text-accent font-bold mt-0.5">→</span>
              <span className="text-text/90 font-medium">{f}</span>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-8 border-t border-border text-xs text-text-dim font-medium">
          Pripojí sa zajtra · Stripe · SuperFaktúra · GHL · Meta Ads · Garmin · Claude API
        </div>
      </div>
    </div>
  );
}
