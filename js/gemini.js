const API_KEY = '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';

async function callGemini(prompt) {
  try {
    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'HTTP-Referer': 'https://naseehmk.github.io',
          'X-Title': 'ResumeAI'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-exp:free',
          messages: [{ role: 'user', content: prompt }]
        })
      }
    );

    if (!response.ok) {
      const err = await response.json();
      console.error('API Error:', err);
      throw new Error(err.error?.message || 'API request failed');
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
