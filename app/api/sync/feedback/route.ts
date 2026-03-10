/**
 * POST /api/sync/feedback
 *
 * Writes sync demo feedback to Redis. Max 200 chars (ZOD validated).
 */

import { NextResponse } from 'next/server';
import { syncFeedbackSchema } from '@/lib/sync-feedback-schema';
import { pushSyncFeedback } from '@/lib/views-kv';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = syncFeedbackSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Invalid input';
      return NextResponse.json(
        { success: false, error: message },
        { status: 400 }
      );
    }

    const ok = await pushSyncFeedback(parsed.data.message);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: 'Feedback storage unavailable' },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API/sync/feedback] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save feedback' },
      { status: 500 }
    );
  }
}
