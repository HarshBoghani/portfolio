/**
 * ============================================================
 * Redis-Backed Server Store
 * ============================================================
 *
 * Replaces the previous in-memory store with Redis persistence.
 * This solves the Vercel serverless cold-start problem where
 * in-memory state was lost between function invocations.
 *
 * Redis is the SINGLE SOURCE OF TRUTH. IndexedDB on clients
 * is just a cache for showing data in the UI.
 *
 * Redis Data Structure:
 * ─────────────────────────────────────────────────────────────
 * sync:records     → Hash  (field: "Model:RecordId", value: SyncRecord)
 * sync:syncid      → String (atomic counter via INCR)
 * sync:synclog     → Sorted Set (score: syncId, member: JSON DeltaSyncAction)
 * ─────────────────────────────────────────────────────────────
 *
 * Conflict Resolution (offline ↔ online):
 * ─────────────────────────────────────────────────────────────
 * 1. UPDATE on a DELETED record → Resurrect (un-delete + apply changes)
 *    Rationale: The offline user actively edited this record,
 *    so their intent is to keep it alive with changes.
 *
 * 2. CREATE when record already exists → Treat as UPDATE (merge)
 *    Rationale: Duplicate create from offline flush retry.
 *
 * 3. DELETE on already-deleted record → No-op
 *    Rationale: Idempotent delete.
 *
 * 4. If offline user did NOT touch a deleted record → stays deleted
 *    Rationale: No pending transaction means no conflict.
 * ─────────────────────────────────────────────────────────────
 */

import { Redis } from '@upstash/redis';
import {
  SyncRecord,
  Transaction,
  DeltaPacket,
  DeltaSyncAction,
  SyncId,
  BootstrapResponse,
  ModelMeta,
} from '../core/types';

// ============================================================
// Redis Keys
// ============================================================

const RECORDS_KEY = 'sync:records';
const SYNC_ID_KEY = 'sync:syncid';
const SYNC_LOG_KEY = 'sync:synclog';

// ============================================================
// Redis Store Implementation
// ============================================================

class RedisServerStore {
  private redis: Redis | null = null;

  /**
   * Lazily initialize the Redis client.
   * Uses Upstash Redis REST (works in serverless environments).
   */
  private getRedis(): Redis {
    if (!this.redis) {
      if (
        !process.env.UPSTASH_REDIS_REST_URL ||
        !process.env.UPSTASH_REDIS_REST_TOKEN
      ) {
        throw new Error(
          'Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN environment variables'
        );
      }
      this.redis = Redis.fromEnv();
    }
    return this.redis;
  }

  // ============================================================
  // Read Operations
  // ============================================================

  /** Get the current global sync ID */
  async getSyncId(): Promise<SyncId> {
    const redis = this.getRedis();
    const val = await redis.get<number>(SYNC_ID_KEY);
    return val ?? 0;
  }

  /** Get a single record by composite key ("ModelName:RecordId") */
  async getRecord(key: string): Promise<SyncRecord | null> {
    const redis = this.getRedis();
    const raw = await redis.hget<SyncRecord>(RECORDS_KEY, key);
    return raw ?? null;
  }

  /** Get count of non-deleted records for a model */
  async getRecordCount(modelName: string): Promise<number> {
    const redis = this.getRedis();
    const allRecords =
      await redis.hgetall<Record<string, SyncRecord>>(RECORDS_KEY);

    if (!allRecords) return 0;

    let count = 0;
    const prefix = `${modelName}:`;
    for (const [key, value] of Object.entries(allRecords)) {
      if (!key.startsWith(prefix)) continue;
      const record = normalizeRecord(value);
      if (record && !record.deleted) count++;
    }
    return count;
  }

  // ============================================================
  // Write Operations (Transaction Processing)
  // ============================================================

