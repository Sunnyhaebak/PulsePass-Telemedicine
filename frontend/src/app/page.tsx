import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Stethoscope, ShieldCheck, Zap, Lock, FileText, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="default" className="gap-1.5 px-3 py-1">
          <Zap className="h-3.5 w-3.5" /> Production React + NestJS Tech Stack
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Hospital Outpatient Telemedicine with Guaranteed Time-Slots
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Streamlining hospital OPD congestion through time-bound 7-day consultation passes, zero-exposure AWS S3 vaults, and Redis distributed slot locks.
        </p>
      </div>

      {/* Role Launch Cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Patient Portal Card */}
        <Card className="border-sky-200 bg-gradient-to-b from-white to-sky-50/50 hover:shadow-lg transition-all">
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-primary text-white flex items-center justify-center mb-3">
              <User className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl">Patient Web Portal</CardTitle>
            <CardDescription>
              Mobile-optimized web views designed for instant access in urban and rural clinics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="text-xs space-y-2 text-slate-600">
              <li className="flex items-center gap-2">✓ 7-Day Consultation Pass purchase (₹500)</li>
              <li className="flex items-center gap-2">✓ Concurrency-safe slot reservation (15-min turns)</li>
              <li className="flex items-center gap-2">✓ Real-time Socket.io doctor consultation chat</li>
              <li className="flex items-center gap-2">✓ Private S3 diagnostic report upload vault</li>
            </ul>
            <div className="flex gap-2 pt-2">
              <Link href="/patient" className="w-full">
                <Button className="w-full gap-2">
                  Launch Patient View <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Doctor Portal Card */}
        <Card className="border-teal-200 bg-gradient-to-b from-white to-teal-50/50 hover:shadow-lg transition-all">
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-secondary text-white flex items-center justify-center mb-3">
              <Stethoscope className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl">Doctor Desktop Desk</CardTitle>
            <CardDescription>
              High-throughput hospital outpatient queue management and clinical review workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="text-xs space-y-2 text-slate-600">
              <li className="flex items-center gap-2">✓ Live real-time patient queue with turn indicators</li>
              <li className="flex items-center gap-2">✓ S3 pre-signed medical report reviewer (PDF/ECG)</li>
              <li className="flex items-center gap-2">✓ Digital E-Prescription generator & print layout</li>
              <li className="flex items-center gap-2">✓ WebSocket room session security guard</li>
            </ul>
            <div className="flex gap-2 pt-2">
              <Link href="/doctor" className="w-full">
                <Button variant="secondary" className="w-full gap-2">
                  Open Doctor Desk <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Architecture Highlights Pill */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-4 border-t border-slate-200">
        <div className="p-4 rounded-xl bg-white border border-slate-200 text-center">
          <div className="font-extrabold text-lg text-primary">SET NX PX</div>
          <div className="text-xs text-slate-500 font-medium">Redis Distributed Lock</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 text-center">
          <div className="font-extrabold text-lg text-secondary">Zero-Exposure</div>
          <div className="text-xs text-slate-500 font-medium">AWS S3 Pre-Signed URLs</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 text-center">
          <div className="font-extrabold text-lg text-emerald-600">&lt; 15 ms</div>
          <div className="text-xs text-slate-500 font-medium">Socket.IO Real-time Latency</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 text-center">
          <div className="font-extrabold text-lg text-indigo-600">ACID Relational</div>
          <div className="text-xs text-slate-500 font-medium">PostgreSQL + Prisma</div>
        </div>
      </div>
    </div>
  );
}
