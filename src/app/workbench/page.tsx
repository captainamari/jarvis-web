'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createTask, getTask, getUserTasks, reviewTask, getTaskEvents, approveHITL } from '@/lib/api';
import { useTaskStream } from '@/hooks/use-task-stream';
import { ChatHeader } from '@/components/workbench/chat-header';
import { ChatMessages } from '@/components/workbench/chat-messages';
import { ChatInput } from '@/components/workbench/chat-input';
import { ActionBanner } from '@/components/workbench/action-banner';
import { ArchiveSummaryDialog } from '@/components/workbench/archive-summary-dialog';
import { TaskCard } from '@/components/tasks/task-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task, TaskId, ReviewResponse } from '@/types/task';
import type { ChatMessage } from '@/types/sse';

export default function WorkbenchPage() {
  const queryClient = useQueryClient();
  // TaskId 使用 string 类型，避免 JavaScript 大数精度丢失
  const [selectedTaskId, setSelectedTaskId] = useState<TaskId | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Archive summary dialog state
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [archiveResponse, setArchiveResponse] = useState<ReviewResponse | null>(null);

  // Fetch user tasks
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => getUserTasks({ include_archived: false }),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch selected task details
  const { data: selectedTask, refetch: refetchTask } = useQuery({
    queryKey: ['task', selectedTaskId],
    queryFn: () => (selectedTaskId ? getTask(selectedTaskId) : null),
    enabled: !!selectedTaskId,
    refetchInterval: selectedTaskId ? 5000 : false,
  });

  // Task stream hook
  const {
    isConnected,
    isConnecting,
    error: streamError,
    messages,
    tokenStats,
    currentStatus,
    connect,
    disconnect,
    clearMessages,
    addUserMessage,
    setHistoryMessages,
  } = useTaskStream({
    onStatusChange: (event) => {
      // Refresh task list when status changes
      queryClient.invalidateQueries({ queryKey: ['tasks', CURRENT_USER_ID] });
      queryClient.invalidateQueries({ queryKey: ['task', selectedTaskId] });
    },
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: (newTask) => {
      // Refresh task list
      queryClient.invalidateQueries({ queryKey: ['tasks', CURRENT_USER_ID] });
      // Select the new task (id 现在是 string 类型)
      setSelectedTaskId(newTask.id);
      // Connect to SSE stream
      connect(newTask.id);
    },
  });

  // Review task mutation
  const reviewTaskMutation = useMutation({
    mutationFn: ({ taskId, action, feedback }: { taskId: TaskId; action: 'approve' | 'reject'; feedback?: string }) =>
      reviewTask(taskId, { action, feedback }),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', CURRENT_USER_ID] });
      queryClient.invalidateQueries({ queryKey: ['task', selectedTaskId] });
      
      // Show archive summary dialog on approval
      if (variables.action === 'approve') {
        setArchiveResponse(response);
        // Refetch task to get updated archive_summary
        setTimeout(() => {
          refetchTask().then(() => {
            setShowArchiveDialog(true);
          });
        }, 500);
      }
    },
  });

  // HITL approval mutation
  const hitlMutation = useMutation({
    mutationFn: ({ taskId, approved, message }: { taskId: TaskId; approved: boolean; message?: string }) =>
      approveHITL(taskId, { approved, message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', CURRENT_USER_ID] });
      queryClient.invalidateQueries({ queryKey: ['task', selectedTaskId] });
      // Reconnect to stream after HITL response
      if (selectedTaskId) {
        connect(selectedTaskId);
      }
    },
  });

  // Load historical events when task is selected
  const loadTaskHistory = useCallback(async (taskId: TaskId) => {
    try {
      const events = await getTaskEvents(taskId);
      
      // Safety check: ensure events is an array
      if (!Array.isArray(events)) {
        console.warn('getTaskEvents did not return an array:', events);
        return [];
      }
      
      // Convert events to chat messages
      const historyMessages: ChatMessage[] = events.map((event: any, index: number) => {
        // Safety check: ensure event has required fields
        if (!event || typeof event.role !== 'string') {
          console.warn('Invalid event:', event);
          return null;
        }
        
        // Ensure content is always a string
        const safeContent = event.content ?? '';
        
        if (event.role === 'user') {
          return {
            id: `history-${event.id || index}`,
            type: 'user' as const,
            content: String(safeContent),
            timestamp: event.created_at || new Date().toISOString(),
          };
        } else if (event.role === 'assistant') {
          // Assistant content might be JSON array from Claude API
          let textContent = String(safeContent);
          try {
            const parsed = JSON.parse(safeContent);
            if (Array.isArray(parsed)) {
              // Extract text from Claude response format: [{type: "text", text: "..."}]
              const texts = parsed
                .filter((block: any) => block && block.type === 'text')
                .map((block: any) => block.text || '');
              textContent = texts.join('\n') || textContent;
            }
          } catch {
            // Content is plain text, use as is
          }
          return {
            id: `history-${event.id || index}`,
            type: 'assistant' as const,
            content: textContent,
            agent: event.meta?.agent || 'assistant',
            timestamp: event.created_at || new Date().toISOString(),
          };
        } else if (event.role === 'thought') {
          return {
            id: `history-${event.id || index}`,
            type: 'thought' as const,
            content: String(safeContent),
            agent: event.meta?.agent,
            timestamp: event.created_at || new Date().toISOString(),
          };
        } else if (event.role === 'tool_use') {
          const meta = typeof event.meta === 'string' ? JSON.parse(event.meta) : (event.meta || {});
          return {
            id: `history-${event.id || index}`,
            type: 'tool_call' as const,
            content: String(safeContent),
            toolName: meta?.tool_name || 'unknown',
            toolInput: meta?.input,
            agent: meta?.agent,
            timestamp: event.created_at || new Date().toISOString(),
          };
        } else if (event.role === 'tool_result') {
          const meta = typeof event.meta === 'string' ? JSON.parse(event.meta) : (event.meta || {});
          return {
            id: `history-${event.id || index}`,
            type: 'tool_result' as const,
            content: String(safeContent),
            toolName: meta?.tool_name || 'unknown',
            toolResult: String(safeContent),
            toolSuccess: meta?.success ?? true,
            agent: meta?.agent,
            timestamp: event.created_at || new Date().toISOString(),
          };
        } else if (event.role === 'review_feedback') {
          // M5: Review feedback from user
          return {
            id: `history-${event.id || index}`,
            type: 'review_feedback' as const,
            content: String(safeContent),
            timestamp: event.created_at || new Date().toISOString(),
          };
        }
        // Unknown role, skip
        console.warn('Unknown event role:', event.role);
        return null;
      }).filter(Boolean) as ChatMessage[];

      return historyMessages;
    } catch (err) {
      console.error('Failed to load task history:', err);
      return [];
    }
  }, []);

  // Handle task selection
  const handleSelectTask = useCallback(async (task: Task) => {
    // Disconnect from current stream
    disconnect();
    clearMessages();
    
    setSelectedTaskId(task.id);
    setIsLoadingHistory(true);
    
    try {
      // Load task history
      const history = await loadTaskHistory(task.id);
      // Set history messages to display
      setHistoryMessages(history);
    } catch (err) {
      console.error('Failed to load task history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
    
    // Connect to SSE if task is running
    if (['running', 'pending'].includes(task.status)) {
      connect(task.id);
    }
  }, [disconnect, clearMessages, loadTaskHistory, connect, setHistoryMessages]);

  // Handle message submission
  const handleSubmit = async (message: string) => {
    setIsCreatingTask(true);
    
    try {
      // Add user message to display immediately
      addUserMessage(message);
      
      // Create new task
      await createTaskMutation.mutateAsync({
        user_id: CURRENT_USER_ID,
        description: message,
        agent_name: 'secretary',
      });
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setIsCreatingTask(false);
    }
  };

  // Handle HITL approval (for suspended status)
  const handleHITLApprove = async (message?: string) => {
    if (!selectedTaskId) return;
    await hitlMutation.mutateAsync({
      taskId: selectedTaskId,
      approved: true,
      message,
    });
  };

  // Handle HITL rejection (for suspended status)
  const handleHITLReject = async (message?: string) => {
    if (!selectedTaskId) return;
    await hitlMutation.mutateAsync({
      taskId: selectedTaskId,
      approved: false,
      message,
    });
  };

  // Handle review approval (for awaiting_review status)
  const handleReviewApprove = async (feedback?: string) => {
    if (!selectedTaskId) return;
    await reviewTaskMutation.mutateAsync({
      taskId: selectedTaskId,
      action: 'approve',
      feedback,
    });
  };

  // Handle review rejection (for awaiting_review status)
  const handleReviewReject = async (feedback: string) => {
    if (!selectedTaskId) return;
    await reviewTaskMutation.mutateAsync({
      taskId: selectedTaskId,
      action: 'reject',
      feedback,
    });
    // Reconnect to stream after rejection (task continues)
    connect(selectedTaskId);
  };

  // Reconnect handler
  const handleReconnect = () => {
    if (selectedTaskId) {
      connect(selectedTaskId);
    }
  };

  // Close handler (deselect task)
  const handleClose = () => {
    disconnect();
    clearMessages();
    setSelectedTaskId(null);
  };

  // Create new task handler
  const handleCreateNewTask = () => {
    disconnect();
    clearMessages();
    setSelectedTaskId(null);
  };

  // Get effective status (from SSE stream or task)
  const effectiveStatus = currentStatus || selectedTask?.status;

  // Determine if input should be disabled
  const isInputDisabled = effectiveStatus === 'archived' || 
                          effectiveStatus === 'awaiting_review' ||
                          effectiveStatus === 'suspended';

  // Get HITL question from the latest status change message
  const hitlQuestion = messages.find(
    m => m.type === 'status' && m.status === 'suspended' && m.hitlQuestion
  )?.hitlQuestion;

  // Check if action banner should be shown
  const showActionBanner = effectiveStatus && 
    ['suspended', 'awaiting_review', 'archived', 'failed'].includes(effectiveStatus);

  return (
    <div className="flex h-full">
      {/* Task Sidebar */}
      <div
        className={cn(
          'border-r bg-card/30 transition-all duration-300 flex flex-col',
          showSidebar ? 'w-80' : 'w-0 overflow-hidden'
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold">Recent Tasks</h2>
            </div>
          </div>
          <Button
            onClick={handleCreateNewTask}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>

        {/* Task List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {isLoadingTasks ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading tasks...
              </div>
            ) : tasks.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No active tasks
              </div>
            ) : (
              tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isSelected={task.id === selectedTaskId}
                  onClick={() => handleSelectTask(task)}
                  compact
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Sidebar Toggle */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className={cn(
          'absolute left-0 top-1/2 -translate-y-1/2 z-10',
          'w-6 h-12 flex items-center justify-center',
          'bg-muted hover:bg-muted/80 border border-l-0 rounded-r-md',
          'transition-all duration-300',
          showSidebar ? 'ml-80' : 'ml-0'
        )}
      >
        {showSidebar ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <ChatHeader
          task={selectedTask || null}
          isConnected={isConnected}
          isConnecting={isConnecting}
          tokenStats={tokenStats}
          onReconnect={handleReconnect}
          onClose={selectedTaskId ? handleClose : undefined}
        />

        {/* Messages */}
        <ChatMessages 
          messages={messages} 
          isLoading={isConnected && effectiveStatus === 'running'}
          isLoadingHistory={isLoadingHistory}
        />

        {/* Error Banner */}
        {streamError && (
          <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20">
            <p className="text-sm text-destructive">{streamError}</p>
          </div>
        )}

        {/* Action Banner (HITL / Review / Archived) */}
        {showActionBanner && effectiveStatus && (
          <ActionBanner
            status={effectiveStatus as any}
            hitlQuestion={hitlQuestion}
            onHITLApprove={handleHITLApprove}
            onHITLReject={handleHITLReject}
            onReviewApprove={handleReviewApprove}
            onReviewReject={handleReviewReject}
            isLoading={reviewTaskMutation.isPending || hitlMutation.isPending}
          />
        )}

        {/* Input Area (hidden when action banner shows) */}
        {!showActionBanner && (
          <ChatInput
            onSubmit={handleSubmit}
            isDisabled={isInputDisabled}
            isLoading={isCreatingTask || createTaskMutation.isPending}
            placeholder={
              isInputDisabled
                ? 'This task is archived. Create a new task to continue.'
                : 'Describe what you want Jarvis to do...'
            }
          />
        )}
      </div>

      {/* Archive Summary Dialog */}
      <ArchiveSummaryDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        task={selectedTask || null}
        reviewResponse={archiveResponse}
        onCreateNewTask={handleCreateNewTask}
      />
    </div>
  );
}
