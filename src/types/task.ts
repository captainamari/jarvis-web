// Task Types based on API Reference v5.0.0

/**
 * Task Status Types
 * Updated for Dual-Path Completion Mechanism
 */
export type TaskStatus =
  | 'pending'          // 等待执行
  | 'queued'           // 排队中，等待执行
  | 'running'          // 正在执行
  | 'suspended'        // 挂起等待审批 (HITL)
  | 'awaiting_review'  // 待验收 (Standard Review path)
  | 'completed'        // 已完成 (Quick Finish path - no human review needed)
  | 'archived'         // 已归档
  | 'failed'           // 执行失败
  | 'cancelled';       // 用户取消

/**
 * Available Agent Names
 */
export type AgentName = 'secretary' | 'python_dev' | 'investor';

/**
 * Task ID type
 * 
 * 后端返回的 task_id 是 17 位数字格式 (时间戳 + 3位随机数)
 * 由于超过 JavaScript Number.MAX_SAFE_INTEGER，必须使用 string 类型
 */
export type TaskId = string;

/**
 * Task Response from API
 */
export interface Task {
  id: TaskId;                     // 17位时间戳格式 ID (字符串，避免精度丢失)
  user_id: string;                // 用户 ID (字符串)
  description: string;            // 任务描述
  status: TaskStatus;             // 任务状态
  agent_name: string;             // 执行 Agent 名称
  error_message: string | null;   // 错误信息（失败时）
  
  // Token & Cost tracking
  total_tokens_used: number;      // 累计 Token 消耗
  total_cost: number;             // 累计成本 (USD)
  
  // Archive fields
  archive_summary: string | null; // 归档总结
  archive_artifacts: string[] | null; // 产出物路径列表
  is_archived: boolean;           // 是否已归档
  archived_at: string | null;     // 归档时间 (ISO 8601)
  
  // Timestamps
  created_at: string;             // 创建时间 (ISO 8601)
  updated_at: string;             // 更新时间 (ISO 8601)
}

/**
 * Create Task Request
 */
export interface CreateTaskRequest {
  user_id: number;
  description: string;
  agent_name?: AgentName;
}

/**
 * Create Task Response
 */
export interface CreateTaskResponse extends Task {}

/**
 * Task Run Response
 */
export interface TaskRunResponse {
  task_id: TaskId;
  status: 'started' | 'already_running' | 'already_completed' | 'already_archived' | 'awaiting_review';
  message: string;
}

/**
 * Review Request
 */
export interface ReviewRequest {
  action: 'approve' | 'reject';
  feedback?: string;
}

/**
 * Review Response
 */
export interface ReviewResponse {
  task_id: TaskId;
  action: 'approve' | 'reject';
  new_status: TaskStatus;
  message: string;
  total_tokens_used: number;
  total_cost: number;
}

/**
 * Archive Request
 */
export interface ArchiveRequest {
  generate_summary?: boolean;
  custom_summary?: string;
  artifacts?: string[];
}

/**
 * Archive Response
 */
export interface ArchiveResponse {
  task_id: TaskId;
  status: 'archived' | 'already_archived' | 'error';
  archive_summary: string;
  archived_at: string;
  total_tokens_used: number;
  total_cost: number;
}

/**
 * User Stats Response
 */
export interface UserStatsResponse {
  user_id: string;
  total_tasks: number;
  tasks_by_status: Record<TaskStatus, number>;
  total_tokens_used: number;
  total_cost: number;
  archived_count: number;
}

/**
 * Task List Query Parameters
 */
export interface TaskListParams {
  status?: TaskStatus;
  include_archived?: boolean;
}

/**
 * Agent Option for Select
 */
export interface AgentOption {
  value: AgentName;
  label: string;
  description: string;
}

/**
 * Available agents for task creation
 */
export const AVAILABLE_AGENTS: AgentOption[] = [
  {
    value: 'secretary',
    label: 'Secretary',
    description: '任务分发者，默认入口',
  },
  {
    value: 'python_dev',
    label: 'Python Developer',
    description: 'Python 开发专家',
  },
  {
    value: 'investor',
    label: 'Investor',
    description: '投资分析师',
  },
];
