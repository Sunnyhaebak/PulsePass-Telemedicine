import React from 'react';
import { usePassTimer } from '@/hooks/usePassTimer';
import { cn } from '@/lib/utils';
import { Clock, ShieldAlert } from 'lucide-react';

export interface PassCountdownBadgeProps {
  expiresAt?: string | null;
  onRenewClick?: () => void;
  className?: string;
  showIcon?: boolean;
}

export const PassCountdownBadge: React.FC<PassCountdownBadgeProps> = ({
  expiresAt,
  onRenewClick,
  className,
  showIcon = true,
}) => {
  const { isExpired, formattedText } = usePassTimer(expiresAt);

  if (!expiresAt) {
    return (
      <div className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600', className)}>
        <span>No Active Pass</span>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div
        onClick={onRenewClick}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-800 cursor-pointer hover:bg-rose-100 transition-colors',
          className,
        )}
        title="Pass Expired. Click to Renew"
      >
        <span className="h-2 w-2 rounded-full bg-rose-500" />
        {showIcon && <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />}
        <span>Pass Expired (Renew)</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800',
        className,
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      {showIcon && <Clock className="h-3.5 w-3.5 text-emerald-600" />}
      <span>7-Day Pass: <strong>{formattedText}</strong></span>
    </div>
  );
};
