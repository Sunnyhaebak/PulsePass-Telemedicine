'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SlotPicker } from '@/components/shared/SlotPicker';
import { TimeSlotDto, SlotStatus } from '@/types';
import { Calendar, ShieldAlert, CheckCircle2, Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BookSlotPage() {
  const [selectedDate, setSelectedDate] = useState<'Today' | 'Tomorrow'>('Today');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotDto | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [concurrencyNotice, setConcurrencyNotice] = useState<string | null>(null);

  // Initial Mock Slots
  const [slots, setSlots] = useState<TimeSlotDto[]>([
    {
      id: 's1',
      doctorId: 'doc_101',
      startTime: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(),
      endTime: new Date(new Date().setHours(17, 15, 0, 0)).toISOString(),
      status: SlotStatus.BOOKED,
      turnNumber: 1,
    },
    {
      id: 's2',
      doctorId: 'doc_101',
      startTime: new Date(new Date().setHours(17, 15, 0, 0)).toISOString(),
      endTime: new Date(new Date().setHours(17, 30, 0, 0)).toISOString(),
      status: SlotStatus.BOOKED,
      turnNumber: 2,
    },
    {
      id: 's3',
      doctorId: 'doc_101',
      startTime: new Date(new Date().setHours(17, 30, 0, 0)).toISOString(),
      endTime: new Date(new Date().setHours(17, 45, 0, 0)).toISOString(),
      status: SlotStatus.AVAILABLE,
      turnNumber: 3,
    },
    {
      id: 's4',
      doctorId: 'doc_101',
      startTime: new Date(new Date().setHours(17, 45, 0, 0)).toISOString(),
      endTime: new Date(new Date().setHours(18, 0, 0, 0)).toISOString(),
      status: SlotStatus.AVAILABLE,
      turnNumber: 4,
    },
    {
      id: 's5',
      doctorId: 'doc_101',
      startTime: new Date(new Date().setHours(18, 0, 0, 0)).toISOString(),
      endTime: new Date(new Date().setHours(18, 15, 0, 0)).toISOString(),
      status: SlotStatus.AVAILABLE,
      turnNumber: 5,
    },
    {
      id: 's6',
      doctorId: 'doc_101',
      startTime: new Date(new Date().setHours(18, 15, 0, 0)).toISOString(),
      endTime: new Date(new Date().setHours(18, 30, 0, 0)).toISOString(),
      status: SlotStatus.AVAILABLE,
      turnNumber: 6,
    },
  ]);

  const handleBook = () => {
    if (!selectedSlot) return;

    // Simulate booking with Redis distributed lock
    setSlots((prev) =>
      prev.map((s) => (s.id === selectedSlot.id ? { ...s, status: SlotStatus.BOOKED } : s)),
    );
    setBookingSuccess(true);
  };

  const simulateRaceCondition = () => {
    setConcurrencyNotice('Testing Redis Distributed Lock: Simulating 2 concurrent patients hitting slot s3...');
    
    // Temporarily mark slot as LOCKED
    setSlots((prev) =>
      prev.map((s) => (s.id === 's3' ? { ...s, status: SlotStatus.LOCKED } : s)),
    );

    setTimeout(() => {
      setSlots((prev) =>
        prev.map((s) => (s.id === 's3' ? { ...s, status: SlotStatus.BOOKED } : s)),
      );
      setConcurrencyNotice('✓ Collision Blocked! Patient A acquired Redis SETNX lock. Patient B safely received HTTP 409 Conflict.');
    }, 2500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/patient" className="text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Claim 15-Minute Consultation Slot</h1>
      </div>

      {/* Doctor Summary Banner */}
      <Card className="border-slate-200">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-lg bg-sky-100 flex items-center justify-center text-xl">👨‍⚕️</div>
            <div>
              <div className="font-bold text-sm text-slate-900">Dr. Arvind Mehta</div>
              <div className="text-xs text-secondary font-medium">Senior Cardiologist • Metro Care Hospital</div>
            </div>
          </div>
          <Badge variant="success">Active 7-Day Pass</Badge>
        </CardContent>
      </Card>

      {/* Date Switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedDate('Today')}
          className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
            selectedDate === 'Today'
              ? 'border-primary bg-primary text-white shadow-sm'
              : 'border-slate-200 bg-white text-slate-600'
          }`}
        >
          Today (Nov 16)
        </button>
        <button
          onClick={() => setSelectedDate('Tomorrow')}
          className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
            selectedDate === 'Tomorrow'
              ? 'border-primary bg-primary text-white shadow-sm'
              : 'border-slate-200 bg-white text-slate-600'
          }`}
        >
          Tomorrow (Nov 17)
        </button>
      </div>

      {/* Slots Grid using Shared Component */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Available Time Blocks</CardTitle>
            <span className="text-xs text-slate-500">15-minute slot increments</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <SlotPicker
            slots={slots}
            selectedSlotId={selectedSlot?.id}
            onSelectSlot={(slot) => {
              setSelectedSlot(slot);
              setBookingSuccess(false);
            }}
          />

          {selectedSlot && !bookingSuccess && (
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <div className="text-xs">
                Selected: <strong>{new Date(selectedSlot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong> (Turn #{selectedSlot.turnNumber})
              </div>
              <Button size="sm" onClick={handleBook}>
                Confirm & Claim Slot
              </Button>
            </div>
          )}

          {bookingSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>Slot Confirmed!</strong> Your consultation is scheduled. Join the consultation room at your turn.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Concurrency Laboratory Sandbox */}
      <Card className="border-amber-200 bg-amber-50/40">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
              <Lock className="h-4 w-4 text-amber-700" />
              <span>Redis Distributed Locking Lab</span>
            </div>
            <Button variant="outline" size="sm" onClick={simulateRaceCondition} className="text-xs h-7 bg-white">
              ⚡ Test Race Collision (Slot 05:30 PM)
            </Button>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Tests how our NestJS backend acquires <code>lock:slot:s3</code> with <code>SET NX PX 5000</code>, ensuring zero appointment double-bookings.
          </p>
          {concurrencyNotice && (
            <div className="p-2.5 rounded bg-white border border-amber-200 text-xs text-amber-900 font-mono mt-2">
              {concurrencyNotice}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
