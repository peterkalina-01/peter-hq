'use client';

import TopBar from '@/components/TopBar';
import MobileNav from '@/components/MobileNav';
import { useState, useEffect } from 'react';
import { EditableValue } from '@/components/EditableValue';
import { supabase, getAllOverrides, setOverride, clearOverride } from '@/lib/supabase';

type StripeData = {
  mrr: number;
  revenue7d: number;
  revenue30d: number;
  activeCustomers: number;
  activeSubscriptions?: number;
  transactions: { id: string; amount: number; currency: string; description: string; date: string }[];
};

function useOverride<T>(key: string, realVal: T) {
  const [val, setVal] = useState<T>(realVal);
  const [overridden, setOverridden] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase.from('overrides').select('value').eq('key', `fin_${key}`).single()
      .then(({ data }) => {
        if (data?.value) {
          setVal(JSON.parse(data.value) as T);
          setOverridden(true);
        } else {
          setVal(realVal);
        }
        setLoaded(true);
      });
  }, [key]); // eslint-disable-line

  // Sync realVal if not overridden
  useEffect(() => {
    if (loaded && !overridden) setVal(realVal);
  }, [realVal, loaded, overridden]);

  const save = async (v: string) => {
    const parsed = parseFloat(v.replace(/[^0-9.]/g, '')) || 0;
    setVal(parsed as unknown as T);
    setOverridden(true);
    await setOverride(`fin_${key}`, JSON.stringify(parsed));
  };

  const clear = async () => {
    setOverridden(false);
    setVal(realVal);
    await clearOverride(`fin_${key}`);
  };

  return { val, overridden, save, clear };
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-bg-card border border-border rounded-2xl p-5 ${className}`}>{children}</div>;
}

const periods = ['Dnes', '7d', '30d', 'YTD'];

export default function FinancePage() {
  const [period, setPeriod] = useState('30d');
  const [txTab, setTxTab] = useState('Transakcie');
  const [stripe, setStripe] = useState<StripeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stripe').then(r => r.json()).then(d => {
      if (!d.error) setStripe(d);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Overrideable values
  const realRevenue = period === 'Dnes' ? (stripe?.revenue7d || 0) / 7
    : period === '7d' ? stripe?.revenue7d || 0
    : period === '30d' ? stripe?.revenue30d || 0
    : (stripe?.revenue30d || 0) * 4;

  const mrrO = useOverride('mrr', stripe?.mrr || 0);
  const revO = useOverride(`rev_${period}`, realRevenue);
  const expO = useOverride(`exp_${period}`, Math.round(realRevenue * 0.37));
  const custO = useOverride('customers', stripe?.activeCustomers || 0);

  const profit = (revO.val as number) - (expO.val as number);
  const margin = (revO.val as number) > 0 ? ((profit / (revO.val as number)) * 100).toFixed(1) : '0';

  const expenses = [
    { name: 'Meta Ads spend', pct: 54, color: '#ff7849' },
    { name: 'Editori + creators', pct: 26, color: '#6db6ff' },
    { name: 'Software / SaaS', pct: 10, color: '#a78bfa' },
    { name: 'Osobné výdavky', pct: 6, color: '#ff5d7a' },
    { name: 'Iné', pct: 4, color: '#2dd4bf' },
  ].map(e => ({ ...e, amount: Math.round((expO.val as number) * e.pct / 100) }));

  const DEFAULT_SUBS = [
    { name: 'Claude Max', price: '$100', renews: '18. máj' },
    { name: 'GHL Pro', price: '$97', renews: '1. jún' },
    { name: 'Veo 3', price: '$30', renews: '14. máj' },
    { name: 'ElevenLabs', price: '$22', renews: '9. máj' },
    { name: 'ChatGPT Plus', price: '$20', renews: '12. máj' },
    { name: 'CapCut Pro', price: '$15', renews: '22. máj' },
    { name: 'SuperFaktúra', price: '€15', renews: '1. jún' },
  ];

  const [subs, setSubs] = useState(DEFAULT_SUBS);
  const [newSub, setNewSub] = useState({ name: '', price: '', renews: '' });
  const [addingNew, setAddingNew] = useState(false);

  // Load subs from Supabase overrides
  useEffect(() => {
    supabase.from('overrides').select('value').eq('key', 'subscriptions').single()
      .then(({ data }) => {
        if (data?.value) { try { setSubs(JSON.parse(data.value)); } catch {} }
      });
  }, []);

  const saveSubs = async (newSubs: typeof DEFAULT_SUBS) => {
    setSubs(newSubs);
    await setOverride('subscriptions', JSON.stringify(newSubs));
  };

  const totalSubs = subs.reduce((sum, s) => sum + (parseFloat(s.price.replace(/[^0-9.]/g, '')) || 0), 0);

  return (
    <>
      <TopBar />
      <main className="px-4 md:px-6 py-5 max-w-[1400px] mx-auto pb-24 lg:pb-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-[-0.03em]">Financie</h1>
            <p className="text-xs text-text-dim mt-1">
              {loading ? 'Načítavam Stripe...' : stripe ? '✓ Stripe live' : '⚠ Stripe nedostupný'}
              <span className="ml-2 text-text-subtle">· Klikni na číslo pre manuálnu úpravu</span>
            </p>
          </div>
          <div className="flex gap-1 bg-bg-elev border border-border rounded-xl p-1">
            {periods.map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-2 text-xs font-bold rounded-lg transition-all ${period === p ? 'bg-accent text-bg' : 'text-text-dim hover:text-text'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: 'MRR', colorClass: 'border-l-accent',
              value: <EditableValue value={`$${Number(mrrO.val).toLocaleString()}`} onSave={mrrO.save} onClear={mrrO.clear} isOverridden={mrrO.overridden} className="text-2xl font-bold tracking-tight text-accent"/>,
              sub: mrrO.overridden ? '⚠ manuálne' : stripe ? '✓ Stripe live' : '— nedostupný',
              subColor: mrrO.overridden ? '#ff7849' : stripe ? '#c8ff00' : '#888',
            },
            {
              label: `Tržby · ${period}`, colorClass: 'border-l-warm',
              value: <EditableValue value={`$${Number(revO.val).toLocaleString()}`} onSave={revO.save} onClear={revO.clear} isOverridden={revO.overridden} className="text-2xl font-bold tracking-tight"/>,
              sub: revO.overridden ? '⚠ manuálne' : stripe ? '✓ Stripe live' : '— nedostupný',
              subColor: revO.overridden ? '#ff7849' : stripe ? '#c8ff00' : '#888',
            },
            {
              label: `Náklady · ${period}`, colorClass: 'border-l-cool',
              value: <EditableValue value={`$${Number(expO.val).toLocaleString()}`} onSave={expO.save} onClear={expO.clear} isOverridden={expO.overridden} className="text-2xl font-bold tracking-tight"/>,
              sub: '← Klikni pre manuálnu úpravu', subColor: '#888',
            },
            {
              label: 'Čistý zisk', colorClass: 'border-l-violet',
              value: <span className="text-2xl font-bold tracking-tight" style={{ color: profit >= 0 ? '#c8ff00' : '#ff5d7a' }}>${profit.toLocaleString()}</span>,
              sub: `Marža ${margin}%`, subColor: profit >= 0 ? '#c8ff00' : '#ff5d7a',
            },
          ].map(s => (
            <div key={s.label} className={`bg-bg-elev border border-border border-l-[3px] ${s.colorClass} rounded-2xl p-4`}>
              <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-2">{s.label}</div>
              <div className="mb-1">{s.value}</div>
              <div className="text-[10px] font-semibold" style={{ color: s.subColor }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Clients */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Aktívni klienti', value: custO.val, save: custO.save, clear: custO.clear, overridden: custO.overridden, color: '#ff7849' },
            { label: 'Aktívne sub.', value: stripe?.activeSubscriptions || '—', color: '#c8ff00' },
            { label: 'Cieľ MRR', value: '$30,000', color: '#6db6ff' },
          ].map(s => (
            <Card key={s.label}>
              <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-2">{s.label}</div>
              {'save' in s ? (
                <EditableValue
                  value={String(s.value)}
                  onSave={s.save as (v: string) => void}
                  onClear={s.clear}
                  isOverridden={s.overridden}
                  className="text-2xl font-bold tracking-tight"
                />
              ) : (
                <div className="text-2xl font-bold tracking-tight" style={{ color: s.color }}>{s.value}</div>
              )}
            </Card>
          ))}
        </div>

        {/* Breakdown + Subscriptions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <Card>
            <h3 className="text-sm font-bold mb-4">Náklady · breakdown</h3>
            <div className="space-y-3">
              {expenses.map(it => (
                <div key={it.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="flex items-center gap-2 font-medium">
                      <span className="w-2 h-2 rounded-full" style={{ background: it.color }} />{it.name}
                    </span>
                    <span className="font-bold">${it.amount.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-bg-elev rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${it.pct}%`, background: it.color }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold">Predplatné</h3>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-accent">${totalSubs.toFixed(0)} / mes</span>
                <button onClick={() => setAddingNew(true)} className="text-xs bg-accent text-bg px-2 py-1 rounded-lg font-bold">+ Pridať</button>
              </div>
            </div>

            {addingNew && (
              <div className="flex gap-2 mb-3 p-3 bg-bg-elev rounded-xl border border-border">
                <input placeholder="Názov" value={newSub.name} onChange={e => setNewSub(p => ({ ...p, name: e.target.value }))}
                  className="flex-1 bg-bg-card border border-border rounded-lg px-2 py-1.5 text-xs outline-none focus:border-accent text-text font-[inherit]"/>
                <input placeholder="$20" value={newSub.price} onChange={e => setNewSub(p => ({ ...p, price: e.target.value }))}
                  className="w-16 bg-bg-card border border-border rounded-lg px-2 py-1.5 text-xs outline-none focus:border-accent text-text font-[inherit]"/>
                <input placeholder="1. jún" value={newSub.renews} onChange={e => setNewSub(p => ({ ...p, renews: e.target.value }))}
                  className="w-20 bg-bg-card border border-border rounded-lg px-2 py-1.5 text-xs outline-none focus:border-accent text-text font-[inherit]"/>
                <button onClick={() => {
                  if (newSub.name && newSub.price) {
                    saveSubs([...subs, newSub]);
                    setNewSub({ name: '', price: '', renews: '' });
                    setAddingNew(false);
                  }
                }} className="bg-accent text-bg px-2 py-1.5 rounded-lg text-xs font-bold">✓</button>
                <button onClick={() => setAddingNew(false)} className="text-text-dim px-2 py-1.5 rounded-lg text-xs">✕</button>
              </div>
            )}

            <div className="space-y-2">
              {subs.map((s, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-bg-elev rounded-xl group">
                  <div>
                    <div className="text-sm font-semibold">{s.name}</div>
                    <div className="text-xs text-text-dim">{s.renews}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-bold">{s.price}</div>
                    <button onClick={() => saveSubs(subs.filter((_, j) => j !== i))}
                      className="opacity-0 group-hover:opacity-100 text-text-dim hover:text-rose text-xs transition-all">✕</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Transactions */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4">
              {['Transakcie', 'Faktúry'].map(t => (
                <button key={t} onClick={() => setTxTab(t)}
                  className={`text-sm font-bold pb-1 border-b-2 transition-all ${txTab === t ? 'text-text border-accent' : 'text-text-dim border-transparent'}`}>
                  {t}
                </button>
              ))}
            </div>
            <span className="text-xs text-text-dim">
              {stripe ? `${stripe.transactions.length} posledných` : loading ? 'Načítavam...' : 'Stripe nedostupný'}
            </span>
          </div>

          {txTab === 'Transakcie' && (
            <div className="space-y-0">
              {stripe?.transactions?.length ? stripe.transactions.map(t => (
                <div key={t.id} className="grid grid-cols-[auto_1fr_auto] gap-4 py-3 border-b border-white/[0.04] last:border-b-0 items-center">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm bg-accent/10 text-accent">↓</div>
                  <div>
                    <div className="text-sm font-semibold">{t.description}</div>
                    <div className="text-xs text-text-dim">{t.date} · Stripe</div>
                  </div>
                  <span className="text-sm font-bold text-accent">+{t.currency === 'USD' ? '$' : t.currency}{t.amount.toLocaleString()}</span>
                </div>
              )) : (
                <div className="text-center py-8 text-text-dim text-sm">
                  {loading ? 'Načítavam transakcie zo Stripe...' : 'Žiadne transakcie · skontroluj Stripe key'}
                </div>
              )}
            </div>
          )}

          {txTab === 'Faktúry' && (
            <div className="text-center py-8 text-text-dim text-sm">
              SuperFaktúra integrácia — pridáme neskôr
            </div>
          )}
        </Card>

      </main>
      <MobileNav />
    </>
  );
}
