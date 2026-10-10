'use client';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { catalogoSchema, confirmacionSchema, horariosSchema } from './schemas';
import type { Catalogo, Confirmacion } from './types';

export function useBooking(negocioId: string) {
  const [negocio, setNegocio] = useState<Catalogo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [servicioId, setServicioId] = useState('');
  const [fecha, setFecha] = useState('');
  const [horarios, setHorarios] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [inicio, setInicio] = useState('');
  const [sending, setSending] = useState(false);
  const [confirmacion, setConfirmacion] = useState<Confirmacion | null>(null);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch(`/api/reservas?negocioId=${encodeURIComponent(negocioId)}`, { signal: controller.signal, cache: 'no-store' });
        const parsed = z.object({ negocio: catalogoSchema }).safeParse(await response.json());
        if (!response.ok || !parsed.success) throw new Error('Esta agenda no está publicada. Contactá al negocio para reservar.');
        setNegocio(parsed.data.negocio);
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'No pudimos cargar la agenda.');
      } finally { if (!controller.signal.aborted) setLoading(false); }
    })();
    return () => controller.abort();
  }, [negocioId]);
  useEffect(() => {
    if (!servicioId || !fecha) return;
    const controller = new AbortController();
    void (async () => {
      try {
        setLoadingSlots(true); setInicio(''); setHorarios([]);
        const query = new URLSearchParams({ negocioId, servicioId, fecha });
        const response = await fetch(`/api/reservas?${query}`, { signal: controller.signal, cache: 'no-store' });
        const parsed = z.object({ horarios: horariosSchema }).safeParse(await response.json());
        if (!response.ok || !parsed.success) throw new Error('No pudimos consultar los horarios. Intentá nuevamente.');
        setHorarios(parsed.data.horarios);
      } catch (cause) { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'No pudimos cargar los horarios.'); }
      finally { if (!controller.signal.aborted) setLoadingSlots(false); }
    })();
    return () => controller.abort();
  }, [negocioId, servicioId, fecha, refresh]);
  async function reservar(clienteNombre: string, clienteTelefono: string) {
    if (sending) return;
    setSending(true); setError('');
    try {
      const response = await fetch('/api/reservas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ negocioId, servicioId, inicio, clienteNombre, clienteTelefono }) });
      const data: unknown = await response.json();
      const parsed = z.object({ reserva: confirmacionSchema }).safeParse(data);
      if (!response.ok || !parsed.success) {
        const failure = z.object({ error: z.string() }).safeParse(data);
        throw new Error(failure.success ? failure.data.error : 'No pudimos verificar la reserva. Contactá al negocio.');
      }
      setConfirmacion(parsed.data.reserva);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No pudimos reservar. Contactá al negocio antes de volver a intentar.');
      setRefresh((value) => value + 1);
    } finally { setSending(false); }
  }
  function elegirServicio(value: string) { setServicioId(value); setInicio(''); setHorarios([]); setError(''); }
  function elegirFecha(value: string) { setFecha(value); setInicio(''); setHorarios([]); setError(''); }
  return { negocio, loading, error, servicioId, setServicioId: elegirServicio, fecha, setFecha: elegirFecha, horarios, loadingSlots, inicio, setInicio, sending, confirmacion, reservar };
}

