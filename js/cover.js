async function generateCoverLetter() {
  const fullName    = document.getElementById('fullName').value.trim();
  const email       = document.getElementById('email').value.trim();
  const phone       = document.getElementById('phone').value.trim();
  const jobRole     = document.getElementById('jobRole').value.trim();
  const companyName = document.getElementById('companyName').value.trim();
  const jobDesc     = document.getElementById('jobDesc').value.trim();
  const degree      = document.getElementById('degree').value.trim();
  const skills      = document.getElementById('skills').value.trim();
  const experience  = document.getElementById('experience').value.trim();
  const tone        = document.getElementById('tone').value;

  if (!fullName || !jobRole || !companyName) {
    alert('Please fill in your Name, Job Role, and Company Name.');
    return;
  }

  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('loadingState').style.display = 'flex';
  document.getElementById('coverOutput').style.display = 'none';
  document.getElementById('downloadBtn').style.display = 'none';

  try {
    const prompt = `
Write a professional cover letter for a job application.
Respond ONLY in JSON format with no markdown, no backticks, no extra text.

Respond with this exact JSON structure:
{
  "subject": "Application for [Job Role] Position",
  "opening": "First paragraph - introduction and interest in the role",
  "body": "Second paragraph - relevant skills and experience",
  "closing_para": "Third paragraph - why this company and call to action",
  "closing": "Yours sincerely"
}

Details:
- Applicant Name: ${fullName}
- Job Role: ${jobRole}
- Company: ${companyName}
- Degree: ${degree || 'Not specified'}
- Skills: ${skills || 'Not specified'}
- Experience/Projects: ${experience || 'Not specified'}
- Job Description: ${jobDesc || 'Not specified'}
- Tone: ${tone}

 Write a compelling, ${tone} cover letter. Keep each paragraph 3-4 sentences. Do not include date, address or signature in the JSON - just the letter content paragraphs. Do NOT start any paragraph with "Dear Hiring Manager" - that greeting is already added separately. Start the opening paragraph directly with "I am writing..." or similar.
    `;

    const response = await callGemini(prompt);

    let parsed;
    try {
      const clean = response.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(clean);
    } catch (e) {
      parsed = {
        subject: `Application for ${jobRole} Position`,
        opening: response,
        body: '',
        closing_para: '',
        closing: 'Yours sincerely'
      };
    }

    displayCoverLetter({
      fullName, email, phone, jobRole, companyName, parsed
    });

  } catch (error) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('emptyState').style.display = 'flex';
    alert('Error connecting to AI. Please try again.');
    console.error(error);
  }
}

function displayCoverLetter(data) {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('coverOutput').style.display = 'block';
  document.getElementById('downloadBtn').style.display = 'inline-block';

  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const html = `
    <div class="cover-date">${today}</div>

    <div class="cover-sender">
      <h3>${data.fullName}</h3>
      <p>${data.email || ''}${data.phone ? ' | ' + data.phone : ''}</p>
    </div>

    <div class="cover-recipient">
      <p>The Hiring Manager</p>
      <p>${data.companyName}</p>
    </div>

    <div class="cover-subject">Subject: ${data.parsed.subject}</div>

    <div class="cover-body">
      ${data.parsed.opening ? `<p>${data.parsed.opening}</p>` : ''}
      ${data.parsed.body ? `<p>${data.parsed.body}</p>` : ''}
      ${data.parsed.closing_para ? `<p>${data.parsed.closing_para}</p>` : ''}
    </div>

    <div class="cover-closing">
      <p>${data.parsed.closing || 'Yours sincerely'},</p>
      <p class="cover-name">${data.fullName}</p>
      <p style="font-size:0.82rem;color:#555;margin-top:0.2rem;">${data.email || ''}${data.phone ? ' | ' + data.phone : ''}</p>
    </div>
  `;

  document.getElementById('coverContent').innerHTML = html;
}

function downloadCoverLetter() {
  const name = document.getElementById('fullName').value.trim();
  const content = document.getElementById('coverOutput').innerHTML;

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Cover Letter - ${name}</title>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet"/>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; color: #1a1a2e; background: #fff; padding: 2.5rem; font-size: 13px; }
        .cover-date { font-size: 0.85rem; color: #555; margin-bottom: 1.5rem; }
        .cover-sender { margin-bottom: 1.5rem; }
        .cover-sender h3 { font-family: 'Space Grotesk', sans-serif; font-size: 1.2rem; font-weight: 700; }
        .cover-sender p { font-size: 0.82rem; color: #555; }
        .cover-recipient { margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb; }
        .cover-recipient p { font-size: 0.88rem; color: #333; }
        .cover-subject { font-family: 'Space Grotesk', sans-serif; font-size: 0.95rem; font-weight: 700; color: #7c3aed; margin-bottom: 1.25rem; }
        .cover-body p { font-size: 0.9rem; color: #333; line-height: 1.8; margin-bottom: 1rem; }
        .cover-closing p { font-size: 0.88rem; color: #333; }
        .cover-closing .cover-name { font-family: 'Space Grotesk', sans-serif; font-size: 1rem; font-weight: 700; margin-top: 0.5rem; }
        @media print { body { padding: 1rem; } }
      </style>
    </head>
    <body>${content}</body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); printWindow.close(); }, 600);
}
