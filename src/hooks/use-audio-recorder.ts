'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { AUDIO_CHUNK_INTERVAL_MS, AUDIO_MIME_TYPE, AUDIO_FALLBACK_MIME_TYPE } from '@/lib/constants';

export type RecorderStatus = 'idle' | 'requesting' | 'recording' | 'paused' | 'stopped' | 'error';

interface UseAudioRecorderOptions {
  encounterId: string;
  recordingId: string | null;
  onChunkUploaded?: (chunkIndex: number) => void;
  onError?: (error: string) => void;
}

interface UseAudioRecorderReturn {
  status: RecorderStatus;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
}

export function useAudioRecorder({
  encounterId,
  recordingId,
  onChunkUploaded,
  onError,
}: UseAudioRecorderOptions): UseAudioRecorderReturn {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunkIndexRef = useRef(0);
  const chunksRef = useRef<Blob[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Warn on page close during recording
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (status === 'recording' || status === 'paused') {
        e.preventDefault();
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [status]);

  const uploadChunk = useCallback(
    async (blob: Blob, index: number, isFinal: boolean) => {
      if (!recordingId) return;

      const formData = new FormData();
      formData.append('audio', blob, `chunk-${index}.webm`);
      formData.append('chunkIndex', index.toString());
      formData.append('isFinal', isFinal.toString());

      try {
        const response = await fetch(`/api/encounters/${encounterId}/audio`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          console.error('Chunk upload failed:', response.status);
        } else {
          onChunkUploaded?.(index);
        }
      } catch (err) {
        console.error('Chunk upload error:', err);
      }
    },
    [encounterId, recordingId, onChunkUploaded],
  );

  const startRecording = useCallback(async () => {
    setError(null);
    setStatus('requesting');
    chunkIndexRef.current = 0;
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;

      // Determine supported MIME type
      const mimeType = MediaRecorder.isTypeSupported(AUDIO_MIME_TYPE)
        ? AUDIO_MIME_TYPE
        : MediaRecorder.isTypeSupported(AUDIO_FALLBACK_MIME_TYPE)
          ? AUDIO_FALLBACK_MIME_TYPE
          : '';

      const recorder = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          const currentIndex = chunkIndexRef.current;
          chunkIndexRef.current += 1;
          uploadChunk(event.data, currentIndex, false);
        }
      };

      recorder.onerror = () => {
        const errMsg = 'Recording error occurred';
        setError(errMsg);
        setStatus('error');
        onError?.(errMsg);
      };

      recorder.onstop = () => {
        // Upload final combined blob
        if (chunksRef.current.length > 0) {
          const finalBlob = new Blob(chunksRef.current, {
            type: mimeType || 'audio/webm',
          });
          uploadChunk(finalBlob, -1, true);
        }

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      recorder.start(AUDIO_CHUNK_INTERVAL_MS);
      mediaRecorderRef.current = recorder;
      setStatus('recording');
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Microphone access denied. Please allow microphone access and try again.'
          : err instanceof DOMException && err.name === 'NotFoundError'
            ? 'No microphone found. Please connect a microphone and try again.'
            : 'Failed to access microphone';

      setError(message);
      setStatus('error');
      onError?.(message);
    }
  }, [uploadChunk, onError]);

  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setStatus('stopped');
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setStatus('paused');
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setStatus('recording');
    }
  }, []);

  return {
    status,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  };
}
