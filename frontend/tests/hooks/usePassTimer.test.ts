import { renderHook, act } from '@testing-library/react';
import { usePassTimer } from '../../src/hooks/usePassTimer';

describe('usePassTimer (Custom React Hook Unit Test)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return expired when no expiration date is provided', () => {
    const { result } = renderHook(() => usePassTimer(null));
    expect(result.current.isExpired).toBe(true);
    expect(result.current.formattedText).toBe('No Active Pass');
  });

  it('should compute remaining days and hours accurately for active passes', () => {
    const target = new Date(Date.now() + 86400000 * 2 + 3600000 * 5).toISOString(); // 2 days, 5 hours
    const { result } = renderHook(() => usePassTimer(target));

    expect(result.current.isExpired).toBe(false);
    expect(result.current.days).toBe(2);
    expect(result.current.hours).toBe(5);
  });

  it('should transition to isExpired=true after the expiration timestamp has elapsed', () => {
    const target = new Date(Date.now() + 2000).toISOString(); // 2 seconds in future
    const { result } = renderHook(() => usePassTimer(target));

    expect(result.current.isExpired).toBe(false);

    // Fast forward 3 seconds
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current.isExpired).toBe(true);
    expect(result.current.formattedText).toBe('Pass Expired');
  });
});
