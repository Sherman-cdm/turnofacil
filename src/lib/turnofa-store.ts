import { Cliente, Turno, RecordatorioLog } from '@/types/turnofa';
import { supabase, isSupabaseConfigured } from './supabase';

// Ejemplo ficticio de desarrollo sin datos personales de Clientes para Estética de Pies
const SEED_CLIENTES: Cliente[] = [
  {
    id: 'cli-001',
    nombre: 'Cliente de prueba',
    telefono: '',
    email: 'prueba@example.invalid',
    dni: '',
    notas: 'Ejemplo ficticio; sin datos de personas.',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString()
  },
  {
    id: 'cli-002',
    nombre: 'Cliente de prueba',
    telefono: '',
    email: 'prueba@example.invalid',
    dni: '',
    notas: 'Ejemplo ficticio; sin datos de personas.',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'cli-003',
    nombre: 'Cliente de prueba',
    telefono: '',
    email: 'prueba@example.invalid',
    dni: '',
    notas: 'Ejemplo ficticio; sin datos de personas.',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'cli-004',
    nombre: 'Cliente de prueba',
    telefono: '',
    email: 'prueba@example.invalid',
    dni: '',
    notas: 'Ejemplo ficticio; sin datos de personas.',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

// Ejemplo ficticio de desarrollo sin datos personales de Turnos (incluyendo turnos para hoy y para mañana)
function getIsoDateOffset(daysOffset: number, hour: number, minutes = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hour, minutes, 0, 0);
  return d.toISOString();
}

const SEED_TURNOS: Turno[] = [
  {
    id: 'tur-001',
    cliente_id: 'cli-001',
    cliente_nombre: 'Cliente de prueba',
    cliente_telefono: '',
    cliente_email: 'prueba@example.invalid',
    cliente_dni: '',
    servicio: 'Belleza y Spa de Pies Deluxe',
    duracion_minutos: 50,
    precio: 18000,
    fecha_hora: getIsoDateOffset(0, 10, 30), // Hoy a las 10:30
    estado: 'confirmado',
    recordatorio_1dia_enviado: true,
    recordatorio_1dia_fecha: new Date(Date.now() - 86400000).toISOString(),
    recordatorio_momento_enviado: false,
    notas: 'Ejemplo ficticio; sin datos de personas.',
    created_at: new Date().toISOString()
  },
  {
    id: 'tur-002',
    cliente_id: 'cli-002',
    cliente_nombre: 'Cliente de prueba',
    cliente_telefono: '',
    cliente_email: 'prueba@example.invalid',
    cliente_dni: '',
    servicio: 'Pedicuría Clínica & Talones Agrietados',
    duracion_minutos: 45,
    precio: 16000,
    fecha_hora: getIsoDateOffset(0, 15, 0), // Hoy a las 15:00
    estado: 'confirmado',
    recordatorio_1dia_enviado: true,
    recordatorio_1dia_fecha: new Date(Date.now() - 86400000).toISOString(),
    recordatorio_momento_enviado: false,
    notas: 'Ejemplo ficticio; sin datos de personas.',
    created_at: new Date().toISOString()
  },
  {
    id: 'tur-003',
    cliente_id: 'cli-003',
    cliente_nombre: 'Cliente de prueba',
    cliente_telefono: '',
    cliente_email: 'prueba@example.invalid',
    cliente_dni: '',
    servicio: 'Esmaltado Semipermanente de Pies',
    duracion_minutos: 45,
    precio: 15000,
    fecha_hora: getIsoDateOffset(1, 11, 0), // Mañana a las 11:00
    estado: 'confirmado',
    recordatorio_1dia_enviado: false, // Pendiente de recordatorio 1 día antes
    recordatorio_momento_enviado: false,
    notas: 'Ejemplo ficticio; sin datos de personas.',
    created_at: new Date().toISOString()
  },
  {
    id: 'tur-004',
    cliente_id: 'cli-004',
    cliente_nombre: 'Cliente de prueba',
    cliente_telefono: '',
    cliente_email: 'prueba@example.invalid',
    cliente_dni: '',
    servicio: 'Reflexología Podal y Masaje Descongestivo',
    duracion_minutos: 35,
    precio: 14000,
    fecha_hora: getIsoDateOffset(1, 16, 30), // Mañana a las 16:30
    estado: 'confirmado',
    recordatorio_1dia_enviado: false, // Pendiente de recordatorio 1 día antes
    recordatorio_momento_enviado: false,
    notas: 'Ejemplo ficticio; sin datos de personas.',
    created_at: new Date().toISOString()
  }
];

// Almacén en memoria garantizado para la sesión del servidor
const memoryStore = {
  clientes: [...SEED_CLIENTES],
  turnos: [...SEED_TURNOS],
  logs: [] as RecordatorioLog[]
};

export async function getClientes(search?: string): Promise<Cliente[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('clientes').select('*').order('created_at', { ascending: false });
      if (search && search.trim()) {
        const s = search.trim();
        query = query.or(`dni.ilike.%${s}%,nombre.ilike.%${s}%,telefono.ilike.%${s}%,email.ilike.%${s}%`);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as Cliente[];
    } catch {
      // Fallback a memoria
    }
  }

  // Filtrado en memoria
  if (!search || !search.trim()) return memoryStore.clientes;
  const term = search.trim().toLowerCase();
  return memoryStore.clientes.filter(c =>
    c.nombre.toLowerCase().includes(term) ||
    c.dni.toLowerCase().includes(term) ||
    c.telefono.toLowerCase().includes(term) ||
    c.email.toLowerCase().includes(term)
  );
}

