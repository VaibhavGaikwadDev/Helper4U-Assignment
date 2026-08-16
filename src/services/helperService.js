const pool = require('../config/db');
const { scoreHelper } = require('../utils/scoring');

async function findMatchingHelpers(criteria) {
  const requestedSkills = criteria.skills || [];
  if (!requestedSkills.length) return { helpers: [], usedFallback: false };

  const placeholders = requestedSkills.map(() => '?').join(', ');
  const genderFilter = criteria.worker_preference && criteria.worker_preference !== 'any'
    ? ' AND h.worker_type = ?'
    : '';
  const sql = `
    SELECT
      h.id, h.name, h.location_area, h.shift_preference, h.experience_years,
      h.rating, h.worker_type, h.availability_status, h.last_active_at,
      h.birth_year, h.about_me, h.aadhaar_verified,
      h.criminal_background_verified, h.phone_verified,
      GROUP_CONCAT(DISTINCT s.display_name ORDER BY s.display_name SEPARATOR ' | ') AS skills,
      GROUP_CONCAT(DISTINCT ss.display_name ORDER BY ss.display_name SEPARATOR ' | ') AS sub_skills,
      GROUP_CONCAT(DISTINCT l.display_name ORDER BY l.display_name SEPARATOR ' | ') AS languages,
      COUNT(DISTINCT CASE WHEN s.code IN (${placeholders}) THEN s.code END) AS matched_skill_count
    FROM helpers h
    JOIN helper_skills hs ON hs.helper_id = h.id
    JOIN skills s ON s.id = hs.skill_id AND s.is_active = 1
    LEFT JOIN helper_subskills hss ON hss.helper_id = h.id
    LEFT JOIN subskills ss ON ss.id = hss.subskill_id AND ss.is_active = 1
    LEFT JOIN helper_languages hl ON hl.helper_id = h.id
    LEFT JOIN languages l ON l.id = hl.language_id
    WHERE h.availability_status <> 'employed'${genderFilter}
    GROUP BY h.id
    HAVING matched_skill_count > 0
    LIMIT 50`;

  const params = criteria.worker_preference && criteria.worker_preference !== 'any'
    ? [...requestedSkills, criteria.worker_preference]
    : requestedSkills;
  const [rows] = await pool.query(sql, params);
  const ranked = rows
    .map((helper) => ({ ...helper, matchScore: scoreHelper(helper, criteria) }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);

  return { helpers: ranked, usedFallback: ranked.some((helper) => helper.matched_skill_count < requestedSkills.length) };
}

module.exports = { findMatchingHelpers };
