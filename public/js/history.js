// ── History Page ─────────────────────────────────────────────────
const History = (() => {

  async function load() {
    try {
      const data = await App.api('GET', '/api/history');
      _render(data.items || []);
    } catch (err) {
      document.getElementById('historyList').innerHTML =
        `<p class="text-sm text-zinc-500">${err.message}</p>`;
    }
  }

  function _render(items) {
    const list  = document.getElementById('historyList');
    const empty = document.getElementById('historyEmpty');
    if (!list) return;

    if (!items.length) {
      list.innerHTML = '';
      empty?.classList.remove('hidden');
      return;
    }
    empty?.classList.add('hidden');

    list.innerHTML = items.map(item => `
      <div class="glass rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/15 transition-all">
        <div class="flex flex-col gap-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-sm font-semibold text-zinc-100">${item.job_title || 'Untitled'}</span>
            ${item.company ? `<span class="text-xs text-zinc-500">@ ${item.company}</span>` : ''}
          </div>
          <span class="text-[11px] text-zinc-600">${App.formatDateTime(item.created_at)}</span>
        </div>
        <div class="flex gap-2 flex-shrink-0">
          <button onclick="History.openModal(${item.id})" class="btn-secondary text-xs py-1.5">
            <iconify-icon icon="solar:eye-linear" style="font-size:12px"></iconify-icon> View
          </button>
          <button onclick="History.remove(${item.id})" class="btn-danger text-xs py-1.5 px-3">
            <iconify-icon icon="solar:trash-bin-trash-linear" style="font-size:12px"></iconify-icon>
          </button>
        </div>
      </div>`).join('');
  }

  // ── Detail Modal ───────────────────────────────────────────────
  async function openModal(id) {
    try {
      const data = await App.api('GET', `/api/history/${id}`);
      const item = data.item;

      document.getElementById('histModalTitle').textContent =
        (item.job_title || 'Resume') + (item.company ? ` @ ${item.company}` : '');
      document.getElementById('histModalMeta').textContent = App.formatDateTime(item.created_at);
      document.getElementById('histModalLatex').textContent = item.latex_output || '';

      const latex = item.latex_output || '';
      const title = (item.job_title || 'Resume') + (item.company ? ` @ ${item.company}` : '');

      const copyBtn    = document.getElementById('histCopyBtn');
      const dlBtn      = document.getElementById('histDownloadBtn');
      const dlHtmlBtn  = document.getElementById('histDownloadHtmlBtn');

      copyBtn.onclick   = () => App.copyText(latex, copyBtn);
      dlBtn.onclick     = () => {
        const name = (item.job_title || 'resume').replace(/\s+/g, '_').toLowerCase();
        App.downloadFile(latex, name + '.tex');
      };
      dlHtmlBtn.onclick = () => {
        const name = title.replace(/\s+/g, '_').toLowerCase();
        App.downloadFile(LatexPreview.buildHtml(latex, title), name + '.html');
      };

      // Reset to source tab
      switchTab('source');
      // Pre-render preview
      const container = document.getElementById('histLatexPreview');
      if (container && latex) LatexPreview.render(latex, container);

      document.getElementById('histDetailModal')?.classList.remove('hidden');
    } catch (err) {
      alert(err.message);
    }
  }

  function switchTab(tab) {
    document.querySelectorAll('[data-htab]').forEach(t => t.classList.toggle('active', t.dataset.htab === tab));
    document.getElementById('histTabSource')?.classList.toggle('hidden', tab !== 'source');
    document.getElementById('histTabPreview')?.classList.toggle('hidden', tab !== 'preview');
  }

  function closeModal() {
    document.getElementById('histDetailModal')?.classList.add('hidden');
  }

  async function remove(id) {
    if (!confirm('Delete this history entry?')) return;
    try {
      await App.api('DELETE', `/api/history/${id}`);
      await load();
    } catch (err) { alert(err.message); }
  }

  // ── Register ───────────────────────────────────────────────────
  App.register('history', load);

  return { load, openModal, closeModal, remove, switchTab };
})();
