import { API_CONFIG } from '@/config';
import type {
  Task,
  CreateTaskRequest,
  CreateTaskResponse,
  TaskRunResponse,
  ReviewRequest,
  ReviewResponse,
  ArchiveRequest,
  ArchiveResponse,
  UserStatsResponse,
  TaskListParams,
} from '@/types/task';

/**
 * Base fetch wrapper with error handling
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.baseUrl}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...API_CONFIG.headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// ============================================
// Task API Functions
// ============================================

/**
 * Create a new task
 */
export async function createTask(data: CreateTaskRequest): Promise<CreateTaskResponse> {
  return fetchApi<CreateTaskResponse>('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get task by ID
 */
export async function getTask(taskId: number): Promise<Task> {
  return fetchApi<Task>(`/tasks/${taskId}`);
}

/**
 * Run/restart a task
 */
export async function runTask(taskId: number): Promise<TaskRunResponse> {
  return fetchApi<TaskRunResponse>(`/tasks/${taskId}/run`, {
    method: 'POST',
  });
}

/**
 * Get task events/history
 */
export async function getTaskEvents(taskId: number): Promise<unknown[]> {
  return fetchApi<unknown[]>(`/tasks/${taskId}/events`);
}

/**
 * Submit task review (approve/reject)
 */
export async function reviewTask(
  taskId: number,
  data: ReviewRequest
): Promise<ReviewResponse> {
  return fetchApi<ReviewResponse>(`/tasks/${taskId}/review`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Archive a task
 */
export async function archiveTask(
  taskId: number,
  data: ArchiveRequest = {}
): Promise<ArchiveResponse> {
  return fetchApi<ArchiveResponse>(`/tasks/${taskId}/archive`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ============================================
// User API Functions
// ============================================

/**
 * Get user's tasks list
 */
export async function getUserTasks(
  userId: number,
  params: TaskListParams = {}
): Promise<Task[]> {
  const searchParams = new URLSearchParams();
  
  if (params.status) {
    searchParams.set('status', params.status);
  }
  if (params.include_archived !== undefined) {
    searchParams.set('include_archived', String(params.include_archived));
  }
  
  const queryString = searchParams.toString();
  const endpoint = `/users/${userId}/tasks${queryString ? `?${queryString}` : ''}`;
  
  return fetchApi<Task[]>(endpoint);
}

/**
 * Get user statistics
 */
export async function getUserStats(userId: number): Promise<UserStatsResponse> {
  return fetchApi<UserStatsResponse>(`/users/${userId}/stats`);
}

// ============================================
// System API Functions
// ============================================

/**
 * Health check
 */
export async function healthCheck(): Promise<{ status: string; version: string }> {
  return fetchApi<{ status: string; version: string }>('/health');
}

// ============================================
// SSE Stream URL Builder
// ============================================

/**
 * Get SSE stream URL for a task
 */
export function getTaskStreamUrl(taskId: number): string {
  return `${API_CONFIG.baseUrl}/tasks/${taskId}/stream`;
}

/**
 * Get test SSE stream URL
 */
export function getTestStreamUrl(): string {
  return `${API_CONFIG.baseUrl}/test/sse`;
}
