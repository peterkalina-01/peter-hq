import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://obisrvgvbmuiswvxyuhj.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iaXNydmd2Ym11aXN3dnh5dWhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1ODE5NDUsImV4cCI6MjA5NDE1Nzk0NX0.Jj_7Y_mS6ZEE5yK4-sB-12XDqaY3ZKuy9ulGjMFHGPo';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper — get today's date as YYYY-MM-DD
export const today = () => new Date().toISOString().split('T')[0];

// Get or create today's daily log
export async function getDailyLog() {
  const date = today();
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('date', date)
    .single();

  if (error && error.code === 'PGRST116') {
    // Row doesn't exist — create it
    const { data: newRow } = await supabase
      .from('daily_logs')
      .insert({ date })
      .select()
      .single();
    return newRow;
  }
  return data;
}

// Update today's daily log
export async function updateDailyLog(updates: Record<string, unknown>) {
  const date = today();
  const { error } = await supabase
    .from('daily_logs')
    .upsert({ date, ...updates }, { onConflict: 'date' });
  return !error;
}
