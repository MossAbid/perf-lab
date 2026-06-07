-- =====================================================================
-- PERF LAB — schéma Supabase
-- À coller dans : dashboard Supabase → SQL Editor → New query → Run
-- =====================================================================

-- Programmes (la bibliothèque de l'utilisateur)
create table if not exists public.programs (
  user_id    uuid not null references auth.users(id) on delete cascade,
  id         text not null,                 -- slug du programme (#/p/<id>)
  data       jsonb not null,                -- l'objet programme complet
  sort       int  not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- Progression (séries cochées + charges), une ligne par (programme, semaine)
create table if not exists public.progress (
  user_id    uuid not null references auth.users(id) on delete cascade,
  program_id text not null,
  week       int  not null,
  state      jsonb not null default '{}',   -- { sessionId: { exKey: { done:[], load:[] } } }
  updated_at timestamptz not null default now(),
  primary key (user_id, program_id, week)
);

-- ---------- Sécurité : chaque utilisateur ne voit que ses lignes ----------
alter table public.programs enable row level security;
alter table public.progress enable row level security;

drop policy if exists "own_programs" on public.programs;
create policy "own_programs" on public.programs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own_progress" on public.progress;
create policy "own_progress" on public.progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =====================================================================
-- Après ça : Authentication → Providers → Email → (pour un usage perso)
-- désactive "Confirm email" pour pouvoir te connecter instantanément.
-- =====================================================================
