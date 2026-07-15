let interviewState = {
  name: '',
  role: '',
  type: '',
  questions: [],
  currentQ: 0,
  totalQ: 0,
  answers: [],
  scores: [],
  warnings: 0,
  terminated: false,
  recognition: null,
  isRecording: false,
  timer: null,
  timeLeft: 120,
  stream: null,
  currentTranscript: ''
};

const questionBanks = {
  technical: [
    { q: "What is the difference between HTML, CSS, and JavaScript? Explain each briefly.", type: "TECHNICAL" },
    { q: "What is a variable in programming? Give an example.", type: "TECHNICAL" },
    { q: "Explain what a function is and why we use functions in programming.", type: "TECHNICAL" },
    { q: "What is the difference between a class and an object in OOP?", type: "TECHNICAL" },
    { q: "What is an API and how does it work?", type: "TECHNICAL" },
    { q: "Explain what Git is and why version control is important.", type: "TECHNICAL" },
    { q: "What is responsive web design?", type: "TECHNICAL" },
    { q: "What is the difference between frontend and backend development?", type: "TECHNICAL" },
    { q: "What is a database? Give examples of database management systems.", type: "TECHNICAL" },
    { q: "What is debugging? How do you approach fixing a bug in your code?", type: "TECHNICAL" }
  ],
  hr: [
    { q: "Tell me about yourself and your background.", type: "HR" },
    { q: "Why are you interested in this role?", type: "HR" },
    { q: "Where do you see yourself in 5 years?", type: "HR" },
    { q: "What are your greatest strengths?", type: "HR" },
    { q: "What is your biggest weakness and how are you working on it?", type: "HR" },
    { q: "Why should we hire you over other candidates?", type: "HR" },
    { q: "What motivates you to do your best work?", type: "HR" },
    { q: "How do you handle stress and pressure?", type: "HR" }
  ],
  behavioral: [
    { q: "Tell me about a time when you faced a challenge and how you overcame it.", type: "BEHAVIORAL" },
    { q: "Describe a situation where you had to work as part of a team.", type: "BEHAVIORAL" },
    { q: "Give an example of a time when you showed leadership.", type: "BEHAVIORAL" },
    { q: "Tell me about a time you made a mistake and what you learned from it.", type: "BEHAVIORAL" },
    { q: "Describe a situation where you had to meet a tight deadline.", type: "BEHAVIORAL" },
    { q: "Give an example of a time you went above and beyond what was expected.", type: "BEHAVIORAL" }
  ]
};

const keywords = {
  technical: ['code', 'programming', 'function', 'variable', 'data', 'system', 'develop', 'software', 'design', 'implement', 'algorithm', 'database', 'server', 'client', 'html', 'css', 'javascript', 'python', 'java', 'api', 'git', 'debug', 'test', 'framework', 'library'],
  hr: ['experience', 'skill', 'learn', 'goal', 'team', 'work', 'improve', 'achieve', 'contribute', 'growth', 'opportunity', 'passion', 'dedicated', 'motivated', 'professional', 'career'],
  behavioral: ['situation', 'challenge', 'solved', 'team', 'result', 'learned', 'improved', 'achieved', 'worked', 'helped', 'managed', 'organized', 'communicated', 'deadline', 'success']
};

// ===== PERMISSIONS =====
async function requestPermissions() {
  try {
    interviewState.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    document.getElementById('camStatus').textContent = '✅ Granted';
    document.getElementById('camStatus').classList.add('granted');
    document.getElementById('micStatus').textContent = '✅ Granted';
    document.getElementById('micStatus').classList.add('granted');
    document.getElementById('startBtn').disabled = false;
    document.getElementById('permBtn').textContent = 'Permissions Granted ✅';
  } catch (err) {
    alert('Please allow camera and microphone access to use the Live Interview feature.');
  }
}

