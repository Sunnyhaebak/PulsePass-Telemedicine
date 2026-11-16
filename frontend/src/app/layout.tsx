import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'PulsePass — Telemedicine & Patient Consultation Platform',
  description: 'Time-bound consultation passes, concurrency-safe slot bookings, and secure real-time doctor consultations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans min-h-screen bg-slate-50 text-slate-900 antialiased`}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
