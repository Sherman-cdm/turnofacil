import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TurnoFácil AI | Tu agenda con IA',
  description: 'Agenda privada con asistencia IA: gestioná servicios, horarios y reservas desde tu cuenta.',
  metadataBase: new URL('https://turnofacilia.online'),
  openGraph: {
    title: 'TurnoFácil AI - Agenda con IA',
    description: 'Organizá tus turnos, consultá al asistente y compartí tu enlace de reservas.',
    url: 'https://turnofacilia.online',
    siteName: 'TurnoFácil AI',
    locale: 'es_AR',
    type: 'website',
  },
  alternates: { canonical: '/' },
  icons: {
    icon: [
      { url: '/turnofa-icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { url: '/favicon.ico', sizes: '32x32' }
    ],
    shortcut: '/turnofa-icon.svg',
    apple: '/turnofa-icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} scroll-smooth`}>
      <body className="min-h-screen bg-slate-50/60 text-slate-900 antialiased selection:bg-teal-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
