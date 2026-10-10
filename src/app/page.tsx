import AgendaDashboard from '@/components/agenda/AgendaDashboard';
import { CalendarDays, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-teal-700 p-3 text-white"><CalendarDays aria-hidden="true" className="h-6 w-6" /></span>
            <div><p className="text-lg font-bold tracking-tight">TurnoFácil AI</p><p className="text-xs text-slate-500">Tu espacio de agenda</p></div>
          </div>
          <span className="flex items-center gap-2 text-sm font-medium text-teal-700"><Sparkles aria-hidden="true" className="h-4 w-4" />Con asistencia IA</span>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-7"><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Tu agenda, en un solo lugar.</h1><p className="mt-3 max-w-2xl text-slate-600">Organizá tus turnos, configurá tu disponibilidad y consultá al asistente. Entrá con tu cuenta para acceder a tu agenda privada.</p></div>
        <AgendaDashboard />
      </div>
      <footer className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-500 sm:px-6">TurnoFácil AI · Agenda y reservas con confirmación del cliente.</footer>
    </main>
  );
}
