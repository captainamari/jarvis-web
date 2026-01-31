'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, XCircle, Loader2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewPanelProps {
  onApprove: (feedback?: string) => Promise<void>;
  onReject: (feedback?: string) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Review panel for awaiting_review status
 * Allows user to approve or reject task completion
 */
export function ReviewPanel({ onApprove, onReject, isLoading = false }: ReviewPanelProps) {
  const [feedback, setFeedback] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const handleApprove = async () => {
    setAction('approve');
    try {
      await onApprove(feedback || undefined);
      setFeedback('');
    } finally {
      setAction(null);
    }
  };

  const handleReject = async () => {
    setAction('reject');
    try {
      await onReject(feedback || undefined);
      setFeedback('');
    } finally {
      setAction(null);
    }
  };

  return (
    <div className="border-t bg-gradient-to-b from-purple-500/10 to-transparent">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-purple-400" />
          <span className="text-sm font-medium text-purple-300">
            Task Awaiting Review
          </span>
        </div>

        {/* Feedback Input */}
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Add feedback (optional)..."
          disabled={isLoading}
          className={cn(
            'min-h-[80px] resize-none',
            'bg-muted/30 border-purple-500/30 focus:border-purple-500',
            'placeholder:text-muted-foreground/50'
          )}
        />

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleApprove}
            disabled={isLoading}
            className={cn(
              'flex-1 gap-2',
              'bg-green-600 hover:bg-green-700 text-white'
            )}
          >
            {action === 'approve' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Approve & Archive
          </Button>

          <Button
            onClick={handleReject}
            disabled={isLoading}
            variant="outline"
            className={cn(
              'flex-1 gap-2',
              'border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300'
            )}
          >
            {action === 'reject' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            Reject & Revise
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-muted-foreground text-center">
          Approve to archive the task, or reject to continue with additional feedback.
        </p>
      </div>
    </div>
  );
}
