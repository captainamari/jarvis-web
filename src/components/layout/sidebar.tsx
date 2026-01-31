'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Bot,
  ListTodo,
  MessageSquare,
  UserCheck,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus,
} from 'lucide-react';
import type { SidebarSection } from '@/types';

interface NavItem {
  id: SidebarSection;
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { id: 'agents', label: 'Agents', icon: Bot, href: '/agents' },
  { id: 'tasks', label: 'Tasks', icon: ListTodo, href: '/tasks' },
  { id: 'conversations', label: 'Conversations', icon: MessageSquare, href: '/conversations' },
  { id: 'hitl', label: 'Review Queue', icon: UserCheck, href: '/review', badge: 3 },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics' },
];

interface SidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed = false, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();

  const toggleCollapsed = () => {
    onCollapsedChange?.(!collapsed);
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-card border-r border-border transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-[280px]'
      )}
    >
      {/* Logo & Brand */}
      <div className="flex items-center h-14 px-4 border-b border-border">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight">Project Jarvis</span>
              <span className="text-[10px] text-muted-foreground">Multi-Agent System</span>
            </div>
          )}
        </Link>
      </div>

      {/* Quick Action */}
      <div className="p-3">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" className="w-full">
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">New Task</TooltipContent>
          </Tooltip>
        ) : (
          <Button className="w-full justify-start gap-2">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        )}
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            if (collapsed) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <Link href={item.href}>
                      <Button
                        variant={isActive ? 'secondary' : 'ghost'}
                        size="icon"
                        className={cn(
                          'w-full relative',
                          isActive && 'bg-secondary'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {item.badge && item.badge > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                            {item.badge}
                          </span>
                        )}
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {item.label}
                    {item.badge && item.badge > 0 && ` (${item.badge})`}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Link key={item.id} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3',
                    isActive && 'bg-secondary'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <Badge variant="default" className="ml-auto h-5 px-1.5 text-[10px]">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator />

      {/* Footer */}
      <div className="p-3">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/settings">
                <Button variant="ghost" size="icon" className="w-full">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        ) : (
          <Link href="/settings">
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Settings className="h-5 w-5" />
              Settings
            </Button>
          </Link>
        )}
      </div>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapsed}
          className={cn(
            'w-full',
            collapsed ? 'justify-center' : 'justify-between'
          )}
        >
          {!collapsed && <span className="text-xs text-muted-foreground">Collapse</span>}
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}
