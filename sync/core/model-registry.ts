/**
 * ============================================================
 * Model Registry
 * ============================================================
 *
 * Like Linear's ModelRegistry, this stores metadata about all models.
 *
 * In Linear, TypeScript decorators register models:
 *   @ClientModel("Issue")
 *   class Issue extends Model { ... }
 *
 * We use a simpler functional approach: defineModel()
 *
 * The registry is used to:
 * - Validate data before storing
 * - Create IndexedDB object stores with correct indexes
 * - Generate schema hashes for migration detection
 */

import { ModelMeta, ModelName, PropertyMeta } from './types';

class ModelRegistryClass {
  private models: Map<ModelName, ModelMeta> = new Map();

  /** Register a model with its metadata */
  register(meta: ModelMeta): void {
    if (this.models.has(meta.name)) {
      console.warn(`[ModelRegistry] Model "${meta.name}" already registered.`);
    }
    this.models.set(meta.name, meta);
  }

  /** Get metadata for a model */
  get(name: ModelName): ModelMeta | undefined {
    return this.models.get(name);
  }

  /** Get all registered models */
  getAll(): ModelMeta[] {
    return Array.from(this.models.values());
  }

  /** Check if a model is registered */
  has(name: ModelName): boolean {
    return this.models.has(name);
  }

  /** Get indexed properties for a model (used for IndexedDB indexes) */
  getIndexedProperties(name: ModelName): PropertyMeta[] {
    const model = this.models.get(name);
    if (!model) return [];
    return model.properties.filter((p) => p.indexed);
  }

  /**
   * Generate a schema hash for migration detection.
   * Like Linear's __schemaHash, this changes when models or properties change.
   * If the hash changes, the local IndexedDB needs to be rebuilt.
   */
  getSchemaHash(): string {
    const schema = this.getAll()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((m) => ({
        name: m.name,
        properties: m.properties
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(
            (p) =>
              `${p.name}:${p.type}:${p.indexed ?? false}:${p.nullable ?? false}`
          ),
      }));

    // Simple hash using btoa - in production, use a proper hash function
    if (typeof btoa !== 'undefined') {
      return btoa(JSON.stringify(schema)).slice(0, 16);
    }
    // Node.js fallback
    return Buffer.from(JSON.stringify(schema)).toString('base64').slice(0, 16);
  }

  /** Clear all registered models (useful for testing) */
  clear(): void {
    this.models.clear();
  }
}

/** Singleton model registry */
export const ModelRegistry = new ModelRegistryClass();

/**
 * Define and register a model.
 *
 * Usage:
 * ```
 * const TaskModel = defineModel({
 *   name: 'Task',
 *   properties: [
 *     { name: 'title', type: 'string' },
 *     { name: 'status', type: 'string', indexed: true },
 *     { name: 'priority', type: 'number' },
 *   ],
 * });
 * ```
 */
export function defineModel(meta: ModelMeta): ModelMeta {
  ModelRegistry.register(meta);
  return meta;
}
