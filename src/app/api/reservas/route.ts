import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { consultaSchema, reservaSchema, catalogoSchema, horariosSchema, confirmacionSchema } from '@/lib/reservas/schemas';

const buckets = new Map<string, { count: number; expires: number }>();
function guard(req: NextRequest) {
  const now = Date.now();
  for (const [key, bucket] of buckets) if (bucket.expires <= now) buckets.delete(key);
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const bucket = buckets.get(ip) || { count: 0, expires: now + 60_000 };
  if (bucket.count >= 20) return NextResponse.json({ error: 'Esperá un minuto antes de continuar.' }, { status: 429, headers: { 'Retry-After': '60' } });
  if (buckets.size >= 10_000 && !buckets.has(ip)) return NextResponse.json({ error: 'Servicio ocupado.' }, { status: 503 });
  bucket.count++; buckets.set(ip, bucket);
}
const unavailable = () => NextResponse.json({ error: 'Agenda no disponible.' }, { status: 404 });

export async function GET(req: NextRequest) {
  const blocked = guard(req); if (blocked) return blocked;
  const parsed = consultaSchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) return NextResponse.json({ error: 'Consulta inválida.' }, { status: 400 });
  if (!supabase) return unavailable();
  const { negocioId, servicioId, fecha } = parsed.data;
  if (servicioId && fecha) {
    const { data, error } = await supabase.rpc('horarios_publicos', { p_negocio: negocioId, p_servicio: servicioId, p_fecha: fecha });
    const result = horariosSchema.safeParse(data);
    if (error || !result.success) return unavailable();
    return NextResponse.json({ horarios: result.data }, { headers: { 'Cache-Control': 'no-store' } });
  }
  const { data, error } = await supabase.rpc('catalogo_publico', { p_negocio: negocioId });
  const result = catalogoSchema.safeParse(data);
  if (error || !result.success) return unavailable();
  return NextResponse.json({ negocio: result.data }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  const blocked = guard(req); if (blocked) return blocked;
  const origin = req.headers.get('origin');
  if (origin && origin !== req.nextUrl.origin) return NextResponse.json({ error: 'Origen no permitido.' }, { status: 403 });
  if (!req.headers.get('content-type')?.startsWith('application/json')) return NextResponse.json({ error: 'Formato inválido.' }, { status: 415 });
  const reader = req.body?.getReader();
  if (!reader) return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 });
  let body = ''; let bytes = 0; const decoder = new TextDecoder();
  while (true) {
    const { value, done } = await reader.read(); if (done) break;
    bytes += value.byteLength;
    if (bytes > 4096) { await reader.cancel(); return NextResponse.json({ error: 'Solicitud demasiado grande.' }, { status: 413 }); }
    body += decoder.decode(value, { stream: true });
  }
  body += decoder.decode();
  let input: unknown;
  try { input = JSON.parse(body); } catch { return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 }); }
  const parsed = reservaSchema.safeParse(input);
  if (!parsed.success) return NextResponse.json({ error: 'Revisá el nombre, teléfono y horario.' }, { status: 400 });
  if (!supabase) return unavailable();
  const value = parsed.data;
  const { data, error } = await supabase.rpc('reservar_publico', { p_negocio: value.negocioId, p_servicio: value.servicioId, p_inicio: value.inicio, p_nombre: value.clienteNombre, p_telefono: value.clienteTelefono });
  if (error) {
    const limited = error.message === 'LIMITE_RESERVAS';
    return NextResponse.json({ error: limited ? 'No se pueden agregar más reservas ahora. Contactá al negocio.' : 'No pudimos reservar ese horario. Elegí otro e intentá nuevamente.' }, { status: limited ? 429 : 409 });
  }
  const result = confirmacionSchema.safeParse(data);
  if (!result.success) return NextResponse.json({ error: 'No se pudo verificar la reserva. Contactá al negocio antes de volver a intentar.' }, { status: 502 });
  return NextResponse.json({ reserva: result.data }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
}
