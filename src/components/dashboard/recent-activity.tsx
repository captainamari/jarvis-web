'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TaskStatusBadge } from '@/components/tasks/task-status-badge';
import { Bot, Clock } from 'lucide-react';
import type { Task } from '@/types/task';

interface RecentActivityProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  className?: string;
}

/**
 * Format relative time
 */
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/**
 * Recent activity list showing latest tasks
 */
export function RecentActivity({ tasks, onTaskClick, className }: RecentActivityProps) {
  if (tasks.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No recent activity</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px]">
          <div className="space-y-1 p-4 pt-0">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onTaskClick?.(task)}
              >
                {/* Agent Icon */}
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground">
                      #{String(task.id).slice(-6)}
                    </span>
                    <TaskStatusBadge status={task.status} size="sm" />
                  </div>
                  <p className="text-sm truncate">{task.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="capitalize">{task.agent_name}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(task.updated_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
