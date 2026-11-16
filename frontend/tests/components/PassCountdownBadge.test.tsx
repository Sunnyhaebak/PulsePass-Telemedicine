import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PassCountdownBadge } from '../../src/components/shared/PassCountdownBadge';

describe('PassCountdownBadge (Shared Component Unit Test)', () => {
  it('should render "No Active Pass" when expiresAt is null or undefined', () => {
    render(<PassCountdownBadge expiresAt={null} />);
    expect(screen.getByText('No Active Pass')).toBeInTheDocument();
  });

  it('should render active countdown timer when expiresAt is in the future', () => {
    // 3 days in the future
    const futureDate = new Date(Date.now() + 86400000 * 3).toISOString();
    render(<PassCountdownBadge expiresAt={futureDate} />);

    expect(screen.getByText(/7-Day Pass:/i)).toBeInTheDocument();
    expect(screen.getByText(/3d/i)).toBeInTheDocument();
  });

  it('should render expired state and trigger onRenewClick when pass is expired', () => {
    const onRenewMock = jest.fn();
    // 1 hour in the past
    const pastDate = new Date(Date.now() - 3600000).toISOString();
    render(<PassCountdownBadge expiresAt={pastDate} onRenewClick={onRenewMock} />);

    const expiredBadge = screen.getByText('Pass Expired (Renew)');
    expect(expiredBadge).toBeInTheDocument();

    fireEvent.click(expiredBadge);
    expect(onRenewMock).toHaveBeenCalledTimes(1);
  });
});
