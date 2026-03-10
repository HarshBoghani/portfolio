'use client';

/**
 * ============================================================
 * React Hooks for the Sync Engine
 * ============================================================
 *
 * These hooks connect the SyncEngine to React components.
 *
 * In Linear, MobX is used for reactivity (via `observer` HOC).
 * We use React's built-in hooks + a subscription pattern.
 *
 * Key hooks:
 * - useSyncEngine(): Initialize and access the engine
 * - useModel(): Subscribe to all records of a model
 * - useSearch(): Search/filter records with string matching
 */

import { useState, useEffect, useCallback } from 'react';
import { SyncEngine, SyncEngineEvent } from '../core/sync-engine';
import { SyncRecord, SyncStatus, ModelName } from '../core/types';

// ============================================================
// Singleton Engine Instance
// ============================================================

let engineInstance: SyncEngine | null = null;

/** Get or create the singleton sync engine */
function getEngine(): SyncEngine {
  if (!engineInstance) {
    engineInstance = new SyncEngine();
  }
  return engineInstance;
}

// ============================================================
// useSyncEngine - Initialize and access the engine
// ============================================================

export function useSyncEngine() {
  const engine = getEngine();
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [isReady, setIsReady] = useState(false);
  const [syncId, setSyncId] = useState(0);

  useEffect(() => {
    // Subscribe to ALL events so we can track syncId reactively
    const unsubscribe = engine.subscribe((event: SyncEngineEvent) => {
      if (event.type === 'status-changed') {
        setStatus(event.status);
        // Read latest syncId whenever status changes (push/pull/sync)
        setSyncId(engine.syncId);
      }
      if (event.type === 'bootstrap-complete') {
        setIsReady(true);
        setSyncId(engine.syncId);
      }
      if (
        event.type === 'records-changed' ||
        event.type === 'record-updated' ||
        event.type === 'record-deleted'
      ) {
        // Update syncId whenever records change
        setSyncId(engine.syncId);
      }
    });

    // Initialize the engine (registers models, opens IndexedDB, bootstraps)
    if (!engine.isInitialized) {
      engine.initialize().catch(console.error);
    } else {
      setIsReady(true);
      setStatus(engine.status);
      setSyncId(engine.syncId);
    }

    return () => {
      unsubscribe();
    };
  }, [engine]);

  return {
    engine,
    status,
    isReady,
    syncId,
  };
}

// ============================================================
// useModel - Subscribe to records of a specific model
// ============================================================

export function useModel(modelName: ModelName) {
  const engine = getEngine();
  const [records, setRecords] = useState<SyncRecord[]>([]);

  useEffect(() => {
    // Initial load
    setRecords(engine.getAll(modelName));

    // Subscribe to changes
    const unsubscribe = engine.subscribe((event: SyncEngineEvent) => {
      if (event.type === 'records-changed' && event.modelName === modelName) {
        setRecords([...event.records]);
      }
      if (event.type === 'bootstrap-complete') {
        setRecords(engine.getAll(modelName));
      }
    });

    return unsubscribe;
  }, [engine, modelName]);

  // CRUD operations bound to this model
  const create = useCallback(
    (data: Record<string, unknown>) => engine.create(modelName, data),
    [engine, modelName]
  );

  const update = useCallback(
    (id: string, changes: Record<string, unknown>) =>
      engine.update(modelName, id, changes),
    [engine, modelName]
  );

  const remove = useCallback(
    (id: string) => engine.delete(modelName, id),
    [engine, modelName]
  );

  const getById = useCallback(
    (id: string) => engine.getById(modelName, id),
    [engine, modelName]
  );

  return {
    records,
    create,
    update,
    remove,
    getById,
  };
}

// ============================================================
// useSearch - Search/filter records with string matching
// ============================================================

export function useSearch(modelName: ModelName, field: string) {
  const engine = getEngine();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SyncRecord[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(engine.getAll(modelName));
    } else {
      setResults(engine.search(modelName, field, query));
    }
  }, [engine, modelName, field, query]);

  // Re-run search when records change
  useEffect(() => {
    const unsubscribe = engine.subscribe((event: SyncEngineEvent) => {
      if (event.type === 'records-changed' && event.modelName === modelName) {
        if (!query.trim()) {
          setResults(engine.getAll(modelName));
        } else {
          setResults(engine.search(modelName, field, query));
        }
      }
    });
    return unsubscribe;
  }, [engine, modelName, field, query]);

  return {
    query,
    setQuery,
    results,
  };
}
