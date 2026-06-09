const GEMINI_API_KEY = 'AQ.Ab8RN6Kw-MCfSij17uRPxQyGzvV7vB70-bBm3qw8b-TVx9mzCg';

async function callGemini(prompt) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    );

    if (!response.ok) {
      const err = await response.json();
      console.error('API Error:', err);
      throw new Error(err.error?.message || 'API request failed');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;

  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}
