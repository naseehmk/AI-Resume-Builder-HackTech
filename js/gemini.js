const API_KEY = 'AQ.Ab8RN6LZc7WHX5cBoA2_Qqs9PVAzYtQfrLHxxzlJ-zxEHptEnw';

async function callGemini(prompt) {
  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': API_KEY
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      throw new Error(data.error?.message || 'API request failed');
    }

    return data.candidates[0].content.parts[0].text;

  } catch (error) {
    console.error('Gemini Error:', error);
    throw error;
  }
}
