import { useState, useEffect } from 'react';

export interface PassTimerResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  formattedText: string;
}

export function usePassTimer(expiresAtString?: string | null): PassTimerResult {
  const [timeLeft, setTimeLeft] = useState<PassTimerResult>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: true,
    formattedText: 'Expired',
  });

  useEffect(() => {
    if (!expiresAtString) {
      setTimeLeft({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
        formattedText: 'No Active Pass',
      });
      return;
    }

    const calculate = () => {
      const target = new Date(expiresAtString).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          formattedText: 'Pass Expired',
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
        formattedText: `${days}d ${hours}h ${minutes}m left`,
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [expiresAtString]);

  return timeLeft;
}
