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
} from 'lucide-react';
import type { TaskStatus } from '@/types/task';

interface TaskStatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

/**
 * Status configuration with colors and icons
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
  running: {
    label: 'Running',
    icon: Loader2,
    className: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    iconClassName: 'animate-spin',
  },
  suspended: {
    label: 'Suspended',
    icon: Hand,
    className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  },
  awaiting_review: {
    label: 'Awaiting Review',
    icon: Eye,
    className: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  },
  archived: {
    label: 'Archived',
    icon: Archive,
    className: 'bg-green-500/10 text-green-500 border-green-500/20',
  },
  failed: {
    label: 'Failed',
    icon: AlertCircle,
    className: 'bg-red-500/10 text-red-500 border-red-500/20',
  },
};

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5 font-medium border',
        config.className,
        className
      )}
    >
      <Icon className={cn('h-3 w-3', config.iconClassName)} />
      {config.label}
    </Badge>
  );
}

export { statusConfig };
