async function callGemini(prompt) {
  const API_KEY = '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';
  
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
