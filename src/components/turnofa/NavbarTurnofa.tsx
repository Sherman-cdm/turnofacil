'use client';

import React from 'react';

import { Calendar, UserPlus, Users, Bell, Sparkles, LogOut, Lock } from 'lucide-react';

interface NavbarTurnofaProps {
  activeTab: 'agenda' | 'nuevo-turno' | 'clientes' | 'recordatorios' | 'asistente';
  setActiveTab: (tab: 'agenda' | 'nuevo-turno' | 'clientes' | 'recordatorios' | 'asistente') => void;
  isAuthenticated: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
  pendientesCount: number;
}

export default function NavbarTurnofa({
  activeTab,
  setActiveTab,
  isAuthenticated,
  onOpenLogin,
  onLogout,
  pendientesCount
}: NavbarTurnofaProps) {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/95 border-b border-teal-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Marca y Logotipo de TURNOFA */}
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 shrink-0 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-700 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
            <span className="text-xl font-bold">🦶</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-2xl tracking-tight text-slate-900">
                TURNO<span className="text-teal-600">FA</span>
              </span>
              <span className="bg-teal-50 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-200">
                ESTÉTICA DE PIES
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium tracking-wide">
              Recepción & Agenda con IA
            </span>
          </div>
        </div>

        {/* Pestañas de Navegación del Panel */}
        {isAuthenticated ? (
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => setActiveTab('agenda')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'agenda'
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                  : 'text-slate-600 hover:text-teal-700 hover:bg-teal-50/70'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Agenda & Calendario
            </button>

            <button
              onClick={() => setActiveTab('nuevo-turno')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'nuevo-turno'
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                  : 'text-slate-600 hover:text-teal-700 hover:bg-teal-50/70'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Nuevo Turno
            </button>

            <button
              onClick={() => setActiveTab('clientes')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'clientes'
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                  : 'text-slate-600 hover:text-teal-700 hover:bg-teal-50/70'
              }`}
            >
              <Users className="w-4 h-4" />
              Clientes (DNI & Gmail)
            </button>

            <button
              onClick={() => setActiveTab('recordatorios')}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'recordatorios'
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                  : 'text-slate-600 hover:text-teal-700 hover:bg-teal-50/70'
              }`}
            >
              <Bell className="w-4 h-4" />
              Recordatorios Gmail
              {pendientesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {pendientesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('asistente')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'asistente'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : 'text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Asistente IA
            </button>
          </nav>
        ) : null}

        {/* Acceso / Sesión de Recepción */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-800">Recepción Activa</span>
                <span className="text-[11px] text-teal-600 font-mono">recepcion@tu-negocio.example</span>
              </div>
              <button
                onClick={onLogout}
                title="Cerrar Sesión de Recepción"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-md shadow-teal-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Lock className="w-4 h-4" />
              Ingresar a Recepción
            </button>
          )}
        </div>
      </div>

      {/* Navegación móvil si está autenticado */}
      {isAuthenticated && (
        <div className="md:hidden border-t border-teal-100 bg-teal-50/50 px-2 py-2 flex items-center justify-around text-xs">
          <button
            onClick={() => setActiveTab('agenda')}
            className={`p-2 rounded-lg flex flex-col items-center ${activeTab === 'agenda' ? 'text-teal-700 font-bold' : 'text-slate-600'}`}
          >
            <Calendar className="w-4 h-4 mb-0.5" />
            Agenda
          </button>
          <button
            onClick={() => setActiveTab('nuevo-turno')}
            className={`p-2 rounded-lg flex flex-col items-center ${activeTab === 'nuevo-turno' ? 'text-teal-700 font-bold' : 'text-slate-600'}`}
          >
            <UserPlus className="w-4 h-4 mb-0.5" />
            + Turno
          </button>
          <button
            onClick={() => setActiveTab('clientes')}
            className={`p-2 rounded-lg flex flex-col items-center ${activeTab === 'clientes' ? 'text-teal-700 font-bold' : 'text-slate-600'}`}
          >
            <Users className="w-4 h-4 mb-0.5" />
            Clientes
          </button>
          <button
            onClick={() => setActiveTab('recordatorios')}
            className={`p-2 rounded-lg flex flex-col items-center relative ${activeTab === 'recordatorios' ? 'text-teal-700 font-bold' : 'text-slate-600'}`}
          >
            <Bell className="w-4 h-4 mb-0.5" />
            Avisos
            {pendientesCount > 0 && (
              <span className="absolute top-1 right-2 bg-amber-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {pendientesCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('asistente')}
            className={`p-2 rounded-lg flex flex-col items-center ${activeTab === 'asistente' ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}
          >
            <Sparkles className="w-4 h-4 mb-0.5 text-emerald-600" />
            IA
          </button>
        </div>
      )}
    </header>
  );
}
