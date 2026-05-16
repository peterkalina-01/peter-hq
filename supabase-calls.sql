-- Spusti toto v Supabase SQL Editore

-- Daily calls tracking (Dials/Calls/Setts/Closing/Closed)
create table if not exists daily_calls (
  id uuid default gen_random_uuid() primary key,
  date date not null unique,
  dials integer default 0,
  calls integer default 0,
  setts integer default 0,
  closing integer default 0,
  closed integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table daily_calls enable row level security;
create policy "Allow all" on daily_calls for all using (true) with check (true);

-- Finance & business overrides (permanent manual overrides)
create table if not exists overrides (
  id uuid default gen_random_uuid() primary key,
  key text not null unique,
  value text not null,
  updated_at timestamptz default now()
);

alter table overrides enable row level security;
create policy "Allow all" on overrides for all using (true) with check (true);

-- Weekly goals
create table if not exists weekly_goals (
  id uuid default gen_random_uuid() primary key,
  week_start date not null,  -- always Monday
  goal_index integer not null check (goal_index in (0,1,2)),
  title text not null default '',
  notes text not null default '',
  done boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(week_start, goal_index)
);
alter table weekly_goals enable row level security;
create policy "Allow all" on weekly_goals for all using (true) with check (true);
