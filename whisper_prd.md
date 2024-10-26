# Product Requirements Document: Whisper Transcription Application

## 1. Introduction

### 1.1 Purpose
The Whisper Transcription Application is designed to provide real-time audio transcription using the Whisper AI model. It offers a user-friendly interface for recording audio and instantly converting it to text.

### 1.2 Scope
This application will be a web-based solution, built using Next.js and React, with TypeScript for type safety. It will utilize the Web Audio API for audio recording and processing, and integrate with a server-side Whisper AI model for transcription.

## 2. Product Overview

### 2.1 Product Perspective
The Whisper Transcription Application is a standalone web application that can be integrated into larger systems or used independently. It leverages modern web technologies to provide a seamless audio transcription experience.

### 2.2 User Classes and Characteristics
- General users seeking quick audio-to-text transcription
- Professionals needing real-time transcription for meetings or interviews
- Individuals with hearing impairments requiring speech-to-text conversion

### 2.3 Operating Environment
- Web browsers supporting modern JavaScript and Web Audio API
- Server environment capable of running the Whisper AI model

## 3. System Features and Requirements

### 3.1 User Interface
#### 3.1.1 Main Component (WhisperTranscription.tsx)
- Implement a responsive design using Tailwind CSS
- Display a centered title "Whisper Transcription" with a microphone icon
- Provide a transcription area with a minimum height of 120px
- Include start/stop recording and reset buttons
- Show recording progress and character count

#### 3.1.2 Recording Controls
- Implement a record button that toggles between start and stop
- Display a reset button to clear the transcription
- Show recording time progress (0-20 seconds)

#### 3.1.3 Transcription Display
- Real-time display of transcribed text
- Loading indicator during transcription process
- Character count for transcribed text

### 3.2 Audio Recording (useAudioRecording.ts)
- Utilize the Web Audio API for audio capture
- Implement an AudioWorklet for real-time audio processing
- Set audio parameters: 16kHz sample rate, mono channel
- Limit recording time to 20 seconds maximum
- Implement noise threshold detection

### 3.3 Transcription Processing (useTranscription.ts)
- Handle audio data in 2-second chunks (32000 samples)
- Implement server communication for transcription
- Filter and clean transcription results
- Manage transcription state and updates

### 3.4 Server-Side Processing (api/transcribe/route.ts)
- Implement API endpoint for receiving audio data
- Integrate with Whisper AI model for transcription
- Handle concurrent transcription requests
- Implement error handling and logging

### 3.5 Web Worker (whisper.worker.ts)
- Implement background processing for Whisper model
- Handle message passing between main thread and worker

## 4. Performance Requirements
- Audio processing latency < 100ms
- Transcription response time < 2 seconds per chunk
- Support for multiple concurrent users

## 5. Security Requirements
- Implement secure audio data handling
- Ensure HTTPS for all client-server communications
- Implement rate limiting on the API to prevent abuse

## 6. Software Quality Attributes
- Responsive design for various screen sizes
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Accessibility compliance (WCAG 2.1 Level AA)

## 7. Internationalization and Localization Requirements
- Support for multiple languages in the UI
- Ability to transcribe in multiple languages (dependent on Whisper model capabilities)

## 8. Legal and Licensing Requirements
- Comply with audio recording laws and regulations
- Properly attribute and license the Whisper AI model
- Implement necessary user consent for audio recording

## 9. Documentation and Training
- Provide user documentation within the application
- Develop API documentation for potential integrations
- Create developer documentation for setup and maintenance

## 10. Future Enhancements
- Implement user accounts for saving transcriptions
- Add support for uploading pre-recorded audio files
- Integrate with popular note-taking and productivity apps

## 11. Technical Stack
- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Next.js API routes
- AI Model: Whisper AI
- Audio Processing: Web Audio API, AudioWorklet
- Build Tools: npm or yarn

## 12. Development and Deployment
- Version Control: Git
- Continuous Integration/Deployment: (To be determined based on hosting solution)
- Hosting: Vercel (recommended for Next.js applications)

## 13. Testing Requirements
- Unit tests for React components and hooks
- Integration tests for API endpoints
- End-to-end tests for the complete transcription flow
- Performance testing for audio processing and transcription speed
- Accessibility testing

## 14. Maintenance and Support
- Regular updates to the Whisper AI model
- Ongoing browser compatibility checks
- Performance monitoring and optimization

## 15. File structure

