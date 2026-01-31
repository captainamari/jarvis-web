'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bot,
  ListTodo,
  MessageSquare,
  UserCheck,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for demonstration
const stats = [
  {
    title: 'Active Agents',
    value: '4',
    subtext: '2 running, 2 idle',
    icon: Bot,
    trend: '+1 from yesterday',
    trendUp: true,
  },
  {
    title: 'Tasks Today',
    value: '23',
    subtext: '18 completed, 5 pending',
    icon: ListTodo,
    trend: '+12% from yesterday',
    trendUp: true,
  },
  {
    title: 'Token Usage',
    value: '45.2K',
    subtext: 'Est. cost: $0.90',
    icon: Zap,
    trend: '-5% from yesterday',
    trendUp: false,
  },
  {
    title: 'Pending Reviews',
    value: '3',
    subtext: 'HITL requests',
    icon: UserCheck,
    trend: 'Needs attention',
    trendUp: null,
  },
];

const recentTasks = [
  {
    id: '1',
    title: 'Analyze Q4 sales data',
    agent: 'Data Analyst',
    status: 'completed',
    time: '5 min ago',
  },
  {
    id: '2',
    title: 'Generate weekly report',
    agent: 'Report Generator',
    status: 'running',
    time: 'In progress',
  },
  {
    id: '3',
    title: 'Review code changes',
    agent: 'Code Reviewer',
    status: 'awaiting_review',
    time: '10 min ago',
  },
  {
    id: '4',
    title: 'Process customer feedback',
    agent: 'Sentiment Analyzer',
    status: 'pending',
    time: 'Queued',
  },
  {
    id: '5',
    title: 'Update documentation',
    agent: 'Doc Writer',
    status: 'completed',
    time: '1 hour ago',
  },
];

const activeAgents = [
  {
    id: '1',
    name: 'Orchestrator Hub',
    role: 'orchestrator',
    status: 'running',
    model: 'gpt-4',
    tasks: 12,
    tokens: 15420,
  },
  {
    id: '2',
    name: 'Data Analyst',
    role: 'worker',
    status: 'running',
    model: 'gpt-4',
    tasks: 8,
    tokens: 12300,
  },
  {
    id: '3',
    name: 'Code Reviewer',
    role: 'reviewer',
    status: 'idle',
    model: 'gpt-4-turbo',
    tasks: 5,
    tokens: 8900,
  },
  {
    id: '4',
    name: 'Research Assistant',
    role: 'specialist',
    status: 'idle',
    model: 'gpt-4',
    tasks: 3,
    tokens: 6500,
  },
];

const pendingReviews = [
  {
    id: '1',
    title: 'Approve data export',
    type: 'approval',
    task: 'Export customer data to CSV',
    agent: 'Data Analyst',
    urgency: 'high',
  },
  {
    id: '2',
    title: 'Review code suggestion',
    type: 'review',
    task: 'Refactor authentication module',
    agent: 'Code Reviewer',
    urgency: 'medium',
  },
  {
    id: '3',
    title: 'Confirm email template',
    type: 'decision',
    task: 'Generate marketing email',
    agent: 'Content Writer',
    urgency: 'low',
  },
];

const statusConfig = {
  completed: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
  running: { icon: PlayCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  awaiting_review: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  pending: { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted' },
  idle: { icon: Activity, color: 'text-muted-foreground', bg: 'bg-muted' },
  error: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
};

const urgencyConfig = {
  high: { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  medium: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  low: { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
};

export function DashboardContent() {
  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-card hover:bg-accent/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.subtext}</p>
                <div className="mt-2 flex items-center text-xs">
                  {stat.trendUp !== null && (
                    <TrendingUp
                      className={cn(
                        'h-3 w-3 mr-1',
                        stat.trendUp ? 'text-green-500' : 'text-red-500 rotate-180'
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      stat.trendUp === true && 'text-green-500',
                      stat.trendUp === false && 'text-red-500',
                      stat.trendUp === null && 'text-yellow-500'
                    )}
                  >
                    {stat.trend}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Tasks</CardTitle>
              <CardDescription>Latest task activity across all agents</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {recentTasks.map((task) => {
                  const config = statusConfig[task.status as keyof typeof statusConfig];
                  const StatusIcon = config.icon;
                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                    >
                      <div className={cn('p-2 rounded-md', config.bg)}>
                        <StatusIcon className={cn('h-4 w-4', config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.agent}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="secondary"
                          className={cn('text-[10px]', config.bg, config.color)}
                        >
                          {task.status.replace('_', ' ')}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{task.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Pending Reviews (HITL) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                Pending Reviews
                <Badge variant="destructive" className="text-[10px]">
                  {pendingReviews.length}
                </Badge>
              </CardTitle>
              <CardDescription>Human-in-the-loop requests</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {pendingReviews.map((review) => {
                  const urgency = urgencyConfig[review.urgency as keyof typeof urgencyConfig];
                  return (
                    <div
                      key={review.id}
                      className={cn(
                        'p-3 rounded-lg border bg-secondary/20 hover:bg-secondary/40 transition-colors cursor-pointer',
                        urgency.border
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{review.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {review.task}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn('text-[10px] shrink-0', urgency.color, urgency.bg)}
                        >
                          {review.urgency}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground">{review.agent}</span>
                        <Button size="sm" variant="default" className="h-7 text-xs">
                          Review
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Active Agents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Active Agents</CardTitle>
            <CardDescription>Monitor your agent fleet in real-time</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="gap-1">
            Manage Agents <ArrowRight className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeAgents.map((agent) => {
              const config = statusConfig[agent.status as keyof typeof statusConfig];
              const StatusIcon = config.icon;
              return (
                <div
                  key={agent.id}
                  className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={cn('p-1.5 rounded-md', config.bg)}>
                        <Bot className={cn('h-4 w-4', config.color)} />
                      </div>
                      <span className="text-sm font-medium truncate">{agent.name}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {agent.role}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Model</span>
                      <span>{agent.model}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Tasks</span>
                      <span>{agent.tasks} completed</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Tokens</span>
                      <span>{(agent.tokens / 1000).toFixed(1)}K</span>
                    </div>
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Status</span>
                        <span className={config.color}>{agent.status}</span>
                      </div>
                      <Progress
                        value={agent.status === 'running' ? 65 : 0}
                        className="h-1"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
