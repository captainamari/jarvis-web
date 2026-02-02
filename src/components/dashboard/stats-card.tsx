'use client';

import Link from 'next/link';
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
  /** Optional link - if provided, the card becomes clickable */
  href?: string;
}

/**
 * Stats card for displaying key metrics
 * Optionally clickable when href is provided
 */
export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClassName,
  trend,
  className,
  href,
}: StatsCardProps) {
  const cardContent = (
    <Card
      className={cn(
        'relative overflow-hidden',
        href && 'hover:shadow-md cursor-pointer transition-all hover:border-primary/50',
        className
      )}
    >
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

  // Wrap in Link if href is provided
  if (href) {
    return <Link href={href}>{cardContent}</Link>;
  }

  return cardContent;
}
