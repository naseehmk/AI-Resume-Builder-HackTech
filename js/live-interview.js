// =============================================
// LIVE-INTERVIEW.JS — Live Interview Simulator
// No external API needed!
// =============================================

// Interview State
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
  eyeCheckInterval: null,
  lookAwayCount: 0,
  lookAwayStart: null
};

// Question banks
const questionBanks = {
  technical: [
    { q: "What is the difference between HTML, CSS, and JavaScript? Explain each briefly.", type: "TECHNICAL" },
    { q: "What is a variable in programming? Give an example.", type: "TECHNICAL" },
    { q: "Explain what a function is and why we use functions in programming.", type: "TECHNICAL" },
    { q: "What is the difference between a class and an object in OOP?", type: "TECHNICAL" },
    { q: "What is an API? How does it work?", type: "TECHNICAL" },
    { q: "Explain what Git is and why version control is important.", type: "TECHNICAL" },
    { q: "What is responsive web design?", type: "TECHNICAL" },
    { q: "What is the difference between frontend and backend development?", type: "TECHNICAL" },
    { q: "Explain what a database is and give examples of database management systems.", type: "TECHNICAL" },
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

// Keywords for scoring answers
const keywords = {
  technical: ['code', 'programming', 'function', 'variable', 'data', 'system', 'develop', 'software', 'design', 'implement', 'algorithm', 'database', 'server', 'client', 'html', 'css', 'javascript', 'python', 'java', 'api', 'git', 'debug', 'test', 'framework', 'library'],
  hr: ['experience', 'skill', 'learn', 'goal', 'team', 'work', 'improve', 'achieve', 'contribute', 'growth', 'opportunity', 'passion', 'dedicated', 'motivated', 'professional', 'career'],
  behavioral: ['situation', 'challenge', 'solved', 'team', 'result', 'learned', 'improved', 'achieved', 'worked', 'helped', 'managed', 'organized', 'communicated', 'deadline', 'success']
};

// ===== SETUP =====
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

function startInterview() {
  const name = document.getElementById('setupName').value.trim();
  const role = document.getElementById('setupRole').value.trim();
  const type = document.getElementById('setupType').value;
  const count = parseInt(document.getElementById('setupCount').value);

  if (!name || !role) {
    alert('Please enter your name and target role.');
    return;
  }

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

  document.getElementById('setupScreen').style.display = 'none';
  document.getElementById('interviewScreen').style.display = 'block';
  document.getElementById('interviewType').textContent = getTypeLabel(type);

  // Setup webcam
  const video = document.getElementById('webcam');
  video.srcObject = interviewState.stream;

  // Start eye tracking
  startEyeTracking();

  // Load first question
  loadQuestion(0);
}

function generateQuestions(type, count) {
  let pool = [];
  if (type === 'mixed') {
    const techCount = Math.ceil(count * 0.4);
    const hrCount = Math.ceil(count * 0.3);
    const behavCount = count - techCount - hrCount;
    pool = [
      ...shuffle(questionBanks.technical).slice(0, techCount),
      ...shuffle(questionBanks.hr).slice(0, hrCount),
      ...shuffle(questionBanks.behavioral).slice(0, behavCount)
    ];
  } else if (type === 'technical') {
    pool = shuffle(questionBanks.technical).slice(0, count);
  } else if (type === 'hr') {
    pool = shuffle(questionBanks.hr).slice(0, count);
  } else {
    pool = shuffle(questionBanks.behavioral).slice(0, count);
  }
  return shuffle(pool).slice(0, count);
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getTypeLabel(type) {
  const labels = { mixed: 'Mixed Interview', technical: 'Technical Interview', hr: 'HR Interview', behavioral: 'Behavioral Interview' };
  return labels[type] || 'Interview';
}

// ===== QUESTIONS =====
function loadQuestion(index) {
  if (interviewState.terminated) return;

  const q = interviewState.questions[index];
  const total = interviewState.totalQ;

  document.getElementById('questionCounter').textContent = `Question ${index + 1} of ${total}`;
  document.getElementById('liveQuestionType').textContent = q.type;
  document.getElementById('liveQuestionText').textContent = q.q;
  document.getElementById('progressFill').style.width = `${(index / total) * 100}%`;

  document.getElementById('answerTextBox').style.display = 'none';
  document.getElementById('userAnswerText').textContent = '';
  document.getElementById('nextBtn').style.display = 'none';
  document.getElementById('recordBtn').disabled = false;
  document.getElementById('recordBtn').textContent = '🎤 Start Speaking';
  document.getElementById('recordBtn').classList.remove('recording');

  document.getElementById('statusWaiting').style.display = 'block';
  document.getElementById('statusRecording').style.display = 'none';
  document.getElementById('statusProcessing').style.display = 'none';

  // Speak the question
  speakQuestion(q.q);

  // Reset timer
  resetTimer();
}

function speakQuestion(text) {
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  const mouth = document.getElementById('avatarMouth');
  const speaking = document.getElementById('avatarSpeaking');

  utterance.onstart = () => {
    mouth.classList.add('speaking');
    speaking.style.display = 'flex';
    document.getElementById('recordBtn').disabled = true;
  };

  utterance.onend = () => {
    mouth.classList.remove('speaking');
    speaking.style.display = 'none';
    document.getElementById('recordBtn').disabled = false;
    startTimer();
  };

  window.speechSynthesis.speak(utterance);
}

// ===== RECORDING =====
function toggleRecording() {
  if (interviewState.isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
}

function startRecording() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Your browser does not support speech recognition. Please use Chrome.');
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  interviewState.recognition = new SpeechRecognition();
  interviewState.recognition.continuous = true;
  interviewState.recognition.interimResults = true;
  interviewState.recognition.lang = 'en-US';

  interviewState.recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    document.getElementById('userAnswerText').textContent = transcript;
    document.getElementById('answerTextBox').style.display = 'block';
  };

  interviewState.recognition.onerror = (event) => {
    console.error('Speech error:', event.error);
  };

  interviewState.recognition.start();
  interviewState.isRecording = true;

  document.getElementById('recordBtn').textContent = '⏹️ Stop Recording';
  document.getElementById('recordBtn').classList.add('recording');
  document.getElementById('statusWaiting').style.display = 'none';
  document.getElementById('statusRecording').style.display = 'flex';
}

function stopRecording() {
  if (interviewState.recognition) {
    interviewState.recognition.stop();
    interviewState.isRecording = false;
  }

  document.getElementById('recordBtn').textContent = '🎤 Start Speaking';
  document.getElementById('recordBtn').classList.remove('recording');
  document.getElementById('statusRecording').style.display = 'none';
  document.getElementById('statusProcessing').style.display = 'block';

  clearInterval(interviewState.timer);

  setTimeout(() => {
    document.getElementById('statusProcessing').style.display = 'none';
    document.getElementById('nextBtn').style.display = 'block';
    scoreAnswer();
  }, 1000);
}

// ===== SCORING =====
function scoreAnswer() {
  const answerText = document.getElementById('userAnswerText').textContent.toLowerCase();
  const question = interviewState.questions[interviewState.currentQ];
  const qType = question.type.toLowerCase();

  if (!answerText || answerText.length < 10) {
    interviewState.scores.push(0);
    interviewState.answers.push({ q: question.q, a: 'No answer provided', score: 0, feedback: 'No answer was detected. Make sure to speak clearly into the microphone.' });
    return;
  }

  // Keyword scoring
  const relevantKeywords = keywords[qType] || keywords.hr;
  let matchCount = 0;
  relevantKeywords.forEach(kw => { if (answerText.includes(kw)) matchCount++; });

  // Length scoring
  const wordCount = answerText.split(' ').length;
  let lengthScore = 0;
  if (wordCount > 50) lengthScore = 30;
  else if (wordCount > 30) lengthScore = 20;
  else if (wordCount > 15) lengthScore = 10;

  // Keyword score
  const keywordScore = Math.min(70, matchCount * 10);
  const totalScore = Math.min(100, keywordScore + lengthScore);

  // Feedback
  let feedback = '';
  if (totalScore >= 70) feedback = 'Excellent answer! You covered the key points well.';
  else if (totalScore >= 50) feedback = 'Good answer. Try to include more specific details and examples.';
  else if (totalScore >= 30) feedback = 'Decent attempt. Work on providing more comprehensive answers with relevant keywords.';
  else feedback = 'Your answer needs improvement. Practice answering with more detail and relevant technical terms.';

  interviewState.scores.push(totalScore);
  interviewState.answers.push({
    q: question.q,
    a: document.getElementById('userAnswerText').textContent,
    score: totalScore,
    feedback: feedback
  });
}

function nextQuestion() {
  interviewState.currentQ++;

  if (interviewState.currentQ >= interviewState.totalQ) {
    endInterview();
  } else {
    loadQuestion(interviewState.currentQ);
  }
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
      if (interviewState.isRecording) stopRecording();
      else {
        interviewState.scores.push(0);
        interviewState.answers.push({
          q: interviewState.questions[interviewState.currentQ].q,
          a: 'Time expired - no answer',
          score: 0,
          feedback: 'No answer was provided within the time limit.'
        });
        document.getElementById('nextBtn').style.display = 'block';
      }
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
  const display = `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
  const el = document.getElementById('timerDisplay');
  el.textContent = display;
  el.classList.toggle('urgent', interviewState.timeLeft <= 30);
}

// ===== EYE TRACKING (using mouse/focus detection) =====
function startEyeTracking() {
  // Track when user leaves the window/tab
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('blur', handleWindowBlur);

  // Also track mouse leaving the window
  document.addEventListener('mouseleave', handleMouseLeave);
}

function handleVisibilityChange() {
  if (document.hidden && !interviewState.terminated) {
    triggerCheatingWarning('Tab switch detected!');
  }
}

function handleWindowBlur() {
  if (!interviewState.terminated) {
    triggerCheatingWarning('Window focus lost!');
  }
}

function handleMouseLeave() {
  if (!interviewState.terminated) {
    interviewState.lookAwayCount++;
    if (interviewState.lookAwayCount % 5 === 0) {
      triggerCheatingWarning('Please keep your eyes on the screen!');
    }
  }
}

function triggerCheatingWarning(reason) {
  if (interviewState.terminated) return;

  interviewState.warnings++;
  const eyeStatus = document.getElementById('eyeStatus');

  if (interviewState.warnings === 1) {
    showWarningBanner(`⚠️ Warning 1/2: ${reason}`);
    document.getElementById('warn1').classList.add('active');
    eyeStatus.textContent = '⚠️ Warning 1';
    eyeStatus.className = 'eye-status warning';
  } else if (interviewState.warnings === 2) {
    showWarningBanner(`⚠️ Warning 2/2: ${reason} - Next violation will terminate the interview!`);
    document.getElementById('warn2').classList.add('active');
    eyeStatus.textContent = '⚠️ Warning 2';
    eyeStatus.className = 'eye-status warning';
  } else if (interviewState.warnings >= 3) {
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
  clearInterval(interviewState.timer);
  if (interviewState.recognition) interviewState.recognition.stop();

  document.getElementById('warningBanner').style.display = 'none';
  document.getElementById('terminatedBanner').style.display = 'block';
  document.getElementById('recordBtn').disabled = true;
  document.getElementById('nextBtn').style.display = 'none';

  document.getElementById('eyeStatus').textContent = '🚫 Terminated';
  document.getElementById('eyeStatus').className = 'eye-status danger';

  // Show results after 3 seconds
  setTimeout(() => {
    endInterview(true);
  }, 3000);
}

// ===== END INTERVIEW =====
function endInterview(terminated = false) {
  clearInterval(interviewState.timer);
  if (interviewState.recognition) interviewState.recognition.stop();
  if (interviewState.stream) {
    interviewState.stream.getTracks().forEach(t => t.stop());
  }

  document.removeEventListener('visibilitychange', handleVisibilityChange);
  window.removeEventListener('blur', handleWindowBlur);
  document.removeEventListener('mouseleave', handleMouseLeave);

  document.getElementById('interviewScreen').style.display = 'none';
  document.getElementById('resultsScreen').style.display = 'block';

  showResults(terminated);
}

function showResults(terminated) {
  const scores = interviewState.scores;
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a,b) => a+b, 0) / scores.length) : 0;
  
  // Penalty for warnings
  const warningPenalty = interviewState.warnings * 5;
  const finalScore = Math.max(0, avgScore - warningPenalty);

  // Update score display
  document.getElementById('resultsName').textContent = `${interviewState.name} — ${interviewState.role} Interview`;
  document.getElementById('scoreNumber').textContent = `${finalScore}%`;
  document.getElementById('answeredCount').textContent = `${scores.length}/${interviewState.totalQ}`;
  document.getElementById('avgQuality').textContent = `${avgScore}%`;
  document.getElementById('warningsCount').textContent = interviewState.warnings;
  document.getElementById('interviewStatus').textContent = terminated ? '❌ Terminated' : '✅ Completed';

  // Animate score circle
  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (finalScore / 100) * circumference;
  setTimeout(() => {
    document.getElementById('scoreCircle').style.transition = 'stroke-dashoffset 1.5s ease';
    document.getElementById('scoreCircle').style.strokeDashoffset = offset;
  }, 300);

  // Review list
  const reviewList = document.getElementById('reviewList');
  reviewList.innerHTML = interviewState.answers.map((item, i) => {
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
      </div>
    `;
  }).join('');

  // Overall feedback
  const feedbackEl = document.getElementById('overallFeedback');
  const feedbackPoints = generateFeedback(finalScore, interviewState.answers, terminated);
  feedbackEl.innerHTML = feedbackPoints.map(f => `<div class="feedback-item">${f}</div>`).join('');
}

