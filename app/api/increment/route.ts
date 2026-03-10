import { NextResponse, NextRequest } from 'next/server';
import { incrementProjectViews } from '@/lib/views-kv';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const idParam: string = body.id;

    if (!idParam) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const newViews = await incrementProjectViews(idParam);

    return NextResponse.json({ views: newViews, project: idParam });
  } catch (error) {
    console.error('Error incrementing views:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
