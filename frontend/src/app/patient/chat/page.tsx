'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PassCountdownBadge } from '@/components/shared/PassCountdownBadge';
import { PrescriptionCard } from '@/components/shared/PrescriptionCard';
import { ReportViewerModal } from '@/components/shared/ReportViewerModal';
import { TriageSummaryCard } from '@/components/shared/TriageSummaryCard';
import { Send, Paperclip, Bot, FileText, ArrowLeft, ShieldCheck, Video } from 'lucide-react';
import Link from 'next/link';
import { ChatMessageDto, MessageType } from '@/types';

export default function PatientChatPage() {
  const [messages, setMessages] = useState<ChatMessageDto[]>([
    {
      id: 'msg_01',
      passId: 'pass_9842',
      senderId: 'system',
      senderRole: 'SYSTEM',
      senderName: 'System Gatekeeper',
      messageType: MessageType.SYSTEM,
      content: '🟢 7-Day Consultation Pass active. SSL/TLS End-to-End Encrypted Consultation Channel with Dr. Arvind Mehta.',
      createdAt: '05:00 PM',
    },
    {
      id: 'msg_02',
      passId: 'pass_9842',
      senderId: 'usr_pat_101',
      senderRole: 'PATIENT' as any,
      senderName: 'Rohan Verma',
      messageType: MessageType.TEXT,
      content: 'Good evening Dr. Mehta. I had a slight dizzy spell on Thursday morning after taking my usual Telmisartan.',
      createdAt: '05:02 PM',
    },
    {
      id: 'msg_03',
      passId: 'pass_9842',
      senderId: 'doc_101',
      senderRole: 'DOCTOR' as any,
      senderName: 'Dr. Arvind Mehta',
      messageType: MessageType.TEXT,
      content: 'Good evening Rohan. Did you record your blood pressure reading when you felt dizzy?',
      createdAt: '05:03 PM',
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [showViewer, setShowViewer] = useState(false);
  const [showTriage, setShowTriage] = useState(false);

  const handleSend = () => {
    if (!inputVal.trim()) return;

    const newMsg: ChatMessageDto = {
      id: `msg_${Date.now()}`,
      passId: 'pass_9842',
      senderId: 'usr_pat_101',
      senderRole: 'PATIENT' as any,
      senderName: 'Rohan Verma',
      messageType: MessageType.TEXT,
      content: inputVal,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputVal('');

    // Simulate smart doctor reply after 1.5s
    setTimeout(() => {
      const docReply: ChatMessageDto = {
        id: `msg_${Date.now()}`,
        passId: 'pass_9842',
        senderId: 'doc_101',
        senderRole: 'DOCTOR' as any,
        senderName: 'Dr. Arvind Mehta',
        messageType: MessageType.TEXT,
        content: 'I see. Take half tablet (20mg) of Telmisartan for the next 3 days and stay well hydrated. I am attaching an updated prescription.',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, docReply]);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Link href="/patient" className="text-slate-500 hover:text-slate-800">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm sm:text-base text-slate-900">Dr. Arvind Mehta</h2>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-[11px] text-slate-500">Senior Cardiologist • Metro Care Hospital</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PassCountdownBadge expiresAt={new Date(Date.now() + 86400000 * 6.8).toISOString()} />
        </div>
      </div>

      {/* Triage summary bar */}
      <div className="flex items-center justify-between p-2 rounded-lg bg-sky-50 border border-sky-100 text-xs text-sky-900">
        <div className="flex items-center gap-1.5 font-medium">
          <Bot className="h-4 w-4 text-primary" />
          <span>AI Pre-Consultation Intake: Blood Pressure Follow-up (Score: 2/10)</span>
        </div>
        <button
          onClick={() => setShowTriage(!showTriage)}
          className="text-primary font-bold hover:underline"
        >
          {showTriage ? 'Hide' : 'View'}
        </button>
      </div>

      {showTriage && (
        <TriageSummaryCard
          reason="Medication adjustment after mild dizziness on morning walks"
          medications="Telmisartan 40mg, Rosuvastatin 10mg"
          severity="Mild (Score 2/10)"
        />
      )}

      {/* Chat Messages Area */}
      <Card className="h-[520px] flex flex-col justify-between overflow-hidden shadow-sm">
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/60">
          {messages.map((msg) => {
            if (msg.messageType === MessageType.SYSTEM) {
              return (
                <div key={msg.id} className="text-center my-2">
                  <span className="text-[11px] px-3 py-1 rounded-full bg-slate-200 text-slate-600 font-medium">
                    {msg.content}
                  </span>
                </div>
              );
            }

            const isPatient = msg.senderRole === 'PATIENT';

            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[80%] ${
                  isPatient ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-semibold">
                  {msg.senderName}
                </span>

                <div
                  className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isPatient
                      ? 'bg-primary text-white rounded-br-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5 px-1">{msg.createdAt}</span>
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowViewer(true)}
            title="Upload report to S3 vault"
            className="flex-shrink-0"
          >
            <Paperclip className="h-4 w-4 text-slate-600" />
          </Button>

          <Input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message to Dr. Mehta..."
            className="text-xs sm:text-sm"
          />

          <Button size="icon" onClick={handleSend} className="flex-shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* S3 Report Viewer Modal */}
      <ReportViewerModal
        open={showViewer}
        onClose={() => setShowViewer(false)}
        title="Lipid Profile & Serum Cholesterol (Nov 2026)"
        category="Lab Diagnostic Panel"
        summary="Total Chol: 218 mg/dL, Triglycerides: 165 mg/dL, HDL: 44 mg/dL, LDL: 141 mg/dL. Statin therapy active."
        preSignedUrl="https://telemed-vault-prod.s3.ap-south-1.amazonaws.com/patients/p1/lipid_profile.pdf"
      />
    </div>
  );
}
