'use client';
import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { AgendaData } from './types';
import type { AgendaMutation } from './schemas';
export function useAgenda() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [data, setData] = useState<AgendaData | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!supabase) { setTimeout(() => { setReady(true); setError('La agenda todavía no está configurada.'); }, 0); return; }
    const { data: subscription } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next); setReady(true); setData(null);
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);
  const request = useCallback(async (mutation?: AgendaMutation) => {
    const current = await supabase?.auth.getSession();
    const token = current?.data.session?.access_token;
    if (!token) throw new Error('Iniciá sesión nuevamente.');
    const response = await fetch('/api/agenda', {
      method: mutation ? 'POST' : 'GET',
      headers: { Authorization: `Bearer ${token}`, ...(mutation ? { 'Content-Type': 'application/json' } : {}) },
      ...(mutation ? { body: JSON.stringify(mutation) } : {}),
      cache: 'no-store',
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'No pudimos completar la solicitud.');
    return result;
  }, []);
  const refresh = useCallback(async () => {
    setBusy(true); setError('');
    try { setData(await request()); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Error al cargar la agenda.'); }
    finally { setBusy(false); }
  }, [request]);
  useEffect(() => {
    if (session) { const timer = setTimeout(() => { void refresh(); }, 0); return () => clearTimeout(timer); }
  }, [session, refresh]);
  const mutate = async (input: AgendaMutation) => {
    setBusy(true); setError('');
    try { await request(input); setData(await request()); return true; }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No pudimos guardar.'); return false; }
    finally { setBusy(false); }
  };
  return { session, ready, recovery, setRecovery, data, error, busy, refresh, mutate };
}

