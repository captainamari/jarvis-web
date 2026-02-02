'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2, Sparkles } from 'lucide-react';
import { createTask } from '@/lib/api';
import { CURRENT_USER_ID } from '@/config';
import { AVAILABLE_AGENTS, type AgentName, type Task, type TaskId } from '@/types/task';

interface CreateTaskDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: (taskId: TaskId) => void;
  // 支持受控模式
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onTaskCreated?: (task: Task) => void;
}

export function CreateTaskDialog({ 
  trigger, 
  onSuccess,
  open: controlledOpen,
  onOpenChange,
  onTaskCreated,
}: CreateTaskDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [agentName, setAgentName] = useState<AgentName>('secretary');
  
  // 支持受控和非受控模式
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (isControlled) {
      onOpenChange?.(value);
    } else {
      setInternalOpen(value);
    }
  };
  
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: (data) => {
      // Invalidate tasks query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      // Reset form
      setDescription('');
      setAgentName('secretary');
      setOpen(false);
      
      // Callbacks
      onSuccess?.(data.id);
      onTaskCreated?.(data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) return;

    mutation.mutate({
      user_id: CURRENT_USER_ID,
      description: description.trim(),
      agent_name: agentName,
    });
  };

  const isValid = description.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Create New Task
            </DialogTitle>
            <DialogDescription>
              Describe what you want Jarvis to do. The task will be assigned to the selected agent.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Task Description</Label>
              <Textarea
                id="description"
                placeholder="E.g., Analyze today's stock market trends..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="resize-none"
                disabled={mutation.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Be specific about what you want to accomplish.
              </p>
            </div>

            {/* Agent Selection */}
            <div className="grid gap-2">
              <Label htmlFor="agent">Agent</Label>
              <Select
                value={agentName}
                onValueChange={(value) => setAgentName(value as AgentName)}
                disabled={mutation.isPending}
              >
                <SelectTrigger id="agent">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_AGENTS.map((agent) => (
                    <SelectItem key={agent.value} value={agent.value}>
                      <div className="flex flex-col">
                        <span>{agent.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {agent.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Error Message */}
          {mutation.isError && (
            <p className="text-sm text-red-500 mb-4">
              {mutation.error instanceof Error
                ? mutation.error.message
                : 'Failed to create task'}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Task
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
