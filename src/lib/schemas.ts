import { z } from 'zod';

export const chatSchema = z.object({
  negocioId: z.uuid().optional(),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().trim().min(1).max(2000),
  })).min(1).max(50),
});

export const availabilitySchema = z.object({
  fecha: z.iso.date(),
  servicio: z.string().trim().min(1).max(200).default('Servicio General'),
});

export const reservationSchema = z.object({
  nombre: z.string().trim().min(1).max(200),
  telefono: z.string().trim().min(1).max(40),
  fecha: z.iso.date(),
  hora: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  servicio: z.string().trim().min(1).max(200),
});