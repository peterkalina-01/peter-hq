'use client';

import TopBar from '@/components/TopBar';
import MobileNav from '@/components/MobileNav';
import { useState, useRef, useEffect } from 'react';

type Message = { role: 'user' | 'assistant'; text: string };

const PROSPECTS = [
  { id: 'skeptical', name: 'Mike — Skeptický', desc: 'Land clearing, 35K/mes, mal zlé skúsenosti s agentúrami', difficulty: 'Hard' },
  { id: 'price', name: 'Dave — Cenovo citlivý', desc: 'Roofing, 20K/mes, vždy sa pýta na cenu ako prvý', difficulty: 'Medium' },
  { id: 'busy', name: 'Jake — Vyhovárky', desc: 'Tree service, 15K/mes, vždy hovorí "nie je správny čas"', difficulty: 'Medium' },
  { id: 'easy', name: 'Tom — Ľahký close', desc: 'Paving, 25K/mes, hľadá riešenie, potrebuje len uistenie', difficulty: 'Easy' },
];

const FRAMEWORK = [
  'Hook — Qualifier-based opener',
  'Offer — Exkluzívne leady',
  'Risk Reversal — Platíš len za qualified lead',
  'Authority — Track record + "Who is this kid?"',
  'Social Proof — Meno + číslo + timeframe',
  'Mission — Prečo to robíš',
  'Exclusivity — One company per city',
  'CTA — Click Learn More below',
];

function CallAnalyzer() {
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!transcript.trim() || loading) return;
    setLoading(true);
    setAnalysis('');

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You are Peter's sales coach. Peter runs LeadsFlow Media — UGC + lead gen agency for US home services (land clearing, roofing, paving, fencing, HVAC).

His 9-module Hormozi framework: Hook (qualifier) → Offer → Risk Reversal ("you only pay after the lead is qualified") → Authority → Social Proof → Mission → Exclusivity (one company per city) → CTA (click Learn More below).

Analyze the call transcript. Give:
1. SCORE (0-100)
2. GRADE (A/B/C/D)
3. What went WELL (2-3 specific points)
4. What to IMPROVE (2-3 specific points with exact alternative phrasing)
5. MODULE COVERAGE — which of the 9 modules were hit, which were missed
6. ONE KEY LESSON for next call

Be direct, specific, no fluff. Like a real sales coach who has listened to thousands of calls. Respond in Slovak if transcript is Slovak, English if English.`,
          messages: [{ role: 'user', content: `Analyze this call transcript:\n\n${transcript}` }],
        }),
      });
      const data = await res.json();
      setAnalysis(data.content?.[0]?.text || 'Chyba pri analýze.');
    } catch {
      setAnalysis('Chyba spojenia. Skús znova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-bg-card border border-border rounded-2xl p-6">
        <h3 className="text-lg font-bold tracking-[-0.02em] mb-4">Analyzovať call</h3>
        <textarea
          value={transcript}
          onChange={e => setTranscript(e.target.value)}
          placeholder="Vlož transcript callu sem..."
          rows={8}
          className="w-full bg-bg-elev border border-border rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-accent transition-colors text-text placeholder:text-text-dim resize-none font-[inherit] mb-4"
        />
        <button
          onClick={analyze}
          disabled={loading || !transcript.trim()}
          className="w-full bg-accent text-bg py-3.5 rounded-xl text-sm font-bold hover:bg-accent-dim transition-colors disabled:opacity-40"
        >
          {loading ? 'Analyzujem...' : 'Analyzovať →'}
        </button>
      </div>

      {analysis && (
        <div className="bg-bg-card border border-border rounded-2xl p-6">
          <h3 className="text-base font-bold mb-4">Výsledok analýzy</h3>
          <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap text-text/90">{analysis}</div>
        </div>
      )}
    </div>
  );
}

function Roleplay() {
  const [selected, setSelected] = useState<typeof PROSPECTS[0] | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<'select' | 'chat' | 'feedback'>('select');
  const [feedback, setFeedback] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const start = (prospect: typeof PROSPECTS[0]) => {
    setSelected(prospect);
    setMessages([{ role: 'assistant', text: "Yeah? What's up." }]);
    setPhase('chat');
  };

  const send = async () => {
    if (!input.trim() || loading || !selected) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          system: `You are ${selected.name}. ${selected.desc}. 
