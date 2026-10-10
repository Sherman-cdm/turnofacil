export interface Negocio {
  owner_id?: string;
  agenda_publica?: boolean;
  id: string;
  nombre: string;
  telefono?: string;
  zona_horaria: string;
  prompt_contexto?: string;
  created_at?: string;
}

export interface Servicio {
  id: string;
  negocio_id: string;
  nombre: string;
  descripcion?: string;
  duracion_minutos: number;
  precio: number;
}

export interface HorarioAtencion {
  id: string;
  negocio_id: string;
  dia_semana: number; // 0=Domingo, 1=Lunes, ... 6=Sábado
  hora_apertura: string;
  hora_cierre: string;
}

export interface Turno {
  id: string;
  negocio_id: string;
  servicio_id?: string;
  cliente_nombre: string;
  cliente_telefono: string;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  estado: 'pendiente' | 'confirmado' | 'cancelado';
  notas?: string;
  created_at?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

