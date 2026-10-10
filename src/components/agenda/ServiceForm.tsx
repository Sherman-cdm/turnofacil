'use client';
import { useState } from 'react';
import type { Servicio } from '@/types/database';
import type { AgendaMutation } from '@/lib/agenda/schemas';
import { Field, button, secondary, Section } from './Fields';
export default function ServiceForm({ negocioId, services, busy, save }: { negocioId: string; services: Servicio[]; busy: boolean; save: (input: AgendaMutation) => Promise<boolean> }) {
  const [editing, setEditing] = useState<Servicio | null>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const data = new FormData(form);
    const saved = await save({ action: 'servicio', ...(editing ? { id: editing.id } : {}), negocio_id: negocioId, nombre: String(data.get('nombre')), descripcion: String(data.get('descripcion')), duracion_minutos: Number(data.get('duracion')), precio: Number(data.get('precio')) });
    if (saved) { setEditing(null); form.reset(); }
  }
  return <Section title="Servicios y precios">
    <p className="mb-4 text-sm text-slate-600">Sugerencias para estética de pies: pedicuría estética, esmaltado y cuidado de pies. Guardá solo los servicios que realmente ofrecés. Los precios se muestran en ARS.</p>
    <div className="mb-5 grid gap-3">{services.map(service => <div key={service.id} className="rounded-xl border border-slate-200 p-3">
      <p className="font-semibold break-words">{service.nombre}</p><p className="text-sm text-slate-600">{service.duracion_minutos} min · ARS {Number(service.precio).toLocaleString('es-AR')}</p>
      <div className="mt-2 flex flex-wrap gap-3"><button className="text-sm text-blue-700 underline" onClick={() => setEditing(service)} disabled={busy}>Editar</button><button className="text-sm text-red-700 underline" disabled={busy} onClick={() => { if (window.confirm('¿Eliminar este servicio? Los turnos existentes se conservarán sin el servicio asociado.')) void save({ action: 'eliminar_servicio', id: service.id, negocio_id: negocioId }); }}>Eliminar</button></div>
    </div>)}</div>
    <form onSubmit={submit} className="grid gap-3" key={editing?.id || 'nuevo'}>
      <h3 className="font-semibold">{editing ? 'Editar servicio' : 'Agregar servicio'}</h3>
      <Field label="Nombre" name="nombre" placeholder="Ej.: Pedicuría estética" defaultValue={editing?.nombre || ''} required maxLength={120} />
      <Field label="Descripción" name="descripcion" defaultValue={editing?.descripcion || ''} maxLength={1000} />
      <div className="grid grid-cols-2 gap-3"><Field label="Duración (5 a 240 minutos)" name="duracion" type="number" defaultValue={editing?.duracion_minutos || 45} min={5} max={240} required /><Field label="Precio (ARS)" name="precio" type="number" step="0.01" defaultValue={editing?.precio ?? ''} min={0} max={99999999} required /></div>
      <button disabled={busy} className={button}>{editing ? 'Guardar cambios' : 'Agregar servicio'}</button>{editing && <button type="button" className={secondary} onClick={() => setEditing(null)}>Cancelar edición</button>}
    </form>
  </Section>;
}


