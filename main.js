/* ============================================================
   NythEdit — shared JS
   Real local auth (SHA-256 hashed passwords in this browser),
   real project index, IndexedDB blob store, toast/nav/reveal.
   ============================================================ */
(function () {
  'use strict';

  var CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>';
  var ACCOUNTS_KEY = 'nythedit_accounts';
  var SESSION_KEY = 'nythedit_user';
  var PROJECTS_KEY = 'nythedit_projects';

  /* ---------- toast ---------- */
  var toastEl = null, toastTimer = null;
  function toast(msg) {
    if (!toastEl) toastEl = document.getElementById('toast');
    if (!toastEl) return;
    toastEl.innerHTML = CHECK_SVG + '<span></span>';
    toastEl.querySelector('span').textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }

  /* ---------- storage helpers ---------- */
  function lsGet(k, fb) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch (e) { return fb; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function uid() { return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8); }

  /* ---------- IndexedDB blob store ---------- */
  function idbOpen() {
    return new Promise(function (res, rej) {
      var r = indexedDB.open('nythedit', 1);
      r.onupgradeneeded = function () {
        if (!r.result.objectStoreNames.contains('media')) r.result.createObjectStore('media');
      };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
  }
  function idbTx(mode, fn) {
    return idbOpen().then(function (db) {
      return new Promise(function (res, rej) {
        var tx = db.transaction('media', mode);
        var out;
        try { out = fn(tx.objectStore('media')); } catch (e) { rej(e); return; }
        tx.oncomplete = function () { res(out && out.result !== undefined ? out.result : out); };
        tx.onerror = function () { rej(tx.error); };
      });
    });
  }
  var idb = {
    set: function (k, v) { return idbTx('readwrite', function (s) { return s.put(v, k); }); },
    get: function (k) { return idbTx('readonly', function (s) { return s.get(k); }); },
    del: function (k) { return idbTx('readwrite', function (s) { return s.delete(k); }); }
  };

  /* ---------- auth (real local accounts) ---------- */
  function sha256(str) {
    if (crypto.subtle) {
      return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str)).then(function (b) {
        return Array.prototype.map.call(new Uint8Array(b), function (x) { return x.toString(16).padStart(2, '0'); }).join('');
      });
    }
    var h1 = 0xdeadbeef, h2 = 0x41c6ce57, i;
    for (i = 0; i < str.length; i++) {
      var ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return Promise.resolve((h2 >>> 0).toString(16) + (h1 >>> 0).toString(16));
  }
  function getAccounts() { return lsGet(ACCOUNTS_KEY, []); }
  function getUser() { return lsGet(SESSION_KEY, null); }
  function requireAuth() {
    if (!getUser()) { location.href = 'login.html'; return false; }
    return true;
  }

  /* ---------- project index ---------- */
  function getProjects() { return lsGet(PROJECTS_KEY, []); }
  function saveProjects(p) { lsSet(PROJECTS_KEY, p); }
  function touchProject(id, patch) {
    var ps = getProjects(), f = false;
    ps = ps.map(function (p) { if (p.id === id) { f = true; return Object.assign({}, p, patch, { updatedAt: Date.now() }); } return p; });
    if (!f) ps.unshift(Object.assign({ id: id, updatedAt: Date.now() }, patch));
    saveProjects(ps);
  }

  /* ---------- mobile nav ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var siteLinks = document.getElementById('siteLinks');
  if (menuBtn && siteLinks) {
    menuBtn.addEventListener('click', function () {
      var open = siteLinks.style.display === 'flex';
      if (open) { siteLinks.style.display = ''; siteLinks.removeAttribute('style'); }
      else {
        siteLinks.style.display = 'flex';
        siteLinks.style.position = 'absolute';
        siteLinks.style.top = '64px'; siteLinks.style.left = '0'; siteLinks.style.right = '0';
        siteLinks.style.background = '#fff'; siteLinks.style.flexDirection = 'column';
        siteLinks.style.padding = '18px 24px 24px'; siteLinks.style.gap = '16px';
        siteLinks.style.borderBottom = '1px solid var(--line)';
      }
    });
  }

  /* ---------- reveal ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- landing ratio pills ---------- */
  var aiRatios = document.querySelector('#ai .ratio-row');
  if (aiRatios) aiRatios.querySelectorAll('.ratio').forEach(function (b) {
    b.addEventListener('click', function () {
      aiRatios.querySelectorAll('.ratio').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
    });
  });

  /* ---------- auth page ---------- */
  var authForm = document.getElementById('authForm');
  if (authForm) {
    if (getUser()) { location.href = 'projects.html'; return; }
    var mode = 'login';
    var title = document.getElementById('authTitle');
    var sub = document.getElementById('authSub');
    var submit = document.getElementById('authSubmit');
    var switchBtn = document.getElementById('switchMode');
    var switchText = document.getElementById('switchText');
    var nameField = document.getElementById('nameField');
    var errBox = document.getElementById('formErr');
    function setMode(m) {
      mode = m;
      var su = m === 'signup';
      title.textContent = su ? 'Create your account' : 'Welcome back';
      sub.textContent = su ? 'One account for all your projects on this device.' : 'Log in to pick up right where you left off.';
      submit.childNodes[0].textContent = su ? 'Create account ' : 'Log in ';
      switchText.textContent = su ? 'Already have an account?' : 'New to NythEdit?';
      switchBtn.textContent = su ? 'Log in' : 'Create an account';
      nameField.style.display = su ? 'block' : 'none';
      errBox.style.display = 'none';
    }
    switchBtn.addEventListener('click', function () { setMode(mode === 'login' ? 'signup' : 'login'); });
    function fail(m) { errBox.textContent = m; errBox.style.display = 'block'; }

    authForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('name').value.trim();
      var email = document.getElementById('email').value.trim().toLowerCase();
      var pass = document.getElementById('password').value;
      if (mode === 'signup' && name.length < 2) return fail('Please enter your name.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Please enter a valid email address.');
      if (pass.length < 6) return fail('Password must be at least 6 characters.');
      var accs = getAccounts();
      submit.disabled = true;
      sha256('nythedit:' + email + ':' + pass).then(function (hash) {
        if (mode === 'signup') {
          if (accs.some(function (a) { return a.email === email; })) { submit.disabled = false; return fail('An account with this email already exists. Log in instead.'); }
          accs.push({ name: name, email: email, hash: hash, createdAt: Date.now() });
          lsSet(ACCOUNTS_KEY, accs);
          lsSet(SESSION_KEY, { name: name, email: email });
          toast('Account created — welcome, ' + name.split(' ')[0] + '!');
        } else {
          var a = accs.find(function (x) { return x.email === email; });
          if (!a || a.hash !== hash) { submit.disabled = false; return fail('Wrong email or password.'); }
          lsSet(SESSION_KEY, { name: a.name, email: a.email });
          toast('Welcome back, ' + a.name.split(' ')[0] + '!');
        }
        setTimeout(function () { location.href = 'projects.html'; }, 700);
      });
    });
    document.getElementById('googleBtn').addEventListener('click', function () {
      toast('Google sign-in is not connected — use email instead');
    });
  }

  /* ---------- route guard ---------- */
  var path = (location.pathname.split('/').pop() || 'index.html').split('?')[0];
  if ((path === 'projects.html' || path === 'editor.html') && !new URLSearchParams(location.search).has('demo')) {
    if (!requireAuth()) return;
  }

  /* ---------- avatar / sign out ---------- */
  var avatarBtn = document.getElementById('avatarBtn');
  if (avatarBtn) {
    var u = getUser();
    if (u && u.name) avatarBtn.textContent = u.name.charAt(0).toUpperCase();
    avatarBtn.title = u ? (u.name + ' — click to sign out') : 'Account';
    avatarBtn.addEventListener('click', function () {
      if (confirm('Sign out of NythEdit?')) { lsDel(SESSION_KEY); location.href = 'index.html'; }
    });
  }

  /* ---------- projects page ---------- */
  var grid = document.getElementById('projGrid');
  if (grid) {
    var PLAY_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>';
    var PLUS_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
    var menuEl = null;

    function ago(ts) {
      var d = Date.now() - ts, m = Math.floor(d / 60000);
      if (m < 1) return 'just now'; if (m < 60) return m + ' min ago';
      var h = Math.floor(m / 60); if (h < 24) return h + ' hours ago';
      var dd = Math.floor(h / 24); return dd === 1 ? 'yesterday' : dd + ' days ago';
    }
    function thumbStyle(p) {
      if (p.thumb) return 'background-image:url(' + p.thumb + ');background-size:cover;background-position:center';
      var hues = [[43, 35, 80, '#7c3aed', '#d946ef'], [11, 59, 58, '#0ea5a4', '#5eead4'], [30, 27, 75, '#6366f1', '#a5b4fc']];
      var h = hues[p.id.length % hues.length];
      return 'background:linear-gradient(135deg,rgb(' + h[0] + ',' + h[1] + ',' + h[2] + '),' + h[3] + ' 60%,' + h[4] + ')';
    }
    function render() {
      var ps = getProjects();
      var q = (document.getElementById('searchInput').value || '').toLowerCase();
      var html = ps.filter(function (p) { return p.name.toLowerCase().indexOf(q) !== -1; }).map(function (p) {
        return '<article class="proj-card" data-id="' + p.id + '">' +
          '<div class="proj-thumb" style="' + thumbStyle(p) + '">' +
          '<span class="phover"><span>' + PLAY_SVG + '</span></span></div>' +
          '<div class="proj-meta"><h3>' + escapeHtml(p.name) + '</h3><p>Edited ' + ago(p.updatedAt) + '</p></div></article>';
      }).join('');
      html += '<article class="proj-card new" id="newCard"><div class="proj-thumb">' + PLUS_SVG +
        '</div><div class="proj-meta"><h3>New project</h3><p>Start from scratch</p></div></article>';
      if (!ps.length) html = '<div class="media-empty" style="grid-column:1/-1">No projects yet — create your first one.</div>' + html;
      grid.innerHTML = html;
      grid.querySelectorAll('.proj-card[data-id]').forEach(function (c) {
        c.addEventListener('click', function () { location.href = 'editor.html?project=' + c.dataset.id; });
        c.addEventListener('contextmenu', function (e) { e.preventDefault(); cardMenu(e.clientX, e.clientY, c.dataset.id); });
      });
      document.getElementById('newCard').addEventListener('click', newProject);
    }
    function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function newProject() {
      var id = uid();
      lsSet('nythedit_project_' + id, { id: id, name: 'Untitled project', lanes: { video: [], audio: [], captions: [], fx: [] }, media: [] });
      touchProject(id, { name: 'Untitled project' });
      location.href = 'editor.html?project=' + id;
    }
    var nb = document.getElementById('newBtn');
    if (nb) nb.addEventListener('click', function (e) { e.preventDefault(); newProject(); });

    /* card context menu */
    function closeMenu() { if (menuEl) { menuEl.remove(); menuEl = null; } }
    function cardMenu(x, y, id) {
      closeMenu();
      var ps = getProjects(), p = ps.find(function (a) { return a.id === id; });
      if (!p) return;
      menuEl = document.createElement('div');
      menuEl.className = 'ctxmenu show';
      menuEl.innerHTML =
        '<div class="ctx-title">' + escapeHtml(p.name) + '</div>' +
        '<button class="ctx-item" data-a="open">Open project</button>' +
        '<button class="ctx-item" data-a="rename">Rename</button>' +
        '<button class="ctx-item" data-a="dup">Duplicate</button>' +
        '<div class="ctx-sep"></div>' +
        '<button class="ctx-item danger" data-a="del">Delete project</button>';
      document.body.appendChild(menuEl);
      var r = menuEl.getBoundingClientRect();
      menuEl.style.left = Math.min(x, innerWidth - r.width - 10) + 'px';
      menuEl.style.top = Math.min(y, innerHeight - r.height - 10) + 'px';
      menuEl.querySelectorAll('.ctx-item').forEach(function (b) {
        b.addEventListener('click', function () {
          var a = b.dataset.a; closeMenu();
          if (a === 'open') location.href = 'editor.html?project=' + id;
          else if (a === 'rename') {
            var n = prompt('Rename project', p.name);
            if (n && n.trim()) { touchProject(id, { name: n.trim() }); lsSet('nythedit_project_' + id, Object.assign(lsGet('nythedit_project_' + id, {}), { name: n.trim() })); render(); }
          }
          else if (a === 'dup') {
            var nid = uid(), src = lsGet('nythedit_project_' + id, null);
            if (src) { src.id = nid; src.name = p.name + ' (copy)'; lsSet('nythedit_project_' + nid, src); touchProject(nid, { name: src.name, thumb: p.thumb }); }
            render(); toast('Project duplicated');
          }
          else if (a === 'del') {
            if (!confirm('Delete "' + p.name + '" permanently?')) return;
            var src2 = lsGet('nythedit_project_' + id, null);
            var done = function () {
              lsDel('nythedit_project_' + id);
              saveProjects(getProjects().filter(function (z) { return z.id !== id; }));
              render(); toast('Project deleted');
            };
            if (src2 && src2.media && src2.media.length) {
              Promise.all(src2.media.map(function (m) { return idb.del('blob-' + m.id).catch(function () {}); })).then(done, done);
            } else done();
          }
        });
      });
      setTimeout(function () {
        document.addEventListener('pointerdown', function h(e) { if (menuEl && !menuEl.contains(e.target)) { closeMenu(); document.removeEventListener('pointerdown', h); } });
      }, 0);
    }
    var si = document.getElementById('searchInput');
    if (si) si.addEventListener('input', render);
    render();
  }

  /* public API */
  window.NythEdit = {
    toast: toast, getUser: getUser, uid: uid, idb: idb,
    lsGet: lsGet, lsSet: lsSet, lsDel: lsDel,
    getProjects: getProjects, touchProject: touchProject
  };
})();
