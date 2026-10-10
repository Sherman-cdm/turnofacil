'use client';
import { useState } from 'react';
import type { HorarioAtencion } from '@/types/database';
import type { AgendaMutation } from '@/lib/agenda/schemas';
import { Field, button, secondary, control, Section } from './Fields';
const days = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
export default function HoursForm({ negocioId, hours, busy, save }: { negocioId: string; hours: HorarioAtencion[]; busy: boolean; save: (input: AgendaMutation) => Promise<boolean> }) {
  const [editing, setEditing] = useState<HorarioAtencion | null>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const data = new FormData(form);
    if (await save({ action: 'horario', ...(editing ? { id: editing.id } : {}), negocio_id: negocioId, dia_semana: Number(data.get('dia')), hora_apertura: String(data.get('apertura')), hora_cierre: String(data.get('cierre')) })) { setEditing(null); form.reset(); }
  }
  return <Section title="Horarios de atención">
    <p className="mb-4 text-sm text-slate-600">Agregá cada franja que realmente atendés. Para un descanso, usá dos franjas separadas.</p>
    <div className="mb-5 grid gap-3">{hours.map(hour => <div key={hour.id} className="rounded-xl border border-slate-200 p-3"><p className="font-semibold">{days[hour.dia_semana]} · {hour.hora_apertura.slice(0,5)} a {hour.hora_cierre.slice(0,5)}</p><div className="mt-2 flex gap-3"><button className="text-sm text-blue-700 underline" disabled={busy} onClick={() => setEditing(hour)}>Editar</button><button className="text-sm text-red-700 underline" disabled={busy} onClick={() => { if (window.confirm('¿Eliminar esta franja? Los turnos ya reservados se conservarán.')) void save({ action: 'eliminar_horario', id: hour.id, negocio_id: negocioId }); }}>Eliminar</button></div></div>)}</div>
    <form onSubmit={submit} className="grid gap-3" key={editing?.id || 'nuevo'}>
      <label className="grid gap-1 text-sm font-medium text-slate-700">Día<select name="dia" className={control} defaultValue={editing?.dia_semana ?? 1}>{days.map((day, index) => <option value={index} key={day}>{day}</option>)}</select></label>
      <div className="grid grid-cols-2 gap-3"><Field label="Apertura" name="apertura" type="time" defaultValue={editing?.hora_apertura.slice(0,5) || ''} required /><Field label="Cierre" name="cierre" type="time" defaultValue={editing?.hora_cierre.slice(0,5) || ''} required /></div>
      <button className={button} disabled={busy}>{editing ? 'Guardar horario' : 'Agregar franja'}</button>{editing && <button type="button" className={secondary} onClick={() => setEditing(null)}>Cancelar edición</button>}
    </form>
  </Section>;
}

