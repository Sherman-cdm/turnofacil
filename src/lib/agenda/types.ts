import type { Negocio, Servicio, HorarioAtencion, Turno } from '@/types/database';
export interface AgendaData { negocios: (Negocio & { agenda_publica: boolean })[]; servicios: Servicio[]; horarios: HorarioAtencion[]; turnos: Turno[]; }


