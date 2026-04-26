// ── Templates Page ───────────────────────────────────────────────
const Templates = (() => {

  async function load() {
    try {
      const data = await App.api('GET', '/api/templates');
      _render(data.templates || []);
    } catch (err) {
      document.getElementById('templatesGrid').innerHTML =
        `<p class="text-sm text-zinc-500">${err.message}</p>`;
    }
  }

  function _render(templates) {
    const grid = document.getElementById('templatesGrid');
    if (!grid) return;

    if (!templates.length) {
      grid.innerHTML = `
        <div class="empty-state col-span-3">
          <div class="empty-icon"><iconify-icon icon="solar:document-text-linear" class="text-zinc-600" style="font-size:24px"></iconify-icon></div>
          <p class="text-sm font-medium text-zinc-300">No templates yet</p>
        </div>`;
      return;
    }

    grid.innerHTML = templates.map(t => `
      <div class="glass rounded-xl p-5 flex flex-col gap-3">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="text-sm font-semibold text-zinc-100">${t.name}</h3>
              ${t.is_default ? '<span class="tag tag-hi">Default</span>' : ''}
            </div>
            <p class="text-xs text-zinc-500 mt-1">${t.description || 'No description'}</p>
          </div>
        </div>
        <p class="text-[10px] text-zinc-600">Added ${App.formatDate(t.created_at)}</p>
        <div class="flex gap-2 pt-2 border-t border-white/5">
          <button onclick="Templates.openPreview(${t.id})" class="btn-secondary text-xs py-1.5 flex-1">
            <iconify-icon icon="solar:eye-linear" style="font-size:12px"></iconify-icon> Preview
          </button>
          ${!t.is_default
            ? `<button onclick="Templates.setDefault(${t.id})" class="btn-secondary text-xs py-1.5 flex-1">Set Default</button>
               <button onclick="Templates.remove(${t.id})" class="btn-danger text-xs py-1.5 px-3">
                 <iconify-icon icon="solar:trash-bin-trash-linear" style="font-size:12px"></iconify-icon>
               </button>`
            : ''}
        </div>
      </div>`).join('');
  }

  // ── Upload Modal ───────────────────────────────────────────────
  function openUploadModal() {
    document.getElementById('tmplName').value = '';
    document.getElementById('tmplDesc').value = '';
    document.getElementById('tmplFile').value = '';
    document.getElementById('tmplFileName').textContent = 'No file selected';
    App.hideAlert('tmplAlert');
    document.getElementById('uploadModal')?.classList.remove('hidden');
  }

  function closeUploadModal() {
    document.getElementById('uploadModal')?.classList.add('hidden');
  }

  async function upload() {
    const name = document.getElementById('tmplName')?.value.trim();
    const desc = document.getElementById('tmplDesc')?.value.trim();
    const file = document.getElementById('tmplFile')?.files[0];

    if (!name) { App.showAlert('tmplAlert', 'Template name is required.', 'error'); return; }
    if (!file) { App.showAlert('tmplAlert', 'Please select a file.', 'error'); return; }

    const form = new FormData();
    form.append('name', name);
    form.append('description', desc || '');
    form.append('file', file);

    try {
      await App.api('POST', '/api/templates', form);
      closeUploadModal();
      await load();
    } catch (err) {
      App.showAlert('tmplAlert', err.message, 'error');
    }
  }

  // ── Preview Modal ──────────────────────────────────────────────
  async function openPreview(id) {
    try {
      const data = await App.api('GET', `/api/templates/${id}`);
      document.getElementById('previewTitle').textContent = data.template.name;
      document.getElementById('previewContent').textContent = data.template.content;
      document.getElementById('previewModal')?.classList.remove('hidden');
    } catch (err) {
      alert(err.message);
    }
  }

  function closePreviewModal() {
    document.getElementById('previewModal')?.classList.add('hidden');
  }

  // ── Actions ────────────────────────────────────────────────────
  async function setDefault(id) {
    try {
      await App.api('PUT', `/api/templates/${id}/default`);
      await load();
    } catch (err) { alert(err.message); }
  }

  async function remove(id) {
    if (!confirm('Delete this template?')) return;
    try {
      await App.api('DELETE', `/api/templates/${id}`);
      await load();
    } catch (err) { alert(err.message); }
  }

  // ── Register ───────────────────────────────────────────────────
  App.register('templates', load);

  return { load, openUploadModal, closeUploadModal, upload, openPreview, closePreviewModal, setDefault, remove };
})();
