'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ArrowPathIcon, MicrophoneIcon, StopIcon } from '@heroicons/react/24/outline';
import { useAudioRecording } from '../hooks/useAudioRecording';
import { useTranscription } from '../hooks/useTranscription';

const WhisperTranscription: React.FC = () => {
  const { transcription, isLoading, currentChunk, processTranscription, resetTranscription } = useTranscription();
  const { isRecording, recordingTime, startRecording, stopRecording } = useAudioRecording(processTranscription);

  const handleReset = () => {
    resetTranscription();
    stopRecording();
    console.log('Transcription reset');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-400 flex items-center justify-center">
        <MicrophoneIcon className="w-8 h-8 mr-2" />
        Whisper Transcription
      </h2>
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Transcription:</h3>
          <div className="flex items-center gap-4">
            {isRecording && (
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-600">
                  Recording: {(recordingTime / 1000).toFixed(1)}s / 20.0s
                </div>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-100"
                    style={{ 
                      width: `${(recordingTime / 20000) * 100}%`,
                      backgroundColor: recordingTime > 16000 ? '#ef4444' : '#3b82f6'
                    }}
                  />
                </div>
              </div>
            )}
            {transcription && (
              <div className="text-xs text-gray-500">
                Characters: {transcription.length}
              </div>
            )}
          </div>
        </div>
        <div className="text-xs text-gray-500 mb-2">
          Note: Maximum recording time is 20 seconds
        </div>
        
        <div 
          className="p-4 bg-gray-100 rounded-lg shadow-md min-h-[120px] relative flex flex-col"
        >
          <div className="absolute right-4 top-4 flex flex-col gap-2">
            <button
              className={`p-2 rounded-full ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white transition-colors duration-200 flex items-center justify-center w-10 h-10 shadow-md`}
              onClick={isRecording ? stopRecording : startRecording}
              title={isRecording ? 'Stop Recording' : 'Start Recording'}
            >
              {isRecording ? (
                <StopIcon className="w-5 h-5" />
              ) : (
                <MicrophoneIcon className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded-full bg-gray-300 hover:bg-gray-400 transition-colors duration-200 text-gray-600 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed w-10 h-10 flex items-center justify-center shadow-md"
              disabled={!transcription || isRecording}
              title="Reset transcription"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-grow whitespace-pre-wrap break-words text-black pr-16 overflow-y-auto">
            {transcription || (
              <span className="text-gray-400 italic">
                No transcription yet...
              </span>
            )}
          </div>
          
          {isLoading && (
            <div className="text-sm text-gray-500 mt-2 border-t pt-2">
              Transcribing...
              <ArrowPathIcon className="w-4 h-4 inline-block ml-2 animate-spin" />
            </div>
          )}
          {currentChunk && !isLoading && (
            <div className="text-sm text-gray-500 mt-2 border-t pt-2">
              {currentChunk}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(WhisperTranscription), { ssr: false });
