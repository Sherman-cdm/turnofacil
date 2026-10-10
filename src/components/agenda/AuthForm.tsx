'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Field, button, secondary } from './Fields';
export default function AuthForm({ recovery, onRecovered }: { recovery: boolean; onRecovered: () => void }) {
  const [mode, setMode] = useState<'login'|'signup'|'reset'>('login');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage('');
    if (!supabase) { setMessage('Agenda no configurada.'); return; }
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');
    setBusy(true);
    try {
      if (recovery) {
        const result = await supabase.auth.updateUser({ password });
        if (result.error) throw result.error;
        onRecovered(); setMessage('Contraseña actualizada.');
      } else if (mode === 'reset') {
        const result = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/agenda` });
        if (result.error) throw result.error;
        setMessage('Si hay una cuenta con ese correo, recibirás el enlace para restablecerla.');
      } else if (mode === 'signup') {
        const result = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/agenda` } });
        if (result.error) throw result.error;
        setMessage('Revisá tu correo y confirmá la cuenta antes de entrar. Si ya tenés una cuenta, usá Ingresar.');
      } else {
        const result = await supabase.auth.signInWithPassword({ email, password });
        if (result.error) throw result.error;
      }
    } catch { setMessage('No pudimos completar el acceso. Revisá los datos, la confirmación del correo o intentá más tarde.'); }
    finally { setBusy(false); }
  }
  return <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
    <h2 className="text-2xl font-bold">{recovery ? 'Nueva contraseña' : mode === 'signup' ? 'Crear cuenta propietaria' : mode === 'reset' ? 'Recuperar acceso' : 'Ingresar a tu agenda'}</h2>
    <p className="mb-6 mt-2 text-sm text-slate-600">Tu agenda y los datos de tus clientes son privados. Usá un correo propio al que puedas acceder.</p>
    <form onSubmit={submit} className="grid gap-4">
      {!recovery && <Field label="Correo del propietario" name="email" type="email" autoComplete="email" required maxLength={254} />}
      {(recovery || mode !== 'reset') && <Field label="Contraseña" name="password" type="password" autoComplete={mode === 'login' && !recovery ? 'current-password' : 'new-password'} minLength={mode === 'login' && !recovery ? 1 : 6} maxLength={128} required />}
      {(mode === 'signup' || recovery) && <p className="text-xs text-slate-600">Usá al menos 6 caracteres y una contraseña exclusiva.</p>}
      <button className={button} disabled={busy}>{busy ? 'Procesando…' : recovery ? 'Guardar contraseña' : mode === 'signup' ? 'Crear cuenta' : mode === 'reset' ? 'Enviar enlace' : 'Ingresar'}</button>
    </form>
    {message && <p role="status" className="mt-4 text-sm text-slate-700">{message}</p>}
    {!recovery && <div className="mt-5 flex flex-wrap gap-2">
      <button className={secondary} onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setMessage(''); }}>{mode === 'signup' ? 'Ya tengo cuenta' : 'Crear cuenta'}</button>
      <button className="text-sm text-blue-700 underline" onClick={() => { setMode(mode === 'reset' ? 'login' : 'reset'); setMessage(''); }}>{mode === 'reset' ? 'Volver a ingresar' : 'Olvidé mi contraseña'}</button>
    </div>}
  </div>;
}

