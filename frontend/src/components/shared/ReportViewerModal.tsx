import React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, ShieldCheck, Download, ExternalLink } from 'lucide-react';

export interface ReportViewerModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  category: string;
  summary?: string;
  preSignedUrl?: string;
  uploadedAt?: string;
}

export const ReportViewerModal: React.FC<ReportViewerModalProps> = ({
  open,
  onClose,
  title,
  category,
  summary,
  preSignedUrl,
  uploadedAt,
}) => {
  return (
    <Dialog open={open} onClose={onClose} title={title} description={`Category: ${category} • Uploaded: ${uploadedAt || 'Recently'}`}>
      <div className="space-y-4">
        {/* Security & Zero-Exposure Token Banner */}
        <div className="rounded-lg bg-sky-50 border border-sky-200 p-3 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-sky-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs space-y-1">
            <div className="font-bold text-sky-950">AES-256 Pre-Signed Medical URL</div>
            <p className="text-sky-800">
              Accessed directly via AWS S3 secure token. Short-lived 10-minute read authorization strictly restricted to assigned doctor and patient.
            </p>
          </div>
        </div>

        {/* Clinical Summary */}
        {summary && (
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Diagnostic Summary & Findings</span>
            <p className="text-sm text-slate-800 leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          {preSignedUrl && (
            <Button
              variant="default"
              size="sm"
              onClick={() => window.open(preSignedUrl, '_blank')}
              className="gap-1.5"
            >
              <ExternalLink className="h-4 w-4" /> Open Full Document
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
};
