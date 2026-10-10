import Link from 'next/link';
import type { Metadata } from 'next';
import AgendaDashboard from '@/components/agenda/AgendaDashboard';
export const metadata: Metadata = { title: 'Mi agenda | TurnoFácil AI', description: 'Administrá tu negocio, servicios, horarios y turnos desde tu cuenta privada.', robots: { index: false, follow: false } };
export default function AgendaPage() {
  return <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6"><div className="mx-auto max-w-6xl">
    <Link href="/" className="text-sm font-semibold text-blue-700">← TurnoFácil AI</Link>
    <header className="mb-8 mt-7"><p className="text-sm font-semibold text-blue-700">Espacio del propietario</p><h1 className="mt-2 text-3xl font-bold sm:text-4xl">Tu agenda de estética de pies</h1><p className="mt-3 max-w-2xl text-slate-600">Configurá tus servicios y disponibilidad. Compartí tu enlace cuando esté listo para recibir reservas reales.</p></header>
    <AgendaDashboard />
  </div></main>;
}

