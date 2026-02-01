'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './message-bubble';
import { ThoughtLog } from './thought-log';
import { ToolCallLog, ToolResultLog } from './tool-call-log';
import { StatusIndicator } from './status-indicator';
import { ErrorMessage } from './error-message';
import { Button } from '@/components/ui/button';
import { Bot, MessageSquare, ArrowDown, Loader2, AlertTriangle } from 'lucide-react';
import type { ChatMessage } from '@/types/sse';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  isLoadingHistory?: boolean;
}

/**
 * Chat messages container with improved auto-scroll
 */
export function ChatMessages({ messages, isLoading, isLoadingHistory }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);

  // Scroll to bottom function
  const scrollToBottom = useCallback((smooth = true) => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end',
      });
    }
  }, []);

  // Check if user is near the bottom
  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setShowScrollButton(!isNearBottom);
    setIsAutoScrollEnabled(isNearBottom);
  }, []);

  // Auto-scroll when new messages arrive (if enabled)
  useEffect(() => {
    if (isAutoScrollEnabled && messages.length > 0) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        scrollToBottom(true);
      });
    }
  }, [messages, isAutoScrollEnabled, scrollToBottom]);

  // Setup scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (!container) return;

    container.addEventListener('scroll', checkScrollPosition);
    return () => container.removeEventListener('scroll', checkScrollPosition);
  }, [checkScrollPosition]);

  // Handle manual scroll to bottom
  const handleScrollToBottom = () => {
    setIsAutoScrollEnabled(true);
    scrollToBottom(true);
  };

  // Render individual message based on type
  const renderMessage = (message: ChatMessage, index: number) => {
    const isLatest = index === messages.length - 1;

    switch (message.type) {
      case 'user':
        return (
          <MessageBubble
            key={message.id}
            content={message.content}
            isUser={true}
            timestamp={message.timestamp}
          />
        );

      case 'assistant':
        return (
          <MessageBubble
            key={message.id}
            content={message.content}
            isUser={false}
            agent={message.agent}
            timestamp={message.timestamp}
          />
        );

      case 'thought':
        return (
          <ThoughtLog
            key={message.id}
            content={message.content}
            agent={message.agent}
            timestamp={message.timestamp}
            isLatest={isLatest && isLoading}
          />
        );

      case 'tool_call':
        return (
          <ToolCallLog
            key={message.id}
            toolName={message.toolName || 'unknown'}
            toolInput={message.toolInput}
            agent={message.agent}
            timestamp={message.timestamp}
            isPending={isLatest && isLoading}
          />
        );

      case 'tool_result':
        return (
          <ToolResultLog
            key={message.id}
            toolName={message.toolName || 'unknown'}
            result={message.toolResult || message.content}
            success={message.toolSuccess ?? true}
            agent={message.agent}
            timestamp={message.timestamp}
          />
        );

      case 'status':
        return (
          <StatusIndicator
            key={message.id}
            status={message.status || 'unknown'}
            message={message.content}
            hitlQuestion={message.hitlQuestion}
            timestamp={message.timestamp}
          />
        );

      case 'error':
        return (
          <ErrorMessage
            key={message.id}
            message={message.content}
            timestamp={message.timestamp}
          />
        );

      case 'review_feedback':
        // M5: Review feedback from user (rejection with feedback)
        return (
          <div
            key={message.id}
            className="mx-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">
                  Review Feedback
                </p>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Loading history state
  if (isLoadingHistory) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-foreground">
              Loading conversation...
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Retrieving task history and previous messages.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
            <Bot className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-foreground">
              Welcome to Jarvis Workbench
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Create a new task or select an existing one from the sidebar to start a conversation with your AI agents.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Type a message below to create a new task</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative" ref={scrollContainerRef}>
      <ScrollArea className="h-full">
        <div className="flex flex-col gap-4 p-4">
          {messages.map(renderMessage)}
          <div ref={bottomRef} className="h-1" />
        </div>
      </ScrollArea>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <Button
          variant="secondary"
          size="sm"
          className="absolute bottom-4 right-4 rounded-full shadow-lg gap-1.5"
          onClick={handleScrollToBottom}
        >
          <ArrowDown className="h-4 w-4" />
          New messages
        </Button>
      )}
    </div>
  );
}
