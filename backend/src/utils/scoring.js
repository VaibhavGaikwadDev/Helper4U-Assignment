
function scoreHelper(helper, criteria) {
  let score = 0;

  if (criteria.timing && (helper.shift_preference === criteria.timing || helper.shift_preference === 'Full Day')) {
    score += 10;
  }

  if (criteria.urgency && helper.is_immediately_available) {
    score += 15;
  }

  score += Math.min(helper.experience_years || 0, 10);

  if (criteria.location && helper.location_area &&
      helper.location_area.toLowerCase().includes(criteria.location.toLowerCase())) {
    score += 8;
  }

  return score;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  if ([lat1, lon1, lat2, lon2].some(v => v === null || v === undefined)) return null;
  const toRad = deg => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

module.exports = { scoreHelper, haversineKm };
