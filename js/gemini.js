async function callGemini(prompt) {
  const API_KEY = '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';
  
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + API_KEY
        },
        body: JSON.stringify({
          model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1500,
          temperature: 0.7
        })
      }
    );

    const data = await response.json();
    console.log('Response:', data);

    if (data.error) {
      throw new Error(data.error);
    }

    return data.choices[0].message.content;

  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
