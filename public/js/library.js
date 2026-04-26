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
    if (type) filtered = filtered.filter(i => i.project_type === type);

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
      const typeClass = item.project_type === 'experience' ? 'tag-blue' : 'tag-purple';
      const preview = item.content.replace(/[#*`\[\]>]/g, '').replace(/\n+/g, ' ').slice(0, 130).trim();
      return `
        <div class="glass rounded-xl p-4 flex flex-col gap-3 hover:border-white/15 transition-all cursor-pointer group"
             onclick="Library.openViewModal(${item.id})">
          <div class="flex items-start justify-between gap-2">
            <h3 class="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors leading-snug">${item.title}</h3>
            <span class="tag ${typeClass} flex-shrink-0">${item.project_type}</span>
          </div>
          <p class="text-xs text-zinc-500 leading-relaxed line-clamp-2">${preview}…</p>
          <div class="flex flex-wrap gap-1.5">${App.tagsHTML(item.tags || [])}</div>
          <div class="flex items-center justify-between pt-2 border-t border-white/5">
            <span class="text-[10px] text-zinc-600">${App.formatDate(item.updated_at)}</span>
            ${item.source_url
              ? `<a href="${item.source_url}" target="_blank" onclick="event.stopPropagation()"
                   class="text-[10px] text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
                   <iconify-icon icon="solar:link-linear" style="font-size:10px"></iconify-icon> GitHub
                 </a>`
              : ''}
          </div>
        </div>`;
    }).join('');
  }

  // ── Add Modal ──────────────────────────────────────────────────
  function openAddModal() {
    document.getElementById('addTitle').value = '';
    document.getElementById('addContent').value = '';
    document.getElementById('addTags').value = '';
    document.getElementById('addUrl').value = '';
    document.getElementById('addType').value = 'project';
    App.hideAlert('addAlert');
    document.getElementById('addModal')?.classList.remove('hidden');
  }

  function closeAddModal() {
    document.getElementById('addModal')?.classList.add('hidden');
  }

  async function saveItem() {
    const title   = document.getElementById('addTitle')?.value.trim();
    const content = document.getElementById('addContent')?.value.trim();
    if (!title || !content) {
      App.showAlert('addAlert', 'Title and content are required.', 'error');
      return;
    }
    const tags         = document.getElementById('addTags')?.value.split(',').map(t => t.trim()).filter(Boolean) || [];
    const source_url   = document.getElementById('addUrl')?.value.trim() || '';
    const project_type = document.getElementById('addType')?.value || 'project';

    try {
      await App.api('POST', '/api/library', { title, content, tags, source_url, project_type });
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

    document.getElementById('viewTitle').textContent = item.title;
    document.getElementById('viewTypeBadge').textContent = item.project_type;
    document.getElementById('viewTypeBadge').className = `tag flex-shrink-0 ${item.project_type === 'experience' ? 'tag-blue' : 'tag-purple'}`;
    document.getElementById('viewPreview').innerHTML = marked.parse(item.content);
    document.getElementById('viewRawContent').textContent = item.content;
    document.getElementById('viewTags').innerHTML = App.tagsHTML(item.tags || [], 20);

    // Pre-fill edit fields
    document.getElementById('editTitle').value   = item.title;
    document.getElementById('editType').value    = item.project_type;
    document.getElementById('editTags').value    = (item.tags || []).join(', ');
    document.getElementById('editContent').value = item.content;
    App.hideAlert('editAlert');

    document.getElementById('viewDeleteBtn').onclick = () => _deleteItem(id);
    switchViewTab('preview');
    document.getElementById('viewModal')?.classList.remove('hidden');
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
    const project_type = document.getElementById('editType')?.value || 'project';

    if (!title || !content) { App.showAlert('editAlert', 'Title and content required.', 'error'); return; }

    try {
      await App.api('PUT', `/api/library/${currentViewId}`, { title, content, tags, project_type });
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

  return { load, filter, openAddModal, closeAddModal, saveItem, openViewModal, closeViewModal, switchViewTab, saveEdit };
})();
