declare module '@huggingface/transformers' {
  export interface AutomaticSpeechRecognitionPipeline {
    (
      audio: Float32Array,
      options: {
        sampling_rate: number;
        task: string;
      }
    ): Promise<{ text: string }>;
  }

  export function pipeline(
    task: 'automatic-speech-recognition',
    model: string,
    config?: any
  ): Promise<AutomaticSpeechRecognitionPipeline>;

  export const env: {
    backends?: {
      onnx?: {
        wasm?: {
          proxy: boolean;
        };
      };
    };
  };
}
