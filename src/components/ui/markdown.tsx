'use client';

import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface MarkdownProps {
  content: string;
  className?: string;
}

/**
 * Markdown renderer component with styled elements
 */
export function Markdown({ content, className }: MarkdownProps) {
  return (
    <ReactMarkdown
      className={cn(
        'prose prose-sm dark:prose-invert max-w-none',
        'prose-p:leading-relaxed prose-p:my-2',
        'prose-headings:font-semibold prose-headings:tracking-tight',
        'prose-h1:text-xl prose-h2:text-lg prose-h3:text-base',
        'prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono',
        'prose-pre:bg-muted prose-pre:border prose-pre:rounded-lg prose-pre:p-3',
        'prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5',
        'prose-blockquote:border-l-2 prose-blockquote:border-muted-foreground/30 prose-blockquote:pl-4 prose-blockquote:italic',
        'prose-a:text-primary prose-a:underline prose-a:underline-offset-2',
        'prose-strong:font-semibold',
        'prose-table:text-sm',
        '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
        className
      )}
      components={{
        // Custom code block rendering
        code: ({ className, children, ...props }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code
                className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          }
          return (
            <code className={cn('block', className)} {...props}>
              {children}
            </code>
          );
        },
        // Custom pre rendering for code blocks
        pre: ({ children, ...props }) => (
          <pre
            className="bg-muted border rounded-lg p-3 overflow-x-auto text-sm"
            {...props}
          >
            {children}
          </pre>
        ),
        // Custom link rendering
        a: ({ children, href, ...props }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:text-primary/80"
            {...props}
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
