import { NextResponse } from 'next/server';
import { incrementSyncPageViews } from '@/lib/views-kv';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const views = await incrementSyncPageViews();
    return NextResponse.json({ views });
  } catch (error) {
    console.error('Error incrementing sync page views:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
