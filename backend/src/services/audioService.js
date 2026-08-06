
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

async function transcribeAudio(buffer, originalname, mimetype) {
  const base64 = Buffer.from(buffer).toString('base64');
  const mime = mimetype || 'audio/webm';

  const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text:
                'Transcribe the speech in this audio clip exactly. ' +
                'Return only the spoken words as plain text — no timestamps, ' +
                'no speaker labels, no commentary, no quotes.'
            },
            {
              inline_data: {
                mime_type: mime,
                data: base64
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1
      }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini API returned no transcription');

  return text.trim();
}

module.exports = { transcribeAudio };