.
├── README.md
├── app
│   ├── api
│   │   └── transcribe
│   ├── components
│   │   └── WhisperTranscription.tsx
│   ├── favicon.ico
│   ├── fonts
│   │   ├── GeistMonoVF.woff
│   │   └── GeistVF.woff
│   ├── globals.css
│   ├── hooks
│   │   ├── useAudioRecording.ts
│   │   └── useTranscription.ts
│   ├── layout.tsx
│   ├── page.tsx
│   ├── types
│   │   ├── globals.d.ts
│   │   └── transformers.d.ts
│   └── workers
│       ├── whisper.worker.d.ts
│       ├── whisper.worker.mjs
│       └── whisper.worker.ts
├── audio-processor.ts
├── global.d.ts
├── next-env.d.ts
├── next.config.js
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public
│   └── audio-processor.js
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.worker.json
└── whisper_prd.md


## 16. Docs

This section provides detailed explanations and code samples for key technologies used in the Whisper Transcription Application, based on the actual implementation and the reference from https://github.com/huggingface/transformers.js-examples/tree/main/realtime-whisper-webgpu.

### 15.1 Audio Processing with Web Audio API and AudioWorklet

The application uses the Web Audio API and AudioWorklet for real-time audio processing. Here's how it's implemented:

#### AudioWorklet Implementation (audio-processor.ts)

```typescript
/// <reference lib="WebWorker" />

declare class AudioWorkletProcessor {
  readonly port: MessagePort;
  constructor();
  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>
  ): boolean;
}

declare function registerProcessor(
  name: string,
  processorCtor: typeof AudioWorkletProcessor
): void;

class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    console.log('AudioProcessor: Initialized');
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>
  ): boolean {
    const input = inputs[0];
    if (input && input.length > 0) {
      const channelData = input[0];
      console.log('AudioProcessor: Processing audio data', {
        inputLength: input.length,
        channelDataLength: channelData.length,
        firstFewSamples: channelData.slice(0, 10)
      });
      this.port.postMessage(channelData.slice());
    } else {
      console.log('AudioProcessor: No input data received');
    }
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);
console.log('AudioProcessor: Registered');
```

### 15.2 Audio Recording Hook (useAudioRecording.ts)

The `useAudioRecording` hook manages the audio recording process:

```typescript
import { useState, useRef, useCallback, useEffect } from 'react';

const CHUNK_SIZE = 32000; // 2 seconds of audio at 16kHz
const MAX_RECORDING_TIME = 20000; // 20 seconds maximum recording time
const NOISE_THRESHOLD = 0.01;

export const useAudioRecording = (onAudioData: (data: Float32Array, timestamp: number) => void) => {
  // ... (state and ref declarations)

  const processChunk = useCallback((audioData: Float32Array) => {
    // ... (audio processing logic)
  }, [onAudioData]);

  const stopRecording = useCallback(() => {
    // ... (stop recording logic)
  }, []);

  const startRecording = useCallback(async () => {
    try {
      // ... (start recording logic)
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, [processChunk, stopRecording]);

  // ... (useEffect for maximum recording time)

  return { isRecording, recordingTime, startRecording, stopRecording };
};
```

### 15.3 Transcription Processing (useTranscription.ts)

The `useTranscription` hook manages the transcription process:

```typescript
import { useState, useRef, useCallback } from 'react';

export const useTranscription = () => {
  // ... (state and ref declarations)

  const processTranscription = useCallback(async (audioData: Float32Array, timestamp: number) => {
    try {
      // ... (transcription processing logic)
    } catch (error) {
      console.error('Error processing chunk:', error);
      setCurrentChunk('Error processing chunk');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTranscription = useCallback(() => {
    // ... (transcription update logic)
  }, []);

  const resetTranscription = useCallback(() => {
    // ... (reset logic)
  }, []);

  return { transcription, isLoading, currentChunk, processTranscription, resetTranscription };
};
```

### 15.4 Main Component (WhisperTranscription.tsx)

The main component integrates the hooks and provides the user interface:

```typescript
import React from 'react';
import dynamic from 'next/dynamic';
import { ArrowPathIcon, MicrophoneIcon, StopIcon } from '@heroicons/react/24/outline';
import { useAudioRecording } from '../hooks/useAudioRecording';
import { useTranscription } from '../hooks/useTranscription';

const WhisperTranscription: React.FC = () => {
  const { transcription, isLoading, currentChunk, processTranscription, resetTranscription } = useTranscription();
  const { isRecording, recordingTime, startRecording, stopRecording } = useAudioRecording(processTranscription);

  // ... (component logic and JSX)
};

export default dynamic(() => Promise.resolve(WhisperTranscription), { ssr: false });
```

### 15.5 Whisper Model Integration

The application uses a WebGPU-based Whisper model for transcription. The actual integration is handled in the server-side API route (`/api/transcribe`). Refer to the Hugging Face Transformers.js examples for detailed implementation of the Whisper model with WebGPU support.

For more information on the WebGPU-based Whisper implementation, visit:
https://github.com/huggingface/transformers.js-examples/tree/main/realtime-whisper-webgpu

This documentation provides an overview of the key components and their interactions in the Whisper Transcription Application. Developers can use these code samples and explanations as a guide to recreate or extend the application.
