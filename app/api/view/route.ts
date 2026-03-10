import { NextRequest, NextResponse } from 'next/server';
import { getProjectViews } from '@/lib/views-kv';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const views = await getProjectViews(id);

    return NextResponse.json({ views, project: id });
  } catch (error) {
    console.error('Error fetching view data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
