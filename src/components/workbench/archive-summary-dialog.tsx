'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Markdown } from '@/components/ui/markdown';
import {
  Archive,
  CheckCircle2,
  Coins,
  Clock,
  FileText,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Task } from '@/types/task';
import type { ReviewResponse } from '@/types/task';

interface ArchiveSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  reviewResponse?: ReviewResponse | null;
  onCreateNewTask?: () => void;
}

/**
 * Format token count for display
 */
function formatTokens(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(2)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return String(tokens);
}

/**
 * Format task ID
 */
function formatTaskId(taskId: string): string {
  const str = String(taskId);
  if (str.length > 6) {
    return `#${str.slice(-6)}`;
  }
  return `#${str}`;
}

/**
 * Archive Summary Dialog
 * Shows task completion summary after approval
 */
export function ArchiveSummaryDialog({
  open,
  onOpenChange,
  task,
  reviewResponse,
  onCreateNewTask,
}: ArchiveSummaryDialogProps) {
  const [copied, setCopied] = useState(false);

  // Use review response data if available, otherwise fall back to task
  const totalTokens = reviewResponse?.total_tokens_used ?? task?.total_tokens_used ?? 0;
  const totalCost = reviewResponse?.total_cost ?? task?.total_cost ?? 0;
  const summary = task?.archive_summary;
  const artifacts = task?.archive_artifacts;
  const archivedAt = task?.archived_at;

  const handleCopySummary = async () => {
    if (summary) {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-green-500/20">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <DialogTitle className="text-xl">Task Archived</DialogTitle>
              <DialogDescription>
                {task ? formatTaskId(task.id) : ''} has been successfully completed
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Task Description */}
          {task && (
            <div className="px-4 py-3 rounded-lg bg-muted/50 border">
              <p className="text-sm font-medium line-clamp-2">
                {task.description}
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted/30 border">
              <Coins className="h-5 w-5 text-yellow-500 mb-1" />
              <span className="text-lg font-semibold">{formatTokens(totalTokens)}</span>
              <span className="text-xs text-muted-foreground">Tokens Used</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted/30 border">
              <span className="text-lg font-semibold text-green-500 mb-1">$</span>
              <span className="text-lg font-semibold">{totalCost.toFixed(4)}</span>
              <span className="text-xs text-muted-foreground">Total Cost</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted/30 border">
              <Clock className="h-5 w-5 text-blue-500 mb-1" />
              <span className="text-sm font-semibold">
                {archivedAt ? new Date(archivedAt).toLocaleDateString() : 'Just now'}
              </span>
              <span className="text-xs text-muted-foreground">Archived</span>
            </div>
          </div>

          {/* Summary */}
          {summary && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Summary</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopySummary}
                    className="h-8 gap-1.5"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <ScrollArea className="max-h-[200px]">
                  <div className="px-4 py-3 rounded-lg bg-muted/30 border">
                    <Markdown
                      content={summary}
                      className="text-sm text-foreground/90"
                    />
                  </div>
                </ScrollArea>
              </div>
            </>
          )}

          {/* Artifacts */}
          {artifacts && artifacts.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Archive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Artifacts</span>
                  <Badge variant="secondary" className="text-xs">
                    {artifacts.length}
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  {artifacts.map((artifact, index) => (
                    <div
                      key={index}
                      className={cn(
                        'flex items-center justify-between px-3 py-2 rounded-md',
                        'bg-muted/30 border hover:bg-muted/50 transition-colors'
                      )}
                    >
                      <span className="text-sm font-mono truncate flex-1">
                        {artifact}
                      </span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Close
            </Button>
            {onCreateNewTask && (
              <Button
                onClick={() => {
                  handleClose();
                  onCreateNewTask();
                }}
                className="flex-1"
              >
                New Task
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
