import { ServicioEstetica } from '@/types/turnofa';

export const SERVICIOS_ESTETICA_PIES: ServicioEstetica[] = [
  {
    id: 'spa-deluxe',
    nombre: 'Belleza y Spa de Pies Deluxe',
    descripcion: 'Baño de inmersión aromático, exfoliación profunda, hidratación con mascarilla nutritiva, masaje podal relajante y esmaltado.',
    duracion_minutos: 50,
    precio: 18000,
    categoria: 'spa'
  },
  {
    id: 'pedicuria-clinica',
    nombre: 'Pedicuría Clínica & Talones Agrietados',
    descripcion: 'Remoción técnica de callosidades y durezas, pulido podológico de talones, corte recto anatómico de uñas y nutrición con urea.',
    duracion_minutos: 45,
    precio: 16000,
    categoria: 'clinica'
  },
  {
    id: 'unas-encarnadas',
    nombre: 'Tratamiento de Uña Encarnada (Onicocriptosis)',
    descripcion: 'Descompresión podológica sin dolor de bordes ungueales, desinfección preventiva, espiculotomía y colocación de mecha antibacteriana.',
    duracion_minutos: 40,
    precio: 20000,
    categoria: 'clinica'
  },
  {
    id: 'semipermanente-pies',
    nombre: 'Esmaltado Semipermanente de Pies',
    descripcion: 'Perfilado de uñas, retiro de cutícula seca, esmaltado semipermanente de máxima duración con cabina UV/LED y acabado brillante.',
    duracion_minutos: 45,
    precio: 15000,
    categoria: 'belleza'
  },
  {
    id: 'reflexologia-podal',
    nombre: 'Reflexología Podal y Masaje Descongestivo',
    descripcion: 'Estimulación de puntos reflejos y zonas de drenaje para aliviar piernas cansadas, fascitis plantar y sobrecarga postural.',
    duracion_minutos: 35,
    precio: 14000,
    categoria: 'spa'
  },
  {
    id: 'reconstruccion-ungueal',
    nombre: 'Reconstrucción Ungueal Podológica',
    descripcion: 'Reparación estética y funcional de uña traumatizada o quebrada con acrigel médico antimicótico.',
    duracion_minutos: 30,
    precio: 12000,
    categoria: 'clinica'
  }
];
