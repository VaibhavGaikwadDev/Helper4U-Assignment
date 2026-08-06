const { extractCriteria, generateMatchSummaries } = require('../services/llmService');
const { transcribeAudio } = require('../services/audioService');
const { findMatchingHelpers } = require('../services/helperService');

async function matchHelper(req, res) {
  try {
    let employerText = (req.body.requirementText || '').trim();

    if (req.file) {
      try {
        employerText = await transcribeAudio(req.file.buffer, req.file.originalname, req.file.mimetype);
      } catch (err) {
        console.error('Transcription failed:', err.message);
        return res.status(502).json({
          success: false,
          error: 'Could not transcribe the audio. Please try typing your requirement instead.'
        });
      }
    }

    if (!employerText) {
      return res.status(400).json({
        success: false,
        error: 'Please provide requirement text or an audio recording.'
      });
    }

    let criteria;
    try {
      criteria = await extractCriteria(employerText);
    } catch (err) {
      console.error('Criteria extraction failed:', err.message);
      return res.status(502).json({
        success: false,
        error: 'Could not understand the requirement right now. Please try rephrasing.'
      });
    }

    const { helpers, usedFallback } = await findMatchingHelpers(criteria);

    if (helpers.length === 0) {
      return res.json({
        success: true,
        employerText,
        extractedCriteria: criteria,
        matches: [],
        message: 'No helpers currently match this requirement. Try adjusting the skill or timing.'
      });
    }

    let summaryMap = {};
    try {
      summaryMap = await generateMatchSummaries(employerText, helpers);
    } catch (err) {
      console.error('Summary generation failed:', err.message);
    }

    const matches = helpers.map(h => ({
      id: h.id,
      name: h.name,
      primarySkill: h.primary_skill,
      subSkills: h.sub_skills,
      shiftPreference: h.shift_preference,
      experienceYears: h.experience_years,
      locationArea: h.location_area,
      isImmediatelyAvailable: !!h.is_immediately_available,
      matchSummary:
        summaryMap[h.id] ||
        `${h.name} matches your requirement for ${String(h.primary_skill).toLowerCase()} with ${h.experience_years} years of experience.`
    }));

    res.json({
      success: true,
      employerText,
      extractedCriteria: criteria,
      usedFallbackMatch: usedFallback,
      matches
    });
  } catch (err) {
    console.error('Unexpected error in matchHelper:', err);
    res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
  }
}

module.exports = { matchHelper };
