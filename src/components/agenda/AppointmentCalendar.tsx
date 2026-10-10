'use client';
import { useState } from 'react';
import type { Turno, Servicio } from '@/types/database';
import type { AgendaMutation } from '@/lib/agenda/schemas';
import { control, secondary } from './Fields';
export default function AppointmentCalendar({ turnos, services, zona, busy, save }: {
  turnos: Turno[]; services: Servicio[]; zona: string; busy: boolean; save: (input: AgendaMutation) => Promise<boolean>;
}) {
  const dayOf = (date: Date) => new Intl.DateTimeFormat('sv-SE', { timeZone: zona }).format(date);
  const [day, setDay] = useState(() => dayOf(new Date()));
  const [status, setStatus] = useState('todos');
  const visible = turnos.filter(turno => (!day || dayOf(new Date(turno.fecha_hora_inicio)) === day) && (status === 'todos' || turno.estado === status));
  return <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7" aria-labelledby="calendar-title">
    <h2 id="calendar-title" className="text-xl font-bold">Mis turnos</h2>
    <p className="mt-2 text-sm text-slate-600">Elegí un día para ver sus citas. Horas en {zona}.</p>
    <div className="my-5 flex flex-wrap items-end gap-3">
      <label className="grid gap-1 text-sm">Fecha<input className={control} type="date" value={day} onChange={event => setDay(event.target.value)} /></label>
      <label className="grid gap-1 text-sm">Estado<select className={control} value={status} onChange={event => setStatus(event.target.value)}><option value="todos">Todos</option><option value="pendiente">Pendientes</option><option value="confirmado">Confirmados</option><option value="cancelado">Cancelados</option></select></label>
      <button className={secondary} onClick={() => setDay(dayOf(new Date()))}>Hoy</button><button className={secondary} onClick={() => setDay('')}>Ver todos</button>
    </div>
    <div className="space-y-3">{visible.map(turno => <article key={turno.id} className="min-w-0 rounded-xl border border-slate-200 p-4">
      <div className="flex flex-wrap justify-between gap-2"><h3 className="break-words font-semibold">{turno.cliente_nombre}</h3><p className="text-sm font-medium text-teal-700">{new Intl.DateTimeFormat('es-AR', { timeZone: zona, dateStyle: 'medium', timeStyle: 'short' }).format(new Date(turno.fecha_hora_inicio))}</p></div>
      <p className="mt-1 text-sm text-slate-600">{services.find(service => service.id === turno.servicio_id)?.nombre || 'Servicio retirado'}</p>
      <p className="break-all text-sm text-slate-500">{turno.cliente_telefono}</p>
      <label className="mt-3 grid max-w-xs gap-1 text-sm">Estado del turno<select className={control} disabled={busy} value={turno.estado} onChange={event => {
        const estado = event.target.value as Turno['estado'];
        if (window.confirm('¿Cambiar el turno a ' + estado + '?')) void save({ action: 'estado_turno', id: turno.id, negocio_id: turno.negocio_id, estado });
      }}><option value="pendiente">Pendiente</option><option value="confirmado">Confirmado</option><option value="cancelado">Cancelado</option></select></label>
    </article>)}
    {!visible.length && <div className="rounded-xl bg-slate-50 p-8 text-center"><p className="font-semibold">No hay turnos para esta selección.</p><p className="mt-2 text-sm text-slate-500">Las reservas confirmadas aparecerán aquí. Podés cambiar la fecha o ver todos los turnos.</p></div>}
    </div>
    <p className="mt-5 text-xs text-slate-500">Se muestran hasta 500 turnos desde los últimos 30 días.</p>
  </section>;
}
