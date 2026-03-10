/**
 * ============================================================
 * Local Database (IndexedDB Wrapper)
 * ============================================================
 *
 * Like Linear's use of IndexedDB for client-side persistence.
 *
 * In Linear's architecture:
 * - `linear_databases`: Stores info about other databases
 * - `linear_(hash)`: Contains workspace data with tables per model
 * - `_meta`: Stores persistence state and sync metadata
 *
 * Our simplified version:
 * - One database: `sync_engine`
 * - One object store per model
 * - `_meta` store for sync metadata (lastSyncId, schemaHash)
 * - `_pending_transactions` for offline queue
 *
 * Key responsibilities:
 * 1. Store synced records for offline access
 * 2. Cache pending transactions that haven't been pushed to server
 * 3. Store sync metadata (lastSyncId)
 */

import { ModelRegistry } from './model-registry';
import { SyncRecord, Transaction, SyncId } from './types';

const DB_NAME = 'sync_engine';
const DB_VERSION = 1;
const META_STORE = '_meta';
const PENDING_TX_STORE = '_pending_transactions';

export class LocalDatabase {
  private db: IDBDatabase | null = null;

  /**
   * Open (or create) the IndexedDB database.
   *
   * Like Linear's Database.open, this:
   * 1. Creates the database if it doesn't exist
   * 2. Creates object stores for each registered model
   * 3. Creates indexes for indexed properties
   */
  async open(): Promise<void> {
    return new Promise((resolve, reject) => {
      const models = ModelRegistry.getAll();
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create _meta store for sync metadata
        if (!db.objectStoreNames.contains(META_STORE)) {
          db.createObjectStore(META_STORE, { keyPath: 'key' });
        }

        // Create _pending_transactions store (offline queue)
        if (!db.objectStoreNames.contains(PENDING_TX_STORE)) {
          db.createObjectStore(PENDING_TX_STORE, { keyPath: 'id' });
        }

        // Create a store for each registered model
        for (const model of models) {
          if (!db.objectStoreNames.contains(model.name)) {
            const store = db.createObjectStore(model.name, { keyPath: 'id' });

            // Create indexes for indexed properties
            const indexedProps = ModelRegistry.getIndexedProperties(model.name);
            for (const prop of indexedProps) {
              store.createIndex(prop.name, `data.${prop.name}`, {
                unique: false,
              });
            }

            // Always index by syncId for efficient delta queries
            store.createIndex('syncId', 'syncId', { unique: false });
          }
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = (event) => {
        reject(
          new Error(
            `Failed to open IndexedDB: ${(event.target as IDBOpenDBRequest).error}`
          )
        );
      };
    });
  }

  // ============================================================
  // Record Operations
  // ============================================================

  /** Store or update a single record */
  async putRecord(record: SyncRecord): Promise<void> {
    return this.withTransaction(record.modelName, 'readwrite', (store) => {
      store.put(record);
    });
  }

  /** Store multiple records in a batch (grouped by model) */
  async putRecords(records: SyncRecord[]): Promise<void> {
    if (records.length === 0) return;

    // Group records by model name
    const grouped = new Map<string, SyncRecord[]>();
    for (const record of records) {
      const list = grouped.get(record.modelName) || [];
      list.push(record);
      grouped.set(record.modelName, list);
    }

    // Write each group in parallel
    const promises: Promise<void>[] = [];
    for (const [modelName, modelRecords] of Array.from(grouped.entries())) {
      promises.push(
        this.withTransaction(modelName, 'readwrite', (store) => {
          for (const record of modelRecords) {
            store.put(record);
          }
        })
      );
    }
    await Promise.all(promises);
  }

  /** Get a single record by ID */
  async getRecord(
    modelName: string,
    id: string
  ): Promise<SyncRecord | undefined> {
    return this.withTransactionResult(modelName, 'readonly', (store) => {
      return store.get(id);
    });
  }

  /** Get all records for a model */
  async getAllRecords(modelName: string): Promise<SyncRecord[]> {
    return this.withTransactionResult(modelName, 'readonly', (store) => {
      return store.getAll();
    });
  }

  /** Delete a record */
  async deleteRecord(modelName: string, id: string): Promise<void> {
    return this.withTransaction(modelName, 'readwrite', (store) => {
      store.delete(id);
    });
  }

  // ============================================================
  // Sync Metadata
  // ============================================================

  /** Get the last confirmed syncId from the server */
  async getLastSyncId(): Promise<SyncId> {
    const result = await this.withTransactionResult<{
      key: string;
      value: number;
    }>(META_STORE, 'readonly', (store) => {
      return store.get('lastSyncId');
    });
    return result?.value ?? 0;
  }

  /** Set the last confirmed syncId */
  async setLastSyncId(syncId: SyncId): Promise<void> {
    return this.withTransaction(META_STORE, 'readwrite', (store) => {
      store.put({ key: 'lastSyncId', value: syncId });
    });
  }

  // ============================================================
  // Pending Transactions (Offline Queue)
  // ============================================================

  /** Add a transaction to the offline queue */
  async addPendingTransaction(tx: Transaction): Promise<void> {
    return this.withTransaction(PENDING_TX_STORE, 'readwrite', (store) => {
      store.put(tx);
    });
  }

  /** Get all pending transactions (for flushing) */
  async getPendingTransactions(): Promise<Transaction[]> {
    return this.withTransactionResult(PENDING_TX_STORE, 'readonly', (store) => {
      return store.getAll();
    });
  }

  /** Remove a transaction from the offline queue (after successful push) */
  async removePendingTransaction(txId: string): Promise<void> {
    return this.withTransaction(PENDING_TX_STORE, 'readwrite', (store) => {
      store.delete(txId);
    });
  }

  // ============================================================
  // Lifecycle
  // ============================================================

  /** Clear all data (for testing or logout) */
  async clear(): Promise<void> {
    if (!this.db) return;
    const storeNames = Array.from(this.db.objectStoreNames);
    for (const storeName of storeNames) {
      await this.withTransaction(storeName, 'readwrite', (store) => {
        store.clear();
      });
    }
  }

  /** Close the database connection */
  close(): void {
    this.db?.close();
    this.db = null;
  }

  // ============================================================
  // Internal Helpers
  // ============================================================

  private withTransaction(
    storeName: string,
    mode: IDBTransactionMode,
    fn: (store: IDBObjectStore) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not open'));
        return;
      }
      const tx = this.db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      fn(store);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  private withTransactionResult<T>(
    storeName: string,
    mode: IDBTransactionMode,
    fn: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not open'));
        return;
      }
      const tx = this.db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      const request = fn(store);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}
