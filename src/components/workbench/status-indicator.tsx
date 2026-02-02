'use client';

import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  Clock,
  Hand,
  Loader2,
  XCircle,
  Eye,
  ListOrdered,
  Ban,
} from 'lucide-react';

interface StatusIndicatorProps {
  status: string;
  message?: string;
  hitlQuestion?: string;
  timestamp?: string;
}

/**
 * Status change indicator component
 * Displays task status transitions inline in the chat
 * Updated for Dual-Path Completion Mechanism
 */
export function StatusIndicator({ 
  status, 
  message, 
  hitlQuestion,
  timestamp 
}: StatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          label: 'Pending',
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/10 border-gray-500/20',
        };
      case 'queued':
        return {
          icon: ListOrdered,
          label: 'Queued',
          color: 'text-amber-400',
          bgColor: 'bg-amber-500/10 border-amber-500/20',
        };
      case 'running':
        return {
          icon: Loader2,
          label: 'Running',
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10 border-blue-500/20',
          animate: true,
        };
      case 'suspended':
        return {
          icon: Hand,
          label: 'Awaiting Approval',
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/10 border-orange-500/20',
        };
      case 'awaiting_review':
        return {
          icon: Eye,
          label: 'Awaiting Review',
          color: 'text-sky-400',
          bgColor: 'bg-sky-500/10 border-sky-500/20',
        };
      case 'completed':
        return {
          icon: CheckCircle2,
          label: 'Completed',
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-500/10 border-emerald-500/20',
        };
      case 'archived':
        return {
          icon: Archive,
          label: 'Archived',
          color: 'text-green-500',
          bgColor: 'bg-green-500/10 border-green-500/20',
        };
      case 'failed':
        return {
          icon: XCircle,
          label: 'Failed',
          color: 'text-red-400',
          bgColor: 'bg-red-500/10 border-red-500/20',
        };
      case 'cancelled':
        return {
          icon: Ban,
          label: 'Cancelled',
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/10 border-gray-400/20',
        };
      default:
        return {
          icon: AlertTriangle,
          label: status,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted/50 border-border',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="flex justify-center py-2">
      <div
        className={cn(
          'flex flex-col items-center gap-2 px-4 py-2 rounded-lg border',
          config.bgColor
        )}
      >
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <Icon
            className={cn(
              'h-4 w-4',
              config.color,
              config.animate && 'animate-spin'
            )}
          />
          <span className={cn('text-sm font-medium', config.color)}>
            {config.label}
          </span>
        </div>

        {/* Message */}
        {message && (
          <span className="text-xs text-muted-foreground text-center">
            {message}
          </span>
        )}

        {/* HITL Question */}
        {hitlQuestion && (
          <div className="mt-1 px-3 py-2 bg-yellow-500/20 rounded-md border border-yellow-500/30">
            <span className="text-sm text-yellow-200">
              ⚠️ {hitlQuestion}
            </span>
          </div>
        )}

        {/* Timestamp */}
        {timestamp && (
          <span className="text-[10px] text-muted-foreground/50">
            {new Date(timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}
