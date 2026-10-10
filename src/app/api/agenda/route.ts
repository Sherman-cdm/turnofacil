import { createClient } from '@supabase/supabase-js';
import { env } from '@/env';
import { agendaMutation } from '@/lib/agenda/schemas';

const requests = new Map<string, { count: number; until: number }>();
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
async function readBody(request: Request): Promise<string | Response> {
  if (Number(request.headers.get('content-length')) > 8192) return json({ error: 'Solicitud demasiado grande.' }, 413);
  const reader = request.body?.getReader();
  if (!reader) return '';
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let length = 0;
  let text = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 8192) { await reader.cancel(); return json({ error: 'Solicitud demasiado grande.' }, 413); }
      text += decoder.decode(value, { stream: true });
    }
    return text + decoder.decode();
  } catch { return json({ error: 'No pudimos leer la solicitud.' }, 400); }
  finally { reader.releaseLock(); }
}

async function authorize(request: Request) {
  const token = request.headers.get('authorization')?.match(/^Bearer ([^\s]+)$/)?.[1];
  if (!token || token.length > 8192) return { error: json({ error: 'Iniciá sesión para acceder.' }, 401) };
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return { error: json({ error: 'Agenda no configurada.' }, 503) };
  const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user || !data.user.email_confirmed_at || data.user.is_anonymous) return { error: json({ error: 'Sesión inválida o correo sin confirmar.' }, 401) };
  const now = Date.now();
  for (const [key, value] of requests) if (value.until < now) requests.delete(key);
  const record = requests.get(data.user.id);
  if (record && record.count >= 90) return { error: json({ error: 'Demasiadas solicitudes. Esperá un minuto.' }, 429) };
  if (!record && requests.size >= 10000) return { error: json({ error: 'Agenda ocupada. Intentá nuevamente.' }, 503) };
  requests.set(data.user.id, record ? { ...record, count: record.count + 1 } : { count: 1, until: now + 60000 });
  return { client, user: data.user };
}
export async function GET(request: Request) {
  const auth = await authorize(request);
  if (auth.error) return auth.error;
  const results = await Promise.all([
    auth.client.from('negocios').select('id,nombre,telefono,zona_horaria,agenda_publica').order('created_at').limit(100),
    auth.client.from('servicios').select('id,negocio_id,nombre,descripcion,duracion_minutos,precio').order('nombre').limit(500),
    auth.client.from('horarios_atencion').select('id,negocio_id,dia_semana,hora_apertura,hora_cierre').order('dia_semana').limit(500),
    auth.client.from('turnos').select('id,negocio_id,servicio_id,cliente_nombre,cliente_telefono,fecha_hora_inicio,fecha_hora_fin,estado,notas').gte('fecha_hora_inicio', new Date(Date.now() - 30 * 86400000).toISOString()).order('fecha_hora_inicio').limit(500),
  ]);
  if (results.some(result => result.error)) return json({ error: 'No pudimos cargar la agenda. Intentá nuevamente.' }, 502);
  return json({ negocios: results[0].data, servicios: results[1].data, horarios: results[2].data, turnos: results[3].data });
}
export async function POST(request: Request) {
  if (request.headers.get('origin') && request.headers.get('origin') !== new URL(request.url).origin) return json({ error: 'Origen no permitido.' }, 403);
  if (!request.headers.get('content-type')?.includes('application/json')) return json({ error: 'Usá JSON.' }, 415);
  const auth = await authorize(request);
  if (auth.error) return auth.error;
  const raw = await readBody(request);
  if (raw instanceof Response) return raw;
  let input: unknown;
  try { input = JSON.parse(raw); } catch { return json({ error: 'JSON inválido.' }, 400); }
  const parsed = agendaMutation.safeParse(input);
  if (!parsed.success) return json({ error: 'Revisá los campos y las franjas de atención.' }, 400);
  const { action, ...values } = parsed.data;
  const client = auth.client;
  if (action === 'negocio' && 'nombre' in values && 'zona_horaria' in values) {
    const { id, ...fields } = values;
    const result = id
      ? await client.from('negocios').update(fields).eq('id', id).select('id').single()
      : await client.from('negocios').insert({ ...fields, owner_id: auth.user.id }).select('id').single();
    return result.error ? json({ error: 'No pudimos guardar el negocio.' }, 400) : json({ id: result.data.id });
  }
  if (!('negocio_id' in values)) return json({ error: 'Solicitud inválida.' }, 400);
  const owner = await client.from('negocios').select('id').eq('id', values.negocio_id).eq('owner_id', auth.user.id).maybeSingle();
  if (owner.error || !owner.data) return json({ error: 'Negocio no disponible.' }, 404);
  const table = action === 'servicio' || action === 'eliminar_servicio' ? 'servicios' : action === 'horario' || action === 'eliminar_horario' ? 'horarios_atencion' : 'turnos';
  if (action.startsWith('eliminar_')) {
    const result = await client.from(table).delete().eq('id', values.id).eq('negocio_id', values.negocio_id).select('id').single();
    return result.error ? json({ error: 'No pudimos eliminar el registro.' }, 400) : json({ id: result.data.id });
  }
  const { id, ...fields } = values;
  const result = id
    ? await client.from(table).update(fields).eq('id', id).eq('negocio_id', values.negocio_id).select('id').single()
    : await client.from(table).insert(fields).select('id').single();
  return result.error ? json({ error: 'No pudimos guardar. Revisá los datos o conflictos de horarios.' }, 400) : json({ id: result.data.id });
}



