export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  email: string; // Gmail del cliente
  dni: string;
  notas?: string;
  created_at: string;
}

export type EstadoTurno = 'confirmado' | 'en_atencion' | 'completado' | 'cancelado';

export interface Turno {
  id: string;
  cliente_id?: string;
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_email: string;
  cliente_dni: string;
  servicio: string;
  duracion_minutos: number;
  precio: number;
  fecha_hora: string; // ISO string
  estado: EstadoTurno;
  recordatorio_1dia_enviado: boolean;
  recordatorio_1dia_fecha?: string;
  recordatorio_momento_enviado: boolean;
  recordatorio_momento_fecha?: string;
  notas?: string;
  created_at: string;
}

export interface ServicioEstetica {
  id: string;
  nombre: string;
  descripcion: string;
  duracion_minutos: number;
  precio: number;
  categoria: 'spa' | 'clinica' | 'belleza';
}

export interface RecordatorioLog {
  id: string;
  turno_id: string;
  destinatario_email: string;
  tipo: '1_dia_antes' | 'momento_turno';
  estado: 'enviado' | 'fallido' | 'simulado';
  fecha_envio: string;
  detalle?: string;
}
