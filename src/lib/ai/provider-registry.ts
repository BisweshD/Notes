import type {
  TranscriptionProvider,
  ExtractionProvider,
  NoteGenerationProvider,
} from './types';
import { MockTranscriptionProvider } from './transcription/mock.provider';
import { MockExtractionProvider } from './extraction/mock.provider';
import { MockNoteGenerationProvider } from './note-generation/mock.provider';

/**
 * Provider registry for AI services.
 * Selects the appropriate provider based on configuration.
 * Defaults to mock providers for development.
 */

let _transcriptionProvider: TranscriptionProvider | null = null;
let _extractionProvider: ExtractionProvider | null = null;
let _noteGenerationProvider: NoteGenerationProvider | null = null;

export function getTranscriptionProvider(): TranscriptionProvider {
  if (!_transcriptionProvider) {
    const provider = process.env.TRANSCRIPTION_PROVIDER || 'mock';

    switch (provider) {
      case 'whisper':
        // Whisper provider would be imported and instantiated here
        // For now, fall through to mock
        console.log('Whisper provider not yet implemented, using mock');
        _transcriptionProvider = new MockTranscriptionProvider();
        break;
      case 'mock':
      default:
        _transcriptionProvider = new MockTranscriptionProvider();
    }
  }
  return _transcriptionProvider;
}

export function getExtractionProvider(): ExtractionProvider {
  if (!_extractionProvider) {
    const provider = process.env.AI_PROVIDER || 'mock';

    switch (provider) {
      case 'openai':
        console.log('OpenAI extraction provider not yet implemented, using mock');
        _extractionProvider = new MockExtractionProvider();
        break;
      case 'mock':
      default:
        _extractionProvider = new MockExtractionProvider();
    }
  }
  return _extractionProvider;
}

export function getNoteGenerationProvider(): NoteGenerationProvider {
  if (!_noteGenerationProvider) {
    const provider = process.env.AI_PROVIDER || 'mock';

    switch (provider) {
      case 'openai':
        console.log('OpenAI note generation provider not yet implemented, using mock');
        _noteGenerationProvider = new MockNoteGenerationProvider();
        break;
      case 'mock':
      default:
        _noteGenerationProvider = new MockNoteGenerationProvider();
    }
  }
  return _noteGenerationProvider;
}

// Reset providers (useful for testing)
export function resetProviders() {
  _transcriptionProvider = null;
  _extractionProvider = null;
  _noteGenerationProvider = null;
}
