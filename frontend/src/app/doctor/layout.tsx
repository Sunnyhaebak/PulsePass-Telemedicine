import React from 'react';
import Link from 'next/link';
import { Users, FileText, CheckCircle, Activity, Stethoscope } from 'lucide-react';

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Doctor Navigation Bar */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-secondary text-white flex items-center justify-center font-bold">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Outpatient Consultation Desk</h1>
            <p className="text-xs text-slate-500">Dr. Arvind Mehta (Cardiology) • Reg: MCI-28491-DEL</p>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <Link
            href="/doctor/queue"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-slate-300"
          >
            <Users className="h-4 w-4 text-secondary" /> Live Queue
          </Link>
          <Link
            href="/doctor/chart"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-slate-300"
          >
            <FileText className="h-4 w-4 text-primary" /> Reports & Rx
          </Link>
        </nav>
      </div>

      {children}
    </div>
  );
}
