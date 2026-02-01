// ============================================
// Project Jarvis - Configuration
// ============================================

/**
 * Mock User ID for API requests
 * TODO: Replace with actual authentication in production
 */
export const CURRENT_USER_ID = 7160455832;

/**
 * API Configuration
 * 使用 Next.js rewrites 代理，避免跨域问题
 * /api/* 会被转发到 http://127.0.0.1:8000/*
 */
export const API_CONFIG = {
  // 使用相对路径，通过 Next.js rewrites 代理到后端
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-User-ID': String(CURRENT_USER_ID),
  },
} as const;

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Agents
  agents: '/api/v1/agents',
  agentById: (id: string | number) => `/api/v1/agents/${id}`,
  agentStatus: (id: string | number) => `/api/v1/agents/${id}/status`,
  
  // Tasks
  tasks: '/api/v1/tasks',
  taskById: (id: string | number) => `/api/v1/tasks/${id}`,
  taskAction: (id: string | number, action: string) => `/api/v1/tasks/${id}/${action}`,
  
  // Conversations
  conversations: '/api/v1/conversations',
  conversationById: (id: string | number) => `/api/v1/conversations/${id}`,
  conversationMessages: (id: string | number) => `/api/v1/conversations/${id}/messages`,
  
  // Chat / Workbench
  chat: '/api/v1/chat',
  chatStream: '/api/v1/chat/stream',
  
  // HITL (Human-in-the-Loop)
  hitlRequests: '/api/v1/hitl',
  hitlById: (id: string | number) => `/api/v1/hitl/${id}`,
  hitlRespond: (id: string | number) => `/api/v1/hitl/${id}/respond`,
  
  // Analytics
  stats: '/api/v1/analytics/stats',
  tokenUsage: '/api/v1/analytics/tokens',
  
  // SSE (Server-Sent Events)
  events: '/api/v1/events/stream',
} as const;

/**
 * Application Settings
 */
export const APP_CONFIG = {
  name: 'Project Jarvis',
  description: 'Multi-Agent System Dashboard',
  sidebarWidth: 250,
  sidebarCollapsedWidth: 64,
  defaultTheme: 'dark' as const,
  defaultUserId: CURRENT_USER_ID,
} as const;
