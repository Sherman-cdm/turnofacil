import { z } from 'zod';
const id = z.uuid();
const text = z.string().trim().min(1).max(120);
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
export const agendaMutation = z.discriminatedUnion('action', [
  z.object({ action: z.literal('negocio'), id: id.optional(), nombre: text, telefono: z.string().trim().max(40), agenda_publica: z.boolean(), zona_horaria: z.string().max(80).refine(value => { try { new Intl.DateTimeFormat('es', { timeZone: value }); return true; } catch { return false; } }, 'Zona horaria inválida') }).strict(),
  z.object({ action: z.literal('servicio'), id: id.optional(), negocio_id: id, nombre: text, descripcion: z.string().trim().max(1000), duracion_minutos: z.number().int().min(5).max(240), precio: z.number().min(0).max(99999999) }).strict(),
  z.object({ action: z.literal('horario'), id: id.optional(), negocio_id: id, dia_semana: z.number().int().min(0).max(6), hora_apertura: time, hora_cierre: time }).strict().refine(value => value.hora_cierre > value.hora_apertura, 'El cierre debe ser posterior a la apertura'),
  z.object({ action: z.literal('eliminar_servicio'), id, negocio_id: id }).strict(),
  z.object({ action: z.literal('eliminar_horario'), id, negocio_id: id }).strict(),
  z.object({ action: z.literal('estado_turno'), id, negocio_id: id, estado: z.enum(['pendiente','confirmado','cancelado']) }).strict(),
]);
export type AgendaMutation = z.infer<typeof agendaMutation>;



