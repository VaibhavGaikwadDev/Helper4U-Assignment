import { useState } from 'react';
import AudioRecorder from './AudioRecorder.jsx';

export default function RequirementForm({ onSubmit, loading }) {
  const [text, setText] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);

  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) setAudioBlob(file);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim() && !audioBlob) return;
    onSubmit({ text: text.trim(), audioBlob });
  }

  const canSubmit = !loading && (text.trim() || audioBlob);

  return (
    <form className="requirement-form" onSubmit={handleSubmit}>
      <label htmlFor="requirement">Employer requirement</label>
      <textarea
        id="requirement"
        rows={4}
        placeholder='e.g. "Looking for an experienced cook who can make Maharashtrian food and stay till 8 PM, urgent"'
        value={text}
        onChange={e => setText(e.target.value)}
      />

      <div className="audio-row">
        <AudioRecorder onAudioReady={setAudioBlob} />
        <span className="or-divider">or</span>
        <label className="btn-secondary file-upload">
          Upload audio file
          <input type="file" accept="audio/*" onChange={handleFileUpload} hidden />
        </label>
      </div>

      <button type="submit" className="btn-primary" disabled={!canSubmit}>
        {loading ? 'Finding matches…' : 'Find Match'}
      </button>
    </form>
  );
}
