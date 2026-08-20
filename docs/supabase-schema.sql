-- ============================================================
-- NUESTRO UNIVERSO — ESQUEMA SUPABASE
-- ============================================================
-- Cómo usarlo:
--   1. Supabase > SQL Editor > New query.
--   2. Pega TODO este archivo y pulsa "Run".
--   3. Luego en la app: copia .env.example a .env.local y pon
--      DATABASE_PROVIDER=supabase + tus claves (Settings > API).
--
-- ⚠️ Seguridad: todas las tablas se crean CON Row Level Security
-- ACTIVA, con una política que permite a la app (clave anónima)
-- leer y escribir. Es una app personal de pareja: las políticas
-- son abiertas (using true / with check true), pero la RLS queda
-- activada como pide el panel de Supabase.
-- Si algún día la app fuera pública, cambia las políticas por
-- unas por usuario.
-- El archivo es idempotente: puedes ejecutarlo todas las veces
-- que quieras sin romper nada.

-- ---------- RECUERDOS ----------
create table if not exists public.memories (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  description text,
  kind text not null check (kind in ('photo', 'video', 'note')),
  url text,
  date text not null,
  emoji text,
  tint text,
  tags jsonb,
  author text
);

alter table public.memories add column if not exists author text;

alter table public.memories enable row level security;
drop policy if exists "memories access" on public.memories;
create policy "memories access" on public.memories
  for all using (true) with check (true);

-- ---------- ALMACÉN DE FOTOS Y VIDEOS DE RECUERDOS (bucket público) ----------
insert into storage.buckets (id, name, public)
values ('recuerdos', 'recuerdos', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'recuerdos public select'
  ) then
    create policy "recuerdos public select"
      on storage.objects for select using (bucket_id = 'recuerdos');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'recuerdos public insert'
  ) then
    create policy "recuerdos public insert"
      on storage.objects for insert with check (bucket_id = 'recuerdos');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'recuerdos public delete'
  ) then
    create policy "recuerdos public delete"
      on storage.objects for delete using (bucket_id = 'recuerdos');
  end if;
end $$;

-- ---------- HISTORIA ----------
create table if not exists public.chapters (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  date text not null,
  content text not null,
  image_url text,
  atmosphere text,
  quote text,
  author text
);

alter table public.chapters add column if not exists author text;

alter table public.chapters enable row level security;
drop policy if exists "chapters access" on public.chapters;
create policy "chapters access" on public.chapters
  for all using (true) with check (true);

-- ---------- CARTAS ----------
create table if not exists public.letters (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  read boolean not null default false,
  author text
);

alter table public.letters add column if not exists author text;

alter table public.letters enable row level security;
drop policy if exists "letters access" on public.letters;
create policy "letters access" on public.letters
  for all using (true) with check (true);

-- ---------- JUEGOS (récords) ----------
create table if not exists public.games (
  id text primary key,
  name text not null,
  description text,
  high_score integer not null default 0
);

alter table public.games enable row level security;
drop policy if exists "games access" on public.games;
create policy "games access" on public.games
  for all using (true) with check (true);

-- ---------- REGALOS ----------
create table if not exists public.gifts (
  id text primary key default gen_random_uuid()::text,
  kind text not null default 'given' check (kind in ('wish', 'given')),
  title text not null,
  subtitle text,
  description text,
  author text,
  image_url text,
  emoji text,
  date text not null,
  created_at timestamptz not null default now()
);

-- Columnas nuevas para regalos creados en versiones anteriores:
alter table public.gifts add column if not exists kind text not null default 'given';
alter table public.gifts add column if not exists subtitle text;
alter table public.gifts add column if not exists author text;
alter table public.gifts add column if not exists emoji text;
alter table public.gifts add column if not exists created_at timestamptz not null default now();

alter table public.gifts enable row level security;
drop policy if exists "gifts access" on public.gifts;
create policy "gifts access" on public.gifts
  for all using (true) with check (true);

