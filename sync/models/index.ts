/**
 * Model Registration
 *
 * Import this module to register all models with the ModelRegistry.
 * Models must be registered before the sync engine initializes.
 */

// Register Task model (like Linear's @ClientModel("Issue"))
export {
  TaskModel,
  TaskStatus,
  TaskPriority,
  createTaskData,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from './task';
export type { TaskStatusType, TaskPriorityType } from './task';

// Import to trigger registration
import './task';
