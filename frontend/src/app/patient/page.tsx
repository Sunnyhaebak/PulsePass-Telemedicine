'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PassCountdownBadge } from '@/components/shared/PassCountdownBadge';
import { Calendar, MessageSquare, Upload, Star, Hospital, Award, ArrowRight } from 'lucide-react';

interface MockDoctor {
  id: string;
  name: string;
  title: string;
  department: string;
  hospital: string;
  regNo: string;
  experience: string;
  rating: number;
  passFee: number;
  avatar: string;
}

const DOCTORS_DATA: MockDoctor[] = [
  {
    id: 'doc_101',
    name: 'Dr. Arvind Mehta',
    title: 'Senior Consultant Cardiologist',
    department: 'Cardiology',
    hospital: 'Metro Care Super-Speciality Hospital',
    regNo: 'MCI-28491-DEL',
    experience: '18 Years',
    rating: 4.9,
    passFee: 500,
    avatar: '👨‍⚕️',
  },
  {
    id: 'doc_102',
    name: 'Dr. Shreya Nair',
    title: 'Pediatric Specialist & Neonatologist',
    department: 'Pediatrics',
    hospital: 'Apollo Child & Maternity Centre',
    regNo: 'KMC-77215-BLR',
    experience: '12 Years',
    rating: 4.8,
    passFee: 500,
    avatar: '👩‍⚕️',
  },
  {
    id: 'doc_103',
    name: 'Dr. Rajesh Iyer',
    title: 'Chief Orthopedic Surgeon',
    department: 'Orthopedics',
    hospital: 'Fortis Apex Healthcare',
    regNo: 'MMC-44109-MUM',
    experience: '22 Years',
    rating: 4.9,
    passFee: 500,
    avatar: '👨‍⚕️',
  },
  {
    id: 'doc_104',
    name: 'Dr. Sunita Rao',
    title: 'Consultant Endocrinologist',
    department: 'General Medicine',
    hospital: 'Metro Care Super-Speciality Hospital',
    regNo: 'TMC-89301-HYD',
    experience: '15 Years',
    rating: 4.7,
    passFee: 500,
    avatar: '👩‍⚕️',
  },
];

export default function PatientHomePage() {
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const departments = ['All', 'Cardiology', 'Pediatrics', 'Orthopedics', 'General Medicine'];

  const filteredDoctors = selectedDept === 'All'
    ? DOCTORS_DATA
    : DOCTORS_DATA.filter(d => d.department === selectedDept);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Active 7-Day Pass Card */}
      <Card className="border-sky-300 bg-gradient-to-r from-sky-50 via-white to-emerald-50/50 shadow-sm">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <PassCountdownBadge expiresAt={new Date(Date.now() + 86400000 * 6.8).toISOString()} />
              <Badge variant="outline" className="text-[10px] bg-white">Pass #9842</Badge>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Assigned Specialist: Dr. Arvind Mehta
            </h2>
            <p className="text-xs text-slate-500">
              Metro Care Super-Speciality Hospital • Department of Cardiology
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/patient/book">
              <Button size="sm" className="gap-1.5 shadow-sm">
                <Calendar className="h-4 w-4" /> Claim Slot
              </Button>
            </Link>
            <Link href="/patient/chat">
              <Button variant="outline" size="sm" className="gap-1.5 bg-white">
                <MessageSquare className="h-4 w-4" /> Open Chat
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-3 gap-3">
        <Link href="/patient/book" className="group">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-primary hover:shadow-sm transition-all text-center space-y-1">
            <div className="h-9 w-9 rounded-lg bg-sky-100 text-primary mx-auto flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="text-xs font-bold text-slate-900">Book Turn</div>
            <div className="text-[10px] text-slate-500">15-Min Slots</div>
          </div>
        </Link>

        <Link href="/patient/chat" className="group">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-secondary hover:shadow-sm transition-all text-center space-y-1">
            <div className="h-9 w-9 rounded-lg bg-teal-100 text-secondary mx-auto flex items-center justify-center group-hover:scale-105 transition-transform">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="text-xs font-bold text-slate-900">Live Consult</div>
            <div className="text-[10px] text-slate-500">Real-Time Chat</div>
          </div>
        </Link>

        <Link href="/patient/chat" className="group">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-sm transition-all text-center space-y-1">
            <div className="h-9 w-9 rounded-lg bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center group-hover:scale-105 transition-transform">
              <Upload className="h-5 w-5" />
            </div>
            <div className="text-xs font-bold text-slate-900">S3 Vault</div>
            <div className="text-[10px] text-slate-500">Upload Reports</div>
          </div>
        </Link>
      </div>

      {/* Department Filter Pills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900">Verified Hospital Specialists</h3>
          <span className="text-xs text-slate-500">{filteredDoctors.length} Doctors</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedDept === dept
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {filteredDoctors.map((doc) => (
          <Card key={doc.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-3">
              <div className="flex gap-3">
                <div className="h-14 w-14 rounded-xl bg-slate-100 flex items-center justify-center text-2xl flex-shrink-0 border border-slate-200">
                  {doc.avatar}
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  <h4 className="font-bold text-sm text-slate-900 truncate">{doc.name}</h4>
                  <div className="text-xs font-medium text-secondary">{doc.title}</div>
                  <div className="text-[11px] text-slate-400">Reg: {doc.regNo}</div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-600 pt-0.5">
                    <Hospital className="h-3 w-3" /> {doc.hospital}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1 font-semibold text-slate-800">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  <span>{doc.rating}</span>
                  <span className="text-slate-400 font-normal">({doc.experience})</span>
                </div>
                <div className="font-extrabold text-slate-900">
                  ₹{doc.passFee} <span className="text-[10px] font-normal text-slate-500">/ 7-Day Pass</span>
                </div>
              </div>

              <div className="pt-1 flex gap-2">
                <Link href={`/patient/book?doctorId=${doc.id}`} className="w-full">
                  <Button size="sm" className="w-full text-xs">
                    Book Consultation Slot
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
