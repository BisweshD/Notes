'use client';

import { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

interface RecordingTimerProps {
  startedAt: string;
}

export function RecordingTimer({ startedAt }: RecordingTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const startTime = new Date(startedAt).getTime();

    function tick() {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }

    tick();
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startedAt]);

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  const formatted = hours > 0
    ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    : `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-2 text-2xl font-mono tabular-nums">
      <Clock className="h-5 w-5 text-muted-foreground" />
      <span>{formatted}</span>
    </div>
  );
}
