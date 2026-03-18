import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Zap } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: Date;
  compact?: boolean;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const calculateTimeLeft = (target: Date): TimeLeft => {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    total: diff,
  };
};

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, compact = false, className = '' }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.total <= 0) {
    return (
      <div className={`flex items-center gap-1.5 text-success font-medium ${className}`}>
        <Zap className="w-3.5 h-3.5 animate-pulse" />
        <span className="text-xs">Match Started!</span>
      </div>
    );
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  const isUrgent = timeLeft.total < 1000 * 60 * 60; // < 1 hour

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 ${isUrgent ? 'text-warning' : 'text-muted-foreground'} ${className}`}>
        <Clock className={`w-3 h-3 ${isUrgent ? 'animate-pulse' : ''}`} />
        <span className="text-xs font-mono font-medium">
          {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
          {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Clock className={`w-4 h-4 ${isUrgent ? 'text-warning animate-pulse' : 'text-primary'}`} />
      <div className="flex items-center gap-1">
        {timeLeft.days > 0 && (
          <div className="flex flex-col items-center px-2 py-1 rounded-lg bg-secondary/50 border border-border/50 min-w-[40px]">
            <span className="text-sm font-display font-bold">{timeLeft.days}</span>
            <span className="text-[9px] text-muted-foreground uppercase">Days</span>
          </div>
        )}
        <div className="flex flex-col items-center px-2 py-1 rounded-lg bg-secondary/50 border border-border/50 min-w-[40px]">
          <span className="text-sm font-display font-bold">{pad(timeLeft.hours)}</span>
          <span className="text-[9px] text-muted-foreground uppercase">Hrs</span>
        </div>
        <span className="text-muted-foreground font-bold animate-pulse">:</span>
        <div className="flex flex-col items-center px-2 py-1 rounded-lg bg-secondary/50 border border-border/50 min-w-[40px]">
          <span className="text-sm font-display font-bold">{pad(timeLeft.minutes)}</span>
          <span className="text-[9px] text-muted-foreground uppercase">Min</span>
        </div>
        <span className="text-muted-foreground font-bold animate-pulse">:</span>
        <div className={`flex flex-col items-center px-2 py-1 rounded-lg border min-w-[40px] ${
          isUrgent ? 'bg-warning/10 border-warning/30' : 'bg-secondary/50 border-border/50'
        }`}>
          <span className={`text-sm font-display font-bold ${isUrgent ? 'text-warning' : ''}`}>{pad(timeLeft.seconds)}</span>
          <span className="text-[9px] text-muted-foreground uppercase">Sec</span>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
