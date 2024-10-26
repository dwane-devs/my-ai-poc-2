/// <reference lib="webworker" />

import { pipeline, env, AutomaticSpeechRecognitionPipeline } from '@huggingface/transformers';

declare const self: DedicatedWorkerGlobalScope;

// Type guard for env.backends
if (env.backends?.onnx?.wasm) {
  env.backends.onnx.wasm.proxy = false;
}

let whisper: AutomaticSpeechRecognitionPipeline | null = null;

self.onmessage = async (event: MessageEvent) => {
  if (event.data.type === 'LOAD_MODEL') {
    try {
      whisper = await pipeline(
        'automatic-speech-recognition',
        'openai/whisper-tiny.en'
      ) as AutomaticSpeechRecognitionPipeline;

      self.postMessage({ type: 'MODEL_LOADED' });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      self.postMessage({ type: 'ERROR', error: errorMessage });
    }
  } else if (event.data.type === 'TRANSCRIBE') {
    if (!whisper) {
      self.postMessage({ type: 'ERROR', error: 'Model not loaded' });
      return;
    }

    try {
      const result = await whisper(event.data.audio, {
        sampling_rate: 16000,
        task: 'transcribe',
      });
      self.postMessage({ type: 'TRANSCRIPTION', result });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      self.postMessage({ type: 'ERROR', error: errorMessage });
    }
  }
};

export {}; // Ensure this file is treated as a module
