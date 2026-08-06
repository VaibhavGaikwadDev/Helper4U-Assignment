const API_BASE = '/api/match-helper';

export async function matchHelper({ text, audioBlob }) {
  let response;

  if (audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'requirement.webm');
    if (text) formData.append('requirementText', text);
    response = await fetch(API_BASE, { method: 'POST', body: formData });
  } else {
    response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requirementText: text })
    });
  }

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Something went wrong. Please try again.');
  }
  return data;
}
