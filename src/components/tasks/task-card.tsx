'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { TaskStatusBadge } from './task-status-badge';
import { Zap, Calendar, Bot } from 'lucide-react';
import type { Task } from '@/types/task';

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  isSelected?: boolean;
  className?: string;
}

/**
 * Format task ID to short display format
 * Full ID: 20260129143052123 -> Display: #143052
 */
function formatTaskIdShort(taskId: number): string {
  const str = String(taskId);
  if (str.length >= 14) {
    // Extract HHMMSS portion (chars 8-14)
    return `#${str.slice(8, 14)}`;
  }
  return `#${str.slice(-6)}`;
}

/**
 * Format task ID to readable date
 * 20260129143052123 -> 2026-01-29 14:30:52
 */
function formatTaskDate(taskId: number): string {
  const str = String(taskId);
  if (str.length !== 17) {
    return new Date().toLocaleString();
  }
  
  const year = str.slice(0, 4);
  const month = str.slice(4, 6);
  const day = str.slice(6, 8);
  const hour = str.slice(8, 10);
  const minute = str.slice(10, 12);
  
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

/**
 * Format ISO date string to relative time or short date
 */
function formatCreatedAt(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format token count to readable format
 * 1500 -> 1.5K, 150 -> 150
 */
function formatTokens(tokens: number): string {
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return String(tokens);
}

/**
 * Truncate description to max length
 */
function truncateDescription(text: string, maxLength: number = 80): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function TaskCard({ task, onClick, isSelected, className }: TaskCardProps) {
  const shortId = useMemo(() => formatTaskIdShort(task.id), [task.id]);
  const timeAgo = useMemo(() => formatCreatedAt(task.created_at), [task.created_at]);
  const truncatedDesc = useMemo(
    () => truncateDescription(task.description),
    [task.description]
  );

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:bg-accent/50',
        'border-transparent hover:border-border',
        isSelected && 'bg-accent border-primary/50 ring-1 ring-primary/20',
        className
      )}
      onClick={() => onClick?.(task)}
    >
      <CardContent className="p-4">
        {/* Header: ID + Status */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-muted-foreground">
            {shortId}
          </span>
          <TaskStatusBadge status={task.status} />
        </div>

        {/* Description */}
        <p className="text-sm font-medium mb-3 line-clamp-2">
          {truncatedDesc}
        </p>

        {/* Footer: Meta info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {/* Left side: Agent + Time */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Bot className="h-3 w-3" />
              <span className="capitalize">{task.agent_name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{timeAgo}</span>
            </div>
          </div>

          {/* Right side: Token usage */}
          {task.total_tokens_used > 0 && (
            <div className="flex items-center gap-1 text-yellow-500">
              <Zap className="h-3 w-3" />
              <span>{formatTokens(task.total_tokens_used)} tokens</span>
            </div>
          )}
        </div>

        {/* Error message if failed */}
        {task.status === 'failed' && task.error_message && (
          <p className="mt-2 text-xs text-red-500 truncate">
            Error: {task.error_message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export { formatTaskIdShort, formatTaskDate, formatCreatedAt, formatTokens };
