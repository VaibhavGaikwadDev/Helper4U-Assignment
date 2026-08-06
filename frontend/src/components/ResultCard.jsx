export default function ResultCard({ helper }) {
  return (
    <div className="result-card">
      <div className="result-header">
        <h3>{helper.name}</h3>
        <span className="skill-badge">{helper.primarySkill}</span>
      </div>

      <div className="tags">
        {helper.subSkills && <span className="tag">{helper.subSkills}</span>}
        {helper.shiftPreference && <span className="tag">{helper.shiftPreference}</span>}
        <span className="tag">{helper.experienceYears} yrs exp</span>
        {helper.locationArea && <span className="tag">{helper.locationArea}</span>}
        {helper.isImmediatelyAvailable && <span className="tag tag-urgent">Available now</span>}
      </div>

      <p className="match-summary">{helper.matchSummary}</p>
    </div>
  );
}
