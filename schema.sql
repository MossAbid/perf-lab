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

-- État libre : paliers RPE (progression), semaine courante par programme
-- (weeks) et journal de séances (log). Un blob JSON par clé — même forme
-- que le cache localStorage correspondant, pour rester synchronisé même
-- si l'app perd son localStorage (ex. purge iOS d'une PWA peu utilisée).
create table if not exists public.state (
  user_id    uuid not null references auth.users(id) on delete cascade,
  key        text not null,                 -- 'progression' | 'weeks' | 'log'
  value      jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.state enable row level security;

drop policy if exists "own_state" on public.state;
create policy "own_state" on public.state
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =====================================================================
-- Après ça : Authentication → Providers → Email → (pour un usage perso)
-- désactive "Confirm email" pour pouvoir te connecter instantanément.
--
-- Compte CLOUD déjà créé avant l'ajout de cette table ? Colle juste le
-- bloc "state" ci-dessus dans le SQL Editor et relance l'app — rien
-- d'autre à migrer, la table se remplit au fil des séances.
-- =====================================================================

-- =====================================================================
-- PROGRAMMATION (module « Ta semaine ») — contenu des cycles + athlètes
-- Le contenu des cycles n'est jamais dans le dépôt : il vit ici.
-- Les données de l'athlète (max, séances faites, scores) restent dans
-- la table `state`, clé `cycle`.
-- =====================================================================
create table if not exists public.cycles (
  id         text primary key,
  owner      uuid not null references auth.users(id) on delete cascade,
  data       jsonb not null,                -- cycle complet perflab-cycle-v1
  updated_at timestamptz not null default now(),
  unique (id, owner)                        -- cible de la clé composite ci-dessous
);
create table if not exists public.cycle_athletes (
  cycle_id text not null,
  user_id  uuid not null references auth.users(id) on delete cascade,
  owner    uuid not null references auth.users(id) on delete cascade,
  active   boolean not null default true,
  primary key (cycle_id, user_id),
  -- un lien ne peut nommer comme `owner` que le vrai auteur du cycle
  -- (sinon n'importe quel compte se déclarerait propriétaire du cycle d'un autre)
  foreign key (cycle_id, owner) references public.cycles(id, owner) on delete cascade
);
alter table public.cycles enable row level security;
alter table public.cycle_athletes enable row level security;

-- l'auteur gère ses cycles ; un athlète inscrit les lit
drop policy if exists "cycles_owner" on public.cycles;
create policy "cycles_owner" on public.cycles
  for all using (auth.uid() = owner) with check (auth.uid() = owner);
drop policy if exists "cycles_athlete_read" on public.cycles;
create policy "cycles_athlete_read" on public.cycles
  for select using (exists (select 1 from public.cycle_athletes a
                            where a.cycle_id = cycles.id and a.user_id = auth.uid()));

-- `owner` est recopié ici pour que ces règles ne lisent jamais `cycles`
-- (sinon récursion de RLS entre les deux tables)
-- v1 : on ne s'inscrit qu'à ses propres cycles (owner = user_id = soi) ; l'inscription
-- d'autres athlètes par un coach viendra avec le plan multi-athlètes.
drop policy if exists "ca_owner" on public.cycle_athletes;
create policy "ca_owner" on public.cycle_athletes
  for all using (auth.uid() = owner) with check (auth.uid() = owner and auth.uid() = user_id);
drop policy if exists "ca_self_read" on public.cycle_athletes;
create policy "ca_self_read" on public.cycle_athletes
  for select using (auth.uid() = user_id);
