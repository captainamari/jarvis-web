'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StatsCard, StatusChart, RecentActivity } from '@/components/dashboard';
import { CreateTaskDialog } from '@/components/tasks';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Zap,
  CheckCircle2,
  DollarSign,
  Activity,
  Plus,
  RefreshCcw,
} from 'lucide-react';
import { getUserStats, getUserTasks } from '@/lib/api';
import type { Task, UserStatsResponse, TaskStatus } from '@/types/task';

/**
 * Format token count for display
 */
function formatTokens(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(2)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return String(tokens);
}

/**
 * Format cost as currency
 */
function formatCost(cost: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(cost);
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<UserStatsResponse | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateTask, setShowCreateTask] = useState(false);

  // Fetch stats and recent tasks
  const fetchData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setIsRefreshing(true);
      setError(null);

      const [statsData, tasksData] = await Promise.all([
        getUserStats(),
        getUserTasks({ include_archived: true }),
      ]);

      setStats(statsData);
      // Sort by updated_at and take most recent 10
      const sortedTasks = tasksData
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 10);
      setRecentTasks(sortedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate active tasks (running + pending + suspended + awaiting_review)
  const activeTasks = stats
    ? (stats.tasks_by_status.running || 0) +
      (stats.tasks_by_status.pending || 0) +
      (stats.tasks_by_status.suspended || 0) +
      (stats.tasks_by_status.awaiting_review || 0)
    : 0;

  const handleTaskClick = (task: Task) => {
    router.push(`/workbench?task=${task.id}`);
  };

  const handleTaskCreated = (task: Task) => {
    setShowCreateTask(false);
    router.push(`/workbench?task=${task.id}`);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[320px]" />
          <Skeleton className="h-[320px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your Jarvis agent performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
          >
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setShowCreateTask(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Tasks"
          value={activeTasks}
          subtitle="in progress"
          icon={Activity}
          iconClassName="bg-blue-500/20 text-blue-500"
        />
        <StatsCard
          title="Completed"
          value={stats?.archived_count || 0}
          subtitle="archived"
          icon={CheckCircle2}
          iconClassName="bg-green-500/20 text-green-500"
        />
        <StatsCard
          title="Tokens Used"
          value={formatTokens(stats?.total_tokens_used || 0)}
          subtitle="total"
          icon={Zap}
          iconClassName="bg-yellow-500/20 text-yellow-500"
        />
        <StatsCard
          title="Total Cost"
          value={formatCost(stats?.total_cost || 0)}
          icon={DollarSign}
          iconClassName="bg-emerald-500/20 text-emerald-500"
        />
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Chart */}
        {stats && (
          <StatusChart
            data={stats.tasks_by_status as Record<TaskStatus, number>}
          />
        )}

        {/* Recent Activity */}
        <RecentActivity
          tasks={recentTasks}
          onTaskClick={handleTaskClick}
        />
      </div>

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
}
