import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, FileText, CheckCircle2 } from 'lucide-react';

export interface PrescriptionCardProps {
  doctorName: string;
  registrationNumber: string;
  patientName: string;
  medications: string;
  clinicalAdvice: string;
  date: string;
  onPrint?: () => void;
}

export const PrescriptionCard: React.FC<PrescriptionCardProps> = ({
  doctorName,
  registrationNumber,
  patientName,
  medications,
  clinicalAdvice,
  date,
  onPrint,
}) => {
  return (
    <Card className="border-emerald-200 bg-emerald-50/40 shadow-sm max-w-xl">
      <CardHeader className="pb-3 border-b border-emerald-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base text-emerald-950">Official E-Prescription</CardTitle>
              <p className="text-xs text-emerald-700 font-medium">{doctorName} • Reg: {registrationNumber}</p>
            </div>
          </div>
          <span className="text-xs text-slate-500">{date}</span>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-3 text-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Patient</span>
          <p className="font-semibold text-slate-900">{patientName}</p>
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Rx Medications & Dosage</span>
          <pre className="mt-1 whitespace-pre-wrap font-sans text-xs bg-white p-3 rounded-lg border border-emerald-100 text-slate-800 leading-relaxed">
            {medications}
          </pre>
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Clinical Advice & Notes</span>
          <p className="mt-0.5 text-xs text-slate-700 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-slate-100">
            {clinicalAdvice}
          </p>
        </div>

        <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-emerald-100">
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <CheckCircle2 className="h-4 w-4" /> Digitally Signed & Hospital Verified
          </span>
          <span>Valid for Outpatient Window</span>
        </div>
      </CardContent>

      {onPrint && (
        <CardFooter className="pt-0 justify-end">
          <Button variant="outline" size="sm" onClick={onPrint} className="gap-1.5 bg-white">
            <Printer className="h-3.5 w-3.5" /> Print / Save PDF
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
