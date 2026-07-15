// =============================================
// LIVE-INTERVIEW.JS - Final Version
// All fixes included
// =============================================

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
    { q: "What is the difference between HTML, CSS, and JavaScript? Explain each briefly.", type: "TECHNICAL", answer: "HTML provides the structure of a webpage using elements like headings, paragraphs and buttons. CSS handles the styling and appearance like colors, fonts and layout. JavaScript adds interactivity and logic like button clicks, form validation and API calls. Together, HTML is the skeleton, CSS is the clothes, and JavaScript is the brain." },
    { q: "What is a variable in programming? Give an example.", type: "TECHNICAL", answer: "A variable is a container that stores data values in a program. For example, in JavaScript: let name = 'Naseeh'; stores the value 'Naseeh' in a variable called name. Variables can store numbers, text, booleans and other data types." },
    { q: "Explain what a function is and why we use functions in programming.", type: "TECHNICAL", answer: "A function is a reusable block of code that performs a specific task. We use functions to avoid repeating code, organize our program into smaller parts, and make code easier to maintain. For example, a function called calculateArea() can be called multiple times instead of writing the same formula repeatedly." },
    { q: "What is the difference between a class and an object in OOP?", type: "TECHNICAL", answer: "A class is a blueprint or template that defines properties and methods. An object is an instance of a class — the actual thing created from the blueprint. For example, 'Car' is a class with properties like color and speed. A specific car like 'myRedCar' is an object created from that class." },
    { q: "What is an API and how does it work?", type: "TECHNICAL", answer: "API stands for Application Programming Interface. It allows two different applications to communicate with each other. For example, when you use a weather app, it sends a request to a weather API which returns the current weather data. APIs work through requests and responses using protocols like HTTP." },
    { q: "Explain what Git is and why version control is important.", type: "TECHNICAL", answer: "Git is a version control system that tracks changes in code over time. Version control is important because it allows developers to save different versions of their code, collaborate with team members, revert to previous versions if something breaks, and track who made what changes and when." },
    { q: "What is responsive web design?", type: "TECHNICAL", answer: "Responsive web design is an approach where a website automatically adjusts its layout and content to look good on all screen sizes — from mobile phones to tablets to desktop computers. This is achieved using CSS techniques like media queries, flexible grids, and flexible images." },
    { q: "What is the difference between frontend and backend development?", type: "TECHNICAL", answer: "Frontend development deals with everything the user sees and interacts with in the browser — like HTML, CSS and JavaScript. Backend development handles the server side — databases, APIs, authentication and business logic. Frontend is the face of the application while backend is the brain behind it." },
    { q: "What is a database? Give examples of database management systems.", type: "TECHNICAL", answer: "A database is an organized collection of structured data that can be easily accessed, managed and updated. Examples of database management systems include MySQL, PostgreSQL, MongoDB, SQLite and Oracle. Databases are used to store user information, product data, transactions and more." },
    { q: "What is debugging? How do you approach fixing a bug in your code?", type: "TECHNICAL", answer: "Debugging is the process of finding and fixing errors or bugs in code. My approach is to first reproduce the error, then read the error message carefully, use console.log or a debugger to trace the problem, identify the root cause, fix it, and test again to make sure it is resolved." }
  ],
  hr: [
    { q: "Tell me about yourself and your background.", type: "HR", answer: "I am a BTech Computer Science student at Amity University Haryana with a CGPA of 7.9. I have a strong foundation in programming with skills in C, C++, HTML, CSS and JavaScript. I recently built an AI-powered Resume Builder during my HACKTECH internship. I am passionate about web development and eager to contribute to real-world projects." },
    { q: "Why are you interested in this role?", type: "HR", answer: "I am interested in this role because it aligns perfectly with my skills and career goals in web development. I am excited about the opportunity to work on real projects, learn from experienced professionals, and contribute meaningfully to the team. This role will help me grow both technically and professionally." },
    { q: "Where do you see yourself in 5 years?", type: "HR", answer: "In 5 years, I see myself as a skilled full-stack developer working on impactful products. I plan to deepen my expertise in modern frameworks, take on leadership responsibilities, and possibly mentor junior developers. I want to continue learning and growing with a company that values innovation." },
    { q: "What are your greatest strengths?", type: "HR", answer: "My greatest strengths are my ability to learn quickly, my strong problem-solving skills, and my dedication to quality work. I am also a good team player who communicates clearly. During my internship, I demonstrated these strengths by building a complete AI web application from scratch within a short timeframe." },
    { q: "What is your biggest weakness and how are you working on it?", type: "HR", answer: "My biggest weakness is that I sometimes spend too much time trying to perfect something before moving on. I am working on this by setting time limits for tasks and focusing on getting things done first, then refining. This has helped me become more productive and deliver work on time." },
    { q: "Why should we hire you over other candidates?", type: "HR", answer: "You should hire me because I bring a combination of technical skills, a strong work ethic, and a genuine passion for development. I have hands-on experience building real projects, I learn quickly, and I am highly motivated to contribute from day one. I am also a team player who adapts well to new environments." },
    { q: "What motivates you to do your best work?", type: "HR", answer: "I am motivated by the impact my work can have on real users. When I see someone use something I built and it helps them, that is very fulfilling. I am also motivated by continuous learning — every project teaches me something new and pushes me to improve my skills." },
    { q: "How do you handle stress and pressure?", type: "HR", answer: "I handle stress by breaking large problems into smaller manageable tasks and focusing on one thing at a time. I also prioritize tasks by urgency and importance. Taking short breaks helps me stay focused. During my internship, I managed multiple deliverables under tight deadlines by staying organized and communicating proactively." }
  ],
  behavioral: [
    { q: "Tell me about a time when you faced a challenge and how you overcame it.", type: "BEHAVIORAL", answer: "During my HACKTECH internship, I faced a major challenge when the Gemini API stopped working in my region. I researched alternatives, tried multiple APIs, and eventually solved it using the Groq API with a Cloudflare Workers proxy to secure the key. This taught me persistence and creative problem solving." },
    { q: "Describe a situation where you had to work as part of a team.", type: "BEHAVIORAL", answer: "During a group project at university, our team had to build a software solution under a tight deadline. I took responsibility for coordinating tasks, ensuring clear communication, and helping team members who were stuck. We completed the project on time and received good feedback from our professor." },
    { q: "Give an example of a time when you showed leadership.", type: "BEHAVIORAL", answer: "During a college event, I volunteered to lead the technical team responsible for setting up the registration system. I assigned tasks based on each member's strengths, resolved conflicts, and ensured everything ran smoothly on the day. The event was a success and my team appreciated the clear direction." },
    { q: "Tell me about a time you made a mistake and what you learned from it.", type: "BEHAVIORAL", answer: "Early in my internship, I accidentally deleted some code without having a backup. I learned the hard way why version control with Git is so important. After that, I made it a habit to commit code regularly and maintain proper backups. This mistake taught me discipline and the importance of good development practices." },
    { q: "Describe a situation where you had to meet a tight deadline.", type: "BEHAVIORAL", answer: "During my HACKTECH internship, I had to deliver a working AI web application within a month. I broke the project into daily tasks, focused on core features first, and kept testing regularly. By staying organized and disciplined, I completed the project on time with all required features working." },
    { q: "Give an example of a time you went above and beyond what was expected.", type: "BEHAVIORAL", answer: "My internship project only required a basic resume builder and interview prep, but I went beyond by adding a Cover Letter Generator, and a Live Interview Simulator with cheating detection. I also implemented a secure API proxy using Cloudflare Workers. This showed my initiative and commitment to delivering more value." }
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
  document.getElementById('recordBtn').textContent = '⏳ Listen to question...';
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
    setTimeout(() => autoStartRecording(), 800);
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
  document.getElementById('recordBtn').textContent = '⏹️ Stop & Submit Answer';
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

    const fullTranscript = (finalTranscript + interimTranscript).trim();
    if (fullTranscript) {
      interviewState.currentTranscript = fullTranscript;
      document.getElementById('userAnswerText').textContent = fullTranscript;
      document.getElementById('answerTextBox').style.display = 'block';
    }
  };

  interviewState.recognition.onerror = (e) => {
    if (e.error === 'no-speech' && interviewState.isRecording) {
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

// ===== TOGGLE RECORDING =====
function toggleRecording() {
  if (interviewState.isRecording) submitAnswer();
}

function submitAnswer() {
  // Capture answer BEFORE stopping recognition
  const capturedAnswer = interviewState.currentTranscript.trim() ||
    document.getElementById('userAnswerText').textContent.trim();

  stopSpeechRecognition();
  clearInterval(interviewState.timer);

  document.getElementById('recordBtn').disabled = true;
  document.getElementById('recordBtn').classList.remove('recording');
  document.getElementById('statusRecording').style.display = 'none';
  document.getElementById('statusProcessing').style.display = 'block';

  setTimeout(() => {
    document.getElementById('statusProcessing').style.display = 'none';

    if (!capturedAnswer || capturedAnswer.length < 3) {
      document.getElementById('userAnswerText').textContent = 'No answer detected. Please speak clearly next time.';
      document.getElementById('answerTextBox').style.display = 'block';
      scoreAndSaveAnswer('');
    } else {
      document.getElementById('userAnswerText').textContent = capturedAnswer;
      document.getElementById('answerTextBox').style.display = 'block';
      scoreAndSaveAnswer(capturedAnswer);
    }

    document.getElementById('nextBtn').style.display = 'block';
    document.getElementById('recordBtn').textContent = '✅ Answer Submitted';
  }, 1500);
}

// ===== SCORING =====
function scoreAndSaveAnswer(answerText) {
  const question = interviewState.questions[interviewState.currentQ];
  const qType = question.type.toLowerCase();
  const text = answerText.toLowerCase();

  if (!answerText || answerText.length < 5) {
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
async function startCheatingDetection() {
  // Tab/window detection
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('blur', onWindowBlur);

  // Face detection using face-api.js
  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights');
    await faceapi.nets.faceLandmark68TinyNet.loadFromUri('https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights');
    startFaceTracking();
  } catch(e) {
    console.log('Face detection unavailable:', e);
  }
}

function startFaceTracking() {
  const video = document.getElementById('webcam');
  let noFaceCount = 0;
  let lookAwayCount = 0;

  setInterval(async () => {
    if (interviewState.terminated) return;

    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true);

      const eyeStatus = document.getElementById('eyeStatus');

      if (!detection) {
        noFaceCount++;
        eyeStatus.textContent = '⚠️ Face not detected!';
        eyeStatus.className = 'eye-status warning';
        if (noFaceCount >= 5) {
          noFaceCount = 0;
          triggerWarning('Face not detected — please stay in front of the camera!');
        }
      } else {
        noFaceCount = 0;
        const landmarks = detection.landmarks;
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();

        const leftCenterX = leftEye.reduce((a,b) => a + b.x, 0) / leftEye.length;
        const rightCenterX = rightEye.reduce((a,b) => a + b.x, 0) / rightEye.length;
        const faceWidth = detection.detection.box.width;
        const faceX = detection.detection.box.x;
        const eyeMidX = (leftCenterX + rightCenterX) / 2;
        const relativePos = (eyeMidX - faceX) / faceWidth;

        if (relativePos < 0.25 || relativePos > 0.75) {
          lookAwayCount++;
          eyeStatus.textContent = '👀 Looking away!';
          eyeStatus.className = 'eye-status warning';
          if (lookAwayCount >= 8) {
            lookAwayCount = 0;
            triggerWarning('Please look at the screen — do not look away!');
          }
        } else {
          lookAwayCount = 0;
          eyeStatus.textContent = '✅ Eye contact good';
          eyeStatus.className = 'eye-status';
        }
      }
    } catch(e) {}
  }, 1000);
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
        ${item.score < 70 ? `<p class="review-model-answer">📖 <strong>Model Answer:</strong> ${interviewState.questions[i]?.answer || ''}</p>` : ''}
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
