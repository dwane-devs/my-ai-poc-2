import dynamic from 'next/dynamic';

const WhisperTranscription = dynamic(() => import('./components/WhisperTranscription'), { ssr: false });

export default function Home() {
  return (
    <main>
      {/* <h1>Whisper Transcription</h1> */}
      <WhisperTranscription />
    </main>
  );
}
