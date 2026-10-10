import { NextRequest, NextResponse } from 'next/server';
import { askGemini, isGeminiConfigured } from '@/lib/gemini-agenda';
import { chatSchema } from '@/lib/schemas';
import { z } from 'zod';
import { loadPublicAssistantContext } from '@/lib/public-assistant/tools';

// Vercel WAF applies the shared /api/ limit; this guard also protects local instances.
const requests = new Map<string, { count: number; expires: number }>();

export async function POST(req: NextRequest) {
  const now = Date.now();
  for (const [key, value] of requests) {
    if (value.expires <= now) requests.delete(key);
  }
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const bucket = requests.get(ip) || { count: 0, expires: now + 60_000 };
  if (bucket.count >= 20) {
    return NextResponse.json({ error: 'Demasiadas consultas. Esperá un minuto.' }, {
      status: 429, headers: { 'Retry-After': String(Math.ceil((bucket.expires - now) / 1000)) },
    });
  }
  if (requests.size >= 10_000 && !requests.has(ip)) {
    return NextResponse.json({ error: 'Servicio ocupado. Volvé a intentarlo.' }, { status: 503 });
  }
  bucket.count += 1;
  requests.set(ip, bucket);

  const origin = req.headers.get('origin');
  if (origin && origin !== req.nextUrl.origin) {
    return NextResponse.json({ error: 'Origen no permitido.' }, { status: 403 });
  }
  if (!req.headers.get('content-type')?.startsWith('application/json')) {
    return NextResponse.json({ error: 'Formato inválido.' }, { status: 415 });
  }
  const reader = req.body?.getReader();
  if (!reader) return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  let body = ''; let bytes = 0;
  const decoder = new TextDecoder();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > 110_000) {
      await reader.cancel();
      return NextResponse.json({ error: 'Solicitud demasiado grande' }, { status: 413 });
    }
    body += decoder.decode(value, { stream: true });
  }
  body += decoder.decode();  let input: unknown;
  try {
    input = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }
  const result = chatSchema.extend({ negocioId: z.uuid() }).strict().safeParse(input);
  if (!result.success) {
    return NextResponse.json({ error: 'Se requieren entre 1 y 50 mensajes válidos, de hasta 2000 caracteres' }, { status: 400 });
  }
  try {
    const context = result.data.negocioId ? await loadPublicAssistantContext(result.data.negocioId) : undefined;
    if (result.data.negocioId && !context) {
      return NextResponse.json({ error: 'Agenda no disponible.' }, { status: 404 });
    }
    const reply = await askGemini(result.data.messages, context || undefined);
    return NextResponse.json({ reply, mode: context ? 'agenda' : isGeminiConfigured ? 'ai' : 'demo', simulatedBooking: false }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    console.error('API Chat failed');
    return NextResponse.json({ error: 'Error procesando el mensaje' }, { status: 500 });
  }
}
