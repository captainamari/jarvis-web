// SSE Event Types based on API Reference v5.0.0

/**
 * Base SSE Event structure
 */
export interface BaseSSEEvent {
  event_id: string;
  type: string;
  agent: string;
  timestamp: string;
  task_id: number;
  meta?: Record<string, unknown>;
}

/**
 * Connected Event - Connection established
 */
export interface ConnectedEvent {
  task_id: number;
  timestamp: string;
}

/**
 * Heartbeat Event - Keep-alive signal
 */
export interface HeartbeatEvent {
  timestamp: string;
}

/**
 * Thought Event - Agent thinking process
 */
export interface ThoughtEvent extends BaseSSEEvent {
  type: 'thought';
  content: {
    text: string;
  };
  meta?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
    cost?: number;
    model?: string;
  };
}

/**
 * Tool Call Event - Agent calling a tool
 */
export interface ToolCallEvent extends BaseSSEEvent {
  type: 'tool_call';
  content: {
    tool: string;
    input: Record<string, unknown>;
  };
  meta?: {
    round?: number;
    max_rounds?: number;
  };
}

/**
 * Tool Result Event - Tool execution result
 */
export interface ToolResultEvent extends BaseSSEEvent {
  type: 'tool_result';
  content: {
    tool: string;
    result: string;
    success: boolean;
  };
}

/**
 * Message Event - Final message to user
 */
export interface MessageEvent extends BaseSSEEvent {
  type: 'message';
  content: {
    text: string;
  };
}

/**
 * Status Change Event - Task status changed
 */
export interface StatusChangeEvent extends BaseSSEEvent {
  type: 'status_change';
  content: {
    status: string;
    previous_status?: string;
    question?: string;
    type?: 'hitl' | 'plan_confirmation';
    message?: string;
    total_tokens?: number;
    total_cost?: number;
  };
}

/**
 * Token Update Event - Real-time token consumption
 */
export interface TokenUpdateEvent extends BaseSSEEvent {
  type: 'token_update';
  content: {
    input_tokens: number;
    output_tokens: number;
    cost: number;
    cumulative_tokens: number;
    cumulative_cost: number;
    model: string;
  };
}

/**
 * Error Event - Error occurred
 */
export interface ErrorEvent extends BaseSSEEvent {
  type: 'error';
  content: {
    message: string;
    code?: string;
  };
}

/**
 * Close Event - Connection closing
 */
export interface CloseEvent {
  task_id: number;
  timestamp: string;
  reason?: string;
}

/**
 * Union type for all SSE events
 */
export type SSEEvent =
  | ThoughtEvent
  | ToolCallEvent
  | ToolResultEvent
  | MessageEvent
  | StatusChangeEvent
  | TokenUpdateEvent
  | ErrorEvent;

/**
 * Event type literal union
 */
export type SSEEventType =
  | 'connected'
  | 'heartbeat'
  | 'thought'
  | 'tool_call'
  | 'tool_result'
  | 'message'
  | 'status_change'
  | 'token_update'
  | 'error'
  | 'close';

/**
 * Token statistics for display
 */
export interface TokenStats {
  inputTokens: number;
  outputTokens: number;
  cost: number;
  cumulativeTokens: number;
  cumulativeCost: number;
  model: string;
}

/**
 * Unified chat message for rendering
 */
export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'thought' | 'tool_call' | 'tool_result' | 'status' | 'error' | 'review_feedback';
  content: string;
  agent?: string;
  timestamp: string;
  meta?: Record<string, unknown>;
  // Tool-specific fields
  toolName?: string;
  toolInput?: Record<string, unknown>;
  toolResult?: string;
  toolSuccess?: boolean;
  // Status-specific fields
  status?: string;
  previousStatus?: string;
  hitlQuestion?: string;
}