function generateFeedback(score, answers, terminated) {
  const points = [];

  if (terminated) points.push('⚠️ Your interview was terminated due to multiple integrity violations. Please retake the interview honestly.');

  if (score >= 80) points.push('🏆 Excellent performance! You demonstrated strong knowledge and communication skills.');
  else if (score >= 60) points.push('👍 Good performance. With a bit more preparation, you can excel in real interviews.');
  else if (score >= 40) points.push('📚 Average performance. Focus on studying the topics you struggled with.');
  else points.push('💪 You need more practice. Review the questions and work on your answers.');

  const lowScores = answers.filter(a => a.score < 40);
  if (lowScores.length > 0) points.push(`📝 Focus on improving answers for ${lowScores.length} question(s) where you scored below 40%.`);

  const highScores = answers.filter(a => a.score >= 70);
  if (highScores.length > 0) points.push(`✅ You answered ${highScores.length} question(s) very well. Keep it up!`);

  if (interviewState.warnings > 0) points.push(`⚠️ You received ${interviewState.warnings} warning(s). In a real interview, maintain eye contact and avoid distractions.`);

  points.push('🎯 Practice regularly using the Interview Prep section to improve your performance.');

  return points;
}

function retakeInterview() {
  document.getElementById('resultsScreen').style.display = 'none';
  document.getElementById('setupScreen').style.display = 'block';
  interviewState = { ...interviewState, questions: [], currentQ: 0, answers: [], scores: [], warnings: 0, terminated: false, stream: null };
  document.getElementById('startBtn').disabled = true;
  document.getElementById('camStatus').textContent = 'Not granted';
  document.getElementById('micStatus').textContent = 'Not granted';
  document.getElementById('permBtn').textContent = 'Grant Permissions';
  document.getElementById('warn1').classList.remove('active');
  document.getElementById('warn2').classList.remove('active');
}
