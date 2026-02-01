// Project Jarvis - Constants

import {
  Bot,
  ListTodo,
  MessageSquare,
  UserCheck,
  BarChart3,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import type { SidebarSection, AgentStatus, TaskStatus, TaskPriority } from '@/types';

// ============================================
// Navigation
// ============================================

export interface NavItem {
  id: SidebarSection;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'agents', label: 'Agents', icon: Bot },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'conversations', label: 'Conversations', icon: MessageSquare },
  { id: 'hitl', label: 'Review Queue', icon: UserCheck },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

// ============================================
// Status Configurations
// ============================================

export const AGENT_STATUS_CONFIG: Record<AgentStatus, { label: string; color: string; bgColor: string }> = {
  idle: { label: 'Idle', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  running: { label: 'Running', color: 'text-green-500', bgColor: 'bg-green-500/10' },
  paused: { label: 'Paused', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  error: { label: 'Error', color: 'text-red-500', bgColor: 'bg-red-500/10' },
  completed: { label: 'Completed', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
};

export const TASK_STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pending', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  queued: { label: 'Queued', color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
  running: { label: 'Running', color: 'text-green-500', bgColor: 'bg-green-500/10' },
  suspended: { label: 'Suspended', color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  awaiting_review: { label: 'Awaiting Review', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  approved: { label: 'Approved', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
  rejected: { label: 'Rejected', color: 'text-red-500', bgColor: 'bg-red-500/10' },
  completed: { label: 'Completed', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  archived: { label: 'Archived', color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  failed: { label: 'Failed', color: 'text-red-500', bgColor: 'bg-red-500/10' },
  cancelled: { label: 'Cancelled', color: 'text-gray-500', bgColor: 'bg-gray-500/10' },
};

export const TASK_PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Low', color: 'text-gray-500', bgColor: 'bg-gray-500/10' },
  medium: { label: 'Medium', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  high: { label: 'High', color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  critical: { label: 'Critical', color: 'text-red-500', bgColor: 'bg-red-500/10' },
};

// ============================================
// API Configuration
// ============================================

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Agents
  agents: '/api/v1/agents',
  agentById: (id: string) => `/api/v1/agents/${id}`,
  agentStatus: (id: string) => `/api/v1/agents/${id}/status`,
  
  // Tasks
  tasks: '/api/v1/tasks',
  taskById: (id: string) => `/api/v1/tasks/${id}`,
  taskAction: (id: string, action: string) => `/api/v1/tasks/${id}/${action}`,
  
  // Conversations
  conversations: '/api/v1/conversations',
  conversationById: (id: string) => `/api/v1/conversations/${id}`,
  conversationMessages: (id: string) => `/api/v1/conversations/${id}/messages`,
  
  // HITL
  hitlRequests: '/api/v1/hitl',
  hitlById: (id: string) => `/api/v1/hitl/${id}`,
  hitlRespond: (id: string) => `/api/v1/hitl/${id}/respond`,
  
  // Analytics
  stats: '/api/v1/analytics/stats',
  tokenUsage: '/api/v1/analytics/tokens',
  
  // SSE
  events: '/api/v1/events/stream',
} as const;

// ============================================
// Default Values
// ============================================

export const DEFAULT_AGENT_CONFIG = {
  temperature: 0.7,
  maxTokens: 4096,
  systemPrompt: '',
  tools: [],
  memoryEnabled: true,
};

export const DEFAULT_PAGE_SIZE = 20;

// ============================================
// UI Configuration
// ============================================

export const SIDEBAR_WIDTH = 280;
export const SIDEBAR_COLLAPSED_WIDTH = 64;

export const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
] as const;