You are a real US home service business owner on a cold call. Stay in character completely.
You are not easy to sell to — push back, have real objections, be skeptical.
Respond naturally, briefly (1-4 sentences). Use American English. Be realistic.
Do NOT break character. Do NOT say you're an AI.`,
          messages: [...messages, { role: 'user' as const, text: userMsg }].map(m => ({
            role: m.role,
            content: m.text,
          })),
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', text: data.content?.[0]?.text || '...' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Connection error.' }]);
    } finally {
      setLoading(false);
    }
  };

  const getFeedback = async () => {
    setPhase('feedback');
    setLoading(true);
    try {
      const transcript = messages.map(m => `${m.role === 'user' ? 'Peter' : selected?.name}: ${m.text}`).join('\n');
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 800,
          system: `You are Peter's sales coach. Analyze this roleplay session and give direct, actionable feedback. Peter uses a 9-module Hormozi framework. Be specific about what he did well and what to improve. 2-3 sentences max per point. End with ONE key thing to practice. Respond in Slovak.`,
          messages: [{ role: 'user', content: `Roleplay transcript with ${selected?.name}:\n\n${transcript}\n\nGive feedback.` }],
        }),
      });
      const data = await res.json();
      setFeedback(data.content?.[0]?.text || '');
    } catch {
      setFeedback('Chyba pri generovaní feedbacku.');
    } finally {
      setLoading(false);
    }
  };

  if (phase === 'select') {
    return (
      <div className="bg-bg-card border border-border rounded-2xl p-6">
        <h3 className="text-lg font-bold tracking-[-0.02em] mb-5">Vyber prospekta</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PROSPECTS.map(p => (
            <button
              key={p.id}
              onClick={() => start(p)}
              className="text-left p-4 bg-bg-elev border border-border rounded-xl hover:border-accent transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-bold">{p.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  p.difficulty === 'Hard' ? 'bg-rose/10 text-rose' :
                  p.difficulty === 'Medium' ? 'bg-warm/10 text-warm' :
                  'bg-accent/10 text-accent'
                }`}>{p.difficulty}</span>
              </div>
              <p className="text-xs text-text-dim font-medium">{p.desc}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'feedback') {
    return (
      <div className="bg-bg-card border border-border rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-4">Feedback · {selected?.name}</h3>
        {loading ? (
          <div className="flex gap-1.5 py-4">
            {[0,1,2].map(i => <span key={i} className="w-2 h-2 bg-text-dim rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
          </div>
        ) : (
          <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap text-text/90 mb-6">{feedback}</div>
        )}
        <button onClick={() => { setPhase('select'); setMessages([]); setFeedback(''); }}
          className="w-full bg-accent text-bg py-3 rounded-xl text-sm font-bold hover:bg-accent-dim transition-colors">
          Nový roleplay →
        </button>
      </div>
    );
  }

  return (
    <div className="bg-bg-card border border-border rounded-2xl p-6">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-lg font-bold">{selected?.name}</h3>
          <p className="text-xs text-text-dim font-medium">{selected?.desc}</p>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded ${selected?.difficulty === 'Hard' ? 'bg-rose/10 text-rose' : selected?.difficulty === 'Medium' ? 'bg-warm/10 text-warm' : 'bg-accent/10 text-accent'}`}>
          {selected?.difficulty}
        </span>
      </div>

      <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm font-medium ${
              m.role === 'user' ? 'bg-accent text-bg rounded-tr-sm' : 'bg-bg-elev border border-border rounded-tl-sm'
            }`}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-bg-elev border border-border px-4 py-2.5 rounded-2xl flex gap-1.5">
              {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 bg-text-dim rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Tvoja odpoveď..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          className="flex-1 bg-bg-elev border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors text-text placeholder:text-text-dim font-[inherit] font-medium"
        />
        <button onClick={send} disabled={loading}
          className="bg-accent text-bg px-4 py-3 rounded-xl text-sm font-bold hover:bg-accent-dim disabled:opacity-40">→</button>
        <button onClick={getFeedback}
          className="bg-bg-elev border border-border px-4 py-3 rounded-xl text-xs font-bold hover:border-accent transition-all">
          Feedback
        </button>
      </div>
    </div>
  );
}

export default function SalesPage() {
  const [tab, setTab] = useState<'analyze' | 'roleplay' | 'framework'>('roleplay');

  return (
    <>
      <TopBar />
      <main className="px-4 md:px-8 py-6 md:py-8 max-w-[900px] mx-auto pb-24 lg:pb-8">

        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-[-0.03em]">Sales</h1>
          <p className="text-sm text-text-dim font-medium mt-1">Coach · Analýza callov · Roleplay</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { lbl: 'Close rate', val: '28%', sub: 'Posledných 30 callov' },
            { lbl: 'Roleplay sessions', val: '7×', sub: 'Tento týždeň' },
            { lbl: 'Script reviews', val: '12×', sub: 'Tento mesiac' },
          ].map(s => (
            <div key={s.lbl} className="bg-bg-card border border-border rounded-2xl p-5">
              <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-2">{s.lbl}</div>
              <div className="text-2xl font-bold tracking-[-0.025em] mb-1">{s.val}</div>
              <div className="text-xs text-text-dim font-medium">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-bg-elev border border-border rounded-xl p-1">
          {(['roleplay', 'analyze', 'framework'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all capitalize ${tab === t ? 'bg-bg-card text-text' : 'text-text-dim hover:text-text'}`}>
              {t === 'roleplay' ? 'Roleplay' : t === 'analyze' ? 'Analyzovať call' : 'Framework'}
            </button>
          ))}
        </div>

        {tab === 'roleplay' && <Roleplay />}
        {tab === 'analyze' && <CallAnalyzer />}
        {tab === 'framework' && (
          <div className="bg-bg-card border border-border rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-5">9-modul Hormozi framework</h3>
            <div className="space-y-3">
              {FRAMEWORK.map((step, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-bg-elev rounded-xl">
                  <span className="w-7 h-7 rounded-lg bg-accent/10 text-accent flex items-center justify-center text-xs font-extrabold flex-shrink-0">{i + 1}</span>
                  <span className="text-sm font-medium">{step}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 p-4 bg-accent/[0.04] border border-accent/20 rounded-xl">
              <div className="text-xs font-bold text-accent mb-1">CTA rule</div>
              <div className="text-xs font-medium text-text/80">Pre paid traffic vždy: "click Learn More below to [next step]" — nikdy organic CTA (comment, DM, link in bio)</div>
            </div>
          </div>
        )}

      </main>
      <MobileNav />
    </>
  );
}
