// ── Library Page ─────────────────────────────────────────────────
const Library = (() => {
  let allItems = [];
  let currentViewId = null;

  // ── Load & Render ──────────────────────────────────────────────
  async function load() {
    try {
      const data = await App.api('GET', '/api/library');
      allItems = data.items || [];
      _populateTagFilter(allItems);
      _render(allItems);
    } catch (err) {
      _render([]);
    }
  }

  function _populateTagFilter(items) {
    const sel = document.getElementById('libTagFilter');
    if (!sel) return;
    const cur = sel.value;
    const tags = [...new Set(items.flatMap(i => i.tags || []))].sort();
    sel.innerHTML = '<option value="">All Tags</option>' +
      tags.map(t => `<option value="${t}" ${t === cur ? 'selected' : ''}>${t}</option>`).join('');
  }

  function filter() {
    const search = document.getElementById('libSearch')?.value.toLowerCase() || '';
    const tag    = document.getElementById('libTagFilter')?.value.toLowerCase() || '';
    const type   = document.getElementById('libTypeFilter')?.value || '';

    let filtered = allItems;
    if (search) filtered = filtered.filter(i =>
      i.title.toLowerCase().includes(search) ||
      (i.tags || []).join(' ').toLowerCase().includes(search) ||
      i.content.toLowerCase().includes(search));
    if (tag)  filtered = filtered.filter(i => (i.tags || []).some(t => t.toLowerCase() === tag));
    if (type) filtered = filtered.filter(i => i.item_type === type);

    _render(filtered);
  }

  function _render(items) {
    const grid  = document.getElementById('libGrid');
    const empty = document.getElementById('libEmpty');
    const stats = document.getElementById('libStats');
    if (!grid) return;

    if (stats) stats.textContent = `${items.length} of ${allItems.length} items`;

    if (!items.length) {
      grid.innerHTML = '';
      empty?.classList.remove('hidden');
      return;
    }
    empty?.classList.add('hidden');

    grid.innerHTML = items.map(item => {
      const typeIcons = {
        project: 'solar:code-square-linear',
        experience: 'solar:case-linear',
        education: 'solar:book-linear',
        skill: 'solar:star-linear',
        certification: 'solar:diploma-linear'
      };
      const typeColors = {
        project: 'tag-purple',
        experience: 'tag-blue',
        education: 'tag-green',
        skill: 'tag-yellow',
        certification: 'tag-orange'
      };
      const itemType = item.item_type || 'project';
      const typeClass = typeColors[itemType] || 'tag-purple';
      const typeIcon = typeIcons[itemType] || 'solar:code-square-linear';
      const preview = item.content.replace(/[#*`\[\]>]/g, '').replace(/\n+/g, ' ').slice(0, 130).trim();
      
      let metaInfo = '';
      if (item.organization) metaInfo = `<span class="text-[10px] text-zinc-600">${item.organization}</span>`;
      if (item.start_date || item.end_date) {
        const dates = [item.start_date, item.end_date].filter(Boolean).join(' - ');
        metaInfo += metaInfo ? ` • ${dates}` : `<span class="text-[10px] text-zinc-600">${dates}</span>`;
      }
      
      return `
        <div class="glass rounded-xl p-4 flex flex-col gap-3 hover:border-white/15 transition-all cursor-pointer group"
             onclick="Library.openViewModal(${item.id})">
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0">
              <iconify-icon icon="${typeIcon}" class="text-zinc-400 flex-shrink-0" style="font-size:16px"></iconify-icon>
              <h3 class="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors leading-snug truncate">${item.title}</h3>
            </div>
            <span class="tag ${typeClass} flex-shrink-0">${itemType}</span>
          </div>
          ${metaInfo ? `<div class="text-[10px] text-zinc-600">${metaInfo}</div>` : ''}
          <p class="text-xs text-zinc-500 leading-relaxed line-clamp-2">${preview}…</p>
          <div class="flex flex-wrap gap-1.5">${App.tagsHTML(item.tags || [])}</div>
          <div class="flex items-center justify-between pt-2 border-t border-white/5">
            <span class="text-[10px] text-zinc-600">${App.formatDate(item.updated_at)}</span>
            ${item.source_url
              ? `<a href="${item.source_url}" target="_blank" onclick="event.stopPropagation()"
                   class="text-[10px] text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
                   <iconify-icon icon="solar:link-linear" style="font-size:10px"></iconify-icon> Source
                 </a>`
              : ''}
          </div>
        </div>`;
    }).join('');
  }

  // ── Add Modal ──────────────────────────────────────────────────
  function openAddModal() {
    document.getElementById('addType').value = 'project';
    App.hideAlert('addAlert');
    updateAddFormFields();
    document.getElementById('addModal')?.classList.remove('hidden');
  }

  function updateAddFormFields() {
    const type = document.getElementById('addType')?.value || 'project';
    const container = document.getElementById('addDynamicFields');
    if (!container) return;

    let html = '';
    
    if (type === 'project') {
      html = `
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Project Name *</label>
          <input id="addTitle" type="text" placeholder="E-commerce Platform" class="input py-2.5 text-sm">
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">GitHub/Source URL</label>
          <input id="addUrl" type="url" placeholder="https://github.com/username/project" class="input py-2.5 text-sm">
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Technologies Used <span class="text-zinc-600">(comma separated)</span></label>
          <input id="addTags" type="text" placeholder="React, Node.js, PostgreSQL, AWS" class="input py-2.5 text-sm">
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Project Description & Achievements *</label>
          <textarea id="addContent" placeholder="Describe what you built, the problem it solves, key features, and your accomplishments. Use bullet points for achievements." class="input scroll min-h-[180px] text-sm"></textarea>
          <p class="text-[10px] text-zinc-600">Tip: Use markdown formatting. Start achievements with action verbs.</p>
        </div>`;
    } 
    else if (type === 'experience') {
      html = `
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Job Title/Position *</label>
          <input id="addTitle" type="text" placeholder="Senior Software Engineer" class="input py-2.5 text-sm">
        </div>
        <div class="flex gap-3">
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">Company Name *</label>
            <input id="addOrganization" type="text" placeholder="Google" class="input py-2.5 text-sm">
          </div>
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">Location</label>
            <input id="addLocation" type="text" placeholder="San Francisco, CA" class="input py-2.5 text-sm">
          </div>
        </div>
        <div class="flex gap-3">
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">Start Date *</label>
            <input id="addStartDate" type="text" placeholder="Jan 2020" class="input py-2.5 text-sm">
          </div>
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">End Date</label>
            <input id="addEndDate" type="text" placeholder="Present" class="input py-2.5 text-sm">
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Technologies & Skills <span class="text-zinc-600">(comma separated)</span></label>
          <input id="addTags" type="text" placeholder="Python, Django, AWS, Docker, Kubernetes" class="input py-2.5 text-sm">
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Responsibilities & Achievements *</label>
          <textarea id="addContent" placeholder="• Led development of microservices architecture serving 10M+ users&#10;• Reduced API response time by 40% through optimization&#10;• Mentored team of 5 junior engineers" class="input scroll min-h-[180px] text-sm"></textarea>
          <p class="text-[10px] text-zinc-600">Use bullet points. Start with action verbs. Quantify impact when possible.</p>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Company Website/LinkedIn</label>
          <input id="addUrl" type="url" placeholder="https://company.com" class="input py-2.5 text-sm">
        </div>`;
    }
    else if (type === 'education') {
      html = `
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Degree *</label>
          <input id="addTitle" type="text" placeholder="Bachelor of Science in Computer Science" class="input py-2.5 text-sm">
        </div>
        <div class="flex gap-3">
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">University/Institution *</label>
            <input id="addOrganization" type="text" placeholder="Massachusetts Institute of Technology" class="input py-2.5 text-sm">
          </div>
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">Location</label>
            <input id="addLocation" type="text" placeholder="Cambridge, MA" class="input py-2.5 text-sm">
          </div>
        </div>
        <div class="flex gap-3">
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">Start Year *</label>
            <input id="addStartDate" type="text" placeholder="2018" class="input py-2.5 text-sm">
          </div>
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">Graduation Year</label>
            <input id="addEndDate" type="text" placeholder="2022" class="input py-2.5 text-sm">
          </div>
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">GPA</label>
            <input id="addGpa" type="text" placeholder="3.8/4.0" class="input py-2.5 text-sm">
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Relevant Coursework <span class="text-zinc-600">(comma separated)</span></label>
          <input id="addTags" type="text" placeholder="Data Structures, Algorithms, Machine Learning, Databases" class="input py-2.5 text-sm">
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Achievements, Honors & Activities</label>
          <textarea id="addContent" placeholder="• Dean's List all semesters&#10;• President of Computer Science Club&#10;• Published research paper on distributed systems" class="input scroll min-h-[140px] text-sm"></textarea>
          <p class="text-[10px] text-zinc-600">Include honors, awards, relevant activities, research, publications.</p>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">University Website</label>
          <input id="addUrl" type="url" placeholder="https://university.edu" class="input py-2.5 text-sm">
        </div>`;
    }
    else if (type === 'certification') {
      html = `
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Certification Name *</label>
          <input id="addTitle" type="text" placeholder="AWS Certified Solutions Architect - Professional" class="input py-2.5 text-sm">
        </div>
        <div class="flex gap-3">
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">Issuing Organization *</label>
            <input id="addOrganization" type="text" placeholder="Amazon Web Services" class="input py-2.5 text-sm">
          </div>
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">Date Obtained *</label>
            <input id="addStartDate" type="text" placeholder="Dec 2023" class="input py-2.5 text-sm">
          </div>
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">Expiry Date</label>
            <input id="addEndDate" type="text" placeholder="Dec 2026" class="input py-2.5 text-sm">
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Credential ID</label>
          <input id="addCredentialId" type="text" placeholder="ABC123XYZ789" class="input py-2.5 text-sm">
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Verification URL *</label>
          <input id="addUrl" type="url" placeholder="https://www.credly.com/badges/..." class="input py-2.5 text-sm">
          <p class="text-[10px] text-zinc-600">Link to verify the certification (Credly, official certificate, etc.)</p>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Skills Covered <span class="text-zinc-600">(comma separated)</span></label>
          <input id="addTags" type="text" placeholder="AWS, Cloud Architecture, Security, Networking" class="input py-2.5 text-sm">
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Additional Details</label>
          <textarea id="addContent" placeholder="Score, key competencies demonstrated, or other relevant information" class="input scroll min-h-[100px] text-sm"></textarea>
        </div>`;
    }
    else if (type === 'skill') {
      html = `
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Skill Category *</label>
          <input id="addTitle" type="text" placeholder="Frontend Development" class="input py-2.5 text-sm">
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Skills *</label>
          <textarea id="addContent" placeholder="• React, Vue.js, Angular - 5+ years&#10;• TypeScript, JavaScript (ES6+) - Expert&#10;• HTML5, CSS3, Tailwind CSS - Advanced&#10;• Webpack, Vite, Build Tools - Proficient" class="input scroll min-h-[160px] text-sm"></textarea>
          <p class="text-[10px] text-zinc-600">List skills with proficiency levels or years of experience.</p>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Tags <span class="text-zinc-600">(comma separated)</span></label>
          <input id="addTags" type="text" placeholder="React, TypeScript, CSS, JavaScript" class="input py-2.5 text-sm">
        </div>`;
    }
    
    container.innerHTML = html;
  }

  function closeAddModal() {
    document.getElementById('addModal')?.classList.add('hidden');
  }

  async function saveItem() {
    const title   = document.getElementById('addTitle')?.value.trim();
    const content = document.getElementById('addContent')?.value.trim();
    if (!title || !content) {
      App.showAlert('addAlert', 'Please fill in all required fields.', 'error');
      return;
    }
    const tags         = document.getElementById('addTags')?.value.split(',').map(t => t.trim()).filter(Boolean) || [];
    const source_url   = document.getElementById('addUrl')?.value.trim() || '';
    const item_type    = document.getElementById('addType')?.value || 'project';
    const organization = document.getElementById('addOrganization')?.value.trim() || null;
    const location     = document.getElementById('addLocation')?.value.trim() || null;
    const start_date   = document.getElementById('addStartDate')?.value.trim() || null;
    const end_date     = document.getElementById('addEndDate')?.value.trim() || null;
    const gpa          = document.getElementById('addGpa')?.value.trim() || null;
    const credential_id = document.getElementById('addCredentialId')?.value.trim() || null;

    try {
      await App.api('POST', '/api/library', { 
        title, content, tags, source_url, item_type,
        organization, location, start_date, end_date, gpa, credential_id
      });
      closeAddModal();
      await load();
    } catch (err) {
      App.showAlert('addAlert', err.message, 'error');
    }
  }

  // ── View Modal ─────────────────────────────────────────────────
  function openViewModal(id) {
    currentViewId = id;
    const item = allItems.find(i => i.id === id);
    if (!item) return;

    const typeColors = {
      project: 'tag-purple',
      experience: 'tag-blue',
      education: 'tag-green',
      skill: 'tag-yellow',
      certification: 'tag-orange'
    };
    const itemType = item.item_type || 'project';

    document.getElementById('viewTitle').textContent = item.title;
    document.getElementById('viewTypeBadge').textContent = itemType;
    document.getElementById('viewTypeBadge').className = `tag flex-shrink-0 ${typeColors[itemType] || 'tag-purple'}`;
    document.getElementById('viewPreview').innerHTML = marked.parse(item.content);
    document.getElementById('viewRawContent').textContent = item.content;
    document.getElementById('viewTags').innerHTML = App.tagsHTML(item.tags || [], 20);

    // Pre-fill edit fields
    document.getElementById('editTitle').value   = item.title;
    document.getElementById('editType').value    = itemType;
    document.getElementById('editTags').value    = (item.tags || []).join(', ');
    document.getElementById('editContent').value = item.content;
    updateEditFormFields(item);
    App.hideAlert('editAlert');

    document.getElementById('viewDeleteBtn').onclick = () => _deleteItem(id);
    switchViewTab('preview');
    document.getElementById('viewModal')?.classList.remove('hidden');
  }

  function updateEditFormFields(item = null) {
    const type = document.getElementById('editType')?.value || 'project';
    const container = document.getElementById('editDynamicFields');
    if (!container) return;

    let html = '';
    
    if (type === 'project') {
      const url = item?.source_url || '';
      html = `
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">GitHub/Source URL</label>
          <input id="editUrl" type="url" value="${url}" placeholder="https://github.com/username/project" class="input py-2 text-sm">
        </div>`;
    }
    else if (type === 'experience') {
      const org = item?.organization || '';
      const loc = item?.location || '';
      const start = item?.start_date || '';
      const end = item?.end_date || '';
      const url = item?.source_url || '';
      html = `
        <div class="flex gap-3">
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">Company Name</label>
            <input id="editOrganization" type="text" value="${org}" placeholder="Google" class="input py-2 text-sm">
          </div>
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">Location</label>
            <input id="editLocation" type="text" value="${loc}" placeholder="San Francisco, CA" class="input py-2 text-sm">
          </div>
        </div>
        <div class="flex gap-3">
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">Start Date</label>
            <input id="editStartDate" type="text" value="${start}" placeholder="Jan 2020" class="input py-2 text-sm">
          </div>
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">End Date</label>
            <input id="editEndDate" type="text" value="${end}" placeholder="Present" class="input py-2 text-sm">
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Company Website</label>
          <input id="editUrl" type="url" value="${url}" placeholder="https://company.com" class="input py-2 text-sm">
        </div>`;
    }
    else if (type === 'education') {
      const org = item?.organization || '';
      const loc = item?.location || '';
      const start = item?.start_date || '';
      const end = item?.end_date || '';
      const gpa = item?.gpa || '';
      const url = item?.source_url || '';
      html = `
        <div class="flex gap-3">
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">University/Institution</label>
            <input id="editOrganization" type="text" value="${org}" placeholder="MIT" class="input py-2 text-sm">
          </div>
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">Location</label>
            <input id="editLocation" type="text" value="${loc}" placeholder="Cambridge, MA" class="input py-2 text-sm">
          </div>
        </div>
        <div class="flex gap-3">
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">Start Year</label>
            <input id="editStartDate" type="text" value="${start}" placeholder="2018" class="input py-2 text-sm">
          </div>
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">Graduation Year</label>
            <input id="editEndDate" type="text" value="${end}" placeholder="2022" class="input py-2 text-sm">
          </div>
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">GPA</label>
            <input id="editGpa" type="text" value="${gpa}" placeholder="3.8/4.0" class="input py-2 text-sm">
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">University Website</label>
          <input id="editUrl" type="url" value="${url}" placeholder="https://university.edu" class="input py-2 text-sm">
        </div>`;
    }
    else if (type === 'certification') {
      const org = item?.organization || '';
      const start = item?.start_date || '';
      const end = item?.end_date || '';
      const credId = item?.credential_id || '';
      const url = item?.source_url || '';
      html = `
        <div class="flex gap-3">
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">Issuing Organization</label>
            <input id="editOrganization" type="text" value="${org}" placeholder="AWS" class="input py-2 text-sm">
          </div>
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">Date Obtained</label>
            <input id="editStartDate" type="text" value="${start}" placeholder="Dec 2023" class="input py-2 text-sm">
          </div>
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="text-xs font-medium text-zinc-400">Expiry Date</label>
            <input id="editEndDate" type="text" value="${end}" placeholder="Dec 2026" class="input py-2 text-sm">
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Credential ID</label>
          <input id="editCredentialId" type="text" value="${credId}" placeholder="ABC123XYZ789" class="input py-2 text-sm">
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-400">Verification URL</label>
          <input id="editUrl" type="url" value="${url}" placeholder="https://www.credly.com/badges/..." class="input py-2 text-sm">
        </div>`;
    }
    
    container.innerHTML = html;
  }

  function closeViewModal() {
    document.getElementById('viewModal')?.classList.add('hidden');
    currentViewId = null;
  }

  function switchViewTab(tab) {
    document.querySelectorAll('[data-vtab]').forEach(t => t.classList.toggle('active', t.dataset.vtab === tab));
    document.getElementById('viewPreview')?.classList.toggle('hidden', tab !== 'preview');
    document.getElementById('viewRaw')?.classList.toggle('hidden', tab !== 'raw');
    document.getElementById('viewEdit')?.classList.toggle('hidden', tab !== 'edit');
  }

  async function saveEdit() {
    if (!currentViewId) return;
    const title        = document.getElementById('editTitle')?.value.trim();
    const content      = document.getElementById('editContent')?.value.trim();
    const tags         = document.getElementById('editTags')?.value.split(',').map(t => t.trim()).filter(Boolean) || [];
    const item_type    = document.getElementById('editType')?.value || 'project';
    const organization = document.getElementById('editOrganization')?.value.trim() || null;
    const location     = document.getElementById('editLocation')?.value.trim() || null;
    const start_date   = document.getElementById('editStartDate')?.value.trim() || null;
    const end_date     = document.getElementById('editEndDate')?.value.trim() || null;
    const gpa          = document.getElementById('editGpa')?.value.trim() || null;
    const credential_id = document.getElementById('editCredentialId')?.value.trim() || null;
    const source_url   = document.getElementById('editUrl')?.value.trim() || null;

    if (!title || !content) { App.showAlert('editAlert', 'Title and content required.', 'error'); return; }

    try {
      await App.api('PUT', `/api/library/${currentViewId}`, { 
        title, content, tags, item_type, source_url,
        organization, location, start_date, end_date, gpa, credential_id
      });
      closeViewModal();
      await load();
    } catch (err) {
      App.showAlert('editAlert', err.message, 'error');
    }
  }

  async function _deleteItem(id) {
    if (!confirm('Delete this item from your library? This cannot be undone.')) return;
    try {
      await App.api('DELETE', `/api/library/${id}`);
      closeViewModal();
      await load();
    } catch (err) {
      alert(err.message);
    }
  }

  // ── Register ───────────────────────────────────────────────────
  App.register('library', load);

  return { 
    load, filter, 
    openAddModal, closeAddModal, saveItem, updateAddFormFields,
    openViewModal, closeViewModal, switchViewTab, saveEdit, updateEditFormFields 
  };
})();
