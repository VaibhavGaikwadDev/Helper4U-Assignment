function recencyScore(lastActiveAt) {
  if (!lastActiveAt) return 0;
  const days = (Date.now() - new Date(lastActiveAt).getTime()) / 86400000;
  if (days <= 7) return 10;
  if (days <= 30) return 7;
  if (days <= 90) return 3;
  return 0;
}

function scoreHelper(helper, criteria) {
  const requestedSkills = criteria.skills || [];
  const matchedSkills = Number(helper.matched_skill_count || 0);
  let score = requestedSkills.length ? (matchedSkills / requestedSkills.length) * 45 : 0;

  const helperSubskills = String(helper.sub_skills || '').toLowerCase();
  const requestedSubskills = criteria.sub_skills || [];
  const matchedSubskills = requestedSubskills.filter((skill) => helperSubskills.includes(skill.toLowerCase())).length;
  if (requestedSubskills.length) score += (matchedSubskills / requestedSubskills.length) * 12;

  if (criteria.timing && helper.shift_preference === criteria.timing) score += 12;
  if (helper.availability_status === 'available') score += criteria.urgency ? 9 : 5;

  if (criteria.location && helper.location_area?.toLowerCase().includes(criteria.location.toLowerCase())) score += 10;

  const helperLanguages = String(helper.languages || '').toLowerCase();
  if ((criteria.languages || []).some((language) => helperLanguages.includes(language.toLowerCase()))) score += 4;

  score += Math.min(Number(helper.experience_years || 0), 8);
  score += Math.min(Number(helper.rating || 0), 5);
  score += recencyScore(helper.last_active_at);

  return Math.round(score);
}

module.exports = { scoreHelper };
