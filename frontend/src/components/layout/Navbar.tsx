'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PassCountdownBadge } from '../shared/PassCountdownBadge';
import { Stethoscope, User, Calendar, MessageSquare, Hospital } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const isPatient = pathname?.startsWith('/patient');
  const isDoctor = pathname?.startsWith('/doctor');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-md shadow-primary/20">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-extrabold text-base tracking-tight text-slate-900">
              PulsePass <span className="text-[10px] uppercase font-bold bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded-full">v1.0</span>
            </div>
            <div className="text-[10px] text-slate-500 hidden sm:block">Hospital Outpatient Telemedicine</div>
          </div>
        </Link>

        {/* Role Switcher Pill */}
        <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200 text-xs font-semibold">
          <Link
            href="/patient"
            className={cn(
              'px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5',
              isPatient ? 'bg-white text-primary shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900',
            )}
          >
            <User className="h-3.5 w-3.5" /> Patient
          </Link>
          <Link
            href="/doctor"
            className={cn(
              'px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5',
              isDoctor ? 'bg-white text-secondary shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900',
            )}
          >
            <Stethoscope className="h-3.5 w-3.5" /> Doctor Desk
          </Link>
        </nav>

        {/* Right Header: 7-Day Pass Badge */}
        <div className="flex items-center gap-3">
          <PassCountdownBadge
            expiresAt={new Date(Date.now() + 86400000 * 6.8).toISOString()}
            className="hidden sm:inline-flex"
          />

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
              {isDoctor ? 'AM' : 'RV'}
            </div>
            <div className="hidden md:block text-left text-xs leading-tight">
              <div className="font-bold text-slate-900">{isDoctor ? 'Dr. Arvind Mehta' : 'Rohan Verma'}</div>
              <div className="text-slate-500">{isDoctor ? 'Senior Cardiologist' : 'Patient'}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
