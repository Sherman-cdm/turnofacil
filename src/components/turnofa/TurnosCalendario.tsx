'use client';

import React, { useState } from 'react';
import { Turno, EstadoTurno } from '@/types/turnofa';
import { User, Mail, CheckCircle, Send, Trash2, MessageCircle } from 'lucide-react';

interface TurnosCalendarioProps {
  turnos: Turno[];
  loading: boolean;
  onActualizarEstado: (id: string, nuevoEstado: EstadoTurno) => void;
  onEliminarTurno: (id: string) => void;
  onEnviarRecordatorio: (turnoId: string, tipo: '1_dia_antes' | 'momento_turno') => void;
  onNuevoTurnoClick: () => void;
}

export default function TurnosCalendario({
  turnos,
  loading,
  onActualizarEstado,
  onEliminarTurno,
  onEnviarRecordatorio,
  onNuevoTurnoClick
}: TurnosCalendarioProps) {
  const [filtroVista, setFiltroVista] = useState<'hoy' | 'manana' | 'todos'>('hoy');
  const [filtroServicio] = useState<string>('todos');

  const [hoyStr] = useState(() => new Date().toISOString().split('T')[0]);
  const [mananaStr] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const turnosFiltrados = turnos.filter(t => {
    const fechaTurno = t.fecha_hora.split('T')[0];
    if (filtroVista === 'hoy' && hoyStr && fechaTurno !== hoyStr) return false;
    if (filtroVista === 'manana' && mananaStr && fechaTurno !== mananaStr) return false;
    if (filtroServicio !== 'todos' && !t.servicio.toLowerCase().includes(filtroServicio.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Barra de filtros y acciones superiores */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-teal-100 shadow-xs">
        
        {/* Selector de periodo */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setFiltroVista('hoy')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filtroVista === 'hoy' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hoy ({turnos.filter(t => t.fecha_hora.startsWith(hoyStr)).length})
          </button>

          <button
            onClick={() => setFiltroVista('manana')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filtroVista === 'manana' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mañana ({turnos.filter(t => t.fecha_hora.startsWith(mananaStr)).length})
          </button>

          <button
            onClick={() => setFiltroVista('todos')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filtroVista === 'todos' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos ({turnos.length})
          </button>
        </div>

        {/* Botón de nuevo turno */}
        <button
          onClick={onNuevoTurnoClick}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-xs transition-all"
        >
          <span>+ Agendar Nuevo Turno</span>
        </button>
      </div>

      {/* Lista de turnos */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-teal-50">
          <div className="inline-block w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-sm text-slate-500 font-medium">Cargando agenda de turnos...</p>
        </div>
      ) : turnosFiltrados.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-teal-200">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 text-xl">
            📅
          </div>
          <h4 className="text-base font-bold text-slate-800">No hay turnos para este período</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Agendá nuevos clientes para estética de pies o cambiá el filtro para ver otros días.
          </p>
          <button
            onClick={onNuevoTurnoClick}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors"
          >
            + Agendar Turno Ahora
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {turnosFiltrados.map((t) => {
            const fecha = new Date(t.fecha_hora);
            const hora = new Intl.DateTimeFormat('es-AR', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
              timeZone: 'America/Argentina/Buenos_Aires'
            }).format(fecha);

            const fechaDia = new Intl.DateTimeFormat('es-AR', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              timeZone: 'America/Argentina/Buenos_Aires'
            }).format(fecha);

            const whatsappClean = t.cliente_telefono.replace(/[^0-9]/g, '');

            return (
              <div
                key={t.id}
                className="bg-white rounded-2xl p-5 border border-teal-100 shadow-xs hover:border-teal-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                {/* Horario y Servicio */}
                <div className="flex items-start gap-4">
                  <div className="text-center bg-teal-50 border border-teal-100 rounded-xl p-3 shrink-0 min-w-[85px]">
                    <span className="block text-xl font-black text-teal-800">{hora}</span>
                    <span className="block text-[11px] font-semibold text-teal-600 uppercase mt-0.5">{fechaDia}</span>
                    <span className="block text-[10px] text-slate-400 mt-1">{t.duracion_minutos} min</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900">{t.servicio}</h4>
                      <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                        ${t.precio.toLocaleString('es-AR')}
                      </span>
                    </div>

                    {/* Datos del Cliente: Nombre, Teléfono, Gmail, DNI */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <User className="w-3.5 h-3.5 text-teal-600" />
                        {t.cliente_nombre}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="font-mono text-slate-700">DNI: {t.cliente_dni}</span>
                      <span className="text-slate-400">·</span>
                      <span className="flex items-center gap-1 text-slate-700">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {t.cliente_email}
                      </span>
                      <span className="text-slate-400">·</span>
                      <a
                        href={`https://wa.me/${whatsappClean}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold"
                        title="Enviar WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        {t.cliente_telefono}
                      </a>
                    </div>

                    {t.notas && (
                      <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg max-w-xl">
                        Nota: {t.notas}
                      </p>
                    )}
                  </div>
                </div>

                {/* Estados y Recordatorios Gmail */}
                <div className="flex flex-wrap items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  
                  {/* Selector de estado */}
                  <select
                    value={t.estado}
                    onChange={(e) => onActualizarEstado(t.id, e.target.value as EstadoTurno)}
                    className="text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="confirmado">🟢 Confirmado</option>
                    <option value="en_atencion">🟡 En Atención</option>
                    <option value="completado">🔵 Completado</option>
                    <option value="cancelado">🔴 Cancelado</option>
                  </select>

                  {/* Estado Recordatorio 1 Día Antes */}
                  <div className="flex items-center gap-1">
                    {t.recordatorio_1dia_enviado ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        Aviso 24h enviado
                      </span>
                    ) : (
                      <button
                        onClick={() => onEnviarRecordatorio(t.id, '1_dia_antes')}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-md transition-colors"
                        title="Enviar recordatorio previo por Gmail"
                      >
                        <Send className="w-3 h-3 text-amber-600" />
                        Enviar Aviso 24h
                      </button>
                    )}
                  </div>

                  {/* Estado Recordatorio en el Momento */}
                  <div className="flex items-center gap-1">
                    {t.recordatorio_momento_enviado ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        Aviso turno enviado
                      </span>
                    ) : (
                      <button
                        onClick={() => onEnviarRecordatorio(t.id, 'momento_turno')}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 px-2.5 py-1 rounded-md transition-colors"
                        title="Enviar aviso puntual del turno por Gmail"
                      >
                        <Send className="w-3 h-3 text-cyan-600" />
                        Aviso Momento
                      </button>
                    )}
                  </div>

                  {/* Botón eliminar */}
                  <button
                    onClick={() => onEliminarTurno(t.id)}
                    title="Cancelar y eliminar turno"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
