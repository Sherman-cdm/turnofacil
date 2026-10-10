'use client';

import { usePublicAssistant } from '@/hooks/use-public-assistant';

export function PublicAssistant({ negocioId, ownerToken }: { negocioId: string; ownerToken?: string }) {
  const chat = usePublicAssistant(negocioId, ownerToken);
  return (
    <section aria-labelledby="public-assistant-title" className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-slate-900">
      <h2 id="public-assistant-title" className="text-xl font-semibold">Consultá al asistente</h2>
      <p className="mt-2 text-sm text-slate-600">{ownerToken ? 'Consultá servicios, franjas de atención y próximos turnos de tu agenda. El asistente tiene acceso de lectura; no guarda ni cancela turnos.' : 'Te ayuda a consultar los servicios y horarios publicados de este negocio. Para guardar un turno, confirmalo en el formulario.'}</p>
      <p className="mt-2 text-sm text-slate-600">No envíes datos personales en este chat. Tus consultas se procesan con IA.</p>
      <div role="log" aria-live="polite" aria-label="Conversación con el asistente" className="my-4 max-h-80 space-y-3 overflow-y-auto">
        {chat.messages.map((message, index) => (
          <div key={index} className={`rounded-xl p-3 whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-sm ${message.role === 'user' ? 'bg-slate-100' : 'bg-blue-50'}`}>
            <p className="mb-1 font-semibold">{message.role === 'user' ? 'Vos' : 'Asistente'}</p>
            <p>{message.content}</p>
          </div>
        ))}
      </div>
      <form onSubmit={(event) => { event.preventDefault(); void chat.send(); }} className="space-y-3">
        <label htmlFor="public-assistant-query" className="block text-sm font-medium">Tu consulta</label>
        <textarea id="public-assistant-query" value={chat.input} onChange={(event) => chat.setInput(event.target.value)} maxLength={2000} rows={3} disabled={chat.busy} placeholder="¿Qué servicios tienen? ¿Hay horarios para mañana?" className="w-full rounded-lg border border-slate-300 p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" />
        <button type="submit" disabled={chat.busy || !chat.input.trim()} className="min-h-11 rounded-lg bg-blue-700 px-5 py-2 text-white disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">{chat.busy ? 'Consultando…' : 'Enviar consulta'}</button>
        {chat.error && <p role="alert" className="text-sm text-red-700">{chat.error}</p>}
      </form>
    </section>
  );
}
