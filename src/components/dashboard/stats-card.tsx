'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconClassName?: string;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

/**
 * Stats card for displaying key metrics
 */
export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClassName,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
              {subtitle && (
                <span className="text-sm text-muted-foreground">{subtitle}</span>
              )}
            </div>
            {trend && (
              <p
                className={cn(
                  'text-xs font-medium',
                  trend.value >= 0 ? 'text-green-500' : 'text-red-500'
                )}
              >
                {trend.value >= 0 ? '+' : ''}
                {trend.value}% {trend.label}
              </p>
            )}
          </div>
          <div
            className={cn(
              'p-3 rounded-xl bg-primary/10',
              iconClassName
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
