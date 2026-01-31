'use client';

import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './message-bubble';
import { ThoughtLog } from './thought-log';
import { ToolCallLog, ToolResultLog } from './tool-call-log';
import { StatusIndicator } from './status-indicator';
import { ErrorMessage } from './error-message';
import { Bot, MessageSquare } from 'lucide-react';
import type { ChatMessage } from '@/types/sse';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

/**
 * Chat messages container with auto-scroll
 */
export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

      default:
        return null;
    }
  };

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
    <ScrollArea className="flex-1" ref={scrollAreaRef}>
      <div className="flex flex-col gap-4 p-4">
        {messages.map(renderMessage)}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
