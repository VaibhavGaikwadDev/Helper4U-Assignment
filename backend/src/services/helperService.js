const pool = require('../config/db');
const { scoreHelper } = require('../utils/scoring');

async function findMatchingHelpers(criteria) {
  let helpers = await queryBySkillAndSubSkill(criteria.skill, criteria.sub_skill);
  let usedFallback = false;

  if (helpers.length === 0 && criteria.skill) {
    helpers = await queryBySkillAndSubSkill(criteria.skill, null);
    usedFallback = true;
  }

  if (helpers.length === 0) {
    return { helpers: [], usedFallback: true };
  }

  const ranked = helpers
    .map(h => ({ ...h, matchScore: scoreHelper(h, criteria) }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);

  return { helpers: ranked, usedFallback };
}

async function queryBySkillAndSubSkill(skill, subSkill) {
  const params = [];
  let sql = 'SELECT * FROM helpers WHERE 1 = 1';

  if (skill) {
    sql += ' AND primary_skill LIKE ?';
    params.push(`%${skill}%`);
  }
  if (subSkill) {
    sql += ' AND sub_skills LIKE ?';
    params.push(`%${subSkill}%`);
  }

  sql += ' LIMIT 20';

  const [rows] = await pool.query(sql, params);
  return rows;
}

module.exports = { findMatchingHelpers };
