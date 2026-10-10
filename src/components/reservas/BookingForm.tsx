'use client';
import Link from 'next/link';
import { useState } from 'react';
import { CalendarCheck, ChevronLeft, Clock, ShieldCheck } from 'lucide-react';
import { useBooking } from '@/lib/reservas/use-booking';
import { PublicAssistant } from '@/components/reservas/PublicAssistant';

function localDate(zone: string) {
  const parts = new Intl.DateTimeFormat('en', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  return `${parts.find((part) => part.type === 'year')?.value}-${parts.find((part) => part.type === 'month')?.value}-${parts.find((part) => part.type === 'day')?.value}`;
}
export function BookingForm({ negocioId }: { negocioId: string }) {
  const booking = useBooking(negocioId);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const negocio = booking.negocio;
  const zone = negocio?.zona_horaria || 'America/Argentina/Buenos_Aires';
  const hoy = localDate(zone);
  const max = new Date(`${hoy}T12:00:00Z`); max.setUTCDate(max.getUTCDate() + 60);
  const selectedService = negocio?.servicios.find((service) => service.id === booking.servicioId);
  const formatDate = (value: string) => new Intl.DateTimeFormat('es-AR', { timeZone: zone, dateStyle: 'full', timeStyle: 'short' }).format(new Date(value));
  const inputClass = 'w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500';
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:py-14">
      <div className="mx-auto max-w-xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700"><ChevronLeft size={18} /> TurnoFácil AI</Link>
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-100 p-6 sm:p-8">
            <div className="mb-5 inline-flex rounded-2xl bg-blue-50 p-3 text-blue-600"><CalendarCheck size={28} /></div>
            <p className="mb-2 text-sm font-semibold text-blue-600">Reservas online</p>
            <h1 className="break-words text-3xl font-bold tracking-tight">{negocio?.nombre || 'Reservá tu turno'}</h1>
            <p className="mt-3 text-slate-600">Elegí tu servicio y un horario disponible.</p>
          </header>
          <div className="p-6 sm:p-8">
            {booking.loading && <p role="status" className="text-slate-600">Cargando agenda…</p>}
            {booking.error && <p role="alert" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{booking.error}</p>}
            {booking.confirmacion ? (
              <div role="status" className="space-y-4">
                <h2 className="text-xl font-bold text-emerald-700">Tu turno quedó confirmado</h2>
                <p>{formatDate(booking.confirmacion.inicio)}</p>
                <p className="text-sm text-slate-600">Guardá esta referencia para consultar al negocio.</p>
                <code className="block break-all rounded-xl bg-slate-100 p-3 text-sm">{booking.confirmacion.id}</code>
                <p className="text-sm text-slate-600">La reserva está guardada. No se envían recordatorios automáticos por correo ni WhatsApp.</p>
              </div>
            ) : negocio && (
              <form className="space-y-6" onSubmit={(event) => { event.preventDefault(); void booking.reservar(nombre, telefono); }}>
                <div>
                  <label htmlFor="servicio" className="mb-2 block text-sm font-semibold">Servicio</label>
                  <select id="servicio" required className={inputClass} value={booking.servicioId} disabled={booking.sending} onChange={(event) => booking.setServicioId(event.target.value)}>
                    <option value="">Elegí un servicio</option>
                    {negocio.servicios.map((service) => <option key={service.id} value={service.id}>{service.nombre} · {service.duracion_minutos} min</option>)}
                  </select>
                  {selectedService && <div className="mt-3 space-y-1 text-sm text-slate-600"><p>{selectedService.descripcion}</p><p>Precio publicado: {selectedService.precio.toLocaleString('es-AR')}</p></div>}
                  {negocio.servicios.length === 0 && <p className="mt-3 text-sm text-slate-600">El negocio todavía no publicó servicios disponibles.</p>}
                </div>
                <div>
                  <label htmlFor="fecha" className="mb-2 block text-sm font-semibold">Fecha</label>
                  <input id="fecha" type="date" required min={hoy} max={max.toISOString().slice(0, 10)} value={booking.fecha} onChange={(event) => booking.setFecha(event.target.value)} disabled={!booking.servicioId || booking.sending} className={inputClass} />
                </div>
                {booking.servicioId && booking.fecha && <fieldset>
                  <legend className="mb-3 text-sm font-semibold">Horarios disponibles</legend>
                  {booking.loadingSlots ? <p role="status" className="text-sm text-slate-600">Consultando horarios…</p> : <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {booking.horarios.map((hour) => <label key={hour} className={`cursor-pointer rounded-xl border px-2 py-3 text-center text-sm font-medium ${booking.inicio === hour ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-400'}`}><input type="radio" name="horario" value={hour} checked={booking.inicio === hour} onChange={() => booking.setInicio(hour)} disabled={booking.sending} className="sr-only" required /><span>{new Intl.DateTimeFormat('es-AR', { timeZone: zone, hour: '2-digit', minute: '2-digit' }).format(new Date(hour))}</span></label>)}
                  </div>}
                  {!booking.loadingSlots && booking.horarios.length === 0 && <p className="text-sm text-slate-600">No hay horarios disponibles para esa fecha. Elegí otro día.</p>}
                </fieldset>}
                <p className="flex items-start gap-2 text-xs text-slate-500"><Clock size={15} className="shrink-0" /> Horario del negocio: {zone.replaceAll('_', ' ')}.</p>
                <div>
                  <label htmlFor="nombre" className="mb-2 block text-sm font-semibold">Tu nombre</label>
                  <input id="nombre" autoComplete="name" required minLength={2} maxLength={80} value={nombre} onChange={(event) => setNombre(event.target.value)} disabled={booking.sending} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="telefono" className="mb-2 block text-sm font-semibold">Teléfono con código de país y área</label>
                  <input id="telefono" type="tel" autoComplete="tel" required maxLength={30} value={telefono} onChange={(event) => setTelefono(event.target.value)} disabled={booking.sending} placeholder="Ej.: +54 11 1234 5678" className={inputClass} />
                </div>
                <p className="flex items-start gap-2 text-xs text-slate-500"><ShieldCheck size={16} className="shrink-0" /> El propietario del negocio usa tu nombre y teléfono para administrar este turno.</p>
                <button type="submit" disabled={!booking.inicio || booking.loadingSlots || booking.sending} className="w-full rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{booking.sending ? 'Guardando reserva…' : 'Confirmar reserva'}</button>
                <p className="text-xs text-slate-500">El horario se confirma cuando la reserva se guarda. Si alguien lo ocupa antes, podrás elegir otro.</p>
              </form>
            )}
          </div>
        </section>
        {negocio && <PublicAssistant negocioId={negocioId} />}
      </div>
    </main>
  );
}