export async function createOrUpdateCliente(data: {
  id?: string;
  nombre: string;
  telefono: string;
  email: string;
  dni: string;
  notas?: string;
}): Promise<Cliente> {
  const clienteLimpio: Cliente = {
    id: data.id || `cli-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    nombre: data.nombre.trim(),
    telefono: data.telefono.trim(),
    email: data.email.trim(),
    dni: data.dni.trim(),
    notas: data.notas?.trim() || '',
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: supaData, error } = await supabase
        .from('clientes')
        .upsert(clienteLimpio)
        .select()
        .single();
      if (!error && supaData) {
        // También guardar en memoria
        const index = memoryStore.clientes.findIndex(c => c.dni === clienteLimpio.dni || c.id === clienteLimpio.id);
        if (index >= 0) memoryStore.clientes[index] = supaData as Cliente;
        else memoryStore.clientes.unshift(supaData as Cliente);
        return supaData as Cliente;
      }
    } catch {
      // Fallback
    }
  }

  // Guardar en memoria
  const idx = memoryStore.clientes.findIndex(c => c.dni === clienteLimpio.dni || c.id === clienteLimpio.id);
  if (idx >= 0) {
    memoryStore.clientes[idx] = { ...memoryStore.clientes[idx], ...clienteLimpio };
    return memoryStore.clientes[idx];
  } else {
    memoryStore.clientes.unshift(clienteLimpio);
    return clienteLimpio;
  }
}

export async function getTurnos(filtro?: {
  fecha?: string; // YYYY-MM-DD
  cliente_dni?: string;
}): Promise<Turno[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('turnos_estetica').select('*').order('fecha_hora', { ascending: true });
      if (filtro?.cliente_dni) {
        query = query.eq('cliente_dni', filtro.cliente_dni);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        let results = data as Turno[];
        if (filtro?.fecha) {
          results = results.filter(t => t.fecha_hora.startsWith(filtro.fecha!));
        }
        return results;
      }
    } catch {
      // Fallback
    }
  }

  let list = [...memoryStore.turnos].sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime());
  if (filtro?.fecha) {
    list = list.filter(t => t.fecha_hora.startsWith(filtro.fecha!));
  }
  if (filtro?.cliente_dni) {
    list = list.filter(t => t.cliente_dni === filtro.cliente_dni);
  }
  return list;
}

export async function createTurno(data: {
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_email: string;
  cliente_dni: string;
  servicio: string;
  duracion_minutos: number;
  precio: number;
  fecha_hora: string;
  notas?: string;
}): Promise<Turno> {
  // Asegurar que el cliente quede registrado en la base de clientes
  const cliente = await createOrUpdateCliente({
    nombre: data.cliente_nombre,
    telefono: data.cliente_telefono,
    email: data.cliente_email,
    dni: data.cliente_dni,
    notas: data.notas
  });

  const nuevoTurno: Turno = {
    id: `tur-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    cliente_id: cliente.id,
    cliente_nombre: data.cliente_nombre.trim(),
    cliente_telefono: data.cliente_telefono.trim(),
    cliente_email: data.cliente_email.trim(),
    cliente_dni: data.cliente_dni.trim(),
    servicio: data.servicio.trim(),
    duracion_minutos: data.duracion_minutos || 45,
    precio: data.precio || 0,
    fecha_hora: data.fecha_hora,
    estado: 'confirmado',
    recordatorio_1dia_enviado: false,
    recordatorio_momento_enviado: false,
    notas: data.notas?.trim() || '',
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: supaData, error } = await supabase
        .from('turnos_estetica')
        .insert(nuevoTurno)
        .select()
        .single();
      if (!error && supaData) {
        memoryStore.turnos.push(supaData as Turno);
        return supaData as Turno;
      }
    } catch {
      // Fallback
    }
  }

  memoryStore.turnos.push(nuevoTurno);
  return nuevoTurno;
}

