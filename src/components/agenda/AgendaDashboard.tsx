'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAgenda } from '@/lib/agenda/use-agenda';
import AuthForm from './AuthForm';
import BusinessForm from './BusinessForm';
import ServiceForm from './ServiceForm';
import HoursForm from './HoursForm';
import { secondary, control } from './Fields';
import AppointmentCalendar from './AppointmentCalendar';
import { PublicAssistant } from '@/components/reservas/PublicAssistant';
export default function AgendaDashboard() {
  const agenda = useAgenda();
  const [businessId, setBusinessId] = useState('');
  const [view, setView] = useState<'agenda' | 'asistente' | 'configuracion'>('agenda');
  const [logoutError, setLogoutError] = useState('');
  const business = agenda.data?.negocios.find(item => item.id === businessId) || agenda.data?.negocios[0];
  if (!agenda.ready) return <p role="status">Cargando acceso seguro…</p>;
  if (!agenda.session || agenda.recovery) return <><AuthForm recovery={agenda.recovery} onRecovered={() => agenda.setRecovery(false)} />{agenda.error && <p className="mt-4 text-center text-red-700" role="alert">{agenda.error}</p>}</>;
  async function logout() {
    const result = await supabase?.auth.signOut();
    if (result?.error) setLogoutError('No pudimos cerrar sesión. Intentá nuevamente.');
  }
  return <div className="grid gap-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="min-w-0 break-all text-sm text-slate-600">{agenda.session.user.email}</p><div className="flex flex-wrap gap-2"><button className={secondary} onClick={() => void agenda.refresh()} disabled={agenda.busy}>Actualizar</button><button className={secondary} onClick={() => void logout()}>Cerrar sesión</button></div></div>
    {(agenda.error || logoutError) && <p className="rounded-xl bg-red-50 p-4 text-red-800" role="alert">{agenda.error || logoutError}</p>}
    {agenda.busy && <p role="status" className="text-sm text-slate-600">Actualizando agenda…</p>}
    {agenda.data && <>
      {agenda.data.negocios.length > 1 && <label className="grid gap-1 text-sm">Negocio<select className={control} value={business?.id} onChange={event => setBusinessId(event.target.value)}>{agenda.data.negocios.map(item => <option value={item.id} key={item.id}>{item.nombre}</option>)}</select></label>}
      <nav aria-label="Secciones de la agenda" className="flex flex-wrap gap-2">{(['agenda', 'asistente', 'configuracion'] as const).map(tab => <button key={tab} aria-pressed={view === tab} onClick={() => setView(tab)} className={view === tab ? 'rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white' : secondary}>{tab === 'agenda' ? 'Agenda' : tab === 'asistente' ? 'Asistente IA' : 'Configuración'}</button>)}</nav>
      {business && view === 'agenda' && <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal-100 bg-teal-50 p-5"><div><h2 className="font-bold">{business.nombre}</h2><p className="mt-1 text-sm text-teal-800">{business.agenda_publica ? 'Tu enlace está habilitado para recibir reservas.' : 'Configurá servicios y horarios y habilitá el enlace para recibir reservas.'}</p></div>{business.agenda_publica ? <a href={'/reservar/' + business.id} className={secondary}>Nuevo turno</a> : <button className={secondary} onClick={() => setView('configuracion')}>Configurar agenda</button>}</div>}
      <div className="grid items-start gap-6">
        {(view === 'configuracion' || !business) && <BusinessForm key={'business:' + (business?.id || 'nuevo')} business={business} busy={agenda.busy} save={agenda.mutate} />}
        {business && view === 'configuracion' && <ServiceForm key={'services:' + business.id} negocioId={business.id} services={agenda.data.servicios.filter(item => item.negocio_id === business.id)} busy={agenda.busy} save={agenda.mutate} />}
        {business && view === 'configuracion' && <HoursForm key={'hours:' + business.id} negocioId={business.id} hours={agenda.data.horarios.filter(item => item.negocio_id === business.id)} busy={agenda.busy} save={agenda.mutate} />}
        {business && view === 'agenda' && <AppointmentCalendar key={'calendar:' + business.id} turnos={agenda.data.turnos.filter(item => item.negocio_id === business.id)} services={agenda.data.servicios.filter(item => item.negocio_id === business.id)} zona={business.zona_horaria} busy={agenda.busy} save={agenda.mutate} />}
        {business && view === 'asistente' && <PublicAssistant key={'assistant:' + business.id} negocioId={business.id} ownerToken={agenda.session.access_token} />}
      </div>
    </>}
  </div>;
}

