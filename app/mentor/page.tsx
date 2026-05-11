'use client';

import TopBar from '@/components/TopBar';
import MobileNav from '@/components/MobileNav';
import { useState, useRef, useEffect } from 'react';

type Message = { role: 'user' | 'assistant'; text: string };

const VISION = `Peter's vision:
IDENTITY: I communicate with anyone, anywhere. I lead every conversation on calls. I am the authority — I know exactly what to do. I am Batman.
MINDSET: I take full responsibility. I make decisions on my own. I am not overthinking. I always do what needs to be done.
EXECUTION: I open my laptop anywhere and run client calls at the highest energy. I built my agency from $10K → $30K in three months.
LIFESTYLE: I take multi-day trips with my girlfriend. I attend masterminds with other entrepreneurs.
GOALS: MRR $1K → $30K, Clients 2 → 10.
BUSINESS: LeadsFlow Media — UGC + lead gen for land clearing, home services (US market). 
DAILY STEPS: $40 into ads, 5× remind myself of vision, study mindset book 45min, meditation 20min.`;

export default function MentorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: "Ahoj Peter. Som tu. Viem o tvojej vízii, viem kde si teraz a kam ideš. Čo ti leží na mysli dnes?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
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
          max_tokens: 1000,
          system: `You are Peter's personal AI mentor. You know everything about him:
${VISION}

You speak to him like a real mentor — direct, warm, no fluff. You know his context so don't ask basic questions. You push him when he needs it, support him when he needs it. Respond in the same language he writes in (Slovak or English). Keep responses concise — max 3-4 sentences unless he needs more. You remember everything shared in this conversation.`,
          messages: [...messages, { role: 'user' as const, text: userMsg }].map(m => ({
            role: m.role,
            content: m.text,
          })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || 'Niečo sa pokazilo, skús znova.';
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Chyba spojenia. Skús znova.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopBar />
      <main className="px-4 md:px-8 py-6 max-w-[800px] mx-auto pb-32 lg:pb-8 flex flex-col" style={{ minHeight: 'calc(100vh - 73px)' }}>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-[-0.03em]">Mentor</h1>
          <p className="text-sm text-text-dim font-medium mt-1">Pozná tvoju víziu, tvoj týždeň, tvoj kontext.</p>
        </div>

        {/* Context pill */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['Vízia ✓', 'Kroky k vízii ✓', 'LeadsFlow ✓', 'MRR $1K → $30K ✓', '18 dní do maturity ✓'].map(tag => (
            <span key={tag} className="text-xs font-bold px-3 py-1.5 bg-accent/10 text-accent rounded-full">{tag}</span>
          ))}
        </div>

        {/* Chat */}
        <div className="flex-1 space-y-4 mb-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold text-sm text-bg mr-3 flex-shrink-0 mt-0.5">M</div>
              )}
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed ${
                m.role === 'user'
                  ? 'bg-accent text-bg rounded-tr-sm'
                  : 'bg-bg-card border border-border rounded-tl-sm'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold text-sm text-bg mr-3 flex-shrink-0">M</div>
              <div className="bg-bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 bg-text-dim rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              'Ako ide dnes môj deň?',
              'Čo by si mi poradil k môjmu MRR?',
              'Potrebujem motiváciu',
              'Pomôž mi s prioritami na dnes',
            ].map(s => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="text-xs font-semibold p-3 bg-bg-card border border-border rounded-xl hover:border-accent text-text-dim hover:text-text transition-all text-left"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-3 sticky bottom-20 lg:bottom-4">
          <input
            type="text"
            placeholder="Napíš mentorovi..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            className="flex-1 bg-bg-card border border-border rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-accent transition-colors text-text placeholder:text-text-dim font-[inherit]"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="bg-accent text-bg px-6 py-4 rounded-2xl text-sm font-bold hover:bg-accent-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            →
          </button>
        </div>

      </main>
      <MobileNav />
    </>
  );
}