-- ---------- ALMACÉN DE FOTOS DE REGALOS (bucket público) ----------
insert into storage.buckets (id, name, public)
values ('regalos', 'regalos', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'regalos public select'
  ) then
    create policy "regalos public select"
      on storage.objects for select using (bucket_id = 'regalos');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'regalos public insert'
  ) then
    create policy "regalos public insert"
      on storage.objects for insert with check (bucket_id = 'regalos');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'regalos public delete'
  ) then
    create policy "regalos public delete"
      on storage.objects for delete using (bucket_id = 'regalos');
  end if;
end $$;

-- ---------- CANCIONES ----------
create table if not exists public.songs (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  artist text not null,
  reason text not null default '',
  author text not null default '',
  emoji text,
  audio_url text not null,
  created_at timestamptz not null default now()
);

alter table public.songs enable row level security;
drop policy if exists "songs access" on public.songs;
create policy "songs access" on public.songs
  for all using (true) with check (true);

-- ---------- ALMACÉN DE AUDIOS (bucket público) ----------
insert into storage.buckets (id, name, public)
values ('songs', 'songs', true)
on conflict (id) do nothing;

-- Políticas de acceso: sin estas, subir una canción falla con
-- "new row violates row-level security policy".
-- (Se usa un DO block para que funcione también en PostgreSQL 14,
--  donde CREATE POLICY no soporta IF NOT EXISTS.)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'songs public select'
  ) then
    create policy "songs public select"
      on storage.objects for select using (bucket_id = 'songs');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'songs public insert'
  ) then
    create policy "songs public insert"
      on storage.objects for insert with check (bucket_id = 'songs');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'songs public update'
  ) then
    create policy "songs public update"
      on storage.objects for update using (bucket_id = 'songs');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'songs public delete'
  ) then
    create policy "songs public delete"
      on storage.objects for delete using (bucket_id = 'songs');
  end if;
end $$;

-- ---------- LOGROS (retos con verificación) ----------
create table if not exists public.achievements (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  emoji text not null default '🏅',
  howto text not null default '',
  author text not null default '',
  deadline text,
  status text not null default 'pending'
    check (status in ('pending', 'review', 'done', 'failed')),
  completed_by text,
  completed_at timestamptz,
  completion_phrase text,
  images jsonb not null default '[]'::jsonb,
  verified_by text,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

-- Foto de ilustración del reto (opcional):
alter table public.achievements add column if not exists image_url text;

alter table public.achievements enable row level security;
drop policy if exists "achievements access" on public.achievements;
create policy "achievements access" on public.achievements
  for all using (true) with check (true);

-- ---------- ALMACÉN DE PRUEBAS DE LOGROS (bucket público) ----------
insert into storage.buckets (id, name, public)
values ('logros', 'logros', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'logros public select'
  ) then
    create policy "logros public select"
      on storage.objects for select using (bucket_id = 'logros');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'logros public insert'
  ) then
    create policy "logros public insert"
      on storage.objects for insert with check (bucket_id = 'logros');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'logros public delete'
  ) then
    create policy "logros public delete"
      on storage.objects for delete using (bucket_id = 'logros');
  end if;
end $$;

-- ============================================================
-- TUS CARTAS — PLANTILLA PARA PEGAR (sin ejemplos)
-- ============================================================
-- Copia este bloque, reemplaza lo que está entre comillas ('...')
-- y ejecútalo. Cada bloque entre paréntesis ( ... ) es una carta.
-- Separa los párrafos con \n\n dentro del texto.
-- created_at: fecha en formato ISO (ej: '2026-08-16T12:00:00Z').
--
-- Varias cartas a la vez: separa los bloques con una coma (,)
-- como en el ejemplo de abajo (hay 2 memorizadas; agrega o quita).

insert into public.letters (title, content, created_at, read) values
(
  'Título de tu primera carta',
  'Primer párrafo de tu carta.\n\nSegundo párrafo, separado por una línea en blanco.',
  '2026-01-01T12:00:00Z',
  false
),
(
  'Título de tu segunda carta',
  'Así se agrega otra: copia este bloque, sepáralo con una coma del anterior y cámbialo.',
  '2026-02-14T12:00:00Z',
  false
)
on conflict do nothing;

