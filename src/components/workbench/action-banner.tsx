'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Hand,
  Eye,
  Archive,
  MessageSquare,
  AlertTriangle,
  Send,
  Lock,
  Ban,
  Zap,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskStatus } from '@/types/task';

interface ActionBannerProps {
  status: TaskStatus;
  // For suspended status (HITL)
  hitlQuestion?: string;
  hitlType?: 'hitl' | 'plan_confirmation';
  onHITLApprove?: (message?: string) => Promise<void>;
  onHITLReject?: (message?: string) => Promise<void>;
  // For awaiting_review status
  onReviewApprove?: (feedback?: string) => Promise<void>;
  onReviewReject?: (feedback: string) => Promise<void>;
  // For completed status - copy last agent response
  onCopyResult?: () => Promise<string | undefined>;
  // Loading states
  isLoading?: boolean;
}

/**
 * Action Banner Component
 * Handles different task statuses with appropriate UI:
 * - suspended: HITL approval with question display
 * - awaiting_review: Task review with approve/reject (Standard Review path)
 * - completed: Success banner for Quick Finish path
 * - cancelled: Neutral banner for cancelled tasks
 * - archived: Read-only banner
 */
export function ActionBanner({
  status,
  hitlQuestion,
  hitlType,
  onHITLApprove,
  onHITLReject,
  onReviewApprove,
  onReviewReject,
  onCopyResult,
  isLoading = false,
}: ActionBannerProps) {
  const [feedback, setFeedback] = useState('');
  const [hitlMessage, setHitlMessage] = useState('');
  const [activeAction, setActiveAction] = useState<'approve' | 'reject' | null>(null);
  const [copied, setCopied] = useState(false);

  // Handle Copy Result
  const handleCopyResult = async () => {
    if (!onCopyResult) return;
    try {
      const result = await onCopyResult();
      if (result) {
        await navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error('Failed to copy result:', error);
    }
  };

  // Handle HITL Approve
  const handleHITLApprove = async () => {
    if (!onHITLApprove) return;
    setActiveAction('approve');
    try {
      await onHITLApprove(hitlMessage || undefined);
      setHitlMessage('');
    } finally {
      setActiveAction(null);
    }
  };

  // Handle HITL Reject
  const handleHITLReject = async () => {
    if (!onHITLReject) return;
    setActiveAction('reject');
    try {
      await onHITLReject(hitlMessage || undefined);
      setHitlMessage('');
    } finally {
      setActiveAction(null);
    }
  };

  // Handle Review Approve
  const handleReviewApprove = async () => {
    if (!onReviewApprove) return;
    setActiveAction('approve');
    try {
      await onReviewApprove(feedback || undefined);
      setFeedback('');
    } finally {
      setActiveAction(null);
    }
  };

  // Handle Review Reject
  const handleReviewReject = async () => {
    if (!onReviewReject || !feedback.trim()) return;
    setActiveAction('reject');
    try {
      await onReviewReject(feedback);
      setFeedback('');
    } finally {
      setActiveAction(null);
    }
  };

  // Suspended Status (HITL)
  if (status === 'suspended') {
    return (
      <div className="border-t bg-gradient-to-b from-yellow-500/10 to-yellow-500/5">
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-yellow-500/20">
              <Hand className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <h4 className="font-medium text-yellow-300">
                Human Approval Required
              </h4>
              <p className="text-xs text-yellow-400/70">
                {hitlType === 'plan_confirmation' ? 'Plan Confirmation' : 'Action Confirmation'}
              </p>
            </div>
          </div>

          {/* Question Box */}
          {hitlQuestion && (
            <div className="px-4 py-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
                <p className="text-sm text-yellow-200 whitespace-pre-wrap">
                  {hitlQuestion}
                </p>
              </div>
            </div>
          )}

          {/* Reply Input */}
          <div className="flex gap-2">
            <Input
              value={hitlMessage}
              onChange={(e) => setHitlMessage(e.target.value)}
              placeholder="Add a message (optional)..."
              disabled={isLoading}
              className={cn(
                'flex-1',
                'bg-muted/30 border-yellow-500/30 focus:border-yellow-500',
                'placeholder:text-muted-foreground/50'
              )}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleHITLApprove}
              disabled={isLoading}
              className={cn(
                'flex-1 gap-2',
                'bg-green-600 hover:bg-green-700 text-white'
              )}
            >
              {activeAction === 'approve' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Approve
            </Button>

            <Button
              onClick={handleHITLReject}
              disabled={isLoading}
              variant="outline"
              className={cn(
                'flex-1 gap-2',
                'border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300'
              )}
            >
              {activeAction === 'reject' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Reject
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Awaiting Review Status (Standard Review Path)
  if (status === 'awaiting_review') {
    return (
      <div className="border-t bg-gradient-to-b from-sky-500/10 to-sky-500/5">
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-sky-500/20">
              <Eye className="h-5 w-5 text-sky-400" />
            </div>
            <div>
              <h4 className="font-medium text-sky-300">
                Task Ready for Review
              </h4>
              <p className="text-xs text-sky-400/70">
                Review the results and approve or request changes
              </p>
            </div>
          </div>

          {/* Feedback Input */}
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Add feedback for changes (required for rejection)..."
            disabled={isLoading}
            className={cn(
              'min-h-[80px] resize-none',
              'bg-muted/30 border-sky-500/30 focus:border-sky-500',
              'placeholder:text-muted-foreground/50'
            )}
          />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleReviewApprove}
              disabled={isLoading}
              className={cn(
                'flex-1 gap-2',
                'bg-green-600 hover:bg-green-700 text-white'
              )}
            >
              {activeAction === 'approve' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Archive className="h-4 w-4" />
              )}
              Approve & Archive
            </Button>

            <Button
              onClick={handleReviewReject}
              disabled={isLoading || !feedback.trim()}
              variant="outline"
              className={cn(
                'flex-1 gap-2',
                'border-orange-500/50 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300',
                !feedback.trim() && 'opacity-50 cursor-not-allowed'
              )}
            >
              {activeAction === 'reject' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Request Changes
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-muted-foreground text-center">
            Approve to archive the task, or provide feedback and request changes.
          </p>
        </div>
      </div>
    );
  }

  // Completed Status (Quick Finish Path - no human review needed)
  if (status === 'completed') {
    return (
      <div className="border-t bg-gradient-to-r from-emerald-500/10 to-emerald-500/5">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Left: Status Info */}
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-full bg-emerald-500/20">
              <Zap className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-400">
                Task Completed via Quick Mode
              </p>
              <p className="text-xs text-emerald-400/70">
                Task finished automatically • No review required
              </p>
            </div>
          </div>

          {/* Right: Copy Result Button */}
          <div className="flex items-center gap-2">
            {onCopyResult && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyResult}
                className={cn(
                  'gap-1.5 transition-all',
                  copied
                    ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'
                    : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50'
                )}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy Result
                  </>
                )}
              </Button>
            )}
            <div className="p-1.5 rounded-full bg-emerald-500/20">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Cancelled Status
  if (status === 'cancelled') {
    return (
      <div className="border-t bg-gradient-to-r from-gray-500/10 to-gray-500/5">
        <div className="px-4 py-3 flex items-center justify-center gap-3">
          <div className="p-1.5 rounded-full bg-gray-500/20">
            <Ban className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-400">
              Task Cancelled
            </p>
            <p className="text-xs text-gray-400/70">
              This task was stopped by user • Create a new task to continue
            </p>
          </div>
          <div className="p-1.5 rounded-full bg-gray-500/20">
            <XCircle className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    );
  }

  // Archived Status
  if (status === 'archived') {
    return (
      <div className="border-t bg-gradient-to-r from-muted/50 to-muted/30">
        <div className="px-4 py-3 flex items-center justify-center gap-3">
          <div className="p-1.5 rounded-full bg-muted">
            <Lock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">
              This task has been archived
            </p>
            <p className="text-xs text-muted-foreground/70">
              Read-only mode • Create a new task to continue
            </p>
          </div>
          <div className="p-1.5 rounded-full bg-green-500/10">
            <Archive className="h-4 w-4 text-green-500" />
          </div>
        </div>
      </div>
    );
  }

  // Failed Status
  if (status === 'failed') {
    return (
      <div className="border-t bg-gradient-to-r from-red-500/10 to-red-500/5">
        <div className="px-4 py-3 flex items-center justify-center gap-3">
          <div className="p-1.5 rounded-full bg-red-500/20">
            <XCircle className="h-4 w-4 text-red-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-red-400">
              Task Failed
            </p>
            <p className="text-xs text-red-400/70">
              An error occurred during execution
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No banner for other statuses (pending, queued, running)
  return null;
}
