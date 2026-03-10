/**
 * ============================================================
 * SYNC ENGINE - Core Type Definitions
 * ============================================================
 *
 * Inspired by Linear's sync engine architecture.
 *
 * Key concepts:
 * - SyncId: Monotonically increasing integer representing global version
 *   (like Linear's sync id - ensures total ordering of all changes)
 * - Transactions: Client → Server operations
 * - Delta Packets: Server → Client change broadcasts
 * - Models: Entity definitions with metadata
 *
 * Reference: https://github.com/wzhudev/reverse-linear-sync-engine
 */

// ============================================================
// Sync Primitives
// ============================================================

/** Monotonically increasing integer - the global version number */
export type SyncId = number;

/** Unique identifier for records (UUID v4) */
export type RecordId = string;

/** Model name identifier */
export type ModelName = string;

// ============================================================
// Model Definitions
// ============================================================

/** Supported property types */
export type PropertyType = 'string' | 'number' | 'boolean' | 'datetime';

/** Metadata for a model property */
export interface PropertyMeta {
  name: string;
  type: PropertyType;
  indexed?: boolean;
  nullable?: boolean;
  defaultValue?: unknown;
}

/** Metadata for a model definition */
export interface ModelMeta {
  name: ModelName;
  properties: PropertyMeta[];
}

// ============================================================
// Records
// ============================================================

/** A single record stored in the system */
export interface SyncRecord {
  id: RecordId;
  modelName: ModelName;
  data: Record<string, unknown>;
  syncId: SyncId;
  deleted: boolean;
  createdAt: number; // Unix timestamp (ms)
  updatedAt: number; // Unix timestamp (ms)
}

// ============================================================
// Transactions (Client → Server)
// ============================================================

/** Types of sync actions */
export type SyncActionType = 'create' | 'update' | 'delete';

/** A single action within a transaction */
export interface SyncAction {
  type: SyncActionType;
  modelName: ModelName;
  recordId: RecordId;
  /** For create/update: the data to write */
  data?: Record<string, unknown>;
  /** For update: which fields changed (used for per-field LWW) */
  changedFields?: string[];
}

/**
 * A transaction bundles one or more actions.
 *
 * In Linear, operations on models are packaged into transactions,
 * which are sent to the server, executed there, and then broadcast
 * as delta packets to all connected clients.
 */
export interface Transaction {
  id: string;
  actions: SyncAction[];
  clientId: string;
  timestamp: number;
}

// ============================================================
// Delta Packets (Server → Client)
// ============================================================

/** A single delta action from the server, tagged with its syncId */
export interface DeltaSyncAction {
  syncId: SyncId;
  type: SyncActionType;
  modelName: ModelName;
  recordId: RecordId;
  data?: Record<string, unknown>;
}

/**
 * A delta packet containing all changes since some syncId.
 *
 * In Linear, once transactions are executed, the server broadcasts
 * delta packets to all clients (including the sender) to update models.
 */
export interface DeltaPacket {
  syncId: SyncId;
  actions: DeltaSyncAction[];
}

// ============================================================
// API Types
// ============================================================

/** Full bootstrap response - initial data load */
export interface BootstrapResponse {
  records: SyncRecord[];
  syncId: SyncId;
  models: ModelMeta[];
}

/** Push request - client sends a transaction */
export interface PushRequest {
  transaction: Transaction;
}

/** Push response - server confirms or rejects */
export interface PushResponse {
  success: boolean;
  delta: DeltaPacket;
  error?: string;
}

/** Pull response - server sends deltas since lastSyncId */
export interface PullResponse {
  delta: DeltaPacket;
}

// ============================================================
// Sync Engine State
// ============================================================

export type SyncStatus =
  | 'idle'
  | 'bootstrapping'
  | 'syncing'
  | 'pushing'
  | 'error'
  | 'offline';
