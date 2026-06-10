async function generateResume() {
  const fullName    = document.getElementById('fullName').value.trim();
  const email       = document.getElementById('email').value.trim();
  const phone       = document.getElementById('phone').value.trim();
  const location    = document.getElementById('location').value.trim();
  const linkedin    = document.getElementById('linkedin').value.trim();
  const jobRole     = document.getElementById('jobRole').value.trim();
  const experience  = document.getElementById('experience').value;
  const skills      = document.getElementById('skills').value.trim();
  const languages   = document.getElementById('languages').value.trim();
  const degree      = document.getElementById('degree').value.trim();
  const college     = document.getElementById('college').value.trim();
  const gradYear    = document.getElementById('gradYear').value.trim();
  const cgpa        = document.getElementById('cgpa').value.trim();
  const class12     = document.getElementById('class12').value.trim();
  const class10     = document.getElementById('class10').value.trim();
  const workExp     = document.getElementById('workExp').value.trim();
  const achievements = document.getElementById('achievements').value.trim();

  if (!fullName || !jobRole || !skills) {
    alert('Please fill in at least your Name, Target Role, and Skills.');
    return;
  }

  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('loadingState').style.display = 'flex';
  document.getElementById('resumeOutput').style.display = 'none';
  document.getElementById('downloadBtn').style.display = 'none';

  try {
    const prompt = `
You are a professional resume writer. Generate a resume for the following person.
Respond ONLY in JSON format with no markdown, no backticks, no extra text.

Respond with this exact JSON structure:
{
  "summary": "A compelling 3-4 sentence professional summary",
  "suggestions": [
    "Suggestion 1",
    "Suggestion 2",
    "Suggestion 3"
  ]
}

Person details:
- Name: ${fullName}
- Target Job Role: ${jobRole}
- Experience Level: ${experience || 'fresher'}
- Technical Skills: ${skills}
- Languages Known: ${languages || 'Not specified'}
- Education: ${degree || 'Not specified'} from ${college || 'Not specified'}, ${gradYear || ''}. CGPA: ${cgpa || 'Not specified'}
- 12th Grade: ${class12 || 'Not specified'}
- 10th Grade: ${class10 || 'Not specified'}
- Work Experience / Projects: ${workExp || 'No experience listed'}
- Achievements: ${achievements || 'None listed'}

Write the summary in first person. Make it ATS-friendly and tailored to the ${jobRole} role.
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
          'Add more quantifiable achievements to your experience section.',
          'Include relevant certifications to strengthen your profile.',
          'Tailor your skills section to match the job description keywords.'
        ]
      };
    }

    populateResume({
      fullName, email, phone, location, linkedin,
      jobRole, skills, languages, degree, college, gradYear, cgpa,
      class12, class10, workExp, achievements,
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

  // Name & Role
  document.getElementById('previewName').textContent = data.fullName;
  document.getElementById('previewRole').textContent = data.jobRole;

  // Contacts
  const contacts = [];
  if (data.email)    contacts.push(data.email);
  if (data.phone)    contacts.push(data.phone);
  if (data.location) contacts.push(data.location);
  if (data.linkedin) contacts.push(data.linkedin);
  document.getElementById('previewContacts').innerHTML = contacts.join(' &nbsp;|&nbsp; ');

  // Summary
  document.getElementById('previewSummary').textContent = data.summary;

  // Skills
  const skillsArr = data.skills.split(',').map(s => s.trim()).filter(Boolean);
  let skillsHTML = skillsArr.map(s => `<span class="skill-tag">${s}</span>`).join('');

  document.getElementById('previewSkills').innerHTML = skillsHTML;

  // Education
  let eduHTML = '';
  if (data.degree || data.college) {
    eduHTML += `
      <div class="edu-item">
        <h4>${data.degree || 'Degree'}</h4>
        <p>${data.college || ''}${data.gradYear ? ' · ' + data.gradYear : ''}${data.cgpa ? ' · ' + data.cgpa : ''}</p>
      </div>`;
  }
  if (data.class12) {
    eduHTML += `
      <div class="edu-item">
        <h4>Class 12 (HSC)</h4>
        <p>${data.class12}</p>
      </div>`;
  }
  if (data.class10) {
    eduHTML += `
      <div class="edu-item">
        <h4>Class 10 (SSC)</h4>
        <p>${data.class10}</p>
      </div>`;
  }
  document.getElementById('previewEducation').innerHTML = eduHTML || '<p style="font-size:0.85rem;color:#999">No education details provided</p>';

  // Experience
  if (data.workExp) {
    document.getElementById('expSection').style.display = 'block';
    document.getElementById('previewExperience').innerHTML = `<div class="exp-item"><p>${data.workExp.replace(/\n/g, '<br/>')}</p></div>`;
  } else {
    document.getElementById('expSection').style.display = 'none';
  }

  // Achievements
  if (data.achievements) {
    document.getElementById('achieveSection').style.display = 'block';
    const achArr = data.achievements.split('\n').filter(a => a.trim());
    document.getElementById('previewAchievements').innerHTML = achArr
      .map(a => `<div class="achieve-item">${a.trim()}</div>`)
      .join('');
  } else {
    document.getElementById('achieveSection').style.display = 'none';
  }
  
  // Languages
  if (data.languages) {
    const langSection = document.getElementById('langSection');
    if (langSection) langSection.style.display = 'block';
    const langArr = data.languages.split(',').map(l => l.trim()).filter(Boolean);
    document.getElementById('previewLanguages').innerHTML = langArr
      .map(l => `<span class="skill-tag">${l}</span>`)
      .join('');
  } else {
    const langSection = document.getElementById('langSection');
    if (langSection) langSection.style.display = 'none';
  }

  // AI Suggestions
  if (data.suggestions && data.suggestions.length > 0) {
    document.getElementById('suggestionsContent').innerHTML = data.suggestions
      .map(s => `<div class="suggestion-item">${s}</div>`)
      .join('');
  }
}

function downloadPDF() {
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Resume - ${document.getElementById('previewName').textContent}</title>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet"/>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; color: #1a1a2e; background: #fff; padding: 2rem; }
        .resume-head { border-bottom: 2px solid #7c3aed; padding-bottom: 1rem; margin-bottom: 1.25rem; }
        .resume-head h1 { font-family: 'Space Grotesk', sans-serif; font-size: 1.6rem; font-weight: 700; }
        .preview-role { font-size: 0.95rem; color: #7c3aed; font-weight: 500; margin-top: 0.2rem; }
        .preview-contacts { font-size: 0.78rem; color: #555; margin-top: 0.4rem; }
        .resume-section { margin-bottom: 1.25rem; }
        .resume-sec-title { font-family: 'Space Grotesk', sans-serif; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #7c3aed; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.3rem; margin-bottom: 0.6rem; }
        .resume-section p, .exp-item p { font-size: 0.88rem; color: #333; line-height: 1.65; }
        .skills-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .skill-tag { background: #f3e8ff; color: #7c3aed; font-size: 0.78rem; font-weight: 500; padding: 0.25rem 0.7rem; border-radius: 999px; }
        .edu-item { margin-bottom: 0.75rem; }
        .edu-item h4 { font-size: 0.9rem; font-weight: 600; color: #1a1a2e; }
        .edu-item p { font-size: 0.82rem; color: #666; }
        .achieve-item { font-size: 0.85rem; color: #333; padding-left: 1rem; position: relative; margin-bottom: 0.3rem; }
        .achieve-item::before { content: '▸'; position: absolute; left: 0; color: #7c3aed; }
        .ai-suggestions { display: none; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      ${document.getElementById('resumeOutput').innerHTML}
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
}
