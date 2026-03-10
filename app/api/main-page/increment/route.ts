import { NextResponse } from 'next/server';
import { incrementMainPageViews } from '@/lib/views-kv';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const views = await incrementMainPageViews();
    return NextResponse.json({ views });
  } catch (error) {
    console.error('Error incrementing main page views:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
