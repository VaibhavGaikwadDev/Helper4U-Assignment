import { useState } from 'react';
import RequirementForm from './components/RequirementForm.jsx';
import ResultCard from './components/ResultCard.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import { matchHelper } from './api/matchApi.js';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const [criteria, setCriteria] = useState(null);

  async function handleSubmit({ text, audioBlob }) {
    setLoading(true);
    setError('');
    setResults(null);
    setCriteria(null);

    try {
      const data = await matchHelper({ text, audioBlob });
      setResults(data.matches);
      setCriteria(data.extractedCriteria);
      if (data.matches.length === 0 && data.message) {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header>
        <h1>Smart Match</h1>
        <p className="subtitle">
          Type or record an employer requirement, and we'll find the best matching helpers.
        </p>
      </header>

      <RequirementForm onSubmit={handleSubmit} loading={loading} />

      {loading && <LoadingSpinner />}

      {!loading && criteria && (
        <div className="criteria-summary">
          <strong>Understood as:</strong> {criteria.skill}
          {criteria.sub_skill ? ` · ${criteria.sub_skill}` : ''}
          {criteria.timing ? ` · ${criteria.timing}` : ''}
          {criteria.urgency ? ' · Urgent' : ''}
        </div>
      )}

      {!loading && error && <div className="error-banner">{error}</div>}

      {!loading && results && results.length > 0 && (
        <div className="results-grid">
          {results.map(helper => (
            <ResultCard key={helper.id} helper={helper} />
          ))}
        </div>
      )}
    </div>
  );
}
