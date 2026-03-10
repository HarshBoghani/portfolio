/**
 * GET /api/sync/pull?sinceSyncId=N
 *
 * Pull endpoint - returns all changes since a given syncId.
 *
 * This is the "delta sync" mechanism (diff-based, not hash-based):
 * - Client sends its lastSyncId
 * - Server returns all actions that happened after that syncId from Redis
 * - Client applies these actions to its local IndexedDB + object pool
 *
 * Since the sync log is persisted in Redis, it survives Vercel
 * serverless cold starts — no more data loss on redeploy.
 *
 * Query params: sinceSyncId (number)
 * Response: PullResponse { delta }
 */

import { NextResponse } from 'next/server';
import { ServerStore } from '@/sync/server/store';
import { PullResponse } from '@/sync/core/types';

// Ensure models are registered
import '@/sync/models';

// Force dynamic - reads from Redis
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sinceSyncId = parseInt(searchParams.get('sinceSyncId') ?? '0', 10);

    if (isNaN(sinceSyncId) || sinceSyncId < 0) {
      return NextResponse.json(
        { error: 'Invalid sinceSyncId parameter' },
        { status: 400 }
      );
    }

    const delta = await ServerStore.getDeltaSince(sinceSyncId);

    const response: PullResponse = { delta };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[API/pull] Error:', error);
    return NextResponse.json({ error: 'Pull failed' }, { status: 500 });
  }
}
