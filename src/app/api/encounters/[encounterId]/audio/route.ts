import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { encounterRepository } from '@/lib/repositories/encounter.repository';
import fs from 'fs';
import path from 'path';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ encounterId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { encounterId } = await params;

  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    const chunkIndex = formData.get('chunkIndex') as string;
    const isFinal = formData.get('isFinal') === 'true';

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Verify encounter exists
    const encounter = encounterRepository.findById(encounterId);
    if (!encounter) {
      return NextResponse.json({ error: 'Encounter not found' }, { status: 404 });
    }

    // Create audio storage directory
    const audioDir = path.resolve(process.cwd(), 'data', 'audio', encounterId);
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    // Save chunk
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const chunkPath = path.join(audioDir, `chunk-${chunkIndex}.webm`);
    fs.writeFileSync(chunkPath, buffer);

    // If final, concatenate all chunks into a single file
    if (isFinal) {
      const finalPath = path.join(audioDir, 'recording.webm');
      fs.writeFileSync(finalPath, buffer); // Final upload is the complete blob

      // Update recording with file path
      const recordings = encounterRepository.findRecordingsByEncounter(encounterId);
      const activeRecording = recordings.find((r) => r.status === 'recording' || r.status === 'completed');

      if (activeRecording) {
        const stats = fs.statSync(finalPath);
        encounterRepository.updateRecording(activeRecording.id, {
          filePath: finalPath,
          fileSizeBytes: stats.size,
          mimeType: audioFile.type || 'audio/webm',
        });
      }
    }

    return NextResponse.json({
      success: true,
      chunkIndex,
      isFinal,
    });
  } catch (error) {
    console.error('Audio upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload audio' },
      { status: 500 },
    );
  }
}
