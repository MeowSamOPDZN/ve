/* ============================================================
   CutCut — shared JS: toast, nav, auth (demo), guards
   ============================================================ */
(function () {
  'use strict';

  /* ---------- toast ---------- */
  let toastTimer = null;
  window.toast = function (msg, ms) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), ms || 2600);
  };

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  /* ---------- mobile menu (landing) ---------- */
  const menuBtn = document.getElementById('menuBtn');
  const siteLinks = document.getElementById('siteLinks');
  if (menuBtn && siteLinks) {
    // turn links into a dropdown on mobile
    siteLinks.style.display = '';
    menuBtn.addEventListener('click', () => {
      const open = siteLinks.classList.toggle('mobile-open');
      if (open) {
        siteLinks.style.cssText = 'display:flex;position:absolute;top:100%;left:16px;right:16px;background:#fff;border:1px solid var(--line);border-radius:14px;flex-direction:column;padding:16px 22px;gap:12px;box-shadow:var(--shadow-lg)';
      } else {
        siteLinks.style.cssText = '';
      }
    });
  }

  /* ---------- landing ratio pills (decorative) ---------- */
  document.querySelectorAll('.ratio-row .ratio').forEach((b) => {
    b.addEventListener('click', () => {
      b.parentElement.querySelectorAll('.ratio').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
    });
  });

  /* ---------- auth (demo, localStorage) ---------- */
  const USER_KEY = 'cutcut_user';
  window.CutCut = {
    user() {
      try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch (e) { return null; }
    },
    login(name, email) {
      localStorage.setItem(USER_KEY, JSON.stringify({ name: name || 'Creator', email: email || '' }));
    },
    logout() { localStorage.removeItem(USER_KEY); },
    initial() {
      const u = this.user();
      return u && u.name ? u.name.trim().charAt(0).toUpperCase() : 'A';
    }
  };

  // route guard: pages with data-guard or the app pages require login
  const path = location.pathname.split('/').pop() || 'index.html';
  const guarded = document.body.hasAttribute('data-guard') ||
                  path === 'projects.html' || path === 'editor.html';
  if (guarded && !window.CutCut.user() && !location.search.includes('demo=1')) {
    location.href = 'login.html';
    return;
  }

  // paint avatar initials everywhere
  document.querySelectorAll('.avatar').forEach((a) => { a.textContent = window.CutCut.initial(); });

  /* ---------- login / signup form ---------- */
  const authForm = document.getElementById('authForm');
  if (authForm) {
    let mode = 'login';
    const title = document.getElementById('authTitle');
    const sub = document.getElementById('authSub');
    const submit = document.getElementById('authSubmit');
    const nameField = document.getElementById('nameField');
    const switchText = document.getElementById('switchText');
    const switchMode = document.getElementById('switchMode');
    const err = document.getElementById('formErr');

    switchMode.addEventListener('click', () => {
      mode = mode === 'login' ? 'signup' : 'login';
      const signup = mode === 'signup';
      title.textContent = signup ? 'Create your account' : 'Welcome back';
      sub.textContent = signup ? 'Start cutting in under a minute.' : 'Log in to pick up right where you left off.';
      submit.innerHTML = signup ? 'Create account →' : 'Log in →';
      nameField.style.display = signup ? 'block' : 'none';
      switchText.textContent = signup ? 'Already have an account?' : 'New to CutCut?';
      switchMode.textContent = signup ? 'Log in' : 'Create an account';
      err.style.display = 'none';
    });

    function fail(msg) {
      err.textContent = msg;
      err.style.display = 'block';
    }

    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const pass = document.getElementById('password').value;
      if (mode === 'signup' && !name) return fail('Please enter your name.');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail('Please enter a valid email address.');
      if (pass.length < 6) return fail('Password must be at least 6 characters.');
      submit.disabled = true;
      submit.textContent = 'Please wait…';
      setTimeout(() => {
        window.CutCut.login(name || email.split('@')[0], email);
        toast(mode === 'signup' ? 'Account created — welcome!' : 'Welcome back!');
        setTimeout(() => location.href = 'projects.html', 500);
      }, 700);
    });

    document.getElementById('googleBtn').addEventListener('click', () => {
      window.CutCut.login('Creator', 'creator@gmail.com');
      toast('Signed in with Google (demo)');
      setTimeout(() => location.href = 'projects.html', 500);
    });
  }

  /* ---------- footer year ---------- */
  document.querySelectorAll('.foot-note span:first-child').forEach((s) => {
    s.textContent = s.textContent.replace('2026', new Date().getFullYear());
  });
})();
