async function callGemini(prompt) {
  const API_KEY = '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';
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + API_KEY,
        'HTTP-Referer': 'https://naseehmk.github.io',
        'X-Title': 'ResumeAI'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [{ role: 'user', content: prompt }]
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
