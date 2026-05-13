-- Peter HQ — Supabase schema
-- Run this in Supabase SQL Editor

-- Daily data (one row per day)
create table if not exists daily_logs (
  id uuid default gen_random_uuid() primary key,
  date date not null unique,
  -- Vision steps
  vision_step_1 boolean default false,
  vision_step_2 boolean default false,
  vision_step_3 boolean default false,
  vision_step_4 boolean default false,
  -- Personal
  skincare_am boolean default false,
  meditation_done boolean default false,
  meditation_minutes integer default 0,
  -- Work time
  work_deep_hours numeric default 0,
  work_calls_hours numeric default 0,
  work_admin_hours numeric default 0,
  work_content_hours numeric default 0,
  -- Activities
  workout_done boolean default false,
  workout_type text default '',
  workout_duration integer default 0,
  run_done boolean default false,
  -- Trackers
  screen_pc_hours numeric default 0,
  screen_phone_hours numeric default 0,
  english_minutes integer default 0,
  dates_minutes integer default 0,
  -- Weight
  weight_kg numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Caffeine entries
create table if not exists caffeine_log (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  drink text not null,
  mg integer not null,
  time_logged time not null,
  created_at timestamptz default now()
);

-- Workout sessions
create table if not exists workout_sessions (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  type text not null,
  duration_minutes integer default 0,
  notes text default '',
  created_at timestamptz default now()
);

-- Workout exercises (linked to sessions)
create table if not exists workout_exercises (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references workout_sessions(id) on delete cascade,
  name text not null,
  sets jsonb default '[]',
  created_at timestamptz default now()
);

-- Daily tasks (business)
create table if not exists daily_tasks (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  text text not null,
  tag text default 'Task',
  done boolean default false,
  created_at timestamptz default now()
);

-- Pipeline deals
create table if not exists pipeline (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  status text not null default 'Cold',
  value integer default 0,
  meta text default '',
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Subscriptions
create table if not exists subscriptions (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  price text not null,
  renews_date date,
  category text default 'Other',
  active boolean default true,
  created_at timestamptz default now()
);

-- Upgrade ideas
create table if not exists upgrades (
  id uuid default gen_random_uuid() primary key,
  text text not null,
  category text default 'Iné',
  priority text default 'Medium',
  done boolean default false,
  created_at timestamptz default now()
);

-- Call log
create table if not exists calls (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  client_name text not null,
  score integer,
  grade text,
  outcome text default '',
  notes text default '',
  created_at timestamptz default now()
);

-- Enable Row Level Security (public read/write for now - single user app)
alter table daily_logs enable row level security;
alter table caffeine_log enable row level security;
alter table workout_sessions enable row level security;
alter table workout_exercises enable row level security;
alter table daily_tasks enable row level security;
alter table pipeline enable row level security;
alter table subscriptions enable row level security;
alter table upgrades enable row level security;
alter table calls enable row level security;

-- Policies — allow all operations (single user app, no auth needed)
create policy "Allow all" on daily_logs for all using (true) with check (true);
create policy "Allow all" on caffeine_log for all using (true) with check (true);
create policy "Allow all" on workout_sessions for all using (true) with check (true);
create policy "Allow all" on workout_exercises for all using (true) with check (true);
create policy "Allow all" on daily_tasks for all using (true) with check (true);
create policy "Allow all" on pipeline for all using (true) with check (true);
create policy "Allow all" on subscriptions for all using (true) with check (true);
create policy "Allow all" on upgrades for all using (true) with check (true);
create policy "Allow all" on calls for all using (true) with check (true);

-- Insert default pipeline deals
insert into pipeline (name, status, value, meta) values
  ('Lonestar Land Group', 'Hot', 3400, 'Proposal sent · 3 dni'),
  ('Cypress Tree Pro', 'Warm', 2400, '2. call · piatok'),
  ('Brushhog Brothers', 'Warm', 1800, 'Čaká referencie'),
  ('Iron Oak Excavation', 'Cold', 800, '1. kontakt');

-- Insert default subscriptions
insert into subscriptions (name, price, category, renews_date) values
  ('Claude Max', '$100', 'AI', '2026-05-18'),
  ('GHL Pro', '$97', 'CRM', '2026-06-01'),
  ('Veo 3', '$30', 'Video', '2026-05-14'),
  ('ElevenLabs', '$22', 'AI', '2026-05-09'),
  ('ChatGPT Plus', '$20', 'AI', '2026-05-12'),
  ('CapCut Pro', '$15', 'Video', '2026-05-22'),
  ('SuperFaktúra', '€15', 'Finance', '2026-06-01');
