import { z } from 'zod';

export const publicAvailabilitySchema = z.object({
  fecha: z.iso.date(),
  servicio: z.string().trim().min(1).max(200),
});
export const assistantReplySchema = z.object({ reply: z.string().min(1), mode: z.literal('agenda') });