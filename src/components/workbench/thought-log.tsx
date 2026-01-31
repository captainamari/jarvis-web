'use client';

import { useState } from 'react';
import { ChevronRight, Brain, Loader2 } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface ThoughtLogProps {
  content: string;
  agent?: string;
  timestamp?: string;
  isLatest?: boolean;
}

/**
 * Collapsible thought/reasoning display component
 * Shows agent's thinking process in a collapsed accordion
 */
export function ThoughtLog({ content, agent, timestamp, isLatest = false }: ThoughtLogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full max-w-[90%] mr-auto">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
              'bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20',
              'cursor-pointer text-left'
            )}
          >
            {/* Indicator */}
            <div className="flex items-center gap-2 flex-1">
              {isLatest ? (
                <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
              ) : (
                <Brain className="h-4 w-4 text-purple-400" />
              )}
              <span className="text-sm text-purple-300 font-medium">
                {isLatest ? 'Thinking...' : 'Thought'}
              </span>
              {agent && (
                <span className="text-xs text-purple-400/60 capitalize">
                  ({agent})
                </span>
              )}
            </div>

            {/* Chevron */}
            <ChevronRight
              className={cn(
                'h-4 w-4 text-purple-400 transition-transform duration-200',
                isOpen && 'rotate-90'
              )}
            />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="mt-1 ml-6 px-3 py-2 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {content}
            </p>
            {timestamp && (
              <span className="text-[10px] text-muted-foreground/50 block mt-2">
                {new Date(timestamp).toLocaleTimeString()}
              </span>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
