-- Rode uma vez no Supabase: SQL Editor → New query → cole tudo → Run.

create table if not exists public.eventos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  titulo text not null,
  data date not null,
  hora text not null default '',
  notas text not null default '',
  criado_em timestamptz not null default now()
);

-- Cada pessoa só enxerga e altera os próprios compromissos.
alter table public.eventos enable row level security;

drop policy if exists "dono" on public.eventos;
create policy "dono" on public.eventos
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
