# Whisper Transcription App

## Overview

Whisper Transcription is a real-time audio transcription application built with Next.js and the Whisper AI model. It allows users to record audio and receive instant transcriptions, making it ideal for note-taking, accessibility, and content creation.

## Features

- Real-time audio recording
- Instant transcription using Whisper AI
- Responsive design for various screen sizes
- Maximum recording time of 20 seconds per session
- Visual feedback for recording progress
- Easy-to-use interface with start, stop, and reset functionality

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or later)
- npm or yarn

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/whisper-transcription-app.git
   ```

2. Navigate to the project directory:
   ```
   cd whisper-transcription-app
   ```

3. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

4. Set up environment variables:
   Create a `.env.local` file in the root directory and add any necessary environment variables.

## Running the Application

1. Start the development server:
   ```
   npm run dev
   ```
   or
   ```
   yarn dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Click the microphone button to start recording.
2. Speak clearly into your device's microphone.
3. The transcription will appear in real-time as you speak.
4. Recording will automatically stop after 20 seconds, or you can click the stop button.
5. Use the reset button to clear the transcription and start over.

## Project Structure

- `app/`: Next.js app directory
  - `components/`: React components
  - `hooks/`: Custom React hooks
  - `api/`: API routes
  - `workers/`: Web Workers for background processing
- `public/`: Static files
- `styles/`: CSS styles

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- Web Audio API
- Whisper AI model

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
