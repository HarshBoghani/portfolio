import { NextResponse } from 'next/server';
import { manualSeed } from '@/lib/views-kv';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const success = await manualSeed();

    if (success) {
      return NextResponse.json({
        message: 'Data seeded successfully',
        success: true,
      });
    } else {
      return NextResponse.json(
        {
          message: 'Failed to seed data',
          success: false,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Seed endpoint error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
