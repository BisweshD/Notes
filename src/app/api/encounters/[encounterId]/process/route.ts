import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { processEncounter } from '@/lib/pipeline/encounter-pipeline';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ encounterId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { encounterId } = await params;

  try {
    const result = await processEncounter(encounterId);

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Processing complete' });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Process route error:', error);
    return NextResponse.json(
      { error: 'Failed to process encounter' },
      { status: 500 },
    );
  }
}
