import React from 'react';
import { TimeSlotDto, SlotStatus } from '@/types';
import { cn } from '@/lib/utils';
import { Lock, Clock } from 'lucide-react';

export interface SlotPickerProps {
  slots: TimeSlotDto[];
  selectedSlotId?: string | null;
  onSelectSlot: (slot: TimeSlotDto) => void;
  isLoading?: boolean;
}

export const SlotPicker: React.FC<SlotPickerProps> = ({
  slots,
  selectedSlotId,
  onSelectSlot,
  isLoading,
}) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {slots.map((slot) => {
          const isSelected = selectedSlotId === slot.id;
          const isAvailable = slot.status === SlotStatus.AVAILABLE;
          const isLocked = slot.status === SlotStatus.LOCKED;
          const isBooked = slot.status === SlotStatus.BOOKED;

          return (
            <button
              key={slot.id}
              disabled={!isAvailable || isLoading}
              onClick={() => onSelectSlot(slot)}
              className={cn(
                'flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all',
                isAvailable && 'bg-white border-sky-200 text-sky-950 hover:border-primary hover:bg-sky-50 cursor-pointer shadow-sm',
                isSelected && 'border-primary ring-2 ring-primary bg-sky-50/80 font-bold',
                isLocked && 'bg-amber-50 border-amber-200 text-amber-800 cursor-not-allowed animate-pulse',
                isBooked && 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed',
              )}
            >
              <div className="flex items-center gap-1 font-bold text-sm">
                <Clock className="h-3.5 w-3.5 opacity-60" />
                <span>{new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider">
                {isAvailable && <span className="text-emerald-600">Available</span>}
                {isLocked && (
                  <span className="flex items-center gap-0.5 text-amber-700">
                    <Lock className="h-3 w-3" /> In Lock
                  </span>
                )}
                {isBooked && <span>Booked</span>}
              </div>

              {slot.turnNumber && (
                <span className="text-[10px] text-slate-400 mt-0.5">Turn #{slot.turnNumber}</span>
              )}
            </button>
          );
        })}
      </div>

      {slots.length === 0 && (
        <div className="text-center py-8 text-sm text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          No consultation slots published for this date window.
        </div>
      )}
    </div>
  );
};
