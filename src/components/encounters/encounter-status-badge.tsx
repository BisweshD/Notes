import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; className: string }> = {
  scheduled: { label: 'Scheduled', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  in_progress: {
    label: 'In Progress',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  recording: {
    label: 'Recording',
    className: 'bg-red-50 text-red-700 border-red-200 animate-pulse',
  },
  processing: {
    label: 'Processing',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  review: { label: 'Review', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  signed: { label: 'Signed', className: 'bg-green-50 text-green-700 border-green-200' },
  amended: { label: 'Amended', className: 'bg-teal-50 text-teal-700 border-teal-200' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-50 text-gray-500 border-gray-200' },
};

interface EncounterStatusBadgeProps {
  status: string;
  className?: string;
}

export function EncounterStatusBadge({ status, className }: EncounterStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.scheduled;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
