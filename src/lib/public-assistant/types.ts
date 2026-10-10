import type { Catalogo } from '@/lib/reservas/types';

export type PublicAssistantContext = Catalogo;
export interface PublicToolResult {
  mensaje: string;
  exito: boolean;
  guardado: false;
}
export interface PublicAssistantMessage {
  role: 'user' | 'assistant';
  content: string;
}