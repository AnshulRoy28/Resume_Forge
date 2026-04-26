// ── Settings Page ────────────────────────────────────────────────
const Settings = (() => {

  async function load() {
    // Load API key status from localStorage
    const apiKey = Auth.getApiKey();
    const input = document.getElementById('settingsGeminiKey');
    const statusDiv = document.getElementById('apiKeyStatus');
    
    if (apiKey) {
      input.placeholder = `***${apiKey.slice(-4)}`;
      statusDiv.className = 'text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg p-2 flex items-center gap-2';
      statusDiv.innerHTML = '<iconify-icon icon="solar:check-circle-linear"></iconify-icon> API key configured (stored in browser)';
      statusDiv.classList.remove('hidden');
    } else {
      statusDiv.className = 'text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2 flex items-center gap-2';
      statusDiv.innerHTML = '<iconify-icon icon="solar:danger-triangle-linear"></iconify-icon> No API key configured. Add one to use AI features.';
      statusDiv.classList.remove('hidden');
    }

    // Restore GitHub token from localStorage
    const ghToken = App.getSetting('githubToken', '');
    const ghInput = document.getElementById('settingsGHToken');
    if (ghInput && ghToken) {
      ghInput.placeholder = '***' + ghToken.slice(-4);
    }

    // Load stats
    try {
      const [libData, tmplData, histData] = await Promise.all([
        App.api('GET', '/api/library'),
        App.api('GET', '/api/templates'),
        App.api('GET', '/api/history'),
      ]);
      const sp = document.getElementById('statProjects');
      const st = document.getElementById('statTemplates');
      const sr = document.getElementById('statResumes');
      if (sp) sp.textContent = libData.items?.length ?? 0;
      if (st) st.textContent = tmplData.templates?.length ?? 0;
      if (sr) sr.textContent = histData.items?.length ?? 0;
    } catch { /* stats are non-critical */ }
  }

  function saveApiKey() {
    const input = document.getElementById('settingsGeminiKey');
    const statusDiv = document.getElementById('apiKeyStatus');
    const apiKey = input.value.trim();

    if (!apiKey) {
      statusDiv.className = 'text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2';
      statusDiv.textContent = 'Please enter an API key';
      statusDiv.classList.remove('hidden');
      return;
    }

    // Basic validation
    if (!apiKey.startsWith('AIza')) {
      statusDiv.className = 'text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2';
      statusDiv.textContent = 'Invalid API key format. Key should start with "AIza"';
      statusDiv.classList.remove('hidden');
      return;
    }

    // Save to localStorage
    Auth.setApiKey(apiKey);
    
    input.value = '';
    input.placeholder = `***${apiKey.slice(-4)}`;
    
    statusDiv.className = 'text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg p-2 flex items-center gap-2';
    statusDiv.innerHTML = '<iconify-icon icon="solar:check-circle-linear"></iconify-icon> API key saved to browser. You can now use AI features!';
    statusDiv.classList.remove('hidden');
  }

  function saveGitHubToken() {
    const ghToken = document.getElementById('settingsGHToken')?.value.trim() || '';
    App.setSetting('githubToken', ghToken);

    App.showAlert('settingsAlert', 'GitHub token saved locally.', 'success');
    setTimeout(() => App.hideAlert('settingsAlert'), 2000);

    // Update placeholder
    const ghInput = document.getElementById('settingsGHToken');
    if (ghInput && ghToken) {
      ghInput.value = '';
      ghInput.placeholder = '***' + ghToken.slice(-4);
    }
  }

  // ── Register ───────────────────────────────────────────────────
  App.register('settings', load);

  return { load, saveApiKey, saveGitHubToken };
})();

