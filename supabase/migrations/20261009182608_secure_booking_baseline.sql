-- Empty-project baseline for TurnoFacil AI. No users, businesses or bookings are seeded.
-- One owner per business; one simultaneous active booking per business calendar.
-- Anonymous visitors cannot access private tables or create bookings directly.
create extension if not exists btree_gist with schema extensions;

create table public.negocios (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id),
  nombre text not null check (length(btrim(nombre)) > 0),
  telefono text,
  zona_horaria text not null default 'America/Argentina/Buenos_Aires',
  prompt_contexto text default 'Sos el asistente virtual de TurnoFácil AI...',
  created_at timestamptz not null default now()
);
create index idx_negocios_owner on public.negocios(owner_id);

create table public.servicios (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios(id) on delete cascade,
  nombre text not null check (length(btrim(nombre)) > 0),
  descripcion text,
  duracion_minutos integer not null default 30 check (duracion_minutos > 0),
  precio numeric(10,2) not null default 0 check (precio >= 0),
  created_at timestamptz not null default now(),
  constraint servicios_negocio_id_id_key unique(negocio_id, id)
);

create table public.horarios_atencion (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios(id) on delete cascade,
  dia_semana smallint not null check (dia_semana between 0 and 6),
  hora_apertura time not null,
  hora_cierre time not null,
  constraint horarios_intervalo_valido check (hora_cierre > hora_apertura)
);
create index idx_horarios_negocio on public.horarios_atencion(negocio_id);

create table public.turnos (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios(id) on delete cascade,
  servicio_id uuid,
  cliente_nombre text not null check (length(btrim(cliente_nombre)) > 0),
  cliente_telefono text not null check (length(btrim(cliente_telefono)) > 0),
  fecha_hora_inicio timestamptz not null,
  fecha_hora_fin timestamptz not null,
  estado text not null default 'confirmado' check (estado in ('pendiente', 'confirmado', 'cancelado')),
  notas text,
  created_at timestamptz not null default now(),
  constraint turnos_intervalo_valido check (
    isfinite(fecha_hora_inicio) and isfinite(fecha_hora_fin) and fecha_hora_fin > fecha_hora_inicio
  ),
  constraint turnos_servicio_del_negocio foreign key (negocio_id, servicio_id)
    references public.servicios(negocio_id, id) on delete set null (servicio_id),
  constraint turnos_sin_solapamiento exclude using gist (
    negocio_id with =,
    tstzrange(fecha_hora_inicio, fecha_hora_fin, '[)') with &&
  ) where (estado in ('pendiente', 'confirmado'))
);
create index idx_turnos_negocio_fecha on public.turnos(negocio_id, fecha_hora_inicio);
create index idx_turnos_servicio on public.turnos(negocio_id, servicio_id);

alter table public.negocios enable row level security;
alter table public.servicios enable row level security;
alter table public.horarios_atencion enable row level security;
alter table public.turnos enable row level security;

-- Do not inherit permissive default grants on newly created public tables.
revoke all on public.negocios, public.servicios, public.horarios_atencion, public.turnos from public, anon, authenticated;
grant select, insert, update, delete on public.negocios, public.servicios, public.horarios_atencion, public.turnos to authenticated;

create policy negocios_owner_crud on public.negocios for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy servicios_owner_crud on public.servicios for all to authenticated
  using (exists (select 1 from public.negocios n where n.id = servicios.negocio_id and n.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.negocios n where n.id = servicios.negocio_id and n.owner_id = (select auth.uid())));

create policy horarios_owner_crud on public.horarios_atencion for all to authenticated
  using (exists (select 1 from public.negocios n where n.id = horarios_atencion.negocio_id and n.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.negocios n where n.id = horarios_atencion.negocio_id and n.owner_id = (select auth.uid())));

create policy turnos_owner_crud on public.turnos for all to authenticated
  using (exists (select 1 from public.negocios n where n.id = turnos.negocio_id and n.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.negocios n where n.id = turnos.negocio_id and n.owner_id = (select auth.uid())));