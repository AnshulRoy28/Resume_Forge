// ── Add Page ─────────────────────────────────────────────────────
const Add = (() => {
  let currentType = 'project';

  // ── GitHub Repo Analyzer ───────────────────────────────────────
  async function analyzeRepo() {
    const url = document.getElementById('repoUrl').value.trim();
    if (!url) return;
    if (!/github\.com\/[^/]+\/[^/]+/.test(url)) {
      App.showAlert('repoAlert', 'Please enter a valid GitHub repository URL.', 'error');
      return;
    }

    App.hideAlert('repoAlert');
    _setRepoLoading(true);
    _showRepoProgress(true);

    const steps = [
      { txt: 'Fetching repository...', pct: 20, num: '1 / 4' },
      { txt: 'Analyzing tech stack...', pct: 50, num: '2 / 4' },
      { txt: 'Writing resume content...', pct: 80, num: '3 / 4' },
      { txt: 'Saving to library...', pct: 95, num: '4 / 4' },
    ];
    let i = 0;
    const ticker = setInterval(() => {
      if (i < steps.length) _setRepoStep(steps[i++]);
    }, 1800);

    try {
      const data = await App.api('POST', '/api/analyze', { repoUrl: url });
      clearInterval(ticker);
      _setRepoStep({ txt: 'Done!', pct: 100, num: '4 / 4' });
      await App.sleep(400);
      _showRepoProgress(false);
      App.showAlert('repoAlert', `✓ "${data.repoName}" added to library`, 'success');
      document.getElementById('repoUrl').value = '';
    } catch (err) {
      clearInterval(ticker);
      _showRepoProgress(false);
      App.showAlert('repoAlert', err.message, 'error');
    } finally {
      _setRepoLoading(false);
    }
  }

  function _setRepoLoading(on) {
    const btn = document.getElementById('analyzeBtn');
    if (!btn) return;
    btn.disabled = on;
    document.getElementById('analyzeBtnTxt').textContent = on ? 'Analyzing...' : 'Analyze & Add';
  }

  function _showRepoProgress(on) {
    document.getElementById('repoProgress')?.classList.toggle('hidden', !on);
  }

  function _setRepoStep({ txt, pct, num }) {
    const t = document.getElementById('repoStepTxt');
    const n = document.getElementById('repoStepNum');
    const b = document.getElementById('repoBar');
    if (t) t.textContent = txt;
    if (n) n.textContent = num;
    if (b) b.style.width = pct + '%';
  }

  // ── Modal for Manual Entry ─────────────────────────────────────
  function openModal(type) {
    currentType = type;
    const titles = {
      project: 'Add Project',
      experience: 'Add Work Experience',
      education: 'Add Education',
      skill: 'Add Skills',
      certification: 'Add Certification'
    };
    document.getElementById('modalTitle').textContent = titles[type] || 'Add to Library';
    App.hideAlert('modalAlert');
    _renderFormFields(type);
    document.getElementById('addItemModal')?.classList.remove('hidden');
  }

  function closeModal() {
    document.getElementById('addItemModal')?.classList.add('hidden');
  }

  function _renderFormFields(type) {
    const container = document.getElementById('modalDynamicFields');
    if (!container) return;

    let html = '';
    
    if (type === 'project') {
      html = `
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Project Name *</label>
          <input id="itemTitle" type="text" placeholder="E-commerce Platform" class="input py-2.5 text-sm">
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">GitHub/Source URL</label>
          <input id="itemUrl" type="url" placeholder="https://github.com/username/project" class="input py-2.5 text-sm">
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Technologies Used <span class="text-zinc-600">(comma separated)</span></label>
          <input id="itemTags" type="text" placeholder="React, Node.js, PostgreSQL, AWS" class="input py-2.5 text-sm">
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Project Description & Achievements *</label>
          <textarea id="itemContent" placeholder="Describe what you built, the problem it solves, key features, and your accomplishments. Use bullet points for achievements." class="input scroll min-h-[180px] text-sm"></textarea>
          <p class="text-[10px] text-zinc-600">Tip: Use markdown formatting. Start achievements with action verbs.</p>
        </div>`;
    } 
    else if (type === 'experience') {
      html = `
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Job Title/Position *</label>
          <input id="itemTitle" type="text" placeholder="Senior Software Engineer" class="input py-2.5 text-sm">
        </div>
        <div class="flex gap-3">
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">Company Name *</label>
            <input id="itemOrganization" type="text" placeholder="Google" class="input py-2.5 text-sm">
          </div>
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">Location</label>
            <input id="itemLocation" type="text" placeholder="San Francisco, CA" class="input py-2.5 text-sm">
          </div>
        </div>
        <div class="flex gap-3">
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">Start Date *</label>
            <input id="itemStartDate" type="text" placeholder="Jan 2020" class="input py-2.5 text-sm">
          </div>
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">End Date</label>
            <input id="itemEndDate" type="text" placeholder="Present" class="input py-2.5 text-sm">
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Technologies & Skills <span class="text-zinc-600">(comma separated)</span></label>
          <input id="itemTags" type="text" placeholder="Python, Django, AWS, Docker, Kubernetes" class="input py-2.5 text-sm">
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Responsibilities & Achievements *</label>
          <textarea id="itemContent" placeholder="• Led development of microservices architecture serving 10M+ users&#10;• Reduced API response time by 40% through optimization&#10;• Mentored team of 5 junior engineers" class="input scroll min-h-[180px] text-sm"></textarea>
          <p class="text-[10px] text-zinc-600">Use bullet points. Start with action verbs. Quantify impact when possible.</p>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Company Website/LinkedIn</label>
          <input id="itemUrl" type="url" placeholder="https://company.com" class="input py-2.5 text-sm">
        </div>`;
    }
    else if (type === 'education') {
      html = `
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Degree *</label>
          <input id="itemTitle" type="text" placeholder="Bachelor of Science in Computer Science" class="input py-2.5 text-sm">
        </div>
        <div class="flex gap-3">
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">University/Institution *</label>
            <input id="itemOrganization" type="text" placeholder="Massachusetts Institute of Technology" class="input py-2.5 text-sm">
          </div>
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">Location</label>
            <input id="itemLocation" type="text" placeholder="Cambridge, MA" class="input py-2.5 text-sm">
          </div>
        </div>
        <div class="flex gap-3">
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">Start Year *</label>
            <input id="itemStartDate" type="text" placeholder="2018" class="input py-2.5 text-sm">
          </div>
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">Graduation Year</label>
            <input id="itemEndDate" type="text" placeholder="2022" class="input py-2.5 text-sm">
          </div>
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">GPA</label>
            <input id="itemGpa" type="text" placeholder="3.8/4.0" class="input py-2.5 text-sm">
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Relevant Coursework <span class="text-zinc-600">(comma separated)</span></label>
          <input id="itemTags" type="text" placeholder="Data Structures, Algorithms, Machine Learning, Databases" class="input py-2.5 text-sm">
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Achievements, Honors & Activities</label>
          <textarea id="itemContent" placeholder="• Dean's List all semesters&#10;• President of Computer Science Club&#10;• Published research paper on distributed systems" class="input scroll min-h-[140px] text-sm"></textarea>
          <p class="text-[10px] text-zinc-600">Include honors, awards, relevant activities, research, publications.</p>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">University Website</label>
          <input id="itemUrl" type="url" placeholder="https://university.edu" class="input py-2.5 text-sm">
        </div>`;
    }
    else if (type === 'certification') {
      html = `
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Certification Name *</label>
          <input id="itemTitle" type="text" placeholder="AWS Certified Solutions Architect - Professional" class="input py-2.5 text-sm">
        </div>
        <div class="flex gap-3">
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">Issuing Organization *</label>
            <input id="itemOrganization" type="text" placeholder="Amazon Web Services" class="input py-2.5 text-sm">
          </div>
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">Date Obtained *</label>
            <input id="itemStartDate" type="text" placeholder="Dec 2023" class="input py-2.5 text-sm">
          </div>
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">Expiry Date</label>
            <input id="itemEndDate" type="text" placeholder="Dec 2026" class="input py-2.5 text-sm">
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Credential ID</label>
          <input id="itemCredentialId" type="text" placeholder="ABC123XYZ789" class="input py-2.5 text-sm">
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Verification URL *</label>
          <input id="itemUrl" type="url" placeholder="https://www.credly.com/badges/..." class="input py-2.5 text-sm">
          <p class="text-[10px] text-zinc-600">Link to verify the certification (Credly, official certificate, etc.)</p>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Skills Covered <span class="text-zinc-600">(comma separated)</span></label>
          <input id="itemTags" type="text" placeholder="AWS, Cloud Architecture, Security, Networking" class="input py-2.5 text-sm">
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Additional Details</label>
          <textarea id="itemContent" placeholder="Score, key competencies demonstrated, or other relevant information" class="input scroll min-h-[100px] text-sm"></textarea>
        </div>`;
    }
    else if (type === 'skill') {
      html = `
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Skill Category *</label>
          <input id="itemTitle" type="text" placeholder="Frontend Development" class="input py-2.5 text-sm">
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Skills *</label>
          <textarea id="itemContent" placeholder="• React, Vue.js, Angular - 5+ years&#10;• TypeScript, JavaScript (ES6+) - Expert&#10;• HTML5, CSS3, Tailwind CSS - Advanced&#10;• Webpack, Vite, Build Tools - Proficient" class="input scroll min-h-[160px] text-sm"></textarea>
          <p class="text-[10px] text-zinc-600">List skills with proficiency levels or years of experience.</p>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Tags <span class="text-zinc-600">(comma separated)</span></label>
          <input id="itemTags" type="text" placeholder="React, TypeScript, CSS, JavaScript" class="input py-2.5 text-sm">
        </div>`;
    }
    
    container.innerHTML = html;
  }

  async function saveItem() {
    const title   = document.getElementById('itemTitle')?.value.trim();
    const content = document.getElementById('itemContent')?.value.trim() || '';
    
    // Validate required fields based on type
    if (!title) {
      App.showAlert('modalAlert', 'Please fill in all required fields.', 'error');
      return;
    }

    // Content is required for project, experience, and skill types
    if ((currentType === 'project' || currentType === 'experience' || currentType === 'skill') && !content) {
      App.showAlert('modalAlert', 'Please fill in all required fields.', 'error');
      return;
    }

    const tags         = document.getElementById('itemTags')?.value.split(',').map(t => t.trim()).filter(Boolean) || [];
    const source_url   = document.getElementById('itemUrl')?.value.trim() || '';
    const organization = document.getElementById('itemOrganization')?.value.trim() || null;
    const location     = document.getElementById('itemLocation')?.value.trim() || null;
    const start_date   = document.getElementById('itemStartDate')?.value.trim() || null;
    const end_date     = document.getElementById('itemEndDate')?.value.trim() || null;
    const gpa          = document.getElementById('itemGpa')?.value.trim() || null;
    const credential_id = document.getElementById('itemCredentialId')?.value.trim() || null;

    try {
      await App.api('POST', '/api/library', { 
        title, content, tags, source_url, item_type: currentType,
        organization, location, start_date, end_date, gpa, credential_id
      });
      closeModal();
      App.showAlert('modalAlert', '✓ Item added to library', 'success');
      // Redirect to library after short delay
      setTimeout(() => App.nav('library'), 1000);
    } catch (err) {
      App.showAlert('modalAlert', err.message, 'error');
    }
  }

  // ── Register ───────────────────────────────────────────────────
  App.register('add', () => {
    // nothing async needed on init
  });

  return { analyzeRepo, openModal, closeModal, saveItem };
})();
