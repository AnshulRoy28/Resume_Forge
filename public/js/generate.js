// ── Generate Page ────────────────────────────────────────────────
const Generate = (() => {
  let currentLatex = '';
  let currentJobTitle = '';
  let currentCompany = '';
  let autoUpdateTimer = null;

  // ── JD helpers ─────────────────────────────────────────────────
  function updateCharCount() {
    const len = document.getElementById('jobDescription')?.value.length || 0;
    const el = document.getElementById('charCount');
    if (el) el.textContent = `${len} / 10000`;
  }

  function loadJDFile(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const ta = document.getElementById('jobDescription');
      if (ta) { ta.value = e.target.result; updateCharCount(); }
    };
    reader.readAsText(file);
  }

  // ── Editor sync ────────────────────────────────────────────────
  function syncEditors() {
    const editor = document.getElementById('latexEditor');
    const editorSplit = document.getElementById('latexEditorSplit');
    if (editor && editorSplit) {
      // Sync from main editor to split editor
      if (document.activeElement === editor) {
        editorSplit.value = editor.value;
        currentLatex = editor.value;
      }
      // Sync from split editor to main editor
      else if (document.activeElement === editorSplit) {
        editor.value = editorSplit.value;
        currentLatex = editorSplit.value;
      }
    }
  }

  function setupEditorSync() {
    const editor = document.getElementById('latexEditor');
    const editorSplit = document.getElementById('latexEditorSplit');
    
    if (editor) {
      editor.addEventListener('input', () => {
        syncEditors();
        scheduleAutoUpdate();
      });
    }
    
    if (editorSplit) {
      editorSplit.addEventListener('input', () => {
        syncEditors();
        updatePreviewSplit();
      });
    }
  }

  function scheduleAutoUpdate() {
    // Clear existing timer
    if (autoUpdateTimer) clearTimeout(autoUpdateTimer);
    
    // Schedule update after 1 second of no typing
    autoUpdateTimer = setTimeout(() => {
      const currentTab = document.querySelector('[data-tab].active')?.dataset.tab;
      if (currentTab === 'split') {
        updatePreviewSplit();
      }
    }, 1000);
  }

  function updatePreviewSplit() {
    const editorSplit = document.getElementById('latexEditorSplit');
    const previewSplit = document.getElementById('latexPreviewSplit');
    if (editorSplit && previewSplit) {
      try {
        LatexPreview.render(editorSplit.value, previewSplit);
      } catch (err) {
        console.error('Preview error:', err);
      }
    }
  }

  function updatePreview() {
    const editor = document.getElementById('latexEditor');
    const preview = document.getElementById('latexPreview');
    if (editor && preview) {
      currentLatex = editor.value;
      try {
        LatexPreview.render(currentLatex, preview);
      } catch (err) {
        console.error('Preview error:', err);
        App.showAlert('genAlert', 'Preview error: ' + err.message, 'error');
      }
    }
  }

  // ── Generate Resume ────────────────────────────────────────────
  async function run() {
    const jd = document.getElementById('jobDescription')?.value.trim();
    if (!jd) { App.showAlert('genAlert', 'Please paste a job description first.', 'error'); return; }

    currentJobTitle = document.getElementById('jobTitle')?.value.trim() || '';
    currentCompany  = document.getElementById('company')?.value.trim() || '';

    App.hideAlert('genAlert');
    _setGenLoading(true);
    _showGenProgress(true);
    document.getElementById('sourcesPanel')?.classList.add('hidden');
    _showOutput(false);

    const steps = [
      { txt: 'Parsing job description...', pct: 10, num: '1 / 8' },
      { txt: 'Scoring projects...', pct: 20, num: '2 / 8' },
      { txt: 'Scoring experiences...', pct: 30, num: '3 / 8' },
      { txt: 'Generating projects section...', pct: 45, num: '4 / 8' },
      { txt: 'Generating experience section...', pct: 60, num: '5 / 8' },
      { txt: 'Generating skills section...', pct: 75, num: '6 / 8' },
      { txt: 'Integrating final resume...', pct: 85, num: '7 / 8' },
      { txt: 'Verifying accuracy...', pct: 95, num: '8 / 8' },
    ];
    let si = 0;
    const ticker = setInterval(() => {
      if (si < steps.length) _setGenStep(steps[si++]);
    }, 3000);

    try {
      // Score library
      const scoreData = await App.api('POST', '/api/score', { jobDescription: jd });
      const topScores = (scoreData.scores || []).slice(0, 10);

      _renderSources(topScores);

      // Generate (uses all library items, scoring happens server-side)
      const genData = await App.api('POST', '/api/generate', {
        jobDescription: jd,
        jobTitle: currentJobTitle,
        company: currentCompany
      });

      clearInterval(ticker);
      _setGenStep({ txt: 'Done!', pct: 100, num: '8 / 8' });
      await App.sleep(500);

      currentLatex = genData.latex;
      
      // Set editor content
      const editor = document.getElementById('latexEditor');
      const editorSplit = document.getElementById('latexEditorSplit');
      if (editor) editor.value = genData.latex;
      if (editorSplit) editorSplit.value = genData.latex;
      
      // Show top scored items count
      const itemCount = topScores.length;
      document.getElementById('mdCount').textContent = itemCount;
      
      // Show which items were considered
      const topIds = topScores.map(s => s.id);
      _renderMarkdownUsed(topIds);

      _showGenProgress(false);
      _showOutput(true);
      
      // Setup editor sync after content is loaded
      setupEditorSync();
      
      // Switch to editor tab by default
      switchTab('editor');

    } catch (err) {
      clearInterval(ticker);
      _showGenProgress(false);
      App.showAlert('genAlert', err.message, 'error');
    } finally {
      _setGenLoading(false);
    }
  }

  function _setGenLoading(on) {
    const btn = document.getElementById('genBtn');
    if (!btn) return;
    btn.disabled = on;
    const lbl = document.getElementById('genBtnTxt');
    if (lbl) lbl.textContent = on ? 'Generating...' : 'Generate Tailored Resume';
    const icon = btn.querySelector('iconify-icon');
    if (icon) icon.style.display = on ? 'none' : '';
    // spinner
    let sp = btn.querySelector('.spinner');
    if (on && !sp) { sp = document.createElement('span'); sp.className = 'spinner'; btn.prepend(sp); }
    if (!on && sp) sp.remove();
  }

  function _showGenProgress(on) {
    document.getElementById('genProgress')?.classList.toggle('hidden', !on);
  }

  function _setGenStep({ txt, pct, num }) {
    const t = document.getElementById('genStepTxt');
    const n = document.getElementById('genStepNum');
    const b = document.getElementById('genBar');
    if (t) t.textContent = txt;
    if (n) n.textContent = num;
    if (b) b.style.width = pct + '%';
  }

  function _showOutput(on) {
    document.getElementById('outEmpty')?.classList.toggle('hidden', on);
    const res = document.getElementById('outResult');
    if (res) { res.classList.toggle('hidden', !on); res.style.display = on ? 'flex' : ''; }
  }

  function _renderSources(scores) {
    const list = document.getElementById('sourcesList');
    if (!list) return;
    list.innerHTML = scores.map(s => `
      <div class="flex items-center justify-between bg-[#09090b] border border-white/8 rounded-lg p-2.5 gap-3">
        <div class="flex items-center gap-2.5 min-w-0">
          ${App.scoreTag(s.score)}
          <span class="text-xs font-medium text-zinc-200 truncate">${s.title || 'Unknown'}</span>
        </div>
        <span class="text-[10px] text-zinc-600 flex-shrink-0 hidden sm:block truncate max-w-[140px]">${(s.reason || '').slice(0, 50)}</span>
      </div>`).join('');
    document.getElementById('sourcesPanel')?.classList.remove('hidden');
  }

  async function _renderMarkdownUsed(ids) {
    const list = document.getElementById('mdUsedList');
    if (!list) return;
    list.innerHTML = '<p class="text-xs text-zinc-500">Loading...</p>';
    try {
      const data = await App.api('GET', '/api/library');
      const items = ids.map(id => data.items.find(i => i.id === id)).filter(Boolean);
      list.innerHTML = items.map(item => `
        <div class="border border-white/8 rounded-xl overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/5">
            <span class="text-sm font-medium text-zinc-200">${item.title}</span>
            <div class="flex gap-1.5 flex-wrap">${App.tagsHTML(item.tags, 4)}</div>
          </div>
          <div class="p-4 md max-h-52 overflow-y-auto scroll text-xs">${marked.parse(item.content.slice(0, 2000))}</div>
        </div>`).join('');
    } catch {
      list.innerHTML = '<p class="text-xs text-zinc-500">Could not load markdown files.</p>';
    }
  }

  // ── Output actions ─────────────────────────────────────────────
  function switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('[data-tab]').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    
    // Hide all tabs
    document.getElementById('editorTab')?.classList.add('hidden');
    document.getElementById('splitTab')?.classList.add('hidden');
    document.getElementById('previewTab')?.classList.add('hidden');
    document.getElementById('mdTab')?.classList.add('hidden');
    
    // Show selected tab
    if (tab === 'editor') {
      document.getElementById('editorTab')?.classList.remove('hidden');
      document.getElementById('updatePreviewBtn')?.classList.add('hidden');
    } else if (tab === 'split') {
      document.getElementById('splitTab')?.classList.remove('hidden');
      document.getElementById('updatePreviewBtn')?.classList.add('hidden');
      // Sync editors and update preview
      syncEditors();
      updatePreviewSplit();
    } else if (tab === 'preview') {
      document.getElementById('previewTab')?.classList.remove('hidden');
      document.getElementById('updatePreviewBtn')?.classList.remove('hidden');
      // Update preview with current editor content
      const editor = document.getElementById('latexEditor');
      if (editor) currentLatex = editor.value;
      const container = document.getElementById('latexPreview');
      if (container && currentLatex) {
        try {
          LatexPreview.render(currentLatex, container);
        } catch (err) {
          console.error('Preview error:', err);
        }
      }
    } else if (tab === 'md') {
      document.getElementById('mdTab')?.classList.remove('hidden');
      document.getElementById('updatePreviewBtn')?.classList.add('hidden');
    }

    // Show/hide download HTML button
    const dlHtml = document.getElementById('dlHtmlBtn');
    if (dlHtml) dlHtml.classList.toggle('hidden', tab !== 'preview' && tab !== 'split');
  }

  function copyLatex() {
    const editor = document.getElementById('latexEditor');
    if (!editor || !editor.value) return;
    App.copyText(editor.value, document.getElementById('copyLatexBtn'));
  }

  function downloadLatex() {
    const editor = document.getElementById('latexEditor');
    if (!editor || !editor.value) return;
    // ATS Metadata Hack: FirstName_LastName_JobTitle_Year.tex format
    const year = new Date().getFullYear();
    const jobTitle = currentJobTitle || 'Resume';
    const name = `Resume_${jobTitle}_${year}`.replace(/\s+/g, '_');
    App.downloadFile(editor.value, name + '.tex');
  }

  function downloadHtml() {
    const editor = document.getElementById('latexEditor');
    if (!editor || !editor.value) return;
    // ATS Metadata Hack: FirstName_LastName_JobTitle_Year.html format
    const year = new Date().getFullYear();
    const jobTitle = currentJobTitle || 'Resume';
    const title = [currentJobTitle, currentCompany].filter(Boolean).join(' @ ') || 'Resume';
    const name = `Resume_${jobTitle}_${year}`.replace(/\s+/g, '_');
    const html = LatexPreview.buildHtml(editor.value, title);
    App.downloadFile(html, name + '.html');
  }

  // ── Register ───────────────────────────────────────────────────
  App.register('generate', () => {
    // Setup editor sync when page loads
    setupEditorSync();
  });

  return { updateCharCount, loadJDFile, run, switchTab, copyLatex, downloadLatex, downloadHtml, updatePreview };
})();
