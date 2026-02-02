'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { TaskStatus } from '@/types/task';

interface StatusChartProps {
  data: Record<TaskStatus, number>;
  className?: string;
}

// Status colors matching TaskStatusBadge - Updated for Dual-Path Completion
const STATUS_COLORS: Record<TaskStatus, string> = {
  pending: '#6b7280',      // gray
  queued: '#f59e0b',       // amber
  running: '#3b82f6',      // blue
  suspended: '#f97316',    // orange
  awaiting_review: '#0ea5e9', // sky
  completed: '#10b981',    // emerald
  archived: '#16a34a',     // green-600
  failed: '#ef4444',       // red
  cancelled: '#9ca3af',    // gray-400
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pending',
  queued: 'Queued',
  running: 'Running',
  suspended: 'Suspended',
  awaiting_review: 'Review',
  completed: 'Completed',
  archived: 'Archived',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

/**
 * Bar chart showing task distribution by status
 * Updated for Dual-Path Completion Mechanism
 */
export function StatusChart({ data, className }: StatusChartProps) {
  const chartData = useMemo(() => {
    // Display order: active statuses first, then terminal statuses
    const order: TaskStatus[] = [
      'running', 'queued', 'pending', 'suspended', 'awaiting_review',
      'completed', 'archived', 'failed', 'cancelled'
    ];
    
    return order
      .map((status) => ({
        status,
        label: STATUS_LABELS[status],
        count: data[status] ?? 0,
        color: STATUS_COLORS[status],
      }))
      .filter(item => 
        item.count > 0 || 
        ['running', 'pending', 'completed', 'archived'].includes(item.status)
      );
  }, [data]);

  const total = useMemo(() => {
    return Object.values(data).reduce((sum, count) => sum + count, 0);
  }, [data]);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Tasks by Status</CardTitle>
          <span className="text-sm text-muted-foreground">
            {total} total
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                axisLine={false}
                tickLine={false}
                width={70}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted) / 0.5)' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                formatter={(value: number) => [`${value} tasks`, '']}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          {chartData.map((item) => (
            <div key={item.status} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-muted-foreground">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
