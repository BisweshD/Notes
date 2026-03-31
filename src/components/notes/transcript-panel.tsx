'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TranscriptPanelProps {
  segments: Array<{
    id: string;
    segmentIndex: number;
    speaker: string | null;
    startTimeMs: number;
    endTimeMs: number;
    text: string;
    confidence: number | null;
  }>;
  activeSegmentId?: string | null;
}

export function TranscriptPanel({ segments, activeSegmentId }: TranscriptPanelProps) {
  if (segments.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Transcript
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No transcript available.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Transcript
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {segments.length} segments
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-18rem)]">
          <div className="space-y-0 px-4 pb-4">
            {segments.map((segment) => (
              <div
                key={segment.id}
                id={`segment-${segment.id}`}
                className={cn(
                  'py-2 border-b last:border-b-0 transition-colors',
                  activeSegmentId === segment.id && 'bg-yellow-50',
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      'text-xs font-medium px-1.5 py-0.5 rounded',
                      segment.speaker === 'clinician'
                        ? 'bg-blue-100 text-blue-700'
                        : segment.speaker === 'patient'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600',
                    )}
                  >
                    {segment.speaker === 'clinician'
                      ? 'Doctor'
                      : segment.speaker === 'patient'
                        ? 'Patient'
                        : segment.speaker || 'Unknown'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(segment.startTimeMs)}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{segment.text}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