export async function updateTurnoEstado(id: string, estado: Turno['estado']): Promise<Turno | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('turnos_estetica')
        .update({ estado })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        const idx = memoryStore.turnos.findIndex(t => t.id === id);
        if (idx >= 0) memoryStore.turnos[idx] = data as Turno;
        return data as Turno;
      }
    } catch {
      // Fallback
    }
  }

  const index = memoryStore.turnos.findIndex(t => t.id === id);
  if (index >= 0) {
    memoryStore.turnos[index].estado = estado;
    return memoryStore.turnos[index];
  }
  return null;
}

export async function deleteTurno(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('turnos_estetica').delete().eq('id', id);
    } catch {
      // Ignorar error de fallback
    }
  }
  const idx = memoryStore.turnos.findIndex(t => t.id === id);
  if (idx >= 0) {
    memoryStore.turnos.splice(idx, 1);
    return true;
  }
  return false;
}

// Búsqueda de turnos que necesitan recordatorio
export async function getRecordatoriosPendientes() {
  const turnos = await getTurnos();
  const ahora = new Date();
  
  // Mañana (entre 12 y 36 horas a futuro)
  const mañanaInicio = new Date(ahora);
  mañanaInicio.setDate(ahora.getDate() + 1);
  mañanaInicio.setHours(0, 0, 0, 0);

  const mañanaFin = new Date(mañanaInicio);
  mañanaFin.setHours(23, 59, 59, 999);

  // Hoy (en el día de hoy o próximas 2 horas)
  const hoyInicio = new Date(ahora);
  hoyInicio.setHours(0, 0, 0, 0);
  const hoyFin = new Date(ahora);
  hoyFin.setHours(23, 59, 59, 999);

  const pendientes1Dia = turnos.filter(t => {
    if (t.estado !== 'confirmado' || t.recordatorio_1dia_enviado) return false;
    const fecha = new Date(t.fecha_hora);
    return fecha >= mañanaInicio && fecha <= mañanaFin;
  });

  const pendientesMomento = turnos.filter(t => {
    if (t.estado !== 'confirmado' || t.recordatorio_momento_enviado) return false;
    const fecha = new Date(t.fecha_hora);
    return fecha >= hoyInicio && fecha <= hoyFin;
  });

  return {
    pendientes1Dia,
    pendientesMomento,
    totalPendientes: pendientes1Dia.length + pendientesMomento.length
  };
}

export async function registrarEnvioRecordatorio(
  turnoId: string,
  tipo: '1_dia_antes' | 'momento_turno'
): Promise<RecordatorioLog> {
  const ahoraIso = new Date().toISOString();
  const turno = memoryStore.turnos.find(t => t.id === turnoId);

  const updateFields = tipo === '1_dia_antes'
    ? { recordatorio_1dia_enviado: true, recordatorio_1dia_fecha: ahoraIso }
    : { recordatorio_momento_enviado: true, recordatorio_momento_fecha: ahoraIso };

  if (turno) {
    Object.assign(turno, updateFields);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('turnos_estetica').update(updateFields).eq('id', turnoId);
    } catch {
      // Ignorar fallback
    }
  }

  const log: RecordatorioLog = {
    id: `log-${Date.now().toString(36)}`,
    turno_id: turnoId,
    destinatario_email: turno?.cliente_email || 'cliente@gmail.com',
    tipo,
    estado: 'enviado',
    fecha_envio: ahoraIso,
    detalle: tipo === '1_dia_antes'
      ? 'Recordatorio de turno enviado con 24h de antelación vía Gmail'
      : 'Recordatorio puntual del día del turno enviado vía Gmail'
  };

  memoryStore.logs.unshift(log);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('recordatorios_log').insert(log);
    } catch {
      // Ignorar fallback
    }
  }

  return log;
}
