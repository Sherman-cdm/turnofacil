import { Suspense } from 'react';
import { BookingForm } from '@/components/reservas/BookingForm';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Reservá tu turno | TurnoFácil AI', robots: { index: false, follow: false } };
async function BookingPage({ params }: { params: Promise<{ negocioId: string }> }) {
  const { negocioId } = await params;
  return <BookingForm negocioId={negocioId} />;
}
export default function ReservarPage({ params }: { params: Promise<{ negocioId: string }> }) {
  return <Suspense fallback={<main className="p-8" role="status">Cargando agenda…</main>}><BookingPage params={params} /></Suspense>;
}
