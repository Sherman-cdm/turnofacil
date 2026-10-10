import type { z } from 'zod';
import type { catalogoSchema, confirmacionSchema } from './schemas';
export type Catalogo = z.infer<typeof catalogoSchema>;
export type Confirmacion = z.infer<typeof confirmacionSchema>;
