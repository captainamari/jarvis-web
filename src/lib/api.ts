import { API_CONFIG, config } from '@/config';
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
import type {
  HITLApprovalRequest,
  HITLApprovalResponse,
} from '@/types/hitl';

/**
 * Parse JSON with BigInt support for task IDs
 * 
 * 后端返回的 task_id 是 17 位数字，超过了 JavaScript Number.MAX_SAFE_INTEGER (约16位)
 * 直接使用 JSON.parse 会导致精度丢失，例如：
 *   原始: 20260201150546501
 *   丢失: 20260201150546500
 * 
 * 此函数将大数 ID 字段转换为字符串后再解析
 */
function parseJsonWithBigInt(text: string): unknown {
  // 匹配 "id": 数字 或 "task_id": 数字 或 "user_id": 数字 格式
  // 将超过安全整数范围的数字转换为字符串
  const processedText = text.replace(
    /"(id|task_id|user_id)"\s*:\s*(\d{16,})/g,
    '"$1": "$2"'
  );
  return JSON.parse(processedText);
}

/**
 * Base fetch wrapper with error handling
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.baseUrl}${endpoint}`;
  
  // Log request details
  console.log(`[API Request] ${options.method || 'GET'} ${url}`);
  if (options.body) {
    console.log('[API Request Body]', options.body);
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...API_CONFIG.headers,
        ...options.headers,
      },
    });

    console.log(`[API Response] ${response.status} ${response.statusText} for ${url}`);

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: Record<string, unknown> = {};
      try {
        errorData = parseJsonWithBigInt(errorText) as Record<string, unknown>;
      } catch {
        errorData = { detail: errorText };
      }
      console.error(`[API Error] ${url}`, errorData);
      throw new Error((errorData.detail as string) || `HTTP ${response.status}: ${response.statusText}`);
    }

    // 使用自定义解析器处理大数 ID
    const text = await response.text();
    const data = parseJsonWithBigInt(text) as T;
    console.log(`[API Success] ${url}`, data);
    return data;
  } catch (error) {
    console.error(`[API Exception] ${url}`, error);
    throw error;
  }
}

// ============================================
// Task API Functions
// ============================================

/**
 * Get the user tasks base path
 * Uses adminUserId from config for all task-related API calls
 */
function getUserTasksBasePath(): string {
  if (!config.adminUserId) {
    throw new Error('[API Error] adminUserId is not configured. Please set NEXT_PUBLIC_ADMIN_USER_ID in your environment.');
  }
  return `/users/${config.adminUserId}/tasks`;
}

/**
 * Create a new task
 */
export async function createTask(data: CreateTaskRequest): Promise<CreateTaskResponse> {
  return fetchApi<CreateTaskResponse>(getUserTasksBasePath(), {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get task by ID
 * @param taskId - Task ID (string to avoid JS Number precision loss)
 */
export async function getTask(taskId: string): Promise<Task> {
  return fetchApi<Task>(`${getUserTasksBasePath()}/${taskId}`);
}

/**
 * Run/restart a task
 * @param taskId - Task ID (string to avoid JS Number precision loss)
 */
export async function runTask(taskId: string): Promise<TaskRunResponse> {
  return fetchApi<TaskRunResponse>(`${getUserTasksBasePath()}/${taskId}/run`, {
    method: 'POST',
  });
}

/**
 * Get task events/history
 * @param taskId - Task ID (string to avoid JS Number precision loss)
 */
export async function getTaskEvents(taskId: string): Promise<unknown[]> {
  return fetchApi<unknown[]>(`${getUserTasksBasePath()}/${taskId}/events`);
}

/**
 * Submit task review (approve/reject)
 * @param taskId - Task ID (string to avoid JS Number precision loss)
 */
export async function reviewTask(
  taskId: string,
  data: ReviewRequest
): Promise<ReviewResponse> {
  return fetchApi<ReviewResponse>(`${getUserTasksBasePath()}/${taskId}/review`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Archive a task
 * @param taskId - Task ID (string to avoid JS Number precision loss)
 */
export async function archiveTask(
  taskId: string,
  data: ArchiveRequest = {}
): Promise<ArchiveResponse> {
  return fetchApi<ArchiveResponse>(`${getUserTasksBasePath()}/${taskId}/archive`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Approve or reject HITL request (for suspended tasks)
 * This resumes the task with the user's decision
 * @param taskId - Task ID (string to avoid JS Number precision loss)
 */
export async function approveHITL(
  taskId: string,
  data: HITLApprovalRequest
): Promise<HITLApprovalResponse> {
  return fetchApi<HITLApprovalResponse>(`${getUserTasksBasePath()}/${taskId}/approve`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ============================================
// User API Functions
// ============================================

/**
 * Get user's tasks list
 * Uses adminUserId from config
 */
export async function getUserTasks(
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
  const endpoint = `${getUserTasksBasePath()}${queryString ? `?${queryString}` : ''}`;
  
  return fetchApi<Task[]>(endpoint);
}

/**
 * Get user statistics
 * Uses adminUserId from config
 */
export async function getUserStats(): Promise<UserStatsResponse> {
  if (!config.adminUserId) {
    throw new Error('[API Error] adminUserId is not configured. Please set NEXT_PUBLIC_ADMIN_USER_ID in your environment.');
  }
  return fetchApi<UserStatsResponse>(`/users/${config.adminUserId}/stats`);
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
 * Uses adminUserId from config
 * @param taskId - Task ID (string to avoid JS Number precision loss)
 */
export function getTaskStreamUrl(taskId: string): string {
  if (!config.adminUserId) {
    throw new Error('[API Error] adminUserId is not configured. Please set NEXT_PUBLIC_ADMIN_USER_ID in your environment.');
  }
  return `${API_CONFIG.baseUrl}/users/${config.adminUserId}/tasks/${taskId}/stream`;
}

/**
 * Get test SSE stream URL
 */
export function getTestStreamUrl(): string {
  return `${API_CONFIG.baseUrl}/test/sse`;
}