// ===== START INTERVIEW =====
function startInterview() {
  const name = document.getElementById('setupName').value.trim();
  const role = document.getElementById('setupRole').value.trim();
  const type = document.getElementById('setupType').value;
  const count = parseInt(document.getElementById('setupCount').value);

  if (!name || !role) { alert('Please enter your name and target role.'); return; }

  interviewState.name = name;
  interviewState.role = role;
  interviewState.type = type;
  interviewState.totalQ = count;
  interviewState.questions = generateQuestions(type, count);
  interviewState.currentQ = 0;
  interviewState.answers = [];
  interviewState.scores = [];
  interviewState.warnings = 0;
  interviewState.terminated = false;
  interviewState.currentTranscript = '';

  document.getElementById('setupScreen').style.display = 'none';
  document.getElementById('interviewScreen').style.display = 'block';
  document.getElementById('interviewType').textContent = getTypeLabel(type);

  const video = document.getElementById('webcam');
  video.srcObject = interviewState.stream;

  startCheatingDetection();
  loadQuestion(0);
}

function generateQuestions(type, count) {
  let pool = [];
  if (type === 'mixed') {
    const t = Math.ceil(count * 0.4), h = Math.ceil(count * 0.3), b = count - t - h;
    pool = [...shuffle(questionBanks.technical).slice(0,t), ...shuffle(questionBanks.hr).slice(0,h), ...shuffle(questionBanks.behavioral).slice(0,b)];
  } else if (type === 'technical') pool = shuffle(questionBanks.technical).slice(0, count);
  else if (type === 'hr') pool = shuffle(questionBanks.hr).slice(0, count);
  else pool = shuffle(questionBanks.behavioral).slice(0, count);
  return shuffle(pool).slice(0, count);
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function getTypeLabel(type) {
  return { mixed: 'Mixed Interview', technical: 'Technical Interview', hr: 'HR Interview', behavioral: 'Behavioral Interview' }[type] || 'Interview';
}

// ===== LOAD QUESTION =====
function loadQuestion(index) {
  if (interviewState.terminated) return;

  // Stop any ongoing recording first
  stopSpeechRecognition();
  interviewState.currentTranscript = '';
  clearInterval(interviewState.timer);

  const q = interviewState.questions[index];
  const total = interviewState.totalQ;

  document.getElementById('questionCounter').textContent = `Question ${index + 1} of ${total}`;
  document.getElementById('liveQuestionType').textContent = q.type;
  document.getElementById('liveQuestionText').textContent = q.q;
  document.getElementById('progressFill').style.width = `${(index / total) * 100}%`;
  document.getElementById('answerTextBox').style.display = 'none';
  document.getElementById('userAnswerText').textContent = '';
  document.getElementById('nextBtn').style.display = 'none';
  document.getElementById('recordBtn').textContent = '⏳ Waiting...';
  document.getElementById('recordBtn').disabled = true;
  document.getElementById('recordBtn').classList.remove('recording');
  document.getElementById('statusWaiting').style.display = 'block';
  document.getElementById('statusRecording').style.display = 'none';
  document.getElementById('statusProcessing').style.display = 'none';

  resetTimer();
  speakQuestion(q.q);
}

// ===== SPEAK QUESTION =====
function speakQuestion(text) {
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.85;
  utterance.pitch = 1;
  utterance.volume = 1;

  const mouth = document.getElementById('avatarMouth');
  const speaking = document.getElementById('avatarSpeaking');

  utterance.onstart = () => {
    mouth.classList.add('speaking');
    speaking.style.display = 'flex';
  };

  utterance.onend = () => {
    mouth.classList.remove('speaking');
    speaking.style.display = 'none';
    // Auto start recording after question is spoken
    setTimeout(() => {
      autoStartRecording();
    }, 800);
  };

  utterance.onerror = () => {
    mouth.classList.remove('speaking');
    speaking.style.display = 'none';
    autoStartRecording();
  };

  window.speechSynthesis.speak(utterance);
}

// ===== AUTO START RECORDING =====
function autoStartRecording() {
  if (interviewState.terminated) return;

  document.getElementById('statusWaiting').style.display = 'none';
  document.getElementById('statusRecording').style.display = 'flex';
  document.getElementById('recordBtn').textContent = '⏹️ Stop & Submit';
  document.getElementById('recordBtn').disabled = false;
  document.getElementById('recordBtn').classList.add('recording');

  startSpeechRecognition();
  startTimer();
}

// ===== SPEECH RECOGNITION =====
function startSpeechRecognition() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Speech recognition not supported. Please use Chrome browser.');
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  interviewState.recognition = new SpeechRecognition();
  interviewState.recognition.continuous = true;
  interviewState.recognition.interimResults = true;
  interviewState.recognition.lang = 'en-US';
  interviewState.isRecording = true;

  interviewState.recognition.onresult = (event) => {
    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = 0; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript + ' ';
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    interviewState.currentTranscript = finalTranscript || interimTranscript;
    document.getElementById('userAnswerText').textContent = interviewState.currentTranscript;
    document.getElementById('answerTextBox').style.display = 'block';
  };

  interviewState.recognition.onerror = (e) => {
    console.log('Speech error:', e.error);
    if (e.error === 'no-speech') {
      // Restart recognition if no speech detected
      setTimeout(() => {
        if (interviewState.isRecording) {
          try { interviewState.recognition.start(); } catch(err) {}
        }
      }, 1000);
    }
  };

  interviewState.recognition.onend = () => {
    if (interviewState.isRecording) {
      try { interviewState.recognition.start(); } catch(err) {}
    }
  };

  try {
    interviewState.recognition.start();
  } catch(e) {
    console.log('Recognition start error:', e);
  }
}

