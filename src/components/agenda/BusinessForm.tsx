'use client';
import type { Negocio } from '@/types/database';
import type { AgendaMutation } from '@/lib/agenda/schemas';
import { Field, button, Section } from './Fields';
export default function BusinessForm({ business, busy, save }: { business?: Negocio & { agenda_publica?: boolean }; busy: boolean; save: (input: AgendaMutation) => Promise<boolean> }) {
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    await save({ action: 'negocio', ...(business ? { id: business.id } : {}), nombre: String(data.get('nombre')), telefono: String(data.get('telefono')), zona_horaria: String(data.get('zona_horaria')), agenda_publica: data.get('agenda_publica') === 'on' });
  }
  return <Section title={business ? 'Tu negocio' : 'Configurar tu negocio'}>
    <p className="mb-4 text-sm text-slate-600">Una agenda atiende a una persona por vez. Elegí tus servicios y horarios reales antes de habilitar reservas.</p>
    <form onSubmit={submit} className="grid gap-4" key={business?.id || 'nuevo'}>
      <Field label="Nombre del negocio" name="nombre" defaultValue={business?.nombre || 'Estética de pies'} required maxLength={120} />
      <Field label="Teléfono de contacto" name="telefono" defaultValue={business?.telefono || ''} maxLength={40} />
      <Field label="Zona horaria" name="zona_horaria" defaultValue={business?.zona_horaria || 'America/Argentina/Buenos_Aires'} required maxLength={80} />
      <label className="flex items-start gap-3 text-sm text-slate-700"><input name="agenda_publica" type="checkbox" className="mt-1" defaultChecked={business?.agenda_publica || false} />Habilitar reservas públicas. Se compartirán nombre, servicios, precios y horarios disponibles; los datos de clientes permanecen privados.</label>
      <button className={button} disabled={busy}>{business ? 'Guardar configuración' : 'Crear mi agenda'}</button>
    </form>
    {business?.agenda_publica && <a className="mt-4 block break-all text-sm text-blue-700 underline" href={`/reservar/${business.id}`}>Abrir enlace público de reservas</a>}
  </Section>;
}

