'use client';

import React, { useState, useEffect } from 'react';
import { Cliente, ServicioEstetica } from '@/types/turnofa';
import { SERVICIOS_ESTETICA_PIES } from '@/lib/servicios-estetica';
import { Check, X, Search } from 'lucide-react';

interface NuevoTurnoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTurnoCreado: () => void;
  clientePreseleccionado?: Cliente | null;
}

export default function NuevoTurnoModal({
  isOpen,
  onClose,
  onTurnoCreado,
  clientePreseleccionado
}: NuevoTurnoModalProps) {
  // Clientes para autocompletar
  const [clientesExistentes, setClientesExistentes] = useState<Cliente[]>([]);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  
  // Campos del cliente
  const [nombre, setNombre] = useState(clientePreseleccionado?.nombre || '');
  const [telefono, setTelefono] = useState(clientePreseleccionado?.telefono || '');
  const [email, setEmail] = useState(clientePreseleccionado?.email || '');
  const [dni, setDni] = useState(clientePreseleccionado?.dni || '');
  
  // Campos del turno
  const [servicioSeleccionado, setServicioSeleccionado] = useState<ServicioEstetica>(SERVICIOS_ESTETICA_PIES[0]);
  const [fecha, setFecha] = useState(() => isOpen ? new Date().toISOString().split('T')[0] : '');
  const [hora, setHora] = useState('11:00');
  const [notas, setNotas] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Adjust only the fields previously synchronized by prop effects.
  // Preserve every other draft field when reopening or selecting a client.
  const [previousOpen, setPreviousOpen] = useState(isOpen);
  const [previousClient, setPreviousClient] = useState(clientePreseleccionado);
  if (previousOpen !== isOpen) {
    setPreviousOpen(isOpen);
    if (isOpen) setFecha(new Date().toISOString().split('T')[0]);
  }
  if (previousClient !== clientePreseleccionado) {
    setPreviousClient(clientePreseleccionado);
    if (clientePreseleccionado) {
      setNombre(clientePreseleccionado.nombre);
      setTelefono(clientePreseleccionado.telefono);
      setEmail(clientePreseleccionado.email);
      setDni(clientePreseleccionado.dni);
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    fetch('/api/clientes', { signal: controller.signal })
      .then(response => response.json())
      .then(data => {
        if (!controller.signal.aborted && data.ok && Array.isArray(data.clientes)) setClientesExistentes(data.clientes);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [isOpen]);
  if (!isOpen) return null;

  function seleccionarCliente(c: Cliente) {
    setNombre(c.nombre);
    setTelefono(c.telefono);
    setEmail(c.email);
    setDni(c.dni);
    setBusquedaCliente('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const fechaHoraIso = new Date(`${fecha}T${hora}:00`).toISOString();

      const res = await fetch('/api/turnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_nombre: nombre,
          cliente_telefono: telefono,
          cliente_email: email,
          cliente_dni: dni,
          servicio: servicioSeleccionado.nombre,
          duracion_minutos: servicioSeleccionado.duracion_minutos,
          precio: servicioSeleccionado.precio,
          fecha_hora: fechaHoraIso,
          notas
        })
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        onTurnoCreado();
        onClose();
      } else {
        setError(data.error || 'Error al registrar turno');
      }
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  }

  const clientesSugeridos = busquedaCliente.trim()
    ? clientesExistentes.filter(c =>
        c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
        c.dni.includes(busquedaCliente)
      ).slice(0, 4)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-teal-100 overflow-hidden my-8">
        
        {/* Encabezado */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
              🦶
            </div>
            <div>
              <h3 className="text-lg font-bold">Agendar Turno · Estética de Pies</h3>
              <p className="text-xs text-teal-100">Registrá los datos del cliente y coordiná el servicio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido del Formulario */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Sección 1: Datos del Cliente */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Datos del Cliente (DNI, Teléfono, Gmail)
              </label>
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={busquedaCliente}
                  onChange={(e) => setBusquedaCliente(e.target.value)}
                  className="w-full pl-8 pr-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                {clientesSugeridos.length > 0 && (
                  <div className="absolute right-0 top-8 z-10 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-1 space-y-1">
                    {clientesSugeridos.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => seleccionarCliente(c)}
                        className="w-full text-left p-2 text-xs rounded-lg hover:bg-teal-50 flex flex-col"
                      >
                        <span className="font-bold text-slate-800">{c.nombre}</span>
                        <span className="text-[10px] text-slate-500">DNI: {c.dni} · {c.telefono}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nombre y Apellido</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Laura Gómez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">DNI del Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 38459201"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Teléfono / WhatsApp</label>
                <input
                  type="tel"
                  required
                  placeholder="+54 9 11 ..."
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Gmail (Para recordatorios)</label>
                <input
                  type="email"
                  required
                  placeholder="cliente@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Sección 2: Selección de Servicio */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              2. Servicio de Estética Podológica
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SERVICIOS_ESTETICA_PIES.map((serv) => {
                const isSelected = servicioSeleccionado.id === serv.id;
                return (
                  <button
                    key={serv.id}
                    type="button"
                    onClick={() => setServicioSeleccionado(serv)}
                    className={`text-left p-3 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/80 shadow-xs ring-1 ring-teal-600'
                        : 'border-slate-200 hover:border-teal-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{serv.nombre}</span>
                      <span className="text-xs font-extrabold text-teal-700">
                        ${serv.precio.toLocaleString('es-AR')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{serv.descripcion}</p>
                    <span className="inline-block mt-2 text-[10px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                      ⏱️ {serv.duracion_minutos} minutos
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sección 3: Fecha y Horario */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              3. Fecha, Horario y Notas
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Fecha del Turno</label>
                <input
                  type="date"
                  required
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Hora</label>
                <select
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                >
                  {['09:00', '09:45', '10:30', '11:15', '12:00', '14:00', '14:45', '15:30', '16:15', '17:00', '17:45', '18:30', '19:15'].map(h => (
                    <option key={h} value={h}>{h} hs</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Notas Podológicas / Observaciones</label>
                <input
                  type="text"
                  placeholder="Ej: Trae sandalias abiertas, uña sensible, preferencia de hidromasaje..."
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-md shadow-teal-600/20 disabled:opacity-50 transition-all"
            >
              {loading ? 'Agendando...' : (
                <>
                  <Check className="w-4 h-4" />
                  Confirmar Turno en TURNOFA
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
