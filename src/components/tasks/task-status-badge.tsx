'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Hand,
  Eye,
  Archive,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ListOrdered,
} from 'lucide-react';
import type { TaskStatus } from '@/types/task';

interface TaskStatusBadgeProps {
  status: TaskStatus;
  className?: string;
  size?: 'sm' | 'default';
}

/**
 * Status configuration with colors and icons
 * Updated for Dual-Path Completion Mechanism
 */
const statusConfig: Record<TaskStatus, {
  label: string;
  icon: React.ElementType;
  className: string;
  iconClassName?: string;
}> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-muted text-muted-foreground border-muted-foreground/20',
  },
  queued: {
    label: 'Queued',
    icon: ListOrdered,
    className: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  running: {
    label: 'Running',
    icon: Loader2,
    className: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    iconClassName: 'animate-spin',
  },
  suspended: {
    label: 'Suspended',
    icon: Hand,
    className: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  },
  awaiting_review: {
    label: 'Awaiting Review',
    icon: Eye,
    className: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  archived: {
    label: 'Archived',
    icon: Archive,
    className: 'bg-green-600/10 text-green-600 border-green-600/20',
  },
  failed: {
    label: 'Failed',
    icon: AlertCircle,
    className: 'bg-red-500/10 text-red-500 border-red-500/20',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    className: 'bg-gray-400/10 text-gray-400 border-gray-400/20',
  },
};

export function TaskStatusBadge({ status, className, size = 'default' }: TaskStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const isSmall = size === 'sm';

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 font-medium border',
        config.className,
        isSmall && 'text-[10px] px-1.5 py-0',
        className
      )}
    >
      <Icon className={cn(
        isSmall ? 'h-2.5 w-2.5' : 'h-3 w-3',
        config.iconClassName
      )} />
      {isSmall ? config.label.split(' ')[0] : config.label}
    </Badge>
  );
}

export { statusConfig };
