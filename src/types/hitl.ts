// HITL (Human-in-the-Loop) Types

/**
 * HITL Request types
 */
export type HITLType = 'hitl' | 'plan_confirmation';

/**
 * HITL Question from agent (when status is suspended)
 */
export interface HITLQuestion {
  question: string;
  type: HITLType;
  options?: string[];
  defaultOption?: string;
}

/**
 * HITL Response (user's answer)
 */
export interface HITLResponse {
  approved: boolean;
  message?: string;
}

/**
 * HITL Approval Request
 */
export interface HITLApprovalRequest {
  approved: boolean;
  message?: string;
}

/**
 * HITL Approval Response
 */
export interface HITLApprovalResponse {
  task_id: number;
  status: string;
  message: string;
}
