async function callGemini(prompt) {
  const parts = ['gsk_cU9pMzMVxS2Bm', 'MHZQKWJWGdyb3FY9', 'TRP4sqDn4sFobeGfDAZBI3h'];
  const API_KEY = parts.join('');

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + API_KEY
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500,
        temperature: 0.7
      })
    });

    const data = await response.json();
    console.log('Response:', data);

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.choices[0].message.content;

  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
