'use client';

import { useState } from 'react';
import { ChevronRight, Wrench, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface ToolCallLogProps {
  toolName: string;
  toolInput?: Record<string, unknown>;
  agent?: string;
  timestamp?: string;
  isPending?: boolean;
}

interface ToolResultLogProps {
  toolName: string;
  result: string;
  success: boolean;
  agent?: string;
  timestamp?: string;
}

/**
 * Tool call display component
 * Shows the tool being called and its parameters
 */
export function ToolCallLog({ 
  toolName, 
  toolInput, 
  agent, 
  timestamp,
  isPending = false 
}: ToolCallLogProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Format tool input for display
  const formatInput = () => {
    if (!toolInput) return 'No parameters';
    try {
      return JSON.stringify(toolInput, null, 2);
    } catch {
      return String(toolInput);
    }
  };

  return (
    <div className="w-full max-w-[90%] mr-auto">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
              'bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20',
              'cursor-pointer text-left'
            )}
          >
            {/* Icon and Title */}
            <div className="flex items-center gap-2 flex-1">
              {isPending ? (
                <Loader2 className="h-4 w-4 text-orange-400 animate-spin" />
              ) : (
                <Wrench className="h-4 w-4 text-orange-400" />
              )}
              <span className="text-sm text-orange-300 font-medium">
                🛠️ Calling
              </span>
              <code className="text-sm text-orange-200 bg-orange-500/20 px-1.5 py-0.5 rounded font-mono">
                {toolName}
              </code>
              {agent && (
                <span className="text-xs text-orange-400/60 capitalize">
                  ({agent})
                </span>
              )}
            </div>

            {/* Chevron */}
            <ChevronRight
              className={cn(
                'h-4 w-4 text-orange-400 transition-transform duration-200',
                isOpen && 'rotate-90'
              )}
            />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="mt-1 ml-6 px-3 py-2 rounded-lg bg-muted/50 border border-border/50">
            <div className="text-xs text-muted-foreground mb-1">Input:</div>
            <pre className="text-xs text-foreground/80 bg-background/50 p-2 rounded overflow-x-auto font-mono">
              {formatInput()}
            </pre>
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

/**
 * Tool result display component
 * Shows the result of a tool execution
 */
export function ToolResultLog({ 
  toolName, 
  result, 
  success, 
  agent, 
  timestamp 
}: ToolResultLogProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Truncate result for preview
  const previewResult = result.length > 100 
    ? result.slice(0, 100) + '...' 
    : result;

  return (
    <div className="w-full max-w-[90%] mr-auto">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer text-left',
              success
                ? 'bg-green-500/10 hover:bg-green-500/20 border border-green-500/20'
                : 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/20'
            )}
          >
            {/* Icon and Title */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {success ? (
                <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400 shrink-0" />
              )}
              <code
                className={cn(
                  'text-sm px-1.5 py-0.5 rounded font-mono shrink-0',
                  success
                    ? 'text-green-200 bg-green-500/20'
                    : 'text-red-200 bg-red-500/20'
                )}
              >
                {toolName}
              </code>
              <span
                className={cn(
                  'text-xs truncate',
                  success ? 'text-green-300/70' : 'text-red-300/70'
                )}
              >
                {previewResult}
              </span>
            </div>

            {/* Chevron */}
            <ChevronRight
              className={cn(
                'h-4 w-4 transition-transform duration-200 shrink-0',
                success ? 'text-green-400' : 'text-red-400',
                isOpen && 'rotate-90'
              )}
            />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="mt-1 ml-6 px-3 py-2 rounded-lg bg-muted/50 border border-border/50">
            <div className="text-xs text-muted-foreground mb-1">Result:</div>
            <pre className="text-xs text-foreground/80 bg-background/50 p-2 rounded overflow-x-auto max-h-[200px] overflow-y-auto font-mono whitespace-pre-wrap">
              {result}
            </pre>
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
