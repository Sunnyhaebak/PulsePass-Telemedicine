'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PrescriptionCard } from '@/components/shared/PrescriptionCard';
import { ReportViewerModal } from '@/components/shared/ReportViewerModal';
import { FileText, PlusCircle, CheckCircle2, ShieldCheck, Printer } from 'lucide-react';

interface MockReport {
  id: string;
  title: string;
  category: string;
  summary: string;
  fileSize: string;
  uploadedAt: string;
}

export default function DoctorChartPage() {
  const [reports, setReports] = useState<MockReport[]>([
    {
      id: 'rep_1',
      title: 'Lipid Profile & Serum Cholesterol',
      category: 'Blood Chemistry',
      summary: 'Total Chol: 218 mg/dL (Borderline High), Triglycerides: 165 mg/dL, HDL: 44 mg/dL, LDL: 141 mg/dL. Statin therapy active.',
      fileSize: '1.2 MB',
      uploadedAt: 'Today, 11:20 AM',
    },
    {
      id: 'rep_2',
      title: '12-Lead Electrocardiogram (ECG)',
      category: 'Cardiology Trace',
      summary: 'Sinus rhythm, HR 74 bpm, Normal PR interval, No acute ST-elevation or ischemic changes.',
      fileSize: '3.4 MB',
      uploadedAt: 'Yesterday, 04:45 PM',
    },
  ]);

  const [activeReport, setActiveReport] = useState<MockReport | null>(null);
  const [issuedPrescription, setIssuedPrescription] = useState<any>(null);

  // Prescription Form state
  const [rxMeds, setRxMeds] = useState(
    '1. Tab. Telmisartan 20mg (Half tablet) — 1-0-0 (Morning after breakfast) for 14 days\n2. Tab. Rosuvastatin 10mg — 0-0-1 (Night after dinner) for 30 days',
  );
  const [rxAdvice, setRxAdvice] = useState(
    '• Keep well hydrated (2.5L/day).\n• Monitor home BP twice weekly.\n• Low sodium diet (< 2g/day).\n• Repeat Lipid Profile after 6 weeks.',
  );

  const handleIssueRx = (e: React.FormEvent) => {
    e.preventDefault();
    setIssuedPrescription({
      doctorName: 'Dr. Arvind Mehta',
      registrationNumber: 'MCI-28491-DEL',
      patientName: 'Rohan Verma (38M, B+)',
      medications: rxMeds,
      clinicalAdvice: rxAdvice,
      date: new Date().toLocaleDateString('en-IN'),
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Patient Health Summary Banner */}
      <Card className="border-sky-200 bg-sky-50/40">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Rohan Verma (Patient ID: usr_pat_101)</h2>
              <Badge variant="success">Active 7-Day Pass</Badge>
            </div>
            <div className="text-xs text-slate-600">
              Age: 38 • Male • Blood Group: B+ • Stent Placement (LAD, 2024)
            </div>
          </div>
          <div className="text-xs text-slate-500 text-right">
            <div>Consultation Slot: Today, 05:00 PM</div>
            <div className="font-mono text-primary font-bold">Turn #1 (In Progress)</div>
          </div>
        </CardContent>
      </Card>

      {/* Split: Reports Vault (Left) & Prescription Generator (Right) */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Uploaded Reports (Zero-Exposure S3) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Patient Medical Vault (S3)
              </CardTitle>
              <span className="text-xs text-slate-500">{reports.length} Files</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="p-3 rounded-xl border border-slate-200 bg-white hover:border-primary hover:shadow-xs transition-all flex items-center justify-between"
              >
                <div className="space-y-0.5 overflow-hidden">
                  <div className="font-bold text-xs text-slate-900 truncate">{rep.title}</div>
                  <div className="text-[11px] text-slate-500">{rep.category} • {rep.fileSize}</div>
                  <div className="text-[10px] text-slate-400">{rep.uploadedAt}</div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveReport(rep)}
                  className="text-xs bg-slate-50 flex-shrink-0"
                >
                  Review S3 File
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right: Digital E-Prescription Generator */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <PlusCircle className="h-4 w-4 text-secondary" /> Write Digital E-Prescription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleIssueRx} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rx Medications & Frequency</label>
                <textarea
                  value={rxMeds}
                  onChange={(e) => setRxMeds(e.target.value)}
                  className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-300 focus:outline-primary h-24"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Advice</label>
                <textarea
                  value={rxAdvice}
                  onChange={(e) => setRxAdvice(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-primary h-20"
                />
              </div>

              <Button type="submit" variant="secondary" size="sm" className="w-full text-xs">
                Sign & Transmit E-Prescription
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Render Issued Prescription Using Reusable PrescriptionCard */}
      {issuedPrescription && (
        <div className="pt-2">
          <h3 className="font-bold text-sm text-slate-900 mb-3">Delivered E-Prescription Slip</h3>
          <PrescriptionCard
            doctorName={issuedPrescription.doctorName}
            registrationNumber={issuedPrescription.registrationNumber}
            patientName={issuedPrescription.patientName}
            medications={issuedPrescription.medications}
            clinicalAdvice={issuedPrescription.clinicalAdvice}
            date={issuedPrescription.date}
            onPrint={() => window.print()}
          />
        </div>
      )}

      {/* S3 File Viewer Modal */}
      {activeReport && (
        <ReportViewerModal
          open={!!activeReport}
          onClose={() => setActiveReport(null)}
          title={activeReport.title}
          category={activeReport.category}
          summary={activeReport.summary}
          uploadedAt={activeReport.uploadedAt}
          preSignedUrl={`https://telemed-vault-prod.s3.ap-south-1.amazonaws.com/patients/p1/${activeReport.id}.pdf?X-Amz-Signature=mock_token`}
        />
      )}
    </div>
  );
}
