import { useState, useRef, useCallback } from 'react';

export const useTranscription = () => {
  const [transcription, setTranscription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentChunk, setCurrentChunk] = useState('');
  const transcriptionRef = useRef('');
  const pendingChunks = useRef<{[key: number]: string}>({});

  const processTranscription = useCallback(async (audioData: Float32Array, timestamp: number) => {
    try {
      setIsLoading(true);
      setCurrentChunk('Transcribing chunk...');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio: Array.from(audioData), timestamp }),
      });

      const result = await response.json();

      if (response.ok) {
        const filteredTranscription = result.transcription
          .replace(/\[.*?\]/g, '')
          .replace(/\(.*?\)/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (filteredTranscription && filteredTranscription !== "[BLANK_AUDIO]") {
          pendingChunks.current[timestamp] = filteredTranscription;
          updateTranscription();
        }
        setCurrentChunk('Chunk processed successfully');
        setTimeout(() => setCurrentChunk(''), 1000);
      } else {
        console.error('Transcription error:', result.error);
        setCurrentChunk('Error processing chunk');
      }
    } catch (error) {
      console.error('Error processing chunk:', error);
      setCurrentChunk('Error processing chunk');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTranscription = useCallback(() => {
    const sortedChunks = Object.entries(pendingChunks.current)
      .sort(([a], [b]) => Number(a) - Number(b));
    
    let newTranscription = '';
    for (const [, chunk] of sortedChunks) {
      newTranscription += ' ' + chunk;
    }
    
    newTranscription = newTranscription.trim();
    setTranscription(newTranscription);
    transcriptionRef.current = newTranscription;
  }, []);

  const resetTranscription = useCallback(() => {
    setTranscription('');
    transcriptionRef.current = '';
    pendingChunks.current = {};
    setCurrentChunk('');
    setIsLoading(false);
  }, []);

  return { transcription, isLoading, currentChunk, processTranscription, resetTranscription };
};
