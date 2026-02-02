'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TaskStatusBadge } from '@/components/tasks/task-status-badge';
import {
  Wifi,
  WifiOff,
  Coins,
  RefreshCw,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task } from '@/types/task';
import type { TokenStats } from '@/types/sse';

interface ChatHeaderProps {
  task: Task | null;
  isConnected: boolean;
  isConnecting: boolean;
  tokenStats: TokenStats | null;
  onReconnect?: () => void;
  onClose?: () => void;
}

/**
 * Format token count for display (e.g., 1500 -> "1.5K")
 */
function formatTokens(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return String(tokens);
}

/**
 * Format task ID for display (short format)
 */
function formatTaskId(taskId: string): string {
  const str = String(taskId);
  if (str.length > 6) {
    return `#${str.slice(-6)}`;
  }
  return `#${str}`;
}

/**
 * Chat header component showing task info, status, and token counter
 */
export function ChatHeader({
  task,
  isConnected,
  isConnecting,
  tokenStats,
  onReconnect,
  onClose,
}: ChatHeaderProps) {
  const displayTokens = tokenStats?.cumulativeTokens ?? task?.total_tokens_used ?? 0;
  const displayCost = tokenStats?.cumulativeCost ?? task?.total_cost ?? 0;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b bg-card/50 backdrop-blur-sm">
      {/* Left: Task Info */}
      <div className="flex items-center gap-3">
        {task ? (
          <>
            {/* Task ID */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-muted-foreground">
                {formatTaskId(task.id)}
              </span>
              <TaskStatusBadge status={task.status} size="sm" />
            </div>

            <Separator orientation="vertical" className="h-5" />

            {/* Task Description */}
            <span className="text-sm text-foreground truncate max-w-[300px]">
              {task.description}
            </span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">
            No task selected
          </span>
        )}
      </div>

      {/* Right: Connection Status & Token Counter */}
      <div className="flex items-center gap-3">
        {/* Token Counter */}
        {(displayTokens > 0 || displayCost > 0) && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50">
            <Coins className="h-3.5 w-3.5 text-yellow-500" />
            <span className="text-xs font-mono text-muted-foreground">
              {formatTokens(displayTokens)} tokens
            </span>
            <span className="text-xs text-muted-foreground/50">•</span>
            <span className="text-xs font-mono text-green-500">
              ${displayCost.toFixed(4)}
            </span>
          </div>
        )}

        {/* Connection Status */}
        <Badge
          variant="outline"
          className={cn(
            'gap-1.5',
            isConnected
              ? 'border-green-500/50 text-green-400'
              : isConnecting
              ? 'border-yellow-500/50 text-yellow-400'
              : 'border-muted text-muted-foreground'
          )}
        >
          {isConnected ? (
            <Wifi className="h-3 w-3" />
          ) : isConnecting ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <WifiOff className="h-3 w-3" />
          )}
          {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
        </Badge>

        {/* Reconnect Button */}
        {!isConnected && !isConnecting && task && onReconnect && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onReconnect}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}

        {/* Close Button */}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
