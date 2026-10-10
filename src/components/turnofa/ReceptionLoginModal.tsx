'use client';

import React, { useState } from 'react';
import { Lock, Mail, KeyRound, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface ReceptionLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReceptionLoginModal({ isOpen, onClose, onSuccess }: ReceptionLoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reception', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.status === 410) {
        setError('Usá la agenda privada desde la página principal. Este acceso anterior fue retirado.');
        return;
      }

      if (res.ok && data.ok) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 600);
      } else {
        setError(data.error || 'Credenciales inválidas.');
      }
    } catch {
      setError('Error de conexión al servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-teal-100 overflow-hidden">
        
        {/* Cabecera con degradado spa */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 px-6 py-6 text-white text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm mb-3 shadow-inner">
            <span className="text-2xl">🦶</span>
          </div>
          <h3 className="text-2xl font-black tracking-tight">TURNOFA</h3>
          <p className="text-xs font-medium text-teal-100 mt-1 uppercase tracking-widest">
            Recepción · Estética de Pies
          </p>
        </div>

        {/* Formulario */}
        <div className="p-6 sm:p-8">
          <div className="mb-5 text-center">
            <h4 className="text-lg font-bold text-slate-800">Acceso anterior de recepción</h4>
            <p className="text-xs text-slate-500 mt-1">
              Usá la agenda privada desde la página principal. Este acceso anterior fue retirado.
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Acceso confirmado. Ingresando al panel...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Gmail de Recepción
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ingresá tus datos"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Contraseña Designada
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresá tus datos"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || success}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-md shadow-teal-600/20 disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? 'Verificando...' : (
                  <>
                    <Lock className="w-4 h-4" />
                    Consultar acceso
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Botón rápido de credenciales */}
          <div className="mt-5 p-3 rounded-2xl bg-teal-50/70 border border-teal-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-teal-800 font-medium">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Usá la agenda privada desde la página principal</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail('');
                setPassword('');
              }}
              className="text-teal-700 font-bold hover:underline"
            >
              Limpiar campos
            </button>
          </div>
        </div>

        {/* Pie de modal */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            Cerrar ventana
          </button>
        </div>

      </div>
    </div>
  );
}
