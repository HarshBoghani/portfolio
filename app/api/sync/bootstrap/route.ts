/**
 * GET /api/sync/bootstrap
 *
 * Full bootstrap endpoint - returns ALL records and current syncId.
 *
 * In Linear's architecture, this is the initial data load that happens
 * when a client connects for the first time (or when the local database
 * needs to be rebuilt).
 *
 * Returns: BootstrapResponse { records, syncId, models }
 */

import { NextResponse } from 'next/server';
import { ServerStore } from '@/sync/server/store';
import { ModelRegistry } from '@/sync/core/model-registry';

// Ensure models are registered on the server side
import '@/sync/models';

// Force dynamic - this route reads from Redis, never static
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await ServerStore.getBootstrapData(ModelRegistry.getAll());

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[API/bootstrap] Error:', error);
    return NextResponse.json({ error: 'Bootstrap failed' }, { status: 500 });
  }
}
