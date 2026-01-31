'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getTaskStreamUrl } from '@/lib/api';
import type {
  SSEEvent,
  ThoughtEvent,
  ToolCallEvent,
  ToolResultEvent,
  MessageEvent,
  StatusChangeEvent,
  TokenUpdateEvent,
  ErrorEvent,
  ChatMessage,
  TokenStats,
} from '@/types/sse';

interface UseTaskStreamOptions {
  onThought?: (event: ThoughtEvent) => void;
  onToolCall?: (event: ToolCallEvent) => void;
  onToolResult?: (event: ToolResultEvent) => void;
  onMessage?: (event: MessageEvent) => void;
  onStatusChange?: (event: StatusChangeEvent) => void;
  onTokenUpdate?: (event: TokenUpdateEvent) => void;
  onError?: (event: ErrorEvent) => void;
  onConnected?: () => void;
  onClose?: (reason?: string) => void;
}

interface UseTaskStreamReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  
  // Data state
  messages: ChatMessage[];
  tokenStats: TokenStats | null;
  currentStatus: string | null;
  
  // Actions
  connect: (taskId: number) => void;
  disconnect: () => void;
  clearMessages: () => void;
  addUserMessage: (content: string) => void;
}

/**
 * Custom hook for subscribing to task SSE stream
 */
