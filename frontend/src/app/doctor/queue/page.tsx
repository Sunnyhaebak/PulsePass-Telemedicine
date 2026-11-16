'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface QueueItem {
  turnNo: number;
  time: string;
  patientName: string;
  age: number;
  reason: string;
  status: 'CURRENT' | 'WAITING' | 'DONE';
}

export default function DoctorQueuePage() {
  const [queue, setQueue] = useState<QueueItem[]>([
    {
      turnNo: 1,
      time: '05:00 PM',
      patientName: 'Rohan Verma',
      age: 38,
      reason: 'Medication titration & Lipid report review',
      status: 'CURRENT',
    },
    {
      turnNo: 2,
      time: '05:15 PM',
      patientName: 'Ananya Roy',
      age: 29,
      reason: 'Routine ECG follow-up & palpitations review',
      status: 'WAITING',
    },
    {
      turnNo: 3,
      time: '05:30 PM',
      patientName: 'Vikram Singh',
      age: 52,
      reason: 'Post-angioplasty 3-month follow-up query',
      status: 'WAITING',
    },
    {
      turnNo: 4,
      time: '05:45 PM',
      patientName: 'Meenakshi Iyer',
      age: 44,
      reason: 'Hypertension prescription refill confirmation',
      status: 'WAITING',
    },
  ]);

  const markResolved = (turnNo: number) => {
    setQueue((prev) =>
      prev.map((item) => (item.turnNo === turnNo ? { ...item, status: 'DONE' } : item)),
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hospital OPD Patient Queue</h2>
          <p className="text-xs text-slate-500">Live queue synced via WebSockets with hospital displays</p>
        </div>
        <Badge variant="outline">Today: 4 Booked Slots</Badge>
      </div>

      <div className="space-y-3">
        {queue.map((item) => (
          <Card
            key={item.turnNo}
            className={`transition-all ${
              item.status === 'CURRENT'
                ? 'border-emerald-300 bg-emerald-50/30 ring-1 ring-emerald-400'
                : 'border-slate-200'
            }`}
          >
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-slate-100 font-extrabold text-slate-800 flex-shrink-0">
                  <span className="text-[10px] uppercase text-slate-400">Turn</span>
                  <span className="text-base text-primary">#{item.turnNo}</span>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{item.patientName}</h3>
                    <span className="text-xs text-slate-400">({item.age} yrs)</span>
                    {item.status === 'CURRENT' && <Badge variant="success">Active Turn</Badge>}
                    {item.status === 'DONE' && <Badge variant="outline">Resolved</Badge>}
                  </div>
                  <div className="text-xs text-slate-600">{item.reason}</div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="h-3 w-3" /> Scheduled: {item.time} (15 Min Slot)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Link href="/doctor/chart">
                  <Button variant="outline" size="sm" className="text-xs bg-white">
                    Review Chart
                  </Button>
                </Link>

                {item.status !== 'DONE' && (
                  <Button
                    size="sm"
                    variant={item.status === 'CURRENT' ? 'default' : 'secondary'}
                    onClick={() => markResolved(item.turnNo)}
                    className="text-xs"
                  >
                    Mark Resolved
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