function stopSpeechRecognition() {
  interviewState.isRecording = false;
  if (interviewState.recognition) {
    try { interviewState.recognition.stop(); } catch(e) {}
    interviewState.recognition = null;
  }
}

// ===== TOGGLE RECORDING (manual stop button) =====
function toggleRecording() {
  if (interviewState.isRecording) {
    submitAnswer();
  }
}

function submitAnswer() {
  stopSpeechRecognition();
  clearInterval(interviewState.timer);

  document.getElementById('recordBtn').disabled = true;
  document.getElementById('recordBtn').classList.remove('recording');
  document.getElementById('statusRecording').style.display = 'none';
  document.getElementById('statusProcessing').style.display = 'block';

  // Save the final answer
  const finalAnswer = interviewState.currentTranscript.trim() || document.getElementById('userAnswerText').textContent.trim();

  setTimeout(() => {
    document.getElementById('statusProcessing').style.display = 'none';

    if (!finalAnswer || finalAnswer.length < 3) {
      document.getElementById('userAnswerText').textContent = 'No answer detected. Please speak clearly.';
      document.getElementById('answerTextBox').style.display = 'block';
    }

    scoreAndSaveAnswer(finalAnswer);
    document.getElementById('nextBtn').style.display = 'block';
    document.getElementById('recordBtn').textContent = '✅ Answer Submitted';
  }, 1500);
}

// ===== SCORING =====
function scoreAndSaveAnswer(answerText) {
  const question = interviewState.questions[interviewState.currentQ];
  const qType = question.type.toLowerCase();
  const text = answerText.toLowerCase();

  if (!answerText || answerText.length < 5 || answerText === 'No answer detected. Please speak clearly.') {
    interviewState.scores.push(0);
    interviewState.answers.push({ q: question.q, a: 'No answer provided', score: 0, feedback: 'No answer was detected. Make sure to speak clearly into your microphone.' });
    return;
  }

  const relevantKeywords = keywords[qType] || keywords.hr;
  let matchCount = 0;
  relevantKeywords.forEach(kw => { if (text.includes(kw)) matchCount++; });

  const wordCount = answerText.split(' ').length;
  let lengthScore = wordCount > 50 ? 30 : wordCount > 30 ? 20 : wordCount > 10 ? 10 : 0;
  const keywordScore = Math.min(70, matchCount * 10);
  const totalScore = Math.min(100, keywordScore + lengthScore);

  let feedback = totalScore >= 70 ? 'Excellent answer! You covered the key points well.' :
    totalScore >= 50 ? 'Good answer. Try to include more specific details and examples.' :
    totalScore >= 30 ? 'Decent attempt. Work on providing more comprehensive answers.' :
    'Your answer needs improvement. Practice with more detail and relevant keywords.';

  interviewState.scores.push(totalScore);
  interviewState.answers.push({ q: question.q, a: answerText, score: totalScore, feedback });
}

