// ── ResumeForge App Shell ────────────────────────────────────────
// Handles routing, page loading, shared utilities, and modal system.

const App = (() => {
  const pages = {};        // { name: { html, init } }
  let currentPage = null;

  // Register a page module
  function register(name, initFn) {
    pages[name] = { init: initFn };
  }

  // Navigate to a page
  async function nav(name) {
    // Check authentication
    if (!Auth.isAuthenticated() && name !== 'auth') {
      currentPage = 'auth';
      name = 'auth';
    } else if (Auth.isAuthenticated() && name === 'auth') {
      name = 'generate';
    }

    if (currentPage === name) return;
    currentPage = name;

    // Update nav highlights
    document.querySelectorAll('.nav-link').forEach(el => {
      el.classList.toggle('nav-active', el.dataset.nav === name);
    });

    // Load HTML fragment
    const container = document.getElementById('page-content');
    container.innerHTML = '<div class="empty-state"><div class="spinner"></div></div>';

    try {
      const res = await fetch(`/pages/${name}.html`);
      if (!res.ok) throw new Error(`Page not found: ${name}`);
      container.innerHTML = await res.text();
    } catch (e) {
      container.innerHTML = `<div class="empty-state"><p class="text-zinc-500 text-sm">${e.message}</p></div>`;
      return;
    }

    // Run page init
    if (pages[name]?.init) {
      try { await pages[name].init(); } catch (e) { console.error(`Init error [${name}]:`, e); }
    }

    window.scrollTo(0, 0);
  }

  // ── Modal system ─────────────────────────────────────────────
  function openModal(html) {
    const root = document.getElementById('modal-root');
    root.innerHTML = html;
    root.querySelector('.modal-backdrop')?.classList.remove('hidden');
  }

  function closeModal() {
    document.getElementById('modal-root').innerHTML = '';
  }

  // ── Shared API helpers ────────────────────────────────────────
  async function api(method, path, body) {
    const token = Auth.getToken();
    const apiKey = Auth.getApiKey();
    const headers = body instanceof FormData ? {} : { 'Content-Type': 'application/json' };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (apiKey) {
      headers['X-Gemini-Api-Key'] = apiKey;
    }

    const opts = {
      method,
      headers,
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    };
    
    const res = await fetch(path, opts);
    
    // Handle auth errors
    if (res.status === 401 || res.status === 403) {
      Auth.logout();
      return;
    }
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  }

  // ── Shared UI helpers ─────────────────────────────────────────
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  function setBtn(id, loading, defaultHTML) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.disabled = loading;
    if (loading) {
      btn.innerHTML = '<span class="spinner"></span> Working...';
    } else {
      btn.innerHTML = defaultHTML;
    }
  }

  function showAlert(id, msg, type = 'error') {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = `alert alert-${type}`;
    el.textContent = msg;
    el.classList.remove('hidden');
  }

  function hideAlert(id) {
    document.getElementById(id)?.classList.add('hidden');
  }

  function copyText(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
      const orig = btn.innerHTML;
      btn.innerHTML = '<iconify-icon icon="solar:check-circle-linear" style="font-size:12px"></iconify-icon> Copied!';
      setTimeout(() => { btn.innerHTML = orig; }, 1500);
    });
  }

  function downloadFile(content, filename, mime = 'text/plain') {
    const blob = new Blob([content], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function formatDateTime(iso) {
    return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function scoreTag(score) {
    const cls = score >= 75 ? 'tag-hi' : score >= 50 ? 'tag-md' : 'tag-lo';
    return `<span class="tag ${cls}">${score}%</span>`;
  }

  function tagsHTML(tags = [], max = 6) {
    const shown = tags.slice(0, max).map(t => `<span class="tag">${t}</span>`).join('');
    const extra = tags.length > max ? `<span class="tag">+${tags.length - max}</span>` : '';
    return shown + extra;
  }

  // ── Settings ──────────────────────────────────────────────────
  function getSetting(key, fallback) {
    try { return JSON.parse(localStorage.getItem('rf_' + key)) ?? fallback; } catch { return fallback; }
  }
  function setSetting(key, val) { localStorage.setItem('rf_' + key, JSON.stringify(val)); }

  // ── Boot ──────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    // Check auth and redirect if needed
    if (!Auth.isAuthenticated()) {
      nav('auth');
      return;
    }

    const hash = location.hash.replace('#', '') || 'generate';
    nav(hash);
  });

  window.addEventListener('hashchange', () => {
    if (!Auth.isAuthenticated()) {
      nav('auth');
      return;
    }

    const hash = location.hash.replace('#', '') || 'generate';
    nav(hash);
  });

  return { nav, register, openModal, closeModal, api, sleep, setBtn, showAlert, hideAlert, copyText, downloadFile, formatDate, formatDateTime, scoreTag, tagsHTML, getSetting, setSetting };
})();
