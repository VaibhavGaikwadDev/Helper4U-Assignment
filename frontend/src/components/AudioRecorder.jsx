import { useRef, useState } from 'react';

export default function AudioRecorder({ onAudioReady }) {
  const [recording, setRecording] = useState(false);
  const [hasClip, setHasClip] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = e => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onAudioReady(blob);
        setHasClip(true);
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      alert('Microphone access is needed to record audio. You can upload a file instead.');
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  function clearClip() {
    setHasClip(false);
    onAudioReady(null);
  }

  return (
    <div className="audio-recorder">
      {!recording ? (
        <button type="button" className="btn-secondary" onClick={startRecording}>
          🎙 {hasClip ? 'Re-record' : 'Record'} audio
        </button>
      ) : (
        <button type="button" className="btn-secondary recording" onClick={stopRecording}>
          ⏹ Stop recording
        </button>
      )}
      {hasClip && !recording && (
        <span className="clip-status">
          Audio clip ready{' '}
          <button type="button" className="link-btn" onClick={clearClip}>
            clear
          </button>
        </span>
      )}
    </div>
  );
}