function nextQuestion() {
  interviewState.currentQ++;
  if (interviewState.currentQ >= interviewState.totalQ) endInterview();
  else loadQuestion(interviewState.currentQ);
}

// ===== TIMER =====
function startTimer() {
  interviewState.timeLeft = 120;
  updateTimerDisplay();

  interviewState.timer = setInterval(() => {
    interviewState.timeLeft--;
    updateTimerDisplay();

    if (interviewState.timeLeft <= 0) {
      clearInterval(interviewState.timer);
      submitAnswer();
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(interviewState.timer);
  interviewState.timeLeft = 120;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const mins = Math.floor(interviewState.timeLeft / 60);
  const secs = interviewState.timeLeft % 60;
  const el = document.getElementById('timerDisplay');
  el.textContent = `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
  el.classList.toggle('urgent', interviewState.timeLeft <= 30);
}

// ===== CHEATING DETECTION =====
function startCheatingDetection() {
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('blur', onWindowBlur);
}

function onVisibilityChange() {
  if (document.hidden && !interviewState.terminated) triggerWarning('Tab switch detected!');
}

function onWindowBlur() {
  if (!interviewState.terminated) triggerWarning('Window focus lost — stay on the interview tab!');
}

function triggerWarning(reason) {
  if (interviewState.terminated) return;
  interviewState.warnings++;

  const eyeStatus = document.getElementById('eyeStatus');

  if (interviewState.warnings === 1) {
    showWarningBanner(`⚠️ Warning 1/2: ${reason}`);
    document.getElementById('warn1').classList.add('active');
    eyeStatus.textContent = '⚠️ Warning 1';
    eyeStatus.className = 'eye-status warning';
  } else if (interviewState.warnings === 2) {
    showWarningBanner(`⚠️ Final Warning: ${reason} — Next violation will terminate the interview!`);
    document.getElementById('warn2').classList.add('active');
    eyeStatus.textContent = '⚠️ Warning 2';
    eyeStatus.className = 'eye-status warning';
  } else {
    terminateInterview();
  }
}

function showWarningBanner(text) {
  const banner = document.getElementById('warningBanner');
  document.getElementById('warningText').textContent = text;
  banner.style.display = 'block';
  setTimeout(() => { banner.style.display = 'none'; }, 5000);
}

function terminateInterview() {
  interviewState.terminated = true;
  stopSpeechRecognition();
  clearInterval(interviewState.timer);
  window.speechSynthesis.cancel();

  document.getElementById('warningBanner').style.display = 'none';
  document.getElementById('terminatedBanner').style.display = 'block';
  document.getElementById('recordBtn').disabled = true;
  document.getElementById('eyeStatus').textContent = '🚫 Terminated';
  document.getElementById('eyeStatus').className = 'eye-status danger';

  setTimeout(() => endInterview(true), 3000);
}

// ===== END INTERVIEW =====
function endInterview(terminated = false) {
  stopSpeechRecognition();
  clearInterval(interviewState.timer);
  window.speechSynthesis.cancel();

  if (interviewState.stream) interviewState.stream.getTracks().forEach(t => t.stop());

  document.removeEventListener('visibilitychange', onVisibilityChange);
  window.removeEventListener('blur', onWindowBlur);

  document.getElementById('interviewScreen').style.display = 'none';
  document.getElementById('resultsScreen').style.display = 'block';

  showResults(terminated);
}

function showResults(terminated) {
  const scores = interviewState.scores;
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a,b) => a+b, 0) / scores.length) : 0;
  const warningPenalty = interviewState.warnings * 5;
  const finalScore = Math.max(0, avgScore - warningPenalty);

  document.getElementById('resultsName').textContent = `${interviewState.name} — ${interviewState.role} Interview`;
  document.getElementById('scoreNumber').textContent = `${finalScore}%`;
  document.getElementById('answeredCount').textContent = `${scores.length}/${interviewState.totalQ}`;
  document.getElementById('avgQuality').textContent = `${avgScore}%`;
  document.getElementById('warningsCount').textContent = interviewState.warnings;
  document.getElementById('interviewStatus').textContent = terminated ? '❌ Terminated' : '✅ Completed';

  const circumference = 2 * Math.PI * 80;
  setTimeout(() => {
    const circle = document.getElementById('scoreCircle');
    circle.style.transition = 'stroke-dashoffset 1.5s ease';
    circle.style.strokeDashoffset = circumference - (finalScore / 100) * circumference;
  }, 300);

  document.getElementById('reviewList').innerHTML = interviewState.answers.map((item, i) => {
    const scoreClass = item.score >= 70 ? 'score-high' : item.score >= 40 ? 'score-mid' : 'score-low';
    return `
      <div class="review-item">
        <div class="review-item-header">
          <span class="review-q-num">Q${i+1} · ${interviewState.questions[i]?.type || ''}</span>
          <span class="review-score ${scoreClass}">${item.score}%</span>
        </div>
        <p class="review-question">${item.q}</p>
        <p class="review-answer"><strong>Your answer:</strong> ${item.a || 'No answer'}</p>
        <p class="review-feedback">💡 ${item.feedback}</p>
      </div>`;
  }).join('');

  const feedbackPoints = generateFeedback(finalScore, interviewState.answers, terminated);
  document.getElementById('overallFeedback').innerHTML = feedbackPoints.map(f => `<div class="feedback-item">${f}</div>`).join('');
}

function generateFeedback(score, answers, terminated) {
  const points = [];
  if (terminated) points.push('⚠️ Your interview was terminated due to integrity violations. Please retake honestly.');
  if (score >= 80) points.push('🏆 Excellent performance! Strong knowledge and communication skills.');
  else if (score >= 60) points.push('👍 Good performance. A bit more preparation will help you excel.');
  else if (score >= 40) points.push('📚 Average performance. Focus on topics you struggled with.');
  else points.push('💪 You need more practice. Review the questions and work on your answers.');
  const low = answers.filter(a => a.score < 40);
  if (low.length > 0) points.push(`📝 Improve answers for ${low.length} question(s) where you scored below 40%.`);
  const high = answers.filter(a => a.score >= 70);
  if (high.length > 0) points.push(`✅ You answered ${high.length} question(s) very well!`);
  if (interviewState.warnings > 0) points.push(`⚠️ ${interviewState.warnings} warning(s) received. Maintain focus in real interviews.`);
  points.push('🎯 Practice regularly using the Interview Prep section to improve.');
  return points;
}

function retakeInterview() {
  document.getElementById('resultsScreen').style.display = 'none';
  document.getElementById('setupScreen').style.display = 'block';
  interviewState = { ...interviewState, questions: [], currentQ: 0, answers: [], scores: [], warnings: 0, terminated: false, stream: null, currentTranscript: '' };
  document.getElementById('startBtn').disabled = true;
  document.getElementById('camStatus').textContent = 'Not granted';
  document.getElementById('micStatus').textContent = 'Not granted';
  document.getElementById('permBtn').textContent = 'Grant Permissions';
  document.getElementById('warn1').classList.remove('active');
  document.getElementById('warn2').classList.remove('active');
  document.getElementById('terminatedBanner').style.display = 'none';
}
