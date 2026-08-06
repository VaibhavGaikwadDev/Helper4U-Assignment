
const { EXTRACTION_SYSTEM_PROMPT, SUMMARY_SYSTEM_PROMPT } = require('../utils/prompts');

// const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
const MODEL = process.env.GEMINI_MODEL;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

async function callGeminiJson(systemPrompt, userContent) {
  const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userContent }]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3
      }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error('Gemini API returned no content');

  try {
    return JSON.parse(content);
  } catch (err) {
    throw new Error(`Failed to parse LLM JSON output: ${err.message}`);
  }
}

async function extractCriteria(employerText) {
  const raw = await callGeminiJson(EXTRACTION_SYSTEM_PROMPT, employerText);
  // Normalize defensively — never trust the shape of LLM output as-is.
  return {
    skill: raw.skill || null,
    sub_skill: raw.sub_skill || null,
    timing: raw.timing || null,
    urgency: Boolean(raw.urgency),
    location: raw.location || null,
    raw_notes: raw.raw_notes || ''
  };
}

async function generateMatchSummaries(employerText, helpers) {
  if (!helpers.length) return {};
  const userContent = JSON.stringify({
    employer_request: employerText,
    candidates: helpers.map(h => ({
      id: h.id,
      name: h.name,
      primary_skill: h.primary_skill,
      sub_skills: h.sub_skills,
      shift_preference: h.shift_preference,
      experience_years: h.experience_years,
      location_area: h.location_area,
      is_immediately_available: !!h.is_immediately_available
    }))
  });
  const result = await callGeminiJson(SUMMARY_SYSTEM_PROMPT, userContent);
  const map = {};
  (result.summaries || []).forEach(s => {
    if (s && s.id != null) map[s.id] = s.summary;
  });
  return map;
}

module.exports = { extractCriteria, generateMatchSummaries };