  /**
   * Apply a transaction from a client.
   *
   * Each action gets a new syncId via atomic INCR, ensuring total
   * ordering of all changes across all clients.
   *
   * ── Conflict Resolution ──
   * • UPDATE on deleted record  → resurrect (un-delete + apply)
   * • CREATE on existing record → merge as update
   * • DELETE on deleted record  → no-op
   */
  async applyTransaction(transaction: Transaction): Promise<DeltaPacket> {
    const redis = this.getRedis();
    const deltaActions: DeltaSyncAction[] = [];

    for (const action of transaction.actions) {
      // Atomically increment the global sync ID
      const syncId = await redis.incr(SYNC_ID_KEY);
      const key = `${action.modelName}:${action.recordId}`;

      switch (action.type) {
        case 'create': {
          const existing = await redis.hget<SyncRecord>(RECORDS_KEY, key);

          if (existing) {
            const existingRecord = normalizeRecord(existing);

            if (existingRecord && !existingRecord.deleted) {
              // Record already exists and is active → treat as update (merge)
              const mergedRecord: SyncRecord = {
                ...existingRecord,
                data: { ...existingRecord.data, ...action.data },
                syncId,
                updatedAt: transaction.timestamp,
              };
              await redis.hset(RECORDS_KEY, { [key]: mergedRecord });

              deltaActions.push({
                syncId,
                type: 'update',
                modelName: action.modelName,
                recordId: action.recordId,
                data: mergedRecord.data,
              });
            } else if (existingRecord && existingRecord.deleted) {
              // Record was deleted → resurrect with new data
              const resurrectedRecord: SyncRecord = {
                ...existingRecord,
                data: action.data ?? {},
                syncId,
                deleted: false,
                updatedAt: transaction.timestamp,
              };
              await redis.hset(RECORDS_KEY, { [key]: resurrectedRecord });

              deltaActions.push({
                syncId,
                type: 'create',
                modelName: action.modelName,
                recordId: action.recordId,
                data: resurrectedRecord.data,
              });
            }
          } else {
            // Brand new record
            const record: SyncRecord = {
              id: action.recordId,
              modelName: action.modelName,
              data: action.data ?? {},
              syncId,
              deleted: false,
              createdAt: transaction.timestamp,
              updatedAt: transaction.timestamp,
            };
            await redis.hset(RECORDS_KEY, { [key]: record });

            deltaActions.push({
              syncId,
              type: 'create',
              modelName: action.modelName,
              recordId: action.recordId,
              data: record.data,
            });
          }
          break;
        }

        case 'update': {
          const existing = await redis.hget<SyncRecord>(RECORDS_KEY, key);
          const existingRecord = existing ? normalizeRecord(existing) : null;

          if (existingRecord) {
            if (existingRecord.deleted) {
              // ── CONFLICT: Record deleted by another user ──
              // This offline user made changes → resurrect the record.
              // The user's intent to edit overrides the delete.
              const resurrectedRecord: SyncRecord = {
                ...existingRecord,
                data: { ...existingRecord.data, ...action.data },
                syncId,
                deleted: false, // Un-delete!
                updatedAt: transaction.timestamp,
              };
              await redis.hset(RECORDS_KEY, { [key]: resurrectedRecord });

              // Emit as 'create' so all clients get the full record back
              deltaActions.push({
                syncId,
                type: 'create',
                modelName: action.modelName,
                recordId: action.recordId,
                data: resurrectedRecord.data,
              });
            } else {
              // Normal update — Last-Write-Wins
              const updatedRecord: SyncRecord = {
                ...existingRecord,
                data: { ...existingRecord.data, ...action.data },
                syncId,
                updatedAt: transaction.timestamp,
              };
              await redis.hset(RECORDS_KEY, { [key]: updatedRecord });

              deltaActions.push({
                syncId,
                type: 'update',
                modelName: action.modelName,
                recordId: action.recordId,
                data: action.data,
              });
            }
          }
          // If record doesn't exist at all → skip (stale update from very old offline session)
          break;
        }

        case 'delete': {
          const existing = await redis.hget<SyncRecord>(RECORDS_KEY, key);
          const existingRecord = existing ? normalizeRecord(existing) : null;

          if (existingRecord && !existingRecord.deleted) {
            const deletedRecord: SyncRecord = {
              ...existingRecord,
              deleted: true,
              syncId,
              updatedAt: transaction.timestamp,
            };
            await redis.hset(RECORDS_KEY, { [key]: deletedRecord });

            deltaActions.push({
              syncId,
              type: 'delete',
              modelName: action.modelName,
              recordId: action.recordId,
            });
          }
          // If already deleted → no-op (idempotent)
          break;
        }
      }
    }

    // Append delta actions to the sync log (sorted set)
    if (deltaActions.length > 0) {
      const pipeline = redis.pipeline();
      for (const action of deltaActions) {
        pipeline.zadd(SYNC_LOG_KEY, {
          score: action.syncId,
          member: JSON.stringify(action),
        });
      }
      await pipeline.exec();
    }

    const currentSyncId = await this.getSyncId();
    return {
      syncId: currentSyncId,
      actions: deltaActions,
    };
  }

