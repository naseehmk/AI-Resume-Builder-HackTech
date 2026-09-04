async function callGemini(prompt) {
  try {
    const response = await fetch('https://lively-lab-cff6.naseehm134.workers.dev', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
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
