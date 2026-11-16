import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Bot, AlertCircle } from 'lucide-react';

export interface TriageSummaryCardProps {
  reason: string;
  medications: string;
  severity: string;
  vitals?: string;
  createdAt?: string;
}

export const TriageSummaryCard: React.FC<TriageSummaryCardProps> = ({
  reason,
  medications,
  severity,
  vitals = 'BP 108/68, HR 74, SpO2 99%',
  createdAt = 'Just now',
}) => {
  return (
    <Card className="border-sky-200 bg-sky-50/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sky-900">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm font-bold">AI Clinical Intake Summary</CardTitle>
          </div>
          <span className="text-[11px] text-slate-500">{createdAt}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-xs text-slate-700">
        <div>
          <strong className="text-slate-900">Follow-up Reason: </strong>
          <span>{reason}</span>
        </div>
        <div>
          <strong className="text-slate-900">Current Medications: </strong>
          <span>{medications}</span>
        </div>
        <div className="flex items-center gap-4 pt-1">
          <div>
            <strong className="text-slate-900">Severity Index: </strong>
            <span className="font-semibold text-emerald-700">{severity}</span>
          </div>
          <div>
            <strong className="text-slate-900">Vitals: </strong>
            <span className="font-mono text-slate-800">{vitals}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
