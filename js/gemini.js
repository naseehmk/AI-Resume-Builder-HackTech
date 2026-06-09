const GEMINI_API_KEY = 'AQ.Ab8RN6J7fOVYM_wQXCCI1xgN_hAhiAISmbp_DpfTYazagTPayg';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

async function callGemini(prompt) {
  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500,
        }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'API request failed');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;

  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}
