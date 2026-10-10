'use client';

import { useState } from 'react';
import { assistantReplySchema } from '@/lib/public-assistant/schemas';
import type { PublicAssistantMessage } from '@/lib/public-assistant/types';

export function usePublicAssistant(negocioId: string, ownerToken?: string) {
  const [messages, setMessages] = useState<PublicAssistantMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function send() {
    const content = input.trim();
    if (!content || content.length > 2000 || busy) return;
    const history: PublicAssistantMessage[] = [...messages.slice(-28), { role: 'user', content }];
    setBusy(true); setError('');
    try {
      const response = await fetch(ownerToken ? '/api/agenda/asistente' : '/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...(ownerToken ? { Authorization: 'Bearer ' + ownerToken } : {}) },
        body: JSON.stringify({ negocioId, messages: history }), signal: AbortSignal.timeout(ownerToken ? 45_000 : 25_000),
      });
      if (!response.ok) {
        setError(response.status === 429 ? 'Esperá un minuto antes de enviar otra consulta.' : 'No pudimos consultar el asistente. Usá el formulario para ver horarios y reservar.');
        return;
      }
      const parsed = assistantReplySchema.safeParse(await response.json());
      if (!parsed.success) {
        setError('No pudimos verificar la respuesta. Usá el formulario para consultar la agenda.');
        return;
      }
      setMessages([...history, { role: 'assistant', content: parsed.data.reply }]);
      setInput('');
    } catch {
      setError('No pudimos conectar con el asistente. Podés continuar con el formulario.');
    } finally {
      setBusy(false);
    }
  }
  return { messages, input, setInput, busy, error, send };
}
