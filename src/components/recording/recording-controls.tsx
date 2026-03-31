'use client';

import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecordingControlsProps {
  isRecording: boolean;
  isProcessing: boolean;
  onStart: () => void;
  onStop: () => void;
  className?: string;
}

export function RecordingControls({
  isRecording,
  isProcessing,
  onStart,
  onStop,
  className,
}: RecordingControlsProps) {
  return (
    <div className={cn('flex justify-center gap-4', className)}>
      {!isRecording ? (
        <Button
          size="lg"
          onClick={onStart}
          disabled={isProcessing}
          className="h-16 w-16 rounded-full p-0 bg-red-600 hover:bg-red-700 text-white shadow-lg"
        >
          {isProcessing ? (
            <Loader2 className="h-7 w-7 animate-spin" />
          ) : (
            <Mic className="h-7 w-7" />
          )}
        </Button>
      ) : (
        <Button
          size="lg"
          variant="destructive"
          onClick={onStop}
          disabled={isProcessing}
          className="h-16 w-16 rounded-full p-0 shadow-lg"
        >
          {isProcessing ? (
            <Loader2 className="h-7 w-7 animate-spin" />
          ) : (
            <Square className="h-6 w-6 fill-current" />
          )}
        </Button>
      )}
    </div>
  );
}
