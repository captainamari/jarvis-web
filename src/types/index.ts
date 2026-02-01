// Core Types for Project Jarvis - Multi-Agent System

// ============================================
// Agent Types
// ============================================

export type AgentStatus = 'idle' | 'running' | 'paused' | 'error' | 'completed';

export type AgentRole = 'orchestrator' | 'worker' | 'reviewer' | 'specialist';

export interface Agent {
  id: string;
  name: string;
  description: string;
  role: AgentRole;
  status: AgentStatus;
  model: string;
  capabilities: string[];
  createdAt: string;
  updatedAt: string;
  config: AgentConfig;
  metrics: AgentMetrics;
}

export interface AgentConfig {
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  tools: string[];
  memoryEnabled: boolean;
}

export interface AgentMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  avgResponseTime: number;
  totalTokensUsed: number;
}

// ============================================
// Task Types
// ============================================

export type TaskStatus = 
  | 'pending' 
  | 'queued' 
  | 'running' 
  | 'suspended'       // HITL 1.0 - 挂起等待审批
  | 'awaiting_review' // M5 - 待验收
  | 'approved' 
  | 'rejected' 
  | 'completed' 
  | 'archived'        // M5 - 已归档
  | 'failed' 
  | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedAgent: string | null;
  parentTaskId: string | null;
  subtasks: string[];
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  tokenUsage: TokenUsage;
  hitlRequired: boolean;
  reviewNotes: string | null;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

// ============================================
// Conversation & Message Types
// ============================================

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export type MessageType = 'text' | 'code' | 'image' | 'file' | 'tool_call' | 'tool_result';

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  type: MessageType;
  content: string;
  metadata: MessageMetadata;
  createdAt: string;
  agentId?: string;
  taskId?: string;
}

export interface MessageMetadata {
  tokenUsage?: TokenUsage;
  toolCalls?: ToolCall[];
  attachments?: Attachment[];
  codeLanguage?: string;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
  status: 'pending' | 'running' | 'completed' | 'error';
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface Conversation {
  id: string;
  title: string;
  agentId: string;
  taskId?: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
}

// ============================================
// HITL (Human-in-the-Loop) Types
// ============================================

export type HITLRequestType = 'approval' | 'input' | 'review' | 'decision';

export type HITLStatus = 'pending' | 'approved' | 'rejected' | 'responded';

export interface HITLRequest {
  id: string;
  taskId: string;
  agentId: string;
  type: HITLRequestType;
  status: HITLStatus;
  title: string;
  description: string;
  options?: HITLOption[];
  requiredFields?: HITLField[];
  response?: HITLResponse;
  createdAt: string;
  respondedAt: string | null;
  expiresAt: string | null;
}

export interface HITLOption {
  id: string;
  label: string;
  value: string;
  description?: string;
}

export interface HITLField {
  name: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number';
  label: string;
  required: boolean;
  options?: { label: string; value: string }[];
  defaultValue?: unknown;
}

export interface HITLResponse {
  decision?: string;
  fields?: Record<string, unknown>;
  notes?: string;
  respondedBy: string;
  respondedAt: string;
}

// ============================================
// System & Analytics Types
// ============================================

export interface SystemStats {
  totalAgents: number;
  activeAgents: number;
  totalTasks: number;
  pendingTasks: number;
  runningTasks: number;
  completedTasks: number;
  failedTasks: number;
  totalTokensUsed: number;
  estimatedCost: number;
  hitlPendingCount: number;
}

export interface TokenStats {
  date: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  hasMore?: boolean;
}

// ============================================
// SSE Event Types
// ============================================

export type SSEEventType = 
  | 'task_started'
  | 'task_progress'
  | 'task_completed'
  | 'task_failed'
  | 'agent_status_changed'
  | 'hitl_requested'
  | 'message_chunk'
  | 'message_completed'
  | 'system_notification';

export interface SSEEvent<T = unknown> {
  type: SSEEventType;
  timestamp: string;
  data: T;
}

// ============================================
// UI State Types
// ============================================

export type SidebarSection = 'agents' | 'tasks' | 'conversations' | 'hitl' | 'analytics';

export interface UIState {
  sidebarCollapsed: boolean;
  activeSidebarSection: SidebarSection;
  selectedAgentId: string | null;
  selectedTaskId: string | null;
  selectedConversationId: string | null;
  theme: 'light' | 'dark' | 'system';
}
