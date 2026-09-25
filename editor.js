/* ============================================================
   NythEdit — editor JS: panels, timeline, playback, export
   Demo logic only — wire to your backend where marked.
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ---------- project name ---------- */
  const params = new URLSearchParams(location.search);
  const projNameEl = $('#projName');
  if (params.get('name')) projNameEl.textContent = params.get('name');
  $('#renameBtn').addEventListener('click', () => {
    const v = prompt('Rename project:', projNameEl.textContent);
    if (v && v.trim()) {
      projNameEl.textContent = v.trim();
      touchSaved();
      toast('Project renamed');
    }
  });
  $('#backBtn').addEventListener('click', () => location.href = 'projects.html');
  document.querySelectorAll('[data-rail="projects"],[data-rail="home"]').forEach(b =>
    b.addEventListener('click', () => location.href = 'projects.html'));
  $$('.rail-btn').forEach(b => {
    if (b.dataset.rail === 'projects' || b.dataset.rail === 'home') return;
    b.addEventListener('click', () => {
      $$('.rail-btn').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      toast(b.textContent.trim() + ' — coming soon in this demo');
    });
  });

  function touchSaved() {
    $('#savedAt').textContent = 'Last saved just now';
  }

  /* ---------- media panel tabs ---------- */
  const MEDIA = {
    media: [
      { n: 'Import', import: true },
      { n: 'Stand pose.mp4', d: '01:00', g: 'linear-gradient(135deg,#c96f4a,#7c3aed)' },
      { n: 'Start with coach.mp4', d: '01:00', g: 'linear-gradient(135deg,#0ea5a4,#1e3a5f)' },
      { n: 'Start.mp4', d: '01:00', g: 'linear-gradient(135deg,#f59e0b,#7c2d12)' },
      { n: 'Start with coach (1).mp4', d: '01:00', g: 'linear-gradient(135deg,#ec4899,#4c0519)' },
      { n: 'Start (1).mp4', d: '01:00', g: 'linear-gradient(135deg,#6366f1,#1e1b4b)' },
    ],
    text: [
      { n: 'Default title', d: 'TEXT', g: 'linear-gradient(135deg,#3b3f4e,#151a28)' },
      { n: 'Lower third', d: 'TEXT', g: 'linear-gradient(135deg,#0ea5a4,#155e5d)' },
      { n: 'Bold opener', d: 'TEXT', g: 'linear-gradient(135deg,#7c3aed,#2e1065)' },
      { n: 'Subtitles', d: 'AUTO', g: 'linear-gradient(135deg,#64748b,#1e293b)' },
    ],
    effects: [
      { n: 'Sport Effects', d: 'FX', g: 'linear-gradient(135deg,#c084fc,#7c3aed)' },
      { n: 'Glitch Pack', d: 'FX', g: 'linear-gradient(135deg,#22d3ee,#1e3a8a)' },
      { n: 'Light Leaks', d: 'FX', g: 'linear-gradient(135deg,#fbbf24,#b45309)' },
      { n: 'Film Grain', d: 'FX', g: 'linear-gradient(135deg,#78716c,#292524)' },
    ],
    trans: [
      { n: 'Cross Dissolve', d: '1s', g: 'linear-gradient(135deg,#94a3b8,#334155)' },
      { n: 'Whip Pan', d: '0.5s', g: 'linear-gradient(135deg,#f472b6,#9d174d)' },
      { n: 'Zoom Punch', d: '0.6s', g: 'linear-gradient(135deg,#34d399,#065f46)' },
      { n: 'Glitch Cut', d: '0.4s', g: 'linear-gradient(135deg,#a78bfa,#4c1d95)' },
    ],
  };
  const mediaGrid = $('#mediaGrid');
  function renderMedia(tab, q) {
    mediaGrid.innerHTML = '';
    const items = MEDIA[tab].filter(i => !q || i.n.toLowerCase().includes(q.toLowerCase()));
    if (!items.length) {
      mediaGrid.innerHTML = '<div class="media-empty">Nothing found. Try another search.</div>';
      return;
    }
    items.forEach(i => {
      const el = document.createElement('div');
      el.className = 'media-card' + (i.import ? ' import' : '');
      el.innerHTML = `<div class="media-thumb" style="${i.import ? '' : `background:${i.g}`}">${i.import ? '⤒' : ''}${i.d ? `<span class="dur">${i.d}</span>` : ''}</div><div class="media-name">${i.n}</div>`;
      el.addEventListener('click', () => {
        if (i.import) { toast('Import dialog — connect your storage to upload'); return; }
        toast(`"${i.n}" added to timeline`);
        touchSaved();
      });
      mediaGrid.appendChild(el);
    });
  }
  let mtab = 'media';
  renderMedia(mtab);
  $('#mediaTabs').addEventListener('click', e => {
    const b = e.target.closest('.media-tab'); if (!b) return;
    $$('#mediaTabs .media-tab').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    mtab = b.dataset.mtab;
    renderMedia(mtab, $('#mediaSearch').value);
  });
  $('#mediaSearch').addEventListener('input', e => renderMedia(mtab, e.target.value));

  /* ---------- right panel tabs ---------- */
  $('#sideTabs').addEventListener('click', e => {
    const b = e.target.closest('.side-tab'); if (!b) return;
    $$('#sideTabs .side-tab').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    $$('[data-spanel]').forEach(p => p.hidden = p.dataset.spanel !== b.dataset.stab);
  });
  $('#ratioRow').addEventListener('click', e => {
    const b = e.target.closest('.ratio-pill'); if (!b) return;
    $$('#ratioRow .ratio-pill').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
  });
  document.querySelectorAll('[data-qa]').forEach(b =>
    b.addEventListener('click', () => toast(`"${b.dataset.qa}" applied (demo)`)));

  /* ---------- generate (demo) ---------- */
  const genBtn = $('#genBtn');
  genBtn.addEventListener('click', () => {
    const prompt = $('#t2vPrompt').value.trim();
    if (!prompt) { toast('Describe your video first'); return; }
    genBtn.disabled = true;
    genBtn.innerHTML = '⏳ Generating…';
    setTimeout(() => {
      genBtn.disabled = false;
      genBtn.innerHTML = '✦ Generate';
      MEDIA.media.splice(1, 0, { n: 'AI clip — sports opener.mp4', d: '00:10', g: 'linear-gradient(135deg,#7c3aed,#0ea5a4)' });
      if (mtab === 'media') renderMedia(mtab, $('#mediaSearch').value);
      touchSaved();
      toast('✦ AI clip ready — added to your media bin');
    }, 2400);
  });
  $('#imgBtn').addEventListener('click', () => toast('Image upload — connect storage in production'));

  /* ---------- share / export ---------- */
  $('#shareBtn').addEventListener('click', () => toast('🔗 Share link copied to clipboard (demo)'));
  const modal = $('#exportModal');
  $('#exportBtn').addEventListener('click', () => modal.classList.add('show'));
  $('#expCancel').addEventListener('click', () => modal.classList.remove('show'));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('show'); });
  $('#resRow').addEventListener('click', e => {
    const b = e.target.closest('.exp-opt'); if (!b) return;
    $$('#resRow .exp-opt').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
  });
  $('#expStart').addEventListener('click', () => {
    const bar = $('#expBar'), fill = $('#expFill'), status = $('#expStatus');
    const res = $('#resRow .exp-opt.on').dataset.res;
    bar.style.display = 'block';
    let p = 0;
    status.textContent = `Rendering ${res}…`;
    const t = setInterval(() => {
      p = Math.min(100, p + Math.random() * 14);
      fill.style.width = p + '%';
      if (p >= 100) {
        clearInterval(t);
        status.textContent = '✓ Done! Your video is ready (demo — no file produced).';
        toast('Export complete');
      }
    }, 260);
  });

  /* ============================================================
     TIMELINE
     ============================================================ */
  const DURATION = 360;               // 6:00 total
  let pps = 3.2;                      // px per second (zoom)
  let playT = 42;                     // current time, seconds
  let playing = false;
  let raf = null, lastTs = 0;

  const tlInner = $('#tlInner');
  const tlRuler = $('#tlRuler');
  const tlScroll = $('#tlScroll');
  const playhead = $('#playhead');
  const tcNow = $('#tcNow');
  const playBtn = $('#playBtn');
  const capEl = $('#previewCap');

  function fmt(t) {
    t = Math.max(0, t);
    const m = Math.floor(t / 60), s = Math.floor(t % 60), f = Math.floor((t % 1) * 30);
    return `00:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
  }
  function fmtShort(t) {
    const m = Math.floor(t / 60), s = Math.floor(t % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function layout() {
    tlInner.style.width = Math.ceil(DURATION * pps) + 'px';
    tlRuler.innerHTML = '';
    for (let t = 0; t <= DURATION; t += 30) {
      const tick = document.createElement('div');
      tick.className = 'tick';
      tick.style.left = (t * pps) + 'px';
      tick.textContent = fmtShort(t);
      tlRuler.appendChild(tick);
    }
    $$('.clip', tlInner).forEach(c => {
      c.style.left = (parseFloat(c.dataset.start) * pps) + 'px';
      c.style.width = Math.max(24, parseFloat(c.dataset.dur) * pps) + 'px';
    });
    drawPlayhead();
  }

  function drawPlayhead() {
    playhead.style.left = (playT * pps) + 'px';
    tcNow.textContent = fmt(playT);
    // live caption
    let cap = '';
    $$('.clip.cap', tlInner).forEach(c => {
      const s = parseFloat(c.dataset.start), d = parseFloat(c.dataset.dur);
      if (playT >= s && playT <= s + d) cap = c.dataset.cap;
    });
    capEl.textContent = cap;
    capEl.style.opacity = cap ? 1 : 0;
  }

  function tick(ts) {
    if (!playing) return;
    const dt = (ts - lastTs) / 1000;
    lastTs = ts;
    playT += dt;
    if (playT >= DURATION) {
      if ($('#loopBtn').classList.contains('on')) playT = 0;
      else { pause(); playT = DURATION; }
    }
    drawPlayhead();
    // keep playhead in view
    const x = playT * pps;
    if (x < tlScroll.scrollLeft || x > tlScroll.scrollLeft + tlScroll.clientWidth - 60) {
      tlScroll.scrollLeft = x - 80;
    }
    raf = requestAnimationFrame(tick);
  }
  function play() {
    if (playT >= DURATION) playT = 0;
    playing = true;
    playBtn.textContent = '⏸';
    lastTs = performance.now();
    raf = requestAnimationFrame(tick);
  }
  function pause() {
    playing = false;
    playBtn.textContent = '▶';
    cancelAnimationFrame(raf);
  }
  playBtn.addEventListener('click', () => playing ? pause() : play());
  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
      e.preventDefault();
      playing ? pause() : play();
    }
  });

  // seek: click / drag on ruler & lanes
  let scrubbing = false;
  function seekTo(clientX) {
    const r = tlInner.getBoundingClientRect();
    playT = Math.min(DURATION, Math.max(0, (clientX - r.left) / pps));
    drawPlayhead();
  }
  tlRuler.addEventListener('pointerdown', e => { scrubbing = true; tlRuler.setPointerCapture(e.pointerId); seekTo(e.clientX); });
  tlRuler.addEventListener('pointermove', e => { if (scrubbing) seekTo(e.clientX); });
  tlRuler.addEventListener('pointerup', () => scrubbing = false);

  // zoom
  $('#zoomRange').addEventListener('input', e => { pps = parseFloat(e.target.value); layout(); });
  $('#zoomFit').addEventListener('click', () => {
    pps = Math.max(1, (tlScroll.clientWidth - 20) / DURATION);
    $('#zoomRange').value = pps;
    layout();
  });

  // transport extras
  $('#loopBtn').addEventListener('click', function () {
    this.classList.toggle('on');
    this.style.color = this.classList.contains('on') ? 'var(--ink)' : '';
    toast(this.classList.contains('on') ? 'Loop on' : 'Loop off');
  });
  $('#prevEdit').addEventListener('click', () => { playT = Math.max(0, playT - 5); drawPlayhead(); });
  $('#fullBtn').addEventListener('click', () => {
    const f = $('.preview-frame');
    if (document.fullscreenElement) document.exitFullscreen();
    else if (f.requestFullscreen) f.requestFullscreen();
  });

  // timeline tool buttons (demo)
  $$('.tl-tools .tool-btn').forEach(b => {
    if (['zoomFit'].includes(b.id)) return;
    b.addEventListener('click', () => {
      if (b.title && !['Snapping', 'Link clips', 'Mute all'].includes(b.title)) toast(`"${b.title}" — demo`);
    });
  });

  // track header toggles
  $$('.tl-head button').forEach(b => b.addEventListener('click', () => b.classList.toggle('off')));

  // waveform (deterministic pseudo-random bars)
  const wave = $('#wave');
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 140; i++) {
    const bar = document.createElement('i');
    bar.style.height = (18 + rnd() * 64) + '%';
    wave.appendChild(bar);
  }

  // clip click → select toast
  $$('.clip', tlInner).forEach(c =>
    c.addEventListener('click', e => { e.stopPropagation(); toast('Clip selected — trim handles in full version'); }));

  layout();
  drawPlayhead();
  // center initial playhead
  tlScroll.scrollLeft = Math.max(0, playT * pps - tlScroll.clientWidth / 2);
})();
