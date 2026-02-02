'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { TaskCard } from './task-card';
import { CreateTaskDialog } from './create-task-dialog';
import { getUserTasks } from '@/lib/api';
import { Loader2, RefreshCw, Inbox, Plus } from 'lucide-react';
import type { Task } from '@/types/task';

interface TaskListProps {
  onTaskSelect?: (task: Task) => void;
  selectedTaskId?: number | null;
}

export function TaskList({ onTaskSelect, selectedTaskId }: TaskListProps) {
  const [includeArchived, setIncludeArchived] = useState(true);

  const {
    data: tasks,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['tasks', includeArchived],
    queryFn: () => getUserTasks({ include_archived: includeArchived }),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const handleTaskCreated = (taskId: number) => {
    // Optionally select the new task
    const newTask = tasks?.find((t) => t.id === taskId);
    if (newTask) {
      onTaskSelect?.(newTask);
    }
    // Refetch to get the new task
    refetch();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold">Tasks</h2>
          <p className="text-xs text-muted-foreground">
            {tasks?.length ?? 0} task{tasks?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <CreateTaskDialog onSuccess={handleTaskCreated} />
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 p-4 border-b border-border bg-secondary/20">
        <Checkbox
          id="include-archived"
          checked={includeArchived}
          onCheckedChange={(checked) => setIncludeArchived(checked as boolean)}
        />
        <Label
          htmlFor="include-archived"
          className="text-sm text-muted-foreground cursor-pointer"
        >
          Include Archived
        </Label>
      </div>

      {/* Task List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p className="text-sm">Loading tasks...</p>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p className="text-sm text-red-500 mb-2">
                {error instanceof Error ? error.message : 'Failed to load tasks'}
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && tasks?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Inbox className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm mb-4">No tasks yet</p>
              <CreateTaskDialog
                trigger={
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create your first task
                  </Button>
                }
                onSuccess={handleTaskCreated}
              />
            </div>
          )}

          {/* Task Cards */}
          {!isLoading &&
            !isError &&
            tasks?.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={onTaskSelect}
                isSelected={selectedTaskId === task.id}
              />
            ))}
        </div>
      </ScrollArea>
    </div>
  );
}
