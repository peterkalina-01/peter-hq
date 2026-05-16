import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://obisrvgvbmuiswvxyuhj.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iaXNydmd2Ym11aXN3dnh5dWhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1ODE5NDUsImV4cCI6MjA5NDE1Nzk0NX0.Jj_7Y_mS6ZEE5yK4-sB-12XDqaY3ZKuy9ulGjMFHGPo';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper — get today's date as YYYY-MM-DD
export const today = () => new Date().toISOString().split('T')[0];

// ─── DAILY LOG ───────────────────────────────────────────────────────────────
export async function getDailyLog() {
  const date = today();
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('date', date)
    .single();

  if (error && error.code === 'PGRST116') {
    const { data: newRow } = await supabase
      .from('daily_logs')
      .insert({ date })
      .select()
      .single();
    return newRow;
  }
  return data;
}

export async function updateDailyLog(updates: Record<string, unknown>) {
  const date = today();
  const { error } = await supabase
    .from('daily_logs')
    .upsert({ date, ...updates }, { onConflict: 'date' });
  return !error;
}

// ─── DAILY CALLS ─────────────────────────────────────────────────────────────
export type CallMetrics = {
  dials: number; calls: number; setts: number; closing: number; closed: number;
};

export async function getDailyCalls(date?: string): Promise<CallMetrics> {
  const d = date || today();
  const { data, error } = await supabase
    .from('daily_calls')
    .select('*')
    .eq('date', d)
    .single();

  if (error && error.code === 'PGRST116') {
    return { dials: 0, calls: 0, setts: 0, closing: 0, closed: 0 };
  }
  return data || { dials: 0, calls: 0, setts: 0, closing: 0, closed: 0 };
}

export async function updateDailyCalls(metrics: CallMetrics, date?: string) {
  const d = date || today();
  await supabase
    .from('daily_calls')
    .upsert({ date: d, ...metrics }, { onConflict: 'date' });
}

export async function getCallsHistory(days = 30): Promise<(CallMetrics & { date: string })[]> {
  const since = new Date(Date.now() - days * 24 * 3600000).toISOString().split('T')[0];
  const { data } = await supabase
    .from('daily_calls')
    .select('*')
    .gte('date', since)
    .order('date', { ascending: true });
  return data || [];
}

// ─── OVERRIDES (permanent manual values) ────────────────────────────────────
export async function getOverride(key: string): Promise<string | null> {
  const { data } = await supabase
    .from('overrides')
    .select('value')
    .eq('key', key)
    .single();
  return data?.value ?? null;
}

export async function setOverride(key: string, value: string) {
  await supabase
    .from('overrides')
    .upsert({ key, value }, { onConflict: 'key' });
}

export async function clearOverride(key: string) {
  await supabase.from('overrides').delete().eq('key', key);
}

export async function getAllOverrides(): Promise<Record<string, string>> {
  const { data } = await supabase.from('overrides').select('key, value');
  if (!data) return {};
  return Object.fromEntries(data.map(r => [r.key, r.value]));
}
