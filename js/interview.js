async function generateQuestions() {
  const role         = document.getElementById('intRole').value.trim();
  const level        = document.getElementById('intLevel').value;
  const skills       = document.getElementById('intSkills').value.trim();
  const type         = document.getElementById('intType').value;
  const numQuestions = document.getElementById('numQuestions').value;

  if (!role) {
    alert('Please enter your target job role.');
    return;
  }

  // Show loading
  document.getElementById('intEmptyState').style.display = 'none';
  document.getElementById('intLoadingState').style.display = 'flex';
  document.getElementById('questionsOutput').style.display = 'none';

  try {
    const typeLabel = {
      'mixed': 'Mixed (Technical + HR)',
      'technical': 'Technical',
      'hr': 'HR / Behavioral'
    }[type];

    const prompt = `
You are an expert interview coach. Generate ${numQuestions} interview questions for the following profile.
Respond ONLY in JSON format with no markdown, no backticks, no extra text.

Respond with this exact JSON structure:
{
  "questions": [
    {
      "question": "The interview question",
      "type": "technical" or "hr" or "behavioral",
      "answer": "A detailed model answer (3-5 sentences)",
      "tip": "A quick tip for answering this question well"
    }
  ]
}

Profile:
- Target Role: ${role}
- Experience Level: ${level || 'fresher'}
- Skills: ${skills || 'Not specified'}
- Interview Type: ${typeLabel}
- Number of questions: ${numQuestions}

Make questions realistic and relevant to the role. 
For technical questions, focus on ${skills || role + ' concepts'}.
For HR/behavioral questions, focus on common scenarios for ${level || 'fresher'} candidates.
Model answers should be helpful and concise.
Tips should be practical and specific.
    `;

    const response = await callGemini(prompt);

    let parsed;
    try {
      const clean = response.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(clean);
    } catch (e) {
      throw new Error('Failed to parse AI response. Please try again.');
    }

    displayQuestions(parsed.questions, role, level, typeLabel);

  } catch (error) {
    document.getElementById('intLoadingState').style.display = 'none';
    document.getElementById('intEmptyState').style.display = 'flex';
    alert('Error connecting to Gemini AI. Please check your API key in js/gemini.js and try again.');
    console.error(error);
  }
}

function displayQuestions(questions, role, level, type) {
  document.getElementById('intLoadingState').style.display = 'none';
  document.getElementById('questionsOutput').style.display = 'block';
  
  document.getElementById('questionsMeta').innerHTML = `
    Showing <strong>${questions.length} questions</strong> for 
    <strong>${role}</strong> · ${level || 'Fresher'} · ${type}
  `;

  const listEl = document.getElementById('questionsList');
  listEl.innerHTML = questions.map((q, i) => {
    const badgeClass = {
      'technical': 'badge-technical',
      'hr': 'badge-hr',
      'behavioral': 'badge-behavioral'
    }[q.type] || 'badge-hr';

    const typeLabel = {
      'technical': 'Technical',
      'hr': 'HR',
      'behavioral': 'Behavioral'
    }[q.type] || q.type;

    return `
      <div class="question-card" id="qcard-${i}">
        <div class="question-header" onclick="toggleQuestion(${i})">
          <span class="question-num">Q${i + 1}</span>
          <span class="question-type-badge ${badgeClass}">${typeLabel}</span>
          <span class="question-text">${q.question}</span>
          <span class="question-toggle">▾</span>
        </div>
        <div class="question-answer">
          <div class="answer-label">Model Answer</div>
          <p class="answer-text">${q.answer}</p>
          ${q.tip ? `
            <div class="answer-tip">
              <strong>💡 Tip:</strong> ${q.tip}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function toggleQuestion(index) {
  const card = document.getElementById(`qcard-${index}`);
  card.classList.toggle('open');
}
