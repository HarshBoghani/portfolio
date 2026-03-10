import { NextResponse } from 'next/server';
import { getMainPageViews } from '@/lib/views-kv';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const views = await getMainPageViews();
    return NextResponse.json({ views });
  } catch (error) {
    console.error('Error fetching main page views:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
