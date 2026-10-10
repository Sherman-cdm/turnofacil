-- Public access is opt-in; private customer tables remain owner-only under RLS.
alter table public.negocios add column agenda_publica boolean not null default false;
create schema if not exists booking_private;
revoke all on schema booking_private from public;
grant usage on schema booking_private to anon, authenticated;

create function booking_private.catalogo(p_negocio uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
 select jsonb_build_object('id',n.id,'nombre',n.nombre,'zona_horaria',n.zona_horaria,
 'servicios',coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'nombre',s.nombre,'descripcion',s.descripcion,'duracion_minutos',s.duracion_minutos,'precio',s.precio) order by s.nombre)
 from public.servicios s where s.negocio_id=n.id and s.duracion_minutos between 1 and 240),'[]'::jsonb))
 from public.negocios n where n.id=p_negocio and n.agenda_publica
 and exists(select 1 from pg_catalog.pg_timezone_names tz where tz.name=n.zona_horaria);
$$;

create function booking_private.horarios(p_negocio uuid,p_servicio uuid,p_fecha date) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare v_zona text; v_duracion integer; v_hoy date; v_result jsonb;
begin
 select n.zona_horaria,s.duracion_minutos into v_zona,v_duracion from public.negocios n
 join public.servicios s on s.negocio_id=n.id where n.id=p_negocio and n.agenda_publica and s.id=p_servicio
 and s.duracion_minutos between 1 and 240 and exists(select 1 from pg_catalog.pg_timezone_names tz where tz.name=n.zona_horaria);
 if not found or p_fecha is null then return '[]'::jsonb; end if;
 v_hoy := (now() at time zone v_zona)::date;
 if p_fecha < v_hoy or p_fecha > v_hoy+60 then return '[]'::jsonb; end if;
 select coalesce(jsonb_agg(q.inicio order by q.inicio),'[]'::jsonb) into v_result from (
 select distinct (g.local_inicio at time zone v_zona) as inicio
 from public.horarios_atencion h cross join lateral pg_catalog.generate_series(
 p_fecha+h.hora_apertura,p_fecha+h.hora_cierre-pg_catalog.make_interval(mins=>v_duracion),interval '15 minutes') g(local_inicio)
 where h.negocio_id=p_negocio and h.dia_semana=extract(dow from p_fecha)
 and (g.local_inicio at time zone v_zona)>now()
 and not exists(select 1 from public.turnos t where t.negocio_id=p_negocio and t.estado in('pendiente','confirmado')
 and pg_catalog.tstzrange(t.fecha_hora_inicio,t.fecha_hora_fin,'[)') && pg_catalog.tstzrange(
 g.local_inicio at time zone v_zona,(g.local_inicio at time zone v_zona)+pg_catalog.make_interval(mins=>v_duracion),'[)'))
 -- A DST transition cannot make the elapsed duration run past local closing.
 and (((g.local_inicio at time zone v_zona)+pg_catalog.make_interval(mins=>v_duracion)) at time zone v_zona)<=p_fecha+h.hora_cierre
 ) q;
 return v_result;
end;
$$;

create function booking_private.reservar(p_negocio uuid,p_servicio uuid,p_inicio timestamptz,p_nombre text,p_telefono text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare v_zona text; v_duracion integer; v_telefono text; v_id uuid; v_fin timestamptz;
begin
 -- Serialize public writes per business: limits cannot be raced between requests.
 select zona_horaria into v_zona from public.negocios where id=p_negocio and agenda_publica for update;
 if not found or not exists(select 1 from pg_catalog.pg_timezone_names tz where tz.name=v_zona) then raise exception using errcode='P0001',message='AGENDA_NO_DISPONIBLE'; end if;
 v_telefono := pg_catalog.regexp_replace(coalesce(p_telefono,''),'[^0-9]','','g');
 if p_nombre is null or length(btrim(p_nombre)) not between 2 and 80 or length(coalesce(p_telefono,''))>30 or length(v_telefono) not between 8 and 15
 or p_inicio is null or not pg_catalog.isfinite(p_inicio) then raise exception using errcode='P0001',message='DATOS_INVALIDOS'; end if;
 select duracion_minutos into v_duracion from public.servicios where negocio_id=p_negocio and id=p_servicio and duracion_minutos between 1 and 240;
 if not found then raise exception using errcode='P0001',message='DATOS_INVALIDOS'; end if;
 if (select count(*) from public.turnos where negocio_id=p_negocio and cliente_telefono=v_telefono and estado in('pendiente','confirmado') and fecha_hora_inicio>now())>=2
 or (select count(*) from public.turnos where negocio_id=p_negocio and created_at>now()-interval '1 hour')>=20
 then raise exception using errcode='P0001',message='LIMITE_RESERVAS'; end if;
 if not exists(select 1 from pg_catalog.jsonb_array_elements_text(booking_private.horarios(p_negocio,p_servicio,(p_inicio at time zone v_zona)::date)) x(inicio) where x.inicio::timestamptz=p_inicio)
 then raise exception using errcode='P0001',message='HORARIO_NO_DISPONIBLE'; end if;
 v_fin := p_inicio+pg_catalog.make_interval(mins=>v_duracion);
 insert into public.turnos(negocio_id,servicio_id,cliente_nombre,cliente_telefono,fecha_hora_inicio,fecha_hora_fin,estado)
 values(p_negocio,p_servicio,btrim(p_nombre),v_telefono,p_inicio,v_fin,'confirmado') returning id into v_id;
 return jsonb_build_object('id',v_id,'inicio',p_inicio,'fin',v_fin);
exception when exclusion_violation then raise exception using errcode='P0001',message='HORARIO_NO_DISPONIBLE';
end;
$$;

create function public.catalogo_publico(p_negocio uuid) returns jsonb language sql stable security invoker set search_path='' as $$select booking_private.catalogo(p_negocio);$$;
create function public.horarios_publicos(p_negocio uuid,p_servicio uuid,p_fecha date) returns jsonb language sql stable security invoker set search_path='' as $$select booking_private.horarios(p_negocio,p_servicio,p_fecha);$$;
create function public.reservar_publico(p_negocio uuid,p_servicio uuid,p_inicio timestamptz,p_nombre text,p_telefono text) returns jsonb language sql volatile security invoker set search_path='' as $$select booking_private.reservar(p_negocio,p_servicio,p_inicio,p_nombre,p_telefono);$$;
revoke all on function booking_private.catalogo(uuid),booking_private.horarios(uuid,uuid,date),booking_private.reservar(uuid,uuid,timestamptz,text,text),public.catalogo_publico(uuid),public.horarios_publicos(uuid,uuid,date),public.reservar_publico(uuid,uuid,timestamptz,text,text) from public,anon,authenticated;
grant execute on function booking_private.catalogo(uuid),booking_private.horarios(uuid,uuid,date),booking_private.reservar(uuid,uuid,timestamptz,text,text),public.catalogo_publico(uuid),public.horarios_publicos(uuid,uuid,date),public.reservar_publico(uuid,uuid,timestamptz,text,text) to anon,authenticated;
