const Auth = {
  switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');

    if (tab === 'login') {
      loginForm.classList.remove('hidden');
      registerForm.classList.add('hidden');
      loginTab.classList.add('auth-tab-active');
      loginTab.classList.remove('text-zinc-400', 'hover:text-white');
      registerTab.classList.remove('auth-tab-active');
      registerTab.classList.add('text-zinc-400', 'hover:text-white');
    } else {
      registerForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
      registerTab.classList.add('auth-tab-active');
      registerTab.classList.remove('text-zinc-400', 'hover:text-white');
      loginTab.classList.remove('auth-tab-active');
      loginTab.classList.add('text-zinc-400', 'hover:text-white');
    }

    // Clear errors
    document.getElementById('loginError').classList.add('hidden');
    document.getElementById('registerError').classList.add('hidden');
  },

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    const btn = document.getElementById('loginBtn');

    btn.disabled = true;
    btn.textContent = 'Logging in...';
    errorDiv.classList.add('hidden');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      window.location.reload();
    } catch (err) {
      errorDiv.textContent = err.message;
      errorDiv.classList.remove('hidden');
      btn.disabled = false;
      btn.textContent = 'Login';
    }
  },

  async handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const phone = document.getElementById('registerPhone').value.trim();
    const linkedin_url = document.getElementById('registerLinkedIn').value.trim();
    const github_url = document.getElementById('registerGitHub').value.trim();
    const password = document.getElementById('registerPassword').value;
    const errorDiv = document.getElementById('registerError');
    const btn = document.getElementById('registerBtn');

    btn.disabled = true;
    btn.textContent = 'Creating account...';
    errorDiv.classList.add('hidden');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          name: name || undefined,
          phone: phone || undefined,
          linkedin_url: linkedin_url || undefined,
          github_url: github_url || undefined
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      window.location.reload();
    } catch (err) {
      errorDiv.textContent = err.message;
      errorDiv.classList.remove('hidden');
      btn.disabled = false;
      btn.textContent = 'Create Account';
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  },

  getToken() {
    try {
      return localStorage.getItem('token');
    } catch (e) {
      return null;
    }
  },

  getUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  },

  isAuthenticated() {
    try {
      return !!this.getToken();
    } catch (e) {
      return false;
    }
  },

  getApiKey() {
    return localStorage.getItem('gemini_api_key');
  },

  setApiKey(apiKey) {
    if (apiKey) {
      localStorage.setItem('gemini_api_key', apiKey);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  },

  hasApiKey() {
    return !!this.getApiKey();
  }
};
