'use client';

import React, { useState, useEffect } from 'react';
import { Turno } from '@/types/turnofa';
import { Send, CheckCircle2, Eye, Sparkles } from 'lucide-react';
import { generateReminderEmailHtml } from '@/lib/email-reminder';

interface RecordatoriosPanelProps {
  onRecordatorioEnviado: () => void;
}

export default function RecordatoriosPanel({ onRecordatorioEnviado }: RecordatoriosPanelProps) {
  const [pendientes1Dia, setPendientes1Dia] = useState<Turno[]>([]);
  const [pendientesMomento, setPendientesMomento] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const [enviandoId, setEnviandoId] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState('');
  
  // Vista previa de correo
  const [previewTurno, setPreviewTurno] = useState<{ turno: Turno; tipo: '1_dia_antes' | 'momento_turno' } | null>(null);

  async function cargarRecordatorios() {
    setLoading(true);
    try {
      const res = await fetch('/api/recordatorios');
      const data = await res.json();
      if (data.ok) {
        setPendientes1Dia(data.pendientes1Dia || []);
        setPendientesMomento(data.pendientesMomento || []);
      }
    } catch {
      // Ignorar
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/recordatorios', { signal: controller.signal })
      .then(response => response.json())
      .then(data => {
        if (!controller.signal.aborted && data.ok) {
          setPendientes1Dia(data.pendientes1Dia || []);
          setPendientesMomento(data.pendientesMomento || []);
        }
      })
      .catch(() => {})
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  async function enviarAviso(turnoId: string, tipo: '1_dia_antes' | 'momento_turno') {
    setEnviandoId(turnoId + tipo);
    setMensajeExito('');

    try {
      const res = await fetch('/api/recordatorios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ turnoId, tipo })
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setMensajeExito(data.mensaje);
        onRecordatorioEnviado();
        cargarRecordatorios();
        setTimeout(() => setMensajeExito(''), 6000);
      }
    } catch {
      // Ignorar
    } finally {
      setEnviandoId(null);
    }
  }

  async function enviarTodos(tipo: '1_dia_antes' | 'momento_turno') {
    const lista = tipo === '1_dia_antes' ? pendientes1Dia : pendientesMomento;
    for (const t of lista) {
      await enviarAviso(t.id, tipo);
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Cabecera explicativa */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Automatización con IA para Estética de Pies</span>
            </div>
            <h3 className="text-2xl font-black tracking-tight">Centro de Recordatorios por Gmail</h3>
            <p className="text-xs sm:text-sm text-teal-100 mt-1 max-w-2xl leading-relaxed">
              El agente de TURNOFA ayuda a la recepción enviando recordatorios automáticos por correo a los clientes en dos momentos clave: <strong>1 día antes del turno</strong> y <strong>en el momento del turno</strong>.
            </p>
          </div>

          <button
            onClick={() => cargarRecordatorios()}
            className="self-start sm:self-center px-4 py-2 bg-white/10 hover:bg-white/20 text-xs font-bold rounded-xl border border-white/20 transition-colors"
          >
            Actualizar Alertas
          </button>
        </div>
      </div>

      {mensajeExito && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-teal-50">
          <div className="inline-block w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-sm text-slate-500 font-medium">Buscando turnos pendientes de recordatorio...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Bloque 1: Recordatorios 1 Día Antes (Para Mañana) */}
          <div className="bg-white rounded-3xl p-6 border border-teal-100 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    🗓️
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Recordatorio 1 Día Antes (24h)</h4>
                    <p className="text-[11px] text-slate-500">Turnos programados para mañana</p>
                  </div>
                </div>

                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                  {pendientes1Dia.length} pendientes
                </span>
              </div>

              {pendientes1Dia.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/60 mb-2" />
                  No hay recordatorios de 24h pendientes de envío. ¡Todos al día!
                </div>
              ) : (
                <div className="divide-y divide-slate-100 mt-2">
                  {pendientes1Dia.map(t => {
                    const hora = new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date(t.fecha_hora));
                    const isSending = enviandoId === t.id + '1_dia_antes';

                    return (
                      <div key={t.id} className="py-3 flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-900 block">{t.cliente_nombre}</span>
                          <span className="text-[11px] text-teal-700 block font-medium">🦶 {t.servicio}</span>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span className="font-mono font-bold text-slate-700">{hora} hs</span>
                            <span>·</span>
                            <span>{t.cliente_email}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => setPreviewTurno({ turno: t, tipo: '1_dia_antes' })}
                            className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-teal-50"
                            title="Ver vista previa de correo"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => enviarAviso(t.id, '1_dia_antes')}
                            disabled={isSending}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-xs disabled:opacity-50"
                          >
                            <Send className="w-3 h-3" />
                            {isSending ? 'Enviando...' : 'Enviar Gmail'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {pendientes1Dia.length > 0 && (
              <button
                onClick={() => enviarTodos('1_dia_antes')}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
              >
                Enviar Recordatorio por Gmail a Todos ({pendientes1Dia.length})
              </button>
            )}
          </div>

          {/* Bloque 2: Recordatorios en el Momento del Turno (Para Hoy) */}
          <div className="bg-white rounded-3xl p-6 border border-teal-100 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
                    ⚡
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Recordatorio en el Momento del Turno</h4>
                    <p className="text-[11px] text-slate-500">Turnos agendados para el día de hoy</p>
                  </div>
                </div>

                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-800">
                  {pendientesMomento.length} pendientes
                </span>
              </div>

              {pendientesMomento.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/60 mb-2" />
                  No hay avisos puntuales pendientes para hoy. ¡Todo notificado!
                </div>
              ) : (
                <div className="divide-y divide-slate-100 mt-2">
                  {pendientesMomento.map(t => {
                    const hora = new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date(t.fecha_hora));
                    const isSending = enviandoId === t.id + 'momento_turno';

                    return (
                      <div key={t.id} className="py-3 flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-900 block">{t.cliente_nombre}</span>
                          <span className="text-[11px] text-teal-700 block font-medium">🦶 {t.servicio}</span>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span className="font-mono font-bold text-slate-700">{hora} hs (Hoy)</span>
                            <span>·</span>
                            <span>{t.cliente_email}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => setPreviewTurno({ turno: t, tipo: 'momento_turno' })}
                            className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-teal-50"
                            title="Ver vista previa de correo"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => enviarAviso(t.id, 'momento_turno')}
                            disabled={isSending}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 shadow-xs disabled:opacity-50"
                          >
                            <Send className="w-3 h-3" />
                            {isSending ? 'Enviando...' : 'Aviso Momento'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {pendientesMomento.length > 0 && (
              <button
                onClick={() => enviarTodos('momento_turno')}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 transition-colors"
              >
                Enviar Aviso Inmediato por Gmail a Todos ({pendientesMomento.length})
              </button>
            )}
          </div>

        </div>
      )}

      {/* Modal de Vista Previa de Correo HTML */}
      {previewTurno && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-teal-100 p-6 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Vista Previa del Correo en Gmail</h4>
                <p className="text-xs text-slate-500">Destinatario: {previewTurno.turno.cliente_email}</p>
              </div>
              <button
                onClick={() => setPreviewTurno(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-4 flex-1 overflow-y-auto border border-slate-200 rounded-2xl p-2 bg-slate-50">
              <iframe
                title="Preview"
                srcDoc={generateReminderEmailHtml(previewTurno.turno, previewTurno.tipo).html}
                className="w-full h-[450px] rounded-xl bg-white border-0"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
