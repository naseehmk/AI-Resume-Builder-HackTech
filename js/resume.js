async function generateResume() {
  const fullName      = document.getElementById('fullName').value.trim();
  const email         = document.getElementById('email').value.trim();
  const phone         = document.getElementById('phone').value.trim();
  const location      = document.getElementById('location').value.trim();
  const linkedin      = document.getElementById('linkedin').value.trim();
  const github        = document.getElementById('github').value.trim();
  const jobRole       = document.getElementById('jobRole').value.trim();
  const experience    = document.getElementById('experience').value;
  const degree        = document.getElementById('degree').value.trim();
  const college       = document.getElementById('college').value.trim();
  const collegeLocation = document.getElementById('collegeLocation').value.trim();
  const gradYear      = document.getElementById('gradYear').value.trim();
  const cgpa          = document.getElementById('cgpa').value.trim();
  const class12       = document.getElementById('class12').value.trim();
  const class10       = document.getElementById('class10').value.trim();
  const skills        = document.getElementById('skills').value.trim();
  const workExp       = document.getElementById('workExp').value.trim();
  const strengths     = document.getElementById('strengths').value.trim();
  const languages     = document.getElementById('languages').value.trim();
  const achievements  = document.getElementById('achievements').value.trim();

  if (!fullName || !jobRole) {
    alert('Please fill in at least your Name and Target Role.');
    return;
  }

  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('loadingState').style.display = 'flex';
  document.getElementById('resumeOutput').style.display = 'none';
  document.getElementById('downloadBtn').style.display = 'none';

  try {
    const prompt = `
You are a professional resume writer. Generate a profile summary for the following person.
Respond ONLY in JSON format with no markdown, no backticks, no extra text.

Respond with this exact JSON structure:
{
  "summary": "A compelling 3-4 sentence professional profile summary",
  "suggestions": [
    "Suggestion 1 to improve the resume",
    "Suggestion 2 to improve the resume",
    "Suggestion 3 to improve the resume"
  ]
}

Person details:
- Name: ${fullName}
- Target Job Role: ${jobRole}
- Experience Level: ${experience || 'fresher'}
- Skills: ${skills || 'Not specified'}
- Education: ${degree || 'Not specified'} from ${college || 'Not specified'}, ${gradYear || ''}. CGPA: ${cgpa || 'Not specified'}
- Projects: ${workExp || 'Not specified'}
- Strengths: ${strengths || 'Not specified'}

Write the summary in third person. Make it professional, ATS-friendly, and tailored to the ${jobRole} role. Keep it 3-4 sentences max.
    `;

    const response = await callGemini(prompt);

    let parsed;
    try {
      const clean = response.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(clean);
    } catch (e) {
      parsed = {
        summary: response,
        suggestions: [
          'Add more quantifiable achievements to your projects section.',
          'Include relevant certifications to strengthen your profile.',
          'Tailor your skills section to match the job description keywords.'
        ]
      };
    }

    populateResume({
      fullName, email, phone, location, linkedin, github,
      jobRole, degree, college, collegeLocation, gradYear, cgpa,
      class12, class10, skills,
      workExp, strengths, languages, achievements,
      summary: parsed.summary,
      suggestions: parsed.suggestions
    });

  } catch (error) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('emptyState').style.display = 'flex';
    alert('Error connecting to AI. Please try again.');
    console.error(error);
  }
}

