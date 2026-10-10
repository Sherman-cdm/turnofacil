'use client';

import React, { useState, useEffect } from 'react';
import { Cliente } from '@/types/turnofa';
import { Users, Search, UserPlus, Phone, Mail, Calendar, MessageCircle } from 'lucide-react';

interface ClientesDirectorioProps {
  onAgendarTurnoCliente: (cliente: Cliente) => void;
}

export default function ClientesDirectorio({ onAgendarTurnoCliente }: ClientesDirectorioProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal para agregar cliente nuevo
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevoDni, setNuevoDni] = useState('');
  const [nuevoNotas, setNuevoNotas] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState('');

  async function cargarClientes(term = '') {
    setLoading(true);
    try {
      const url = term ? `/api/clientes?search=${encodeURIComponent(term)}` : '/api/clientes';
      const res = await fetch(url);
      const data = await res.json();
      if (data.ok && Array.isArray(data.clientes)) {
        setClientes(data.clientes);
      }
    } catch {
      // Ignorar
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    const url = busqueda ? `/api/clientes?search=${encodeURIComponent(busqueda)}` : '/api/clientes';
    fetch(url, { signal: controller.signal })
      .then(response => response.json())
      .then(data => {
        if (!controller.signal.aborted && data.ok && Array.isArray(data.clientes)) setClientes(data.clientes);
      })
      .catch(() => {})
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [busqueda]);

  async function handleCrearCliente(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setErrorModal('');

    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nuevoNombre,
          telefono: nuevoTelefono,
          email: nuevoEmail,
          dni: nuevoDni,
          notas: nuevoNotas
        })
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setMostrarModalNuevo(false);
        setNuevoNombre('');
        setNuevoTelefono('');
        setNuevoEmail('');
        setNuevoDni('');
        setNuevoNotas('');
        cargarClientes();
      } else {
        setErrorModal(data.error || 'Error al guardar cliente');
      }
    } catch {
      setErrorModal('Error de conexión');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Barra de cabecera con búsqueda y nuevo cliente */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-teal-100 shadow-xs">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            Directorio de Clientes de Estética de Pies
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro de clientes con DNI, Gmail, teléfono e historial para recordatorios.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por DNI, nombre..."
              value={busqueda}
              onChange={(e) => { setLoading(true); setBusqueda(e.target.value); }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white"
            />
          </div>

          <button
            onClick={() => setMostrarModalNuevo(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-xs whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* Lista de clientes */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-teal-50">
          <div className="inline-block w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-sm text-slate-500 font-medium">Buscando clientes...</p>
        </div>
      ) : clientes.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-teal-200">
          <Users className="w-12 h-12 mx-auto text-teal-600/50 mb-3" />
          <h4 className="text-base font-bold text-slate-800">No se encontraron clientes</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {busqueda ? 'No hay coincidencias con tu búsqueda.' : 'Aún no registraste clientes en la plataforma.'}
          </p>
          <button
            onClick={() => setMostrarModalNuevo(true)}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100"
          >
            + Registrar Primer Cliente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clientes.map((c) => {
            const whatsappClean = c.telefono.replace(/[^0-9]/g, '');

            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl p-5 border border-teal-100 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{c.nombre}</h4>
                      <span className="inline-block bg-teal-50 text-teal-700 text-[11px] font-mono font-bold px-2 py-0.5 rounded-md mt-1 border border-teal-200">
                        DNI: {c.dni}
                      </span>
                    </div>
                    <button
                      onClick={() => onAgendarTurnoCliente(c)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors"
                      title="Agendar turno inmediato para este cliente"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Agendar Turno
                    </button>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium text-slate-800">{c.email}</span>
                      <span className="text-[10px] text-teal-600 font-semibold">(Gmail para avisos)</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.telefono}</span>
                      <a
                        href={`https://wa.me/${whatsappClean}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-bold ml-1"
                      >
                        <MessageCircle className="w-3 h-3" />
                        WhatsApp
                      </a>
                    </div>

                    {c.notas && (
                      <p className="mt-2 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg italic">
                        {c.notas}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Registrado en TURNOFA</span>
                  <span className="font-mono">{new Date(c.created_at).toLocaleDateString('es-AR')}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Agregar Cliente */}
      {mostrarModalNuevo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-teal-100 p-6 sm:p-8">
            <h4 className="text-lg font-bold text-slate-900 mb-1">Registrar Nuevo Cliente</h4>
            <p className="text-xs text-slate-500 mb-4">
              Ingresá los datos completos del cliente de estética de pies.
            </p>

            {errorModal && (
              <div className="p-2.5 mb-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                {errorModal}
              </div>
            )}

            <form onSubmit={handleCrearCliente} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Sofía Martínez"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">DNI</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 36890123"
                  value={nuevoDni}
                  onChange={(e) => setNuevoDni(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Gmail (Para recordatorios de turnos)</label>
                <input
                  type="email"
                  required
                  placeholder="sofia.martinez@gmail.com"
                  value={nuevoEmail}
                  onChange={(e) => setNuevoEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Teléfono / WhatsApp</label>
                <input
                  type="tel"
                  required
                  placeholder="+54 9 11 4059-3312"
                  value={nuevoTelefono}
                  onChange={(e) => setNuevoTelefono(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Notas / Preferencias Podológicas</label>
                <input
                  type="text"
                  placeholder="Ej: Piel sensible, esmaltado pastel, talones secos..."
                  value={nuevoNotas}
                  onChange={(e) => setNuevoNotas(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setMostrarModalNuevo(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-xs"
                >
                  {guardando ? 'Guardando...' : 'Guardar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
