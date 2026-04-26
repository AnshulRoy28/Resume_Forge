// ── Generate Page ────────────────────────────────────────────────
const Generate = (() => {
  let currentLatex = '';
  let currentJobTitle = '';
  let currentCompany = '';

  // ── Repo Analyzer ──────────────────────────────────────────────
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
    document.getElementById('analyzeBtnTxt').textContent = on ? 'Analyzing...' : 'Analyze';
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
      { txt: 'Parsing job description...', pct: 15, num: '1 / 5' },
      { txt: 'Scoring your library...',    pct: 35, num: '2 / 5' },
      { txt: 'Selecting best matches...',  pct: 55, num: '3 / 5' },
      { txt: 'Tailoring content with AI...', pct: 80, num: '4 / 5' },
      { txt: 'Finalizing resume...',       pct: 95, num: '5 / 5' },
    ];
    let si = 0;
    const ticker = setInterval(() => {
      if (si < steps.length) _setGenStep(steps[si++]);
    }, 2500);

    try {
      // Score library
      const scoreData = await App.api('POST', '/api/score', { jobDescription: jd });
      const maxProjects = parseInt(App.getSetting('maxProjects', 3));
      const topScores = (scoreData.scores || []).slice(0, maxProjects);
      const markdownIds = topScores.map(s => s.id).filter(Boolean);

      _renderSources(topScores);

      // Generate
      const genData = await App.api('POST', '/api/generate', {
        jobDescription: jd,
        jobTitle: currentJobTitle,
        company: currentCompany,
        markdownIds,
      });

      clearInterval(ticker);
      _setGenStep({ txt: 'Done!', pct: 100, num: '5 / 5' });
      await App.sleep(500);

      currentLatex = genData.latex;
      document.getElementById('latexOut').textContent = genData.latex;
      document.getElementById('mdCount').textContent = markdownIds.length;
      _renderMarkdownUsed(markdownIds);

      _showGenProgress(false);
      _showOutput(true);
      switchTab('latex');

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
    document.querySelectorAll('[data-tab]').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    document.getElementById('latexTab')?.classList.toggle('hidden', tab !== 'latex');
    document.getElementById('previewTab')?.classList.toggle('hidden', tab !== 'preview');
    document.getElementById('mdTab')?.classList.toggle('hidden', tab !== 'md');

    const dlHtml = document.getElementById('dlHtmlBtn');
    if (dlHtml) dlHtml.classList.toggle('hidden', tab !== 'preview');

    if (tab === 'preview' && currentLatex) {
      const container = document.getElementById('latexPreview');
      if (container) LatexPreview.render(currentLatex, container);
    }
  }

  function copyLatex() {
    if (!currentLatex) return;
    App.copyText(currentLatex, document.getElementById('copyLatexBtn'));
  }

  function downloadLatex() {
    if (!currentLatex) return;
    const name = [currentJobTitle, currentCompany].filter(Boolean).join('_').replace(/\s+/g, '_').toLowerCase() || 'resume';
    App.downloadFile(currentLatex, name + '.tex');
  }

  function downloadHtml() {
    if (!currentLatex) return;
    const title = [currentJobTitle, currentCompany].filter(Boolean).join(' @ ') || 'Resume';
    const name  = title.replace(/\s+/g, '_').toLowerCase();
    const html  = LatexPreview.buildHtml(currentLatex, title);
    App.downloadFile(html, name + '.html');
  }

  // ── Register ───────────────────────────────────────────────────
  App.register('generate', () => {
    // nothing async needed on init
  });

  return { analyzeRepo, updateCharCount, loadJDFile, run, switchTab, copyLatex, downloadLatex, downloadHtml };
})();