function populateResume(data) {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('resumeOutput').style.display = 'block';
  document.getElementById('downloadBtn').style.display = 'inline-block';

  // Name
  document.getElementById('previewName').textContent = data.fullName;

  // Contacts
  const contacts = [];
  if (data.phone)    contacts.push(data.phone);
  if (data.email)    contacts.push(data.email);
  if (data.location) contacts.push(data.location);
  if (data.linkedin) contacts.push(`<a href="${data.linkedin}" style="color:#7c3aed">LinkedIn</a>`);
  if (data.github)   contacts.push(`<a href="${data.github}" style="color:#7c3aed">Github</a>`);
  document.getElementById('previewContacts').innerHTML = contacts.join(' &nbsp;|&nbsp; ');

  // Education
  let eduHTML = '';
  if (data.degree || data.college) {
    eduHTML += `
      <div class="edu-item">
        <div class="edu-row">
          <strong>${data.college || ''}</strong>
          <span>${data.collegeLocation || ''}</span>
        </div>
        <div class="edu-row">
          <span>${data.degree || ''}${data.cgpa ? ' - CGPA: ' + data.cgpa + '/ 10.0' : ''}</span>
          <span>${data.gradYear ? '2024 – ' + data.gradYear : ''}</span>
        </div>
      </div>`;
  }
  if (data.class12) {
    const parts12 = data.class12.split(',');
    eduHTML += `
      <div class="edu-item">
        <div class="edu-row">
          <strong>${parts12[1] ? parts12[1].trim() : 'Higher Secondary School'}</strong>
          <span>${parts12[2] ? parts12[2].trim() : ''}</span>
        </div>
        <div class="edu-row">
          <span>XII<sup>th</sup> – ${parts12[0] ? parts12[0].trim() : ''}</span>
          <span>${parts12[3] ? parts12[3].trim() : ''}</span>
        </div>
      </div>`;
  }
  if (data.class10) {
    const parts10 = data.class10.split(',');
    eduHTML += `
      <div class="edu-item">
        <div class="edu-row">
          <strong>${parts10[1] ? parts10[1].trim() : 'High School'}</strong>
          <span>${parts10[2] ? parts10[2].trim() : ''}</span>
        </div>
        <div class="edu-row">
          <span>X<sup>th</sup> – ${parts10[0] ? parts10[0].trim() : ''}</span>
          <span>${parts10[3] ? parts10[3].trim() : ''}</span>
        </div>
      </div>`;
  }
  document.getElementById('previewEducation').innerHTML = eduHTML || '<p style="font-size:0.85rem;color:#999">No education details provided</p>';

  // Profile Summary
  document.getElementById('previewSummary').textContent = data.summary;

  // Technical Knowledge
  const skillsArr = data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
  document.getElementById('previewSkills').innerHTML = skillsArr
    .map(s => `<span class="skill-tag">${s}</span>`)
    .join('') || '<p style="font-size:0.85rem;color:#999">No skills provided</p>';

  // Projects
  if (data.workExp) {
    document.getElementById('expSection').style.display = 'block';
    const projects = data.workExp.split('\n').filter(p => p.trim());
    let projHTML = '';
    projects.forEach(proj => {
      if (proj.includes('-') || proj.includes(':')) {
        const parts = proj.split(/[-:]/);
        projHTML += `<div class="proj-item"><strong>${parts[0].trim()}:</strong> ${parts.slice(1).join('-').trim()}</div>`;
      } else {
        projHTML += `<div class="proj-item">${proj}</div>`;
      }
    });
    document.getElementById('previewExperience').innerHTML = projHTML;
  } else {
    document.getElementById('expSection').style.display = 'none';
  }

  // Strengths
  if (data.strengths) {
    document.getElementById('strengthSection').style.display = 'block';
    const strArr = data.strengths.split(',').map(s => s.trim()).filter(Boolean);
    document.getElementById('previewStrengths').innerHTML = strArr
      .map(s => `<div class="bullet-item">${s}</div>`)
      .join('');
  } else {
    document.getElementById('strengthSection').style.display = 'none';
  }

  // Languages
  if (data.languages) {
    document.getElementById('langSection').style.display = 'block';
    const langArr = data.languages.split(',').map(l => l.trim()).filter(Boolean);
    document.getElementById('previewLanguages').innerHTML = langArr
      .map(l => `<div class="bullet-item">${l}</div>`)
      .join('');
  } else {
    document.getElementById('langSection').style.display = 'none';
  }

  // Certifications
  if (data.achievements) {
    document.getElementById('achieveSection').style.display = 'block';
    const achArr = data.achievements.split('\n').filter(a => a.trim());
    document.getElementById('previewAchievements').innerHTML = achArr
      .map(a => `<div class="bullet-item">${a.trim()}</div>`)
      .join('');
  } else {
    document.getElementById('achieveSection').style.display = 'none';
  }

  // AI Suggestions
  if (data.suggestions && data.suggestions.length > 0) {
    document.getElementById('suggestionsContent').innerHTML = data.suggestions
      .map(s => `<div class="suggestion-item">${s}</div>`)
      .join('');
  }
}

function downloadPDF() {
  const resumeOutput = document.getElementById('resumeOutput').innerHTML;
  const name = document.getElementById('previewName').textContent;

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Resume - ${name}</title>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet"/>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; color: #1a1a2e; background: #fff; padding: 2rem; font-size: 13px; }
        .resume-head { text-align: center; border-bottom: 2px solid #1a1a2e; padding-bottom: 0.75rem; margin-bottom: 1rem; }
        .resume-head h1 { font-family: 'Space Grotesk', sans-serif; font-size: 1.5rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
        .preview-contacts { font-size: 0.78rem; color: #555; margin-top: 0.3rem; }
        .resume-section { margin-bottom: 1rem; }
        .resume-sec-title { font-family: 'Space Grotesk', sans-serif; font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #1a1a2e; border-bottom: 1.5px solid #1a1a2e; padding-bottom: 0.2rem; margin-bottom: 0.5rem; }
        .edu-item { margin-bottom: 0.5rem; }
        .edu-row { display: flex; justify-content: space-between; font-size: 0.85rem; }
        .edu-row strong { color: #1a1a2e; }
        #previewSummary { font-size: 0.88rem; color: #333; line-height: 1.65; }
        #previewSkills p { font-size: 0.85rem; color: #333; margin-bottom: 0.2rem; }
        .proj-item { font-size: 0.85rem; color: #333; margin-bottom: 0.3rem; }
        .bullet-item { font-size: 0.85rem; color: #333; padding-left: 1rem; position: relative; margin-bottom: 0.2rem; }
        .bullet-item::before { content: '•'; position: absolute; left: 0; color: #1a1a2e; }
        .ai-suggestions { display: none; }
        a { color: #1a1a2e; }
        @media print { body { padding: 0.5rem; } }
      </style>
    </head>
    <body>${resumeOutput}</body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); printWindow.close(); }, 600);
}
