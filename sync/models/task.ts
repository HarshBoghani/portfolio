/**
 * ============================================================
 * Task Model
 * ============================================================
 *
 * Our first synced model - like Linear's "Issue" model.
 *
 * In Linear, models are defined with decorators:
 *   @ClientModel("Issue")
 *   class Issue extends Model {
 *     @Property() title: string;
 *     @Property() status: string;
 *   }
 *
 * We use defineModel() for a simpler, functional approach.
 */

import { defineModel, ModelMeta } from '../core';

/** Task status enum */
export const TaskStatus = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
  CANCELLED: 'cancelled',
} as const;

export type TaskStatusType = (typeof TaskStatus)[keyof typeof TaskStatus];

/** Task priority levels */
export const TaskPriority = {
  NONE: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  URGENT: 4,
} as const;

export type TaskPriorityType = (typeof TaskPriority)[keyof typeof TaskPriority];

/** Register the Task model */
export const TaskModel: ModelMeta = defineModel({
  name: 'Task',
  properties: [
    { name: 'title', type: 'string' },
    { name: 'description', type: 'string', nullable: true },
    { name: 'status', type: 'string', indexed: true },
    { name: 'priority', type: 'number', indexed: true },
    { name: 'labels', type: 'string', nullable: true }, // comma-separated labels
  ],
});

/** Helper: create Task data object */
export function createTaskData(params: {
  title: string;
  description?: string;
  status?: TaskStatusType;
  priority?: TaskPriorityType;
  labels?: string;
}): Record<string, unknown> {
  return {
    title: params.title,
    description: params.description ?? '',
    status: params.status ?? TaskStatus.TODO,
    priority: params.priority ?? TaskPriority.NONE,
    labels: params.labels ?? '',
  };
}

/** Priority labels for display */
export const PRIORITY_LABELS: Record<number, string> = {
  [TaskPriority.NONE]: 'No priority',
  [TaskPriority.LOW]: 'Low',
  [TaskPriority.MEDIUM]: 'Medium',
  [TaskPriority.HIGH]: 'High',
  [TaskPriority.URGENT]: 'Urgent',
};

/** Status labels for display */
export const STATUS_LABELS: Record<string, string> = {
  [TaskStatus.TODO]: 'Todo',
  [TaskStatus.IN_PROGRESS]: 'In Progress',
  [TaskStatus.DONE]: 'Done',
  [TaskStatus.CANCELLED]: 'Cancelled',
};
