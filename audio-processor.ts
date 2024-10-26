/// <reference lib="WebWorker" />

// Add necessary type declarations
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

// Remove the duplicate declarations and keep only the actual processor implementation
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
