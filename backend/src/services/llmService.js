const { EXTRACTION_SYSTEM_PROMPT, SUMMARY_SYSTEM_PROMPT } = require('../utils/prompts');

const MODEL = process.env.GEMINI_MODEL;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const ALLOWED_SKILLS = new Set(['maid', 'nanny', 'cook', 'caregiver', 'driver']);

async function callGeminiJson(systemPrompt, userContent) {
  const response = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userContent }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error (${response.status}): ${await response.text()}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error('Gemini API returned no content');
  return JSON.parse(content);
}

function stringArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean)
    : [];
}

async function extractCriteria(employerText) {
  const raw = await callGeminiJson(EXTRACTION_SYSTEM_PROMPT, employerText);
  const skills = stringArray(raw.skills).map((skill) => skill.toLowerCase()).filter((skill) => ALLOWED_SKILLS.has(skill));

  return {
    skills: [...new Set(skills)],
    sub_skills: [...new Set(stringArray(raw.sub_skills))],
    timing: ['Daytime', 'Live-in', 'Nighttime'].includes(raw.timing) ? raw.timing : null,
    urgency: Boolean(raw.urgency),
    location: typeof raw.location === 'string' ? raw.location.trim() || null : null,
    languages: [...new Set(stringArray(raw.languages))],
    raw_notes: typeof raw.raw_notes === 'string' ? raw.raw_notes : ''
  };
}

async function generateMatchSummaries(employerText, helpers) {
  if (!helpers.length) return {};

  const result = await callGeminiJson(SUMMARY_SYSTEM_PROMPT, JSON.stringify({
    employer_request: employerText,
    candidates: helpers.map((helper) => ({
      id: helper.id,
      name: helper.name,
      services: helper.skills,
      specialties: helper.sub_skills,
      languages: helper.languages,
      shift_preference: helper.shift_preference,
      experience_years: helper.experience_years,
      location_area: helper.location_area,
      availability_status: helper.availability_status,
      last_active_at: helper.last_active_at
    }))
  }));

  return (result.summaries || []).reduce((map, item) => {
    if (item?.id != null && typeof item.summary === 'string') map[item.id] = item.summary;
    return map;
  }, {});
}

module.exports = { extractCriteria, generateMatchSummaries };
