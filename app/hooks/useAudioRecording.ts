import { useState, useRef, useCallback, useEffect } from 'react';

const CHUNK_SIZE = 32000; // 2 seconds of audio at 16kHz
const MAX_RECORDING_TIME = 20000; // 20 seconds maximum recording time
const NOISE_THRESHOLD = 0.01;

export const useAudioRecording = (onAudioData: (data: Float32Array, timestamp: number) => void) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioProcessorRef = useRef<AudioWorkletNode | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioBufferRef = useRef<Float32Array>(new Float32Array());

  const processChunk = useCallback((audioData: Float32Array) => {
    const newBuffer = new Float32Array(audioBufferRef.current.length + audioData.length);
    newBuffer.set(audioBufferRef.current);
    newBuffer.set(audioData, audioBufferRef.current.length);
    audioBufferRef.current = newBuffer;

    if (audioBufferRef.current.length < CHUNK_SIZE) {
      return;
    }

    const chunkToProcess = audioBufferRef.current.slice(0, CHUNK_SIZE);
    audioBufferRef.current = audioBufferRef.current.slice(CHUNK_SIZE);

    const maxAmplitude = Math.max(...Array.from(chunkToProcess).map(Math.abs));
    if (maxAmplitude < NOISE_THRESHOLD) {
      return;
    }

    onAudioData(chunkToProcess, Date.now());
  }, [onAudioData]);

  const stopRecording = useCallback(() => {
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
      }
      audioContextRef.current = null;
    }

    if (audioProcessorRef.current) {
      audioProcessorRef.current.disconnect();
      audioProcessorRef.current = null;
    }

    setIsRecording(false);
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    
    setRecordingTime(0);
    // Clear the audio buffer
    audioBufferRef.current = new Float32Array();
  }, []);

  const startRecording = useCallback(async () => {
    try {
      // Stop any existing recording first
      stopRecording();

      // Clear any existing audio buffer
      audioBufferRef.current = new Float32Array();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      await audioContext.audioWorklet.addModule('/audio-processor.js');

      const source = audioContext.createMediaStreamSource(stream);
      const audioProcessor = new AudioWorkletNode(audioContext, 'audio-processor');
      audioProcessorRef.current = audioProcessor;

      audioProcessor.port.onmessage = (event) => {
        processChunk(event.data);
      };

      source.connect(audioProcessor);
      audioProcessor.connect(audioContext.destination);

      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_RECORDING_TIME) {
            stopRecording();
            return 0;
          }
          return prev + 100;
        });
      }, 100);

    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, [processChunk, stopRecording]);

  useEffect(() => {
    if (isRecording) {
      const timeoutId = setTimeout(() => {
        if (audioContextRef.current?.state === 'running') {
          stopRecording();
        }
      }, MAX_RECORDING_TIME);

      return () => clearTimeout(timeoutId);
    }
  }, [isRecording, stopRecording]);

  return { isRecording, recordingTime, startRecording, stopRecording };
};
