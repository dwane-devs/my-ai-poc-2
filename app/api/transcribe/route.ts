import { NextResponse } from 'next/server';
import { pipeline, env, AutomaticSpeechRecognitionPipeline } from '@huggingface/transformers';

// Ensure 'env.backends.onnx.wasm' is defined before accessing its properties
if (env.backends?.onnx?.wasm) {
  env.backends.onnx.wasm.proxy = false;
  console.log('ONNX WASM proxy set to false');
}

let whisperPipeline: AutomaticSpeechRecognitionPipeline | null = null;

async function getWhisperPipeline(): Promise<AutomaticSpeechRecognitionPipeline> {
  console.log('Getting Whisper pipeline...');
  if (!whisperPipeline) {
    console.log('Pipeline not initialized, creating new pipeline...');
    try {
      whisperPipeline = await pipeline(
        'automatic-speech-recognition',
        'onnx-community/whisper-base',
        { 
          revision: 'main',
          quantized: false
        }
      );
      console.log('Pipeline created successfully');
    } catch (error) {
      console.error('Error creating pipeline:', error);
      throw error;
    }
  } else {
    console.log('Using existing pipeline');
  }
  return whisperPipeline;
}

export async function POST(request: Request) {
  console.log('POST request received at /api/transcribe');
  try {
    const data = await request.json();
    console.log('Request data parsed');
    
    const { audio } = data;
    console.log('Audio data extracted, length:', audio?.length);

    if (!audio || !Array.isArray(audio)) {
      console.error('Invalid audio data received:', { audio });
      return NextResponse.json(
        { error: 'No audio data provided or invalid format' },
        { status: 400 }
      );
    }

    // Convert the received array back to Float32Array
    console.log('Converting audio to Float32Array...');
    const audioFloat32 = new Float32Array(audio);
    console.log('Audio converted, length:', audioFloat32.length);
    console.log('First few samples:', audioFloat32.slice(0, 5));
    console.log('Sample rate check - any zeros?', audioFloat32.some(x => x === 0));
    console.log('Sample rate check - max value:', Math.max(...Array.from(audioFloat32)));
    console.log('Sample rate check - min value:', Math.min(...Array.from(audioFloat32)));

    console.log('Getting Whisper pipeline...');
    const whisper = await getWhisperPipeline();
    console.log('Pipeline retrieved successfully');

    console.log('Starting transcription...');
    const result = await whisper(audioFloat32, {
        sampling_rate: 16000,
        task: 'transcribe' ,
    });
    console.log('Transcription completed:', result);

    console.log('Sending response with transcription:', result.text);
    return NextResponse.json({ transcription: result.text });
  } catch (error: any) {
    console.error('Detailed error in transcription API:', {
      error,
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
