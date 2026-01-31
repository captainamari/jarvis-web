'use client';

import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  timestamp?: string;
}

/**
 * Error message display component
 */
export function ErrorMessage({ message, timestamp }: ErrorMessageProps) {
  return (
    <div className="w-full max-w-[90%] mr-auto">
      <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
        <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
        <div className="flex flex-col gap-1">
          <span className="text-sm text-red-300">{message}</span>
          {timestamp && (
            <span className="text-[10px] text-red-400/50">
              {new Date(timestamp).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
