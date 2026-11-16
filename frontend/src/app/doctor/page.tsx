import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, CheckCircle2, DollarSign, ArrowRight, FileText } from 'lucide-react';

export default function DoctorDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Today's Queue</span>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-black text-slate-900">6 Patients</div>
            <div className="text-[11px] text-emerald-600 font-semibold">2 Consulted • 4 Waiting</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Active Turn</span>
              <Clock className="h-4 w-4 text-secondary" />
            </div>
            <div className="text-2xl font-black text-secondary">Rohan Verma</div>
            <div className="text-[11px] text-slate-500">Turn #1 (05:00 PM Slot)</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Diagnostic Files</span>
              <FileText className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">3 Reports</div>
            <div className="text-[11px] text-slate-500">Lipid, ECG, Discharge</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Pass Revenue Pool</span>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">₹3,000</div>
            <div className="text-[11px] text-slate-500">6 Active 7-Day Passes</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Workspace Split */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Patient Card */}
        <Card className="lg:col-span-2 border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Current Patient In Turn</CardTitle>
              <Badge variant="success">Active Consultation</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">Rohan Verma</h3>
                <div className="text-xs text-slate-500">Age: 38 • Male • Blood Group: B+</div>
                <div className="text-xs text-secondary font-medium mt-1">History: Stent Placement (LAD, 2024)</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-primary">Turn #1</span>
                <div className="text-[11px] text-slate-400">Pass #9842</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Link href="/doctor/chart" className="flex-1">
                <Button className="w-full text-xs gap-1.5">
                  <FileText className="h-4 w-4" /> Open Medical Chart & S3 Reports
                </Button>
              </Link>
              <Link href="/patient/chat" className="flex-1">
                <Button variant="outline" className="w-full text-xs gap-1.5">
                  Enter Real-time Chat
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Slot Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today's Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <span className="font-bold text-emerald-900">05:00 PM - Rohan Verma</span>
              <span className="text-[10px] font-bold text-emerald-700">IN TURN</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="text-slate-800">05:15 PM - Ananya Roy</span>
              <span className="text-[10px] font-semibold text-amber-600">WAITING</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="text-slate-800">05:30 PM - Open Slot</span>
              <span className="text-[10px] font-semibold text-slate-400">AVAILABLE</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
