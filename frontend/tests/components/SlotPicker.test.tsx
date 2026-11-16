import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SlotPicker } from '../../src/components/shared/SlotPicker';
import { SlotStatus, TimeSlotDto } from '@/types';

describe('SlotPicker (Shared Component Unit Test)', () => {
  const mockSlots: TimeSlotDto[] = [
    {
      id: 's1',
      doctorId: 'doc-1',
      startTime: '2026-11-16T17:00:00.000Z',
      endTime: '2026-11-16T17:15:00.000Z',
      status: SlotStatus.AVAILABLE,
      turnNumber: 1,
    },
    {
      id: 's2',
      doctorId: 'doc-1',
      startTime: '2026-11-16T17:15:00.000Z',
      endTime: '2026-11-16T17:30:00.000Z',
      status: SlotStatus.LOCKED,
      turnNumber: 2,
    },
    {
      id: 's3',
      doctorId: 'doc-1',
      startTime: '2026-11-16T17:30:00.000Z',
      endTime: '2026-11-16T17:45:00.000Z',
      status: SlotStatus.BOOKED,
      turnNumber: 3,
    },
  ];

  it('should render all slots with appropriate statuses', () => {
    render(<SlotPicker slots={mockSlots} onSelectSlot={jest.fn()} />);

    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('In Lock')).toBeInTheDocument();
    expect(screen.getByText('Booked')).toBeInTheDocument();
  });

  it('should allow clicking an AVAILABLE slot and trigger onSelectSlot callback', () => {
    const onSelectMock = jest.fn();
    render(<SlotPicker slots={mockSlots} onSelectSlot={onSelectMock} />);

    const availableBtn = screen.getByText('Available').closest('button');
    expect(availableBtn).not.toBeDisabled();

    fireEvent.click(availableBtn!);
    expect(onSelectMock).toHaveBeenCalledWith(mockSlots[0]);
  });

  it('should disable clicking on LOCKED and BOOKED slots', () => {
    const onSelectMock = jest.fn();
    render(<SlotPicker slots={mockSlots} onSelectSlot={onSelectMock} />);

    const lockedBtn = screen.getByText('In Lock').closest('button');
    const bookedBtn = screen.getByText('Booked').closest('button');

    expect(lockedBtn).toBeDisabled();
    expect(bookedBtn).toBeDisabled();
  });
});
