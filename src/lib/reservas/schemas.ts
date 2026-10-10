import { z } from 'zod';

export const consultaSchema = z.object({
  negocioId: z.uuid(),
  servicioId: z.uuid().optional(),
  fecha: z.iso.date().optional(),
}).refine((value) => Boolean(value.servicioId) === Boolean(value.fecha));

export const reservaSchema = z.object({
  negocioId: z.uuid(), servicioId: z.uuid(), inicio: z.iso.datetime({ offset: true }),
  clienteNombre: z.string().trim().min(2).max(80),
  clienteTelefono: z.string().trim().max(30).transform((value) => value.replace(/\D/g, '')).pipe(z.string().min(8).max(15)),
}).strict();

export const catalogoSchema = z.object({
  id: z.uuid(), nombre: z.string(), zona_horaria: z.string(),
  servicios: z.array(z.object({ id: z.uuid(), nombre: z.string(), descripcion: z.string().nullable(), duracion_minutos: z.number().int().positive(), precio: z.number().nonnegative() })),
});
export const confirmacionSchema = z.object({ id: z.uuid(), inicio: z.iso.datetime({ offset: true }), fin: z.iso.datetime({ offset: true }) });
export const horariosSchema = z.array(z.iso.datetime({ offset: true }));
