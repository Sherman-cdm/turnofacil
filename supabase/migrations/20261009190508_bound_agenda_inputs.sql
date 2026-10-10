alter table public.negocios add constraint negocios_campos_acotados check (char_length(nombre)<=120 and char_length(coalesce(telefono,''))<=40 and char_length(zona_horaria)<=80 and char_length(coalesce(prompt_contexto,''))<=4000);
alter table public.servicios add constraint servicios_campos_acotados check (char_length(nombre)<=120 and char_length(coalesce(descripcion,''))<=1000 and duracion_minutos between 5 and 240);
alter table public.turnos add constraint turnos_campos_acotados check (char_length(cliente_nombre)<=80 and char_length(cliente_telefono)<=40 and char_length(coalesce(notas,''))<=1000);

