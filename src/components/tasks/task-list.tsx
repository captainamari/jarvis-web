'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TaskCard } from './task-card';
import { CreateTaskDialog } from './create-task-dialog';
import { getUserTasks } from '@/lib/api';
import { Loader2, RefreshCw, Inbox, Plus, X } from 'lucide-react';
import type { Task, TaskStatus, TaskId } from '@/types/task';

/**
 * Filter options for task status
 * 'active' is a virtual status that includes running, queued, suspended, and awaiting_review
 */
type FilterStatus = 'all' | 'active' | TaskStatus;

interface FilterOption {
  value: FilterStatus;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All Tasks' },
  { value: 'active', label: 'Active (In Progress)' },
  { value: 'pending', label: 'Pending' },
  { value: 'queued', label: 'Queued' },
  { value: 'running', label: 'Running' },
  { value: 'suspended', label: 'Suspended (HITL)' },
  { value: 'awaiting_review', label: 'Awaiting Review' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
];

/**
 * Active statuses - tasks that are "in progress" in some form
 */
const ACTIVE_STATUSES: TaskStatus[] = ['pending', 'queued', 'running', 'suspended', 'awaiting_review'];

interface TaskListProps {
  onTaskSelect?: (task: Task) => void;
  selectedTaskId?: TaskId | null;
}

export function TaskList({ onTaskSelect, selectedTaskId }: TaskListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get initial filter status from URL
  const urlStatus = searchParams.get('status') as FilterStatus | null;
  const [filterStatus, setFilterStatus] = useState<FilterStatus>(urlStatus || 'all');

  // Sync filter status with URL on mount and URL changes
  useEffect(() => {
    const status = searchParams.get('status') as FilterStatus | null;
    if (status && FILTER_OPTIONS.some(opt => opt.value === status)) {
      setFilterStatus(status);
    } else if (!status) {
      setFilterStatus('all');
    }
  }, [searchParams]);

  // Update URL when filter changes
  const handleFilterChange = (newStatus: FilterStatus) => {
    setFilterStatus(newStatus);
    
    const params = new URLSearchParams(searchParams.toString());
    if (newStatus === 'all') {
      params.delete('status');
    } else {
      params.set('status', newStatus);
    }
    
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl);
  };

  // Clear filter (reset to all)
  const clearFilter = () => {
    handleFilterChange('all');
  };

  // Determine if we need to include archived tasks in the API call
  const includeArchived = filterStatus === 'all' || filterStatus === 'archived';

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

  // Filter tasks based on selected status
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    
    if (filterStatus === 'all') {
      return tasks;
    }
    
    if (filterStatus === 'active') {
      // Active = running, queued, suspended, awaiting_review, pending
      return tasks.filter(task => ACTIVE_STATUSES.includes(task.status));
    }
    
    // Filter by specific status
    return tasks.filter(task => task.status === filterStatus);
  }, [tasks, filterStatus]);

  const handleTaskCreated = (taskId: TaskId) => {
    // Optionally select the new task
    const newTask = tasks?.find((t) => t.id === taskId);
    if (newTask) {
      onTaskSelect?.(newTask);
    }
    // Refetch to get the new task
    refetch();
  };

  const isFiltered = filterStatus !== 'all';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold">Tasks</h2>
          <p className="text-xs text-muted-foreground">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
            {isFiltered && tasks && ` (of ${tasks.length})`}
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
        <Label htmlFor="status-filter" className="text-sm text-muted-foreground whitespace-nowrap">
          Filter:
        </Label>
        <Select value={filterStatus} onValueChange={handleFilterChange}>
          <SelectTrigger id="status-filter" className="w-[180px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilter}
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
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

          {/* Empty State - No tasks at all */}
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

          {/* Empty State - No tasks matching filter */}
          {!isLoading && !isError && tasks && tasks.length > 0 && filteredTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Inbox className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm mb-2">No tasks match the current filter</p>
              <Button variant="outline" size="sm" onClick={clearFilter}>
                <X className="h-4 w-4 mr-2" />
                Clear filter
              </Button>
            </div>
          )}

          {/* Task Cards */}
          {!isLoading &&
            !isError &&
            filteredTasks.map((task) => (
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
