/**
 * POST /api/sync/push
 *
 * Push endpoint - receives a Transaction from a client and applies it.
 *
 * Flow:
 * 1. Client sends a transaction (one or more actions)
 * 2. Server validates (title length, profanity, max record count)
 * 3. Server applies to Redis with conflict resolution:
 *    - UPDATE on deleted record → resurrect
 *    - CREATE on existing → merge as update
 *    - DELETE on already-deleted → no-op
 * 4. Server returns a DeltaPacket
 * 5. Other clients pick up changes via polling (pull endpoint)
 *
 * Validation (Zod):
 * - Task title: max 75 chars
 * - Total tasks: max 100
 *
 * Request body: PushRequest { transaction }
 * Response: PushResponse { success, delta, error? }
 */

import { NextResponse } from 'next/server';
import { ServerStore } from '@/sync/server/store';
import { PushRequest, PushResponse } from '@/sync/core/types';
import {
  taskCreateSchema,
  taskUpdateSchema,
  MAX_TOTAL_TODOS,
} from '@/lib/sync-task-schema';
import { isProfane } from '@/lib/bad-words-filter';

// Ensure models are registered
import '@/sync/models';

// Force dynamic - mutates Redis store
export const dynamic = 'force-dynamic';

const TASK_MODEL = 'Task';

/**
 * Validate a transaction before applying it.
 * Now async because getRecordCount reads from Redis.
 */
async function validateTransaction(
  transaction: PushRequest['transaction']
): Promise<string | null> {
  if (!transaction?.actions?.length) return null;

  let newTaskCreates = 0;

  for (const action of transaction.actions) {
    if (action.modelName !== TASK_MODEL) continue;

    switch (action.type) {
      case 'create': {
        const parsed = taskCreateSchema.safeParse(action.data ?? {});
        if (!parsed.success) {
          return parsed.error.issues[0]?.message ?? 'Invalid task data';
        }
        if (isProfane(parsed.data.title)) {
          return 'Please use appropriate language';
        }
        newTaskCreates++;
        break;
      }
      case 'update': {
        const data = action.data ?? {};
        if (Object.keys(data).length === 0) continue;
        const parsed = taskUpdateSchema.safeParse(data);
        if (!parsed.success) {
          return parsed.error.issues[0]?.message ?? 'Invalid task update';
        }
        if (parsed.data.title !== undefined && isProfane(parsed.data.title)) {
          return 'Please use appropriate language';
        }
        break;
      }
      case 'delete':
        break;
    }
  }

  // Check record count limit (async - reads from Redis)
  const currentCount = await ServerStore.getRecordCount(TASK_MODEL);
  if (currentCount + newTaskCreates > MAX_TOTAL_TODOS) {
    return `Maximum ${MAX_TOTAL_TODOS} tasks allowed`;
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body: PushRequest = await request.json();
    const currentSyncId = await ServerStore.getSyncId();

    if (!body.transaction) {
      return NextResponse.json(
        {
          success: false,
          delta: { syncId: currentSyncId, actions: [] },
          error: 'Missing transaction',
        } satisfies PushResponse,
        { status: 400 }
      );
    }

    if (!body.transaction.actions || body.transaction.actions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          delta: { syncId: currentSyncId, actions: [] },
          error: 'Transaction has no actions',
        } satisfies PushResponse,
        { status: 400 }
      );
    }

    const validationError = await validateTransaction(body.transaction);
    if (validationError) {
      const latestSyncId = await ServerStore.getSyncId();
      return NextResponse.json(
        {
          success: false,
          delta: { syncId: latestSyncId, actions: [] },
          error: validationError,
        } satisfies PushResponse,
        { status: 400 }
      );
    }

    // Apply the transaction to Redis — this is where syncIds get assigned
    // and conflict resolution (offline vs online) happens
    const delta = await ServerStore.applyTransaction(body.transaction);

    const response: PushResponse = {
      success: true,
      delta,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API/push] Error:', error);
    return NextResponse.json(
      {
        success: false,
        delta: { syncId: 0, actions: [] },
        error: 'Push failed',
      } satisfies PushResponse,
      { status: 500 }
    );
  }
}
