'use client';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';

interface MessageBubbleProps {
  content: string;
  isUser: boolean;
  agent?: string;
  timestamp?: string;
}

/**
 * Message bubble component for user and assistant messages
 */
export function MessageBubble({ content, isUser, agent, timestamp }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        'flex gap-3 max-w-[85%]',
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback
          className={cn(
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white'
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div
        className={cn(
          'flex flex-col gap-1',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        {/* Agent name for assistant messages */}
        {!isUser && agent && (
          <span className="text-xs text-muted-foreground capitalize px-1">
            {agent}
          </span>
        )}

        {/* Bubble */}
        <div
          className={cn(
            'px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
            isUser
              ? 'bg-blue-600 text-white rounded-br-md'
              : 'bg-muted text-foreground rounded-bl-md'
          )}
        >
          {content}
        </div>

        {/* Timestamp */}
        {timestamp && (
          <span className="text-[10px] text-muted-foreground/60 px-1">
            {new Date(timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}
