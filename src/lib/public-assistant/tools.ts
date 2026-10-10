import { supabase } from '@/lib/supabase';
import { catalogoSchema, horariosSchema } from '@/lib/reservas/schemas';
import { publicAvailabilitySchema } from './schemas';
import type { PublicAssistantContext, PublicToolResult } from './types';

export async function loadPublicAssistantContext(negocioId: string): Promise<PublicAssistantContext | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('catalogo_publico', { p_negocio: negocioId });
  const parsed = catalogoSchema.safeParse(data);
  if (error || !parsed.success || parsed.data.id !== negocioId) return null;
  try {
    new Intl.DateTimeFormat('es-AR', { timeZone: parsed.data.zona_horaria }).format();
  } catch {
    return null;
  }
  return parsed.data;
}

export async function executePublicTool(
  name: string, args: Record<string, unknown>, context: PublicAssistantContext,
): Promise<PublicToolResult> {
  const fail = (mensaje: string): PublicToolResult => ({ mensaje, exito: false, guardado: false });
  if (name === 'crear_reserva') {
    return fail('El chat no guarda ni confirma reservas. Elegí servicio y horario en el formulario de esta página, completá allí tus datos y pulsá Confirmar reserva. Solo la confirmación con código del formulario acredita que se guardó el turno.');
  }
  if (name === 'listar_servicios') {
    const lines = context.servicios.map(service => `${service.nombre}: ${service.duracion_minutos} minutos, $${service.precio}.`);
    return { exito: true, guardado: false, mensaje: lines.length ? `Servicios publicados por ${context.nombre}:\n${lines.join('\n')}` : 'Este negocio todavía no publicó servicios disponibles para reservar.' };
  }
  if (name !== 'consultar_disponibilidad') return fail('No pude procesar esa consulta. No se guardó ninguna reserva.');
  const parsed = publicAvailabilitySchema.safeParse(args);
  if (!parsed.success) return fail('Indicá una fecha válida en formato YYYY-MM-DD y el servicio que querés consultar. No se guardó ninguna reserva.');
  const { fecha, servicio } = parsed.data;
  // The model selects only a service within the server-bound published catalog.
  const matches = context.servicios.filter(value => value.id === servicio || value.nombre.toLocaleLowerCase('es') === servicio.toLocaleLowerCase('es'));
  if (matches.length !== 1) return fail(matches.length > 1 ? 'Hay más de un servicio con ese nombre. Elegí el servicio específico en el formulario para consultar sus horarios.' : 'No encontré ese servicio en el catálogo de este negocio. Consultá los servicios publicados o elegilo en el formulario.');
  if (!supabase) return fail('No pude consultar la agenda ahora. No se guardó ninguna reserva.');
  const { data, error } = await supabase.rpc('horarios_publicos', {
    p_negocio: context.id, p_servicio: matches[0].id, p_fecha: fecha,
  });
  const slots = horariosSchema.safeParse(data);
  if (error || !slots.success) return fail('No pude verificar los horarios de la agenda. Volvé a consultarlos en el formulario. No se guardó ninguna reserva.');
  if (!slots.data.length) return { exito: true, guardado: false, mensaje: `La agenda no devuelve horarios disponibles para ${matches[0].nombre} el ${fecha}. Probá otra fecha dentro de los próximos 60 días.` };
  const formatter = new Intl.DateTimeFormat('es-AR', { timeZone: context.zona_horaria, dateStyle: 'short', timeStyle: 'short' });
  return {
    exito: true, guardado: false,
    mensaje: `Horarios consultados en la agenda para ${matches[0].nombre}:\n${slots.data.map(slot => formatter.format(new Date(slot))).join('\n')}\nZona horaria: ${context.zona_horaria}. Pueden cambiar antes de confirmar. Elegí uno en el formulario y pulsá Confirmar reserva para guardarlo. El chat no guardó ningún turno.`,
  };
}