export function useTaskStream(options: UseTaskStreamOptions = {}): UseTaskStreamReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tokenStats, setTokenStats] = useState<TokenStats | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const taskIdRef = useRef<number | null>(null);
  const reconnectAttemptRef = useRef(0);
  const maxReconnectAttempts = 5;

  /**
   * Convert SSE event to ChatMessage
   */
  const eventToMessage = useCallback((event: SSEEvent): ChatMessage | null => {
    switch (event.type) {
      case 'thought':
        return {
          id: event.event_id,
          type: 'thought',
          content: (event as ThoughtEvent).content.text,
          agent: event.agent,
          timestamp: event.timestamp,
          meta: event.meta,
        };
      
      case 'tool_call':
        const toolCallEvent = event as ToolCallEvent;
        return {
          id: event.event_id,
          type: 'tool_call',
          content: `Calling ${toolCallEvent.content.tool}`,
          agent: event.agent,
          timestamp: event.timestamp,
          toolName: toolCallEvent.content.tool,
          toolInput: toolCallEvent.content.input,
          meta: event.meta,
        };
      
      case 'tool_result':
        const toolResultEvent = event as ToolResultEvent;
        return {
          id: event.event_id,
          type: 'tool_result',
          content: toolResultEvent.content.result,
          agent: event.agent,
          timestamp: event.timestamp,
          toolName: toolResultEvent.content.tool,
          toolResult: toolResultEvent.content.result,
          toolSuccess: toolResultEvent.content.success,
          meta: event.meta,
        };
      
      case 'message':
        return {
          id: event.event_id,
          type: 'assistant',
          content: (event as MessageEvent).content.text,
          agent: event.agent,
          timestamp: event.timestamp,
          meta: event.meta,
        };
      
      case 'status_change':
        const statusEvent = event as StatusChangeEvent;
        return {
          id: event.event_id,
          type: 'status',
          content: statusEvent.content.message || `Status: ${statusEvent.content.status}`,
          agent: event.agent,
          timestamp: event.timestamp,
          status: statusEvent.content.status,
          previousStatus: statusEvent.content.previous_status,
          hitlQuestion: statusEvent.content.question,
          meta: event.meta,
        };
      
      case 'error':
        return {
          id: event.event_id,
          type: 'error',
          content: (event as ErrorEvent).content.message,
          agent: event.agent,
          timestamp: event.timestamp,
          meta: event.meta,
        };
      
      default:
        return null;
    }
  }, []);

  /**
   * Handle incoming SSE events
   */
  const handleEvent = useCallback((eventType: string, data: string) => {
    try {
      const parsed = JSON.parse(data);
      
      switch (eventType) {
        case 'connected':
          setIsConnected(true);
          setIsConnecting(false);
          setError(null);
          reconnectAttemptRef.current = 0;
          options.onConnected?.();
          break;
        
        case 'heartbeat':
          // Heartbeat - just acknowledge connection is alive
          break;
        
        case 'thought':
          const thoughtEvent = parsed as ThoughtEvent;
          const thoughtMsg = eventToMessage(thoughtEvent);
          if (thoughtMsg) setMessages(prev => [...prev, thoughtMsg]);
          options.onThought?.(thoughtEvent);
          break;
        
        case 'tool_call':
          const toolCallEvent = parsed as ToolCallEvent;
          const toolCallMsg = eventToMessage(toolCallEvent);
          if (toolCallMsg) setMessages(prev => [...prev, toolCallMsg]);
          options.onToolCall?.(toolCallEvent);
          break;
        
        case 'tool_result':
          const toolResultEvent = parsed as ToolResultEvent;
          const toolResultMsg = eventToMessage(toolResultEvent);
          if (toolResultMsg) setMessages(prev => [...prev, toolResultMsg]);
          options.onToolResult?.(toolResultEvent);
          break;
        
        case 'message':
          const messageEvent = parsed as MessageEvent;
          const messageMsg = eventToMessage(messageEvent);
          if (messageMsg) setMessages(prev => [...prev, messageMsg]);
          options.onMessage?.(messageEvent);
          break;
        
        case 'status_change':
          const statusEvent = parsed as StatusChangeEvent;
          setCurrentStatus(statusEvent.content.status);
          const statusMsg = eventToMessage(statusEvent);
          if (statusMsg) setMessages(prev => [...prev, statusMsg]);
          options.onStatusChange?.(statusEvent);
          
          // Auto-close on terminal states
          if (['archived', 'failed'].includes(statusEvent.content.status)) {
            disconnect();
          }
          break;
        
        case 'token_update':
          const tokenEvent = parsed as TokenUpdateEvent;
          setTokenStats({
            inputTokens: tokenEvent.content.input_tokens,
            outputTokens: tokenEvent.content.output_tokens,
            cost: tokenEvent.content.cost,
            cumulativeTokens: tokenEvent.content.cumulative_tokens,
            cumulativeCost: tokenEvent.content.cumulative_cost,
            model: tokenEvent.content.model,
          });
          options.onTokenUpdate?.(tokenEvent);
          break;
        
        case 'error':
          const errorEvent = parsed as ErrorEvent;
          const errorMsg = eventToMessage(errorEvent);
          if (errorMsg) setMessages(prev => [...prev, errorMsg]);
          setError(errorEvent.content.message);
          options.onError?.(errorEvent);
          break;
        
        case 'close':
          const reason = parsed.reason;
          setIsConnected(false);
          options.onClose?.(reason);
          break;
      }
    } catch (err) {
      console.error('Failed to parse SSE event:', err);
    }
  }, [eventToMessage, options]);

  /**
   * Connect to SSE stream
   */
  const connect = useCallback((taskId: number) => {
    // Disconnect existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    taskIdRef.current = taskId;
    setIsConnecting(true);
    setError(null);
    
    const url = getTaskStreamUrl(taskId);
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;
    
    // Register event listeners for all event types
    const eventTypes = [
      'connected',
      'heartbeat',
      'thought',
      'tool_call',
      'tool_result',
      'message',
      'status_change',
      'token_update',
      'error',
      'close',
    ];
    
    eventTypes.forEach(eventType => {
      eventSource.addEventListener(eventType, (e: MessageEvent) => {
        handleEvent(eventType, e.data);
      });
    });
    
    // Handle SSE connection errors
    eventSource.onerror = () => {
      setIsConnected(false);
      setIsConnecting(false);
      
      // Attempt reconnection with exponential backoff
      if (reconnectAttemptRef.current < maxReconnectAttempts && taskIdRef.current) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptRef.current), 30000);
        reconnectAttemptRef.current++;
        
        setError(`Connection lost. Reconnecting in ${delay / 1000}s...`);
        
        setTimeout(() => {
          if (taskIdRef.current) {
            connect(taskIdRef.current);
          }
        }, delay);
      } else {
        setError('Connection failed. Please refresh the page.');
        eventSource.close();
      }
    };
  }, [handleEvent]);

  /**
   * Disconnect from SSE stream
   */
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    taskIdRef.current = null;
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setTokenStats(null);
    setCurrentStatus(null);
    setError(null);
  }, []);

  /**
   * Add a user message (for display before task creation)
   */
  const addUserMessage = useCallback((content: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    error,
    messages,
    tokenStats,
    currentStatus,
    connect,
    disconnect,
    clearMessages,
    addUserMessage,
  };
}
