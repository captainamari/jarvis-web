'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CURRENT_USER_ID } from '@/config';
import { createTask, getTask, getUserTasks, reviewTask, getTaskEvents } from '@/lib/api';
import { useTaskStream } from '@/hooks/use-task-stream';
import { ChatHeader } from '@/components/workbench/chat-header';
import { ChatMessages } from '@/components/workbench/chat-messages';
import { ChatInput } from '@/components/workbench/chat-input';
import { ReviewPanel } from '@/components/workbench/review-panel';
import { TaskCard } from '@/components/tasks/task-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task } from '@/types/task';
import type { ChatMessage } from '@/types/sse';

export default function WorkbenchPage() {
  const queryClient = useQueryClient();
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Fetch user tasks
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', CURRENT_USER_ID],
    queryFn: () => getUserTasks(CURRENT_USER_ID, { include_archived: false }),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch selected task details
  const { data: selectedTask } = useQuery({
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
      // Select the new task
      setSelectedTaskId(newTask.id);
      // Connect to SSE stream
      connect(newTask.id);
    },
  });

  // Review task mutation
  const reviewTaskMutation = useMutation({
    mutationFn: ({ taskId, action, feedback }: { taskId: number; action: 'approve' | 'reject'; feedback?: string }) =>
      reviewTask(taskId, { action, feedback }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', CURRENT_USER_ID] });
      queryClient.invalidateQueries({ queryKey: ['task', selectedTaskId] });
    },
  });

  // Load historical events when task is selected
  const loadTaskHistory = useCallback(async (taskId: number) => {
    try {
      const events = await getTaskEvents(taskId);
      // Convert events to chat messages
      const historyMessages: ChatMessage[] = events.map((event: any, index: number) => {
        if (event.role === 'user') {
          return {
            id: `history-${event.id || index}`,
            type: 'user' as const,
            content: event.content,
            timestamp: event.created_at || new Date().toISOString(),
          };
        } else if (event.role === 'assistant') {
          return {
            id: `history-${event.id || index}`,
            type: 'assistant' as const,
            content: event.content,
            agent: event.meta?.agent || 'assistant',
            timestamp: event.created_at || new Date().toISOString(),
          };
        } else if (event.role === 'thought') {
          return {
            id: `history-${event.id || index}`,
            type: 'thought' as const,
            content: event.content,
            agent: event.meta?.agent,
            timestamp: event.created_at || new Date().toISOString(),
          };
        } else if (event.role === 'tool_use') {
          const meta = typeof event.meta === 'string' ? JSON.parse(event.meta) : event.meta;
          return {
            id: `history-${event.id || index}`,
            type: 'tool_call' as const,
            content: event.content,
            toolName: meta?.tool_name || 'unknown',
            toolInput: meta?.input,
            agent: meta?.agent,
            timestamp: event.created_at || new Date().toISOString(),
          };
        } else if (event.role === 'tool_result') {
          const meta = typeof event.meta === 'string' ? JSON.parse(event.meta) : event.meta;
          return {
            id: `history-${event.id || index}`,
            type: 'tool_result' as const,
            content: event.content,
            toolName: meta?.tool_name || 'unknown',
            toolResult: event.content,
            toolSuccess: meta?.success ?? true,
            agent: meta?.agent,
            timestamp: event.created_at || new Date().toISOString(),
          };
        }
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
    
    // Load task history
    const history = await loadTaskHistory(task.id);
    history.forEach(msg => {
      // We need to add messages to state, but since we cleared, we start fresh
    });
    
    // Connect to SSE if task is running
    if (['running', 'pending'].includes(task.status)) {
      connect(task.id);
    }
  }, [disconnect, clearMessages, loadTaskHistory, connect]);

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

  // Handle review actions
  const handleApprove = async (feedback?: string) => {
    if (!selectedTaskId) return;
    await reviewTaskMutation.mutateAsync({
      taskId: selectedTaskId,
      action: 'approve',
      feedback,
    });
  };

  const handleReject = async (feedback?: string) => {
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

  // Determine if input should be disabled
  const isInputDisabled = selectedTask?.status === 'archived' || 
                          selectedTask?.status === 'awaiting_review';

  // Show review panel for awaiting_review status
  const showReviewPanel = selectedTask?.status === 'awaiting_review' || 
                          currentStatus === 'awaiting_review';

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
            onClick={() => {
              disconnect();
              clearMessages();
              setSelectedTaskId(null);
            }}
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
          isLoading={isConnected && currentStatus === 'running'} 
        />

        {/* Error Banner */}
        {streamError && (
          <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20">
            <p className="text-sm text-destructive">{streamError}</p>
          </div>
        )}

        {/* Review Panel */}
        {showReviewPanel && (
          <ReviewPanel
            onApprove={handleApprove}
            onReject={handleReject}
            isLoading={reviewTaskMutation.isPending}
          />
        )}

        {/* Input Area */}
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
      </div>
    </div>
  );
}
