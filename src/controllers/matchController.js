const { extractCriteria, generateMatchSummaries } = require('../services/llmService');
const { transcribeAudio } = require('../services/audioService');
const { findMatchingHelpers } = require('../services/helperService');

async function matchHelper(req, res) {
  try {
    let employerText = (req.body.requirementText || '').trim();

    if (req.file) {
      employerText = await transcribeAudio(req.file.buffer, req.file.originalname, req.file.mimetype);
    }

    if (!employerText) {
      return res.status(400).json({ success: false, error: 'Please provide requirement text or an audio recording.' });
    }

    const criteria = await extractCriteria(employerText);
    const { helpers, usedFallback } = await findMatchingHelpers(criteria);

    if (!helpers.length) {
      return res.json({ success: true, employerText, extractedCriteria: criteria, matches: [], message: 'No matching helpers are available right now.' });
    }

    let summaryMap = {};
    try { summaryMap = await generateMatchSummaries(employerText, helpers); } catch (error) { console.error('Summary generation failed:', error.message); }

    return res.json({
      success: true,
      employerText,
      extractedCriteria: criteria,
      usedFallbackMatch: usedFallback,
      matches: helpers.map((helper) => ({
        id: helper.id,
        name: helper.name,
        workerType: helper.worker_type,
        birthYear: helper.birth_year,
        aboutMe: helper.about_me,
        aadhaarVerified: Boolean(helper.aadhaar_verified),
        backgroundVerified: Boolean(helper.criminal_background_verified),
        phoneVerified: Boolean(helper.phone_verified),
        primarySkill: helper.skills,
        subSkills: helper.sub_skills,
        languages: helper.languages,
        shiftPreference: helper.shift_preference,
        experienceYears: helper.experience_years,
        locationArea: helper.location_area,
        isImmediatelyAvailable: helper.availability_status === 'available',
        matchScore: helper.matchScore,
        matchSummary: summaryMap[helper.id] || `${helper.name} matches ${helper.matched_skill_count} of your requested services.`
      }))
    });
  } catch (error) {
    console.error('Unexpected error in matchHelper:', error);
    return res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
  }
}

module.exports = { matchHelper };