  // ============================================================
  // Delta Sync (Pull)
  // ============================================================

  /**
   * Get all changes since a given syncId.
   *
   * Clients send their lastSyncId, and we return all changes
   * that happened after that point. This is how incremental
   * sync works — the diff-based approach.
   */
  async getDeltaSince(sinceSyncId: SyncId): Promise<DeltaPacket> {
    const redis = this.getRedis();

    // Get all sync log entries with score > sinceSyncId
    // Using sinceSyncId as exclusive lower bound (we want entries AFTER it)
    const raw = await redis.zrange(SYNC_LOG_KEY, sinceSyncId, '+inf', {
      byScore: true,
    });

    // Parse entries — Upstash may return strings or auto-parsed objects
    const actions: DeltaSyncAction[] = [];
    if (Array.isArray(raw)) {
      for (const entry of raw) {
        const parsed = normalizeDeltaAction(entry);
        if (parsed && parsed.syncId > sinceSyncId) {
          actions.push(parsed);
        }
      }
    }

    const currentSyncId = await this.getSyncId();
    return {
      syncId: currentSyncId,
      actions,
    };
  }

  // ============================================================
  // Bootstrap (Full Data Load)
  // ============================================================

  /**
   * Get full bootstrap data.
   *
   * Returns all non-deleted records and the current syncId.
   * Used for initial client load or when client needs to rebuild.
   */
  async getBootstrapData(models: ModelMeta[]): Promise<BootstrapResponse> {
    const redis = this.getRedis();

    const allRaw = await redis.hgetall<Record<string, SyncRecord>>(RECORDS_KEY);

    const records: SyncRecord[] = [];
    if (allRaw) {
      for (const value of Object.values(allRaw)) {
        const record = normalizeRecord(value);
        if (record && !record.deleted) {
          records.push(record);
        }
      }
    }

    const currentSyncId = await this.getSyncId();

    return {
      records,
      syncId: currentSyncId,
      models,
    };
  }

  // ============================================================
  // Debug / Admin
  // ============================================================

  /** Get stats about the store */
  async getStats() {
    const redis = this.getRedis();
    const currentSyncId = await this.getSyncId();
    const allRaw = await redis.hgetall<Record<string, SyncRecord>>(RECORDS_KEY);
    const logSize = await redis.zcard(SYNC_LOG_KEY);

    let totalRecords = 0;
    let activeRecords = 0;

    if (allRaw) {
      for (const value of Object.values(allRaw)) {
        const record = normalizeRecord(value);
        if (record) {
          totalRecords++;
          if (!record.deleted) activeRecords++;
        }
      }
    }

    return {
      syncId: currentSyncId,
      totalRecords,
      activeRecords,
      syncLogSize: logSize,
    };
  }

  /** Reset ALL sync data in Redis (for testing/admin) */
  async reset(): Promise<void> {
    const redis = this.getRedis();
    await redis.del(RECORDS_KEY);
    await redis.del(SYNC_ID_KEY);
    await redis.del(SYNC_LOG_KEY);
  }
}

// ============================================================
// Helpers — Normalize data from Redis
// ============================================================

/**
 * Upstash auto-deserializes JSON values from hashes,
 * but the exact shape can vary. This normalizes to SyncRecord.
 */
function normalizeRecord(value: unknown): SyncRecord | null {
  if (!value) return null;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as SyncRecord;
    } catch {
      return null;
    }
  }
  return value as SyncRecord;
}

/**
 * Normalize a sync log entry from Redis sorted set.
 * Members may come back as strings or auto-parsed objects.
 */
function normalizeDeltaAction(entry: unknown): DeltaSyncAction | null {
  if (!entry) return null;
  if (typeof entry === 'string') {
    try {
      return JSON.parse(entry) as DeltaSyncAction;
    } catch {
      return null;
    }
  }
  return entry as DeltaSyncAction;
}

// ============================================================
// Singleton Export
// ============================================================

/**
 * Global singleton server store backed by Redis.
 *
 * Unlike the previous in-memory store, this persists across
 * Vercel serverless function cold starts. Redis (Upstash) is
 * the single source of truth for all sync data.
 */
export const ServerStore = new RedisServerStore();