-- 💡 Alternativa: una vez conectada la app, también puedes
-- escribir cartas desde la página /cartas > "Escribir una carta"
-- y se guardarán aquí solas.

-- ============================================================
-- SECRETOS (con fecha mínima para abrirlos)
-- ============================================================
-- Crea la tabla de secretos. Los secretos escritos desde la
-- página /secretos > "Soltar un secreto" se guardan aquí.
-- open_from: fecha mínima (YYYY-MM-DD) para poder abrir el
-- secreto, o NULL para que se abra desde el primer momento.
create table if not exists public.secretos (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  message text not null,
  author text not null default '',
  emoji text not null default '🤫',
  open_from text,
  created_at timestamptz not null default now()
);

alter table public.secretos enable row level security;
drop policy if exists "secretos access" on public.secretos;
create policy "secretos access" on public.secretos
  for all using (true) with check (true);

-- ---------- FECHAS IMPORTANTES (calendario) ----------
create table if not exists public.fechas (
  id text primary key default gen_random_uuid()::text,
  date text not null,
  title text not null,
  emoji text not null default '💗',
  description text
);

alter table public.fechas enable row level security;
drop policy if exists "fechas access" on public.fechas;
create policy "fechas access" on public.fechas
  for all using (true) with check (true);

-- Fechas de ejemplo (idempotente: no se duplican al re-ejecutar).
-- Cambia o borra las que quieras; las tuyas se agregan desde la
-- página /calendario > "Agregar fecha".
insert into public.fechas (id, date, title, emoji, description) values
  ('navidad', '12-25', 'Nuestra Navidad', '🎄', 'El día en que empezó todo.'),
  ('cumple-cesar', '01-31', 'Cumpleaños de César', '🎂', null),
  ('cumple-sofia', '08-22', 'Cumpleaños de Sofía', '🎁', null),
  ('san-valentin', '02-14', 'San Valentín', '💘', 'El 14 nos queda corto.'),
  ('aniversario', '12-25', 'Aniversario', '💍', 'Otro año eligiéndonos.'),
  ('dahood', '01-12', 'Día del Dahood', '🎮', 'El primer día que jugamos juntos.')
on conflict (id) do nothing;

-- ---------- CÁPSULAS DEL TIEMPO (agregar/editar/borrar desde la página) ----------
create table if not exists public.capsulas (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  emoji text not null default '🕰️',
  open_date text not null,
  message text not null,
  hint text,
  author text,
  created_at timestamptz not null default now()
);

alter table public.capsulas enable row level security;
drop policy if exists "capsulas access" on public.capsulas;
create policy "capsulas access" on public.capsulas
  for all using (true) with check (true);

-- ---------- FOTOS DEL CALENDARIO (3 ranuras del póster) ----------
create table if not exists public.calendario (
  slot integer primary key,
  url text
);

alter table public.calendario enable row level security;
drop policy if exists "calendario access" on public.calendario;
create policy "calendario access" on public.calendario
  for all using (true) with check (true);

-- Almacén de las fotos del póster del calendario (bucket público):
insert into storage.buckets (id, name, public)
values ('calendario', 'calendario', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'calendario public select'
  ) then
    create policy "calendario public select"
      on storage.objects for select using (bucket_id = 'calendario');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'calendario public insert'
  ) then
    create policy "calendario public insert"
      on storage.objects for insert with check (bucket_id = 'calendario');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'calendario public delete'
  ) then
    create policy "calendario public delete"
      on storage.objects for delete using (bucket_id = 'calendario');
  end if;
end $$;

-- 💡 IMPORTANTE: después de ejecutarlo, corre esto para que
-- Supabase se entere de las tablas y columnas nuevas (evita el
-- error "Could not find ... in the schema cache"):
NOTIFY pgrst, 'reload schema';
