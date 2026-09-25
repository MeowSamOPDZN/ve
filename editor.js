/* ============================================================
   NythEdit — REAL editor engine (no demos)
   - Real import: video / audio / image files with real metadata,
     thumbnails and waveforms
   - Real canvas preview renderer with synced playback
   - Real timeline: move, trim (drag handles), split, delete,
     duplicate, copy/paste, mute, lock, snapping, undo/redo
   - Custom right-click context menus everywhere
   - Real export: renders timeline to a video file (video+audio)
   - Real persistence: projects in localStorage, media blobs in IDB
   - Real image generation via Pollinations; text-to-video via your
     own provider (bring-your-own-key settings)
   ============================================================ */
(function () {
  'use strict';
  if (!document.body.classList.contains('editor-body')) return;
  var NX = window.NythEdit;
  function $(id) { return document.getElementById(id); }

  /* ================= icons ================= */
  var SVG = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="5" width="3.6" height="14" rx="1.4"/><rect x="13.4" y="5" width="3.6" height="14" rx="1.4"/></svg>',
    film: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 5v14M17 5v14M3 10h4M3 14h4M17 10h4M17 14h4"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M4.5 18l5-5 3 3 3-3 4 4"/></svg>',
    music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V6l10-2v11"/><circle cx="7" cy="18" r="2.4"/><circle cx="17" cy="15" r="2.4"/></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.8 5.4 5.4 1.8-5.4 1.8L12 17.4l-1.8-5.4L4.8 10.2l5.4-1.8z"/></svg>',
    cap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M7 11.5h5M7 15h8M15 11.5h2"/></svg>',
    upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 20h16"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/></svg>',
    vol: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4h3l4 4V6l-4 4z"/><path d="M15.5 9.5a4 4 0 010 5M18 7a7.5 7.5 0 010 10"/></svg>',
    volx: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4h3l4 4V6l-4 4z"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5"/></svg>',
    scissors: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="6" cy="7" r="2.5"/><circle cx="6" cy="17" r="2.5"/><path d="M8.2 8.6L20 20M8.2 15.4L20 4"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 14V5a2 2 0 012-2h9"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 4h4M7 7l1 13a2 2 0 002 2h4a2 2 0 002-2l1-13"/><path d="M10 11v6M14 11v6"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l4.2-1L20 7.2a2.05 2.05 0 00-2.9-2.9L5.5 16.2z"/><path d="M14.5 6.5l3 3"/></svg>',
    paste: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="5" width="14" height="16" rx="2"/><path d="M9 5a3 3 0 016 0"/><path d="M9 12h6M9 16h4"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    select: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h16v16H4z" stroke-dasharray="4 3"/></svg>',
    fs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>'
  };

  /* ================= state ================= */
  var LANES = [
    { id: 'fx', label: 'Effects', h: 44 },
    { id: 'captions', label: 'Captions', h: 44 },
    { id: 'video', label: 'Video', h: 44 },
    { id: 'audio', label: 'Audio', h: 56 }
  ];
  var project = null;              // {id,name,lanes:{...},media:[...]}
  var media = new Map();           // id -> {id,kind,name,url,duration,width,height,thumb,peaks,missing}
  var laneState = {};
  LANES.forEach(function (l) { laneState[l.id] = { locked: false, hidden: false, muted: false }; });

  var PX = 110, DUR = 30, t = 0;
  var playing = false, loop = false, magnetOn = true;
  var raf = 0, lastTs = 0;
  var selection = null;            // {lane,id}
  var clipboard = null;
  var undoStack = [], redoStack = [];
  var saveTimer = null, saveDeb = null;
  var exporting = false, recorder = null, recChunks = [], exportDest = null, exportGains = [];

  var canvas = $('previewCanvas'), ctx = canvas.getContext('2d');
  var params = new URLSearchParams(location.search);

  function fmt(s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
  function fmtDur(s) { if (s < 60) return Math.round(s) + 's'; return fmt(s); }
  function escapeHtml(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (x) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[x]; }); }

  /* ================= persistence ================= */
  function stripMedia(m) {
    return { id: m.id, kind: m.kind, name: m.name, duration: m.duration, width: m.width, height: m.height, thumb: m.thumb, peaks: m.peaks || null };
  }
  function saveNow() {
    if (!project) return;
    project.media = Array.from(media.values()).map(stripMedia);
    NX.lsSet('nythedit_project_' + project.id, { id: project.id, name: project.name, lanes: project.lanes, media: project.media });
    var firstThumb = null;
    project.lanes.video.forEach(function (c) { if (!firstThumb) { var m = media.get(c.mediaId); if (m && m.thumb) firstThumb = m.thumb; } });
    NX.touchProject(project.id, { name: project.name, thumb: firstThumb });
    var el = $('savedInd');
    el.classList.add('saving'); $('savedTxt').textContent = 'Saving…';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { el.classList.remove('saving'); $('savedTxt').textContent = 'Saved'; }, 600);
  }
  function saveSoon() { clearTimeout(saveDeb); saveDeb = setTimeout(saveNow, 800); }

  function loadProjectData(id) {
    var d = NX.lsGet('nythedit_project_' + id, null);
    if (!d) d = { id: id, name: 'Untitled project', lanes: { fx: [], captions: [], video: [], audio: [] }, media: [] };
    LANES.forEach(function (l) { if (!d.lanes[l.id]) d.lanes[l.id] = []; });
    return d;
  }
  function restoreMedia(list) {
    var jobs = (list || []).map(function (meta) {
      return NX.idb.get('blob-' + meta.id).then(function (blob) {
        var m = Object.assign({}, meta, { missing: !blob });
        m.url = blob ? URL.createObjectURL(blob) : '';
        media.set(m.id, m);
      }).catch(function () {
        media.set(meta.id, Object.assign({}, meta, { missing: true, url: '' }));
      });
    });
    return Promise.all(jobs);
  }

  /* ================= undo/redo ================= */
  function snap() { return JSON.stringify(project.lanes); }
  function pushUndo() { undoStack.push(snap()); if (undoStack.length > 60) undoStack.shift(); redoStack = []; }
  function doUndo() {
    if (!undoStack.length) return NX.toast('Nothing to undo');
    redoStack.push(snap()); project.lanes = JSON.parse(undoStack.pop());
    selection = null; afterMutation();
  }
  function doRedo() {
    if (!redoStack.length) return NX.toast('Nothing to redo');
    undoStack.push(snap()); project.lanes = JSON.parse(redoStack.pop());
    selection = null; afterMutation();
  }

  /* ================= audio context (shared) ================= */
  var AC = null, graphMap = new WeakMap();
  function ensureAC() {
    if (!AC) { var C = window.AudioContext || window.webkitAudioContext; if (C) AC = new C(); }
    if (AC && AC.state === 'suspended') AC.resume();
    return AC;
  }
  function ensureGraph(el) {
    if (graphMap.has(el)) return graphMap.get(el);
    var a = ensureAC(); if (!a) return null;
    try {
      var src = a.createMediaElementSource(el);
      var g = a.createGain();
      src.connect(g); g.connect(a.destination);
      var o = { gain: g }; graphMap.set(el, o); return o;
    } catch (e) { return null; }
  }
  function setElGain(el, v) { var g = ensureGraph(el); if (g) g.gain.value = v; }

  /* ================= import ================= */
  var fileInput = $('fileInput');
  $('importBtn').addEventListener('click', function () { fileInput.click(); });
  fileInput.addEventListener('change', function () {
    Array.prototype.forEach.call(fileInput.files, processFile);
    fileInput.value = '';
  });
  ['mediaPanel', 'tlScroll'].forEach(function (id) {
    var z = $(id);
    z.addEventListener('dragover', function (e) { e.preventDefault(); });
    z.addEventListener('drop', function (e) {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.files.length) {
        Array.prototype.forEach.call(e.dataTransfer.files, processFile);
        NX.toast(e.dataTransfer.files.length + ' file(s) importing…');
      }
    });
  });

  function processFile(file) {
    var kind = file.type.indexOf('video') === 0 ? 'video' : file.type.indexOf('audio') === 0 ? 'audio' : file.type.indexOf('image') === 0 ? 'image' : null;
    if (!kind) { NX.toast('Unsupported file: ' + file.name); return; }
    var id = NX.uid();
    var url = URL.createObjectURL(file);
    var m = { id: id, kind: kind, name: file.name, url: url, duration: 0, width: 0, height: 0, thumb: '', peaks: null, missing: false };
    media.set(id, m);
    NX.idb.set('blob-' + id, file).catch(function () {});
    if (kind === 'video') probeVideo(m);
    else if (kind === 'audio') probeAudio(m, file);
    else probeImage(m);
    renderMedia(); saveSoon();
    NX.toast('Imported ' + file.name);
  }

  function probeVideo(m) {
    var v = document.createElement('video');
    v.muted = true; v.preload = 'auto'; v.src = m.url;
    v.addEventListener('loadedmetadata', function () {
      m.duration = v.duration || 0; m.width = v.videoWidth; m.height = v.videoHeight;
      try { v.currentTime = Math.min(0.4, (v.duration || 1) / 3); } catch (e) {}
    });
    v.addEventListener('seeked', function () {
      try {
        var c = document.createElement('canvas'); c.width = 320; c.height = 180;
        c.getContext('2d').drawImage(v, 0, 0, 320, 180);
        m.thumb = c.toDataURL('image/jpeg', 0.7);
      } catch (e) {}
      renderMedia(); saveSoon();
    });
    v.addEventListener('error', function () { m.missing = true; renderMedia(); });
  }
  function probeAudio(m, file) {
    var rd = new FileReader();
    rd.onload = function () {
      try {
        ensureAC().decodeAudioData(rd.result, function (buf) {
          m.duration = buf.duration;
          var ch = buf.getChannelData(0), n = 90, peaks = [];
          for (var i = 0; i < n; i++) {
            var s = Math.floor(i * ch.length / n), e = Math.floor((i + 1) * ch.length / n), mx = 0;
            for (var j = s; j < e; j += 40) { var v = Math.abs(ch[j]); if (v > mx) mx = v; }
            peaks.push(mx);
          }
          m.peaks = peaks; renderMedia(); saveSoon();
        }, function () { renderMedia(); });
      } catch (e) {}
    };
    rd.readAsArrayBuffer(file);
  }
  function probeImage(m) {
    var img = new Image();
    img.onload = function () { m.width = img.naturalWidth; m.height = img.naturalHeight; m.thumb = m.url; renderMedia(); saveSoon(); };
    img.src = m.url;
  }

  /* ================= media element pools ================= */
  var vidPool = new Map(), audPool = new Map(), imgPool = new Map();
  function vidEl(m) {
    if (!vidPool.has(m.id)) {
      var v = document.createElement('video');
      v.src = m.url; v.preload = 'auto'; v.playsInline = true;
      vidPool.set(m.id, v);
    }
    return vidPool.get(m.id);
  }
  function audEl(m) {
    if (!audPool.has(m.id)) { var a = document.createElement('audio'); a.src = m.url; a.preload = 'auto'; audPool.set(m.id, a); }
    return audPool.get(m.id);
  }
  function imgEl(m) {
    if (!imgPool.has(m.id)) { var i = new Image(); i.src = m.url; imgPool.set(m.id, i); }
    return imgPool.get(m.id);
  }

  /* ================= renderer ================= */
  function clipAt(lane, time) {
    var cs = project.lanes[lane].filter(function (c) { return time >= c.start && time < c.start + c.dur; });
    return cs.length ? cs[cs.length - 1] : null;
  }
  function drawCover(el, vw, vh) {
    var cw = canvas.width, ch = canvas.height;
    var s = Math.max(cw / vw, ch / vh), w = vw * s, h = vh * s;
    ctx.drawImage(el, (cw - w) / 2, (ch - h) / 2, w, h);
  }
  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function drawCaption(text) {
    var ch = canvas.height, cw = canvas.width;
    ctx.font = '600 ' + Math.round(ch * 0.052) + 'px Inter, sans-serif';
    var tw = ctx.measureText(text).width, pad = ch * 0.022;
    var bw = Math.min(tw + pad * 2.4, cw * 0.92), bh = ch * 0.052 + pad * 2;
    var bx = (cw - bw) / 2, by = ch * 0.86 - bh / 2;
    ctx.fillStyle = 'rgba(8,10,16,.8)';
    roundRect(bx, by, bw, bh, bh / 2.4); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    var t2 = text;
    while (ctx.measureText(t2).width > bw - pad * 2 && t2.length > 4) t2 = t2.slice(0, -2);
    if (t2 !== text) t2 += '…';
    ctx.fillText(t2, cw / 2, by + bh / 2 + 1);
  }
  function drawEmpty() {
    var cw = canvas.width, ch = canvas.height;
    ctx.fillStyle = '#14121f'; ctx.fillRect(0, 0, cw, ch);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
    ctx.font = '700 ' + Math.round(ch * 0.055) + 'px "Space Grotesk", Inter, sans-serif';
    ctx.fillText('Import media to begin', cw / 2, ch * 0.46);
    ctx.fillStyle = '#8f8aa3'; ctx.font = '400 ' + Math.round(ch * 0.032) + 'px Inter, sans-serif';
    ctx.fillText('Use the Import button in the Media panel, or drag & drop video, audio and image files.', cw / 2, ch * 0.54);
  }
  function render(time) {
    var cw = canvas.width, ch = canvas.height;
    ctx.save();
    ctx.fillStyle = '#0c0e14'; ctx.fillRect(0, 0, cw, ch);
    var drew = false;
    if (!laneState.video.hidden) {
      var c = clipAt('video', time);
      if (c) {
        var m = media.get(c.mediaId);
        if (m && !m.missing) {
          var fx = clipAt('fx', time);
          ctx.save();
          if (fx && fx.effect === 'zoom') {
            var pr = (time - fx.start) / fx.dur, sc = 1 + 0.18 * pr;
            ctx.translate(cw / 2, ch / 2); ctx.scale(sc, sc); ctx.translate(-cw / 2, -ch / 2);
          }
          if (fx && fx.effect === 'glow') ctx.filter = 'saturate(1.4) brightness(1.12)';
          if (m.kind === 'video') {
            var el = vidEl(m);
            if (el.readyState >= 2 && el.videoWidth) { drawCover(el, el.videoWidth, el.videoHeight); drew = true; }
          } else if (m.kind === 'image') {
            var im = imgEl(m);
            if (im.complete && im.naturalWidth) { drawCover(im, im.naturalWidth, im.naturalHeight); drew = true; }
          }
          ctx.restore();
          if (fx && fx.effect === 'glow') {
            var g = ctx.createRadialGradient(cw / 2, ch / 2, ch * 0.2, cw / 2, ch / 2, ch * 0.75);
            g.addColorStop(0, 'rgba(217,70,239,.14)'); g.addColorStop(1, 'rgba(217,70,239,0)');
            ctx.fillStyle = g; ctx.fillRect(0, 0, cw, ch);
          }
        }
      }
    }
    if (!laneState.captions.hidden) {
      var cap = clipAt('captions', time);
      if (cap && cap.text) drawCaption(cap.text);
    }
    if (!drew && !project.lanes.video.length) drawEmpty();
    ctx.restore();
  }

  /* ================= transport ================= */
  function updateTimeUI() {
    $('timeNow').textContent = fmt(t);
    $('timeDur').textContent = fmt(DUR);
    if (exporting) {
      var p = Math.min(100, Math.round(t / DUR * 100));
      $('expFill').style.width = p + '%';
      $('expStatus').textContent = 'Rendering… ' + p + '%';
    }
  }
  function activeIn(lane, time) {
    return project.lanes[lane].filter(function (c) { return time >= c.start && time < c.start + c.dur; });
  }
  function syncElements() {
    var wantPlay = playing || exporting;
    ['video', 'audio'].forEach(function (lane) {
      var act = {};
      if (!laneState[lane].hidden) activeIn(lane, t).forEach(function (c) { act[c.mediaId] = c; });
      project.lanes[lane].forEach(function (c) {
        var m = media.get(c.mediaId); if (!m || m.missing || m.kind === 'image') return;
        var el = m.kind === 'video' ? vidEl(m) : audEl(m);
        var isAct = !!act[c.mediaId];
        var mt = (c.offset || 0) + (t - c.start);
        if (wantPlay && isAct) {
          setElGain(el, (c.muted || laneState[lane].muted) ? 0 : 1);
          if (Math.abs(el.currentTime - mt) > 0.35) { try { el.currentTime = Math.max(0, Math.min(mt, (m.duration || mt + 1) - 0.05)); } catch (e) {} }
          if (el.paused) el.play().catch(function () {});
        } else {
          if (!el.paused) el.pause();
          if (isAct && !wantPlay) { try { if (Math.abs(el.currentTime - mt) > 0.06) el.currentTime = Math.max(0, mt); } catch (e) {} }
        }
      });
    });
  }
  function pauseAll() {
    vidPool.forEach(function (v) { if (!v.paused) v.pause(); });
    audPool.forEach(function (a) { if (!a.paused) a.pause(); });
  }
  function tick(ts) {
    if (!playing) return;
    if (!lastTs) lastTs = ts;
    t += (ts - lastTs) / 1000; lastTs = ts;
    if (t >= DUR) {
      if (exporting) { finishExport(); return; }
      if (loop) t = 0; else { t = DUR; setPlaying(false); }
    }
    syncElements(); render(t); updateTimeUI(); autoscroll();
    raf = requestAnimationFrame(tick);
  }
  function setPlaying(v) {
    ensureAC();
    playing = v; lastTs = 0;
    $('playBtn').innerHTML = v ? SVG.pause : SVG.play;
    if (!v) pauseAll();
    if (v) raf = requestAnimationFrame(tick); else cancelAnimationFrame(raf);
  }
  function seek(nt) {
    t = Math.max(0, Math.min(DUR, nt));
    syncElements(); render(t); updateTimeUI();
  }
  function autoscroll() {
    var sc = $('tlScroll'), x = t * PX;
    if (x < sc.scrollLeft + 40 || x > sc.scrollLeft + sc.clientWidth - 120) {
      sc.scrollLeft = Math.max(0, x - sc.clientWidth * 0.35);
    }
  }
  $('playBtn').addEventListener('click', function () { setPlaying(!playing); });
  $('prevBtn').addEventListener('click', function () { seek(t - 5); });
  $('loopBtn').addEventListener('click', function () {
    loop = !loop; $('loopBtn').classList.toggle('on', loop);
    NX.toast(loop ? 'Loop on' : 'Loop off');
  });
  $('fsBtn').addEventListener('click', function () {
    var f = $('previewFrame');
    if (document.fullscreenElement) document.exitFullscreen();
    else if (f.requestFullscreen) f.requestFullscreen();
  });
  document.addEventListener('keydown', function (e) {
    var tag = (document.activeElement && document.activeElement.tagName) || '';
    var inField = /INPUT|TEXTAREA|SELECT/.test(tag);
    if (e.code === 'Space' && !inField) { e.preventDefault(); setPlaying(!playing); }
    else if ((e.key === 'Delete' || e.key === 'Backspace') && !inField) { e.preventDefault(); deleteSelection(); }
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && !inField) { e.preventDefault(); duplicateSelection(); }
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && !inField) { e.preventDefault(); copySelection(); }
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v' && !inField) { e.preventDefault(); pasteClipboard(); }
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey && !inField) { e.preventDefault(); doUndo(); }
    else if ((((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')) && !inField) { e.preventDefault(); doRedo(); }
    else if (e.key === 'ArrowLeft' && !inField) { seek(t - (e.shiftKey ? 5 : 1)); }
    else if (e.key === 'ArrowRight' && !inField) { seek(t + (e.shiftKey ? 5 : 1)); }
  });

  /* ================= timeline DOM ================= */
  function recomputeDUR() {
    var mx = 30;
    LANES.forEach(function (l) {
      project.lanes[l.id].forEach(function (c) { mx = Math.max(mx, c.start + c.dur); });
    });
    DUR = Math.ceil(mx + 5);
    $('tlInner').style.width = Math.max($('tlScroll').clientWidth, DUR * PX) + 'px';
  }
  function buildRuler() {
    var html = '', step = PX > 80 ? 5 : 10;
    for (var s = 0; s <= DUR; s += step) html += '<span class="tick" style="left:' + (s * PX) + 'px">' + fmt(s) + '</span>';
    $('tlRuler').innerHTML = html;
  }
  function laneEnd(lane) {
    var mx = 0;
    project.lanes[lane].forEach(function (c) { mx = Math.max(mx, c.start + c.dur); });
    return mx;
  }
  function clipIcon(c) {
    if (c.lane === 'captions') return SVG.cap;
    if (c.lane === 'fx') return SVG.spark;
    var m = media.get(c.mediaId);
    if (!m) return SVG.film;
    return m.kind === 'video' ? SVG.film : m.kind === 'audio' ? SVG.music : SVG.image;
  }
  function clipCls(c) {
    return c.lane === 'captions' ? 'cap' : c.lane === 'fx' ? 'fx' : c.lane === 'audio' ? 'aud' : 'vid';
  }
  function clipLabel(c) {
    if (c.lane === 'captions') return c.text || 'Caption';
    if (c.lane === 'fx') return c.effect === 'glow' ? 'Dream Glow' : 'Zoom Punch';
    var m = media.get(c.mediaId);
    return (c.label || (m && m.name) || 'Clip') + (m && m.missing ? ' (missing)' : '');
  }
  function buildLanes() {
    var heads = $('tlHeads'), lanesBox = $('tlLanes');
    heads.innerHTML = '<div class="tl-ruler-space"></div>';
    lanesBox.innerHTML = '';
    LANES.forEach(function (L) {
      var st = laneState[L.id];
      var lane = document.createElement('div');
      lane.className = 'tl-lane' + (L.id === 'audio' ? ' audio' : '');
      lane.style.height = L.h + 'px';
      lane.dataset.lane = L.id;
      lane.addEventListener('contextmenu', function (e) {
        if (e.target.closest('.clip')) return;
        e.preventDefault(); laneMenu(e.clientX, e.clientY, L.id);
      });
      lane.addEventListener('click', function (e) { if (!e.target.closest('.clip')) { selection = null; paintSelection(); } });
      project.lanes[L.id].forEach(function (c) { lane.appendChild(clipEl(L.id, c)); });
      lanesBox.appendChild(lane);

      var head = document.createElement('div');
      head.className = 'tl-head' + (L.id === 'audio' ? ' audio' : '');
      head.title = L.label;
      head.innerHTML = '<button data-k="locked" title="Lock ' + L.label + '">' + SVG.lock + '</button>' +
        '<button data-k="hidden" title="Hide ' + L.label + '">' + SVG.eye + '</button>' +
        ((L.id === 'video' || L.id === 'audio') ? '<button data-k="muted" title="Mute ' + L.label + '">' + (st.muted ? SVG.volx : SVG.vol) + '</button>' : '');
      Array.prototype.forEach.call(head.querySelectorAll('button'), function (b) {
        if (st[b.dataset.k]) b.classList.add('off');
        b.addEventListener('click', function () {
          var k = b.dataset.k;
          st[k] = !st[k]; b.classList.toggle('off', st[k]);
          if (k === 'muted') b.innerHTML = st.muted ? SVG.volx : SVG.vol;
          if (k === 'locked') buildLanes();
          render(t);
        });
      });
      heads.appendChild(head);
    });
    paintSelection();
  }
  function clipEl(lane, c) {
    var el = document.createElement('div');
    el.className = 'clip ' + clipCls(c) + (laneState[lane].locked ? ' locked' : '') + (c.muted ? ' muted' : '');
    el.dataset.id = c.id; el.dataset.lane = lane;
    el.style.left = (c.start * PX) + 'px';
    el.style.width = Math.max(14, c.dur * PX) + 'px';
    var inner = '<div class="trim-handle l"></div><div class="trim-handle r"></div><span class="clabel">' + clipIcon(c) + '<span>' + escapeHtml(clipLabel(c)) + '</span></span>';
    if (lane === 'audio') {
      var m = media.get(c.mediaId), bars = '';
      var peaks = (m && m.peaks) || null, n = Math.max(12, Math.min(90, Math.floor(c.dur * PX / 5)));
      for (var i = 0; i < n; i++) {
        var h = peaks ? Math.round(4 + peaks[Math.floor(i * peaks.length / n)] * 30) : Math.round(6 + Math.random() * 20);
        bars += '<i style="height:' + h + 'px"></i>';
      }
      inner = '<div class="trim-handle l"></div><div class="trim-handle r"></div><span class="wave">' + bars + '</span><span class="clabel">' + clipIcon(c) + '<span>' + escapeHtml(clipLabel(c)) + '</span></span>';
    }
    el.innerHTML = inner;
    el.addEventListener('pointerdown', function (e) { onClipPointerDown(e, lane, c, el); });
    el.addEventListener('contextmenu', function (e) { e.preventDefault(); e.stopPropagation(); select(lane, c.id); clipMenu(e.clientX, e.clientY, lane, c.id); });
    if (lane === 'captions') el.addEventListener('dblclick', function () { editCaption(c); });
    return el;
  }
  function paintSelection() {
    document.querySelectorAll('.clip').forEach(function (el) {
      el.classList.toggle('selected', !!selection && el.dataset.id === selection.id);
    });
  }
  function select(lane, id) { selection = { lane: lane, id: id }; paintSelection(); }
  function findClip(lane, id) {
    var cs = project.lanes[lane] || [];
    for (var i = 0; i < cs.length; i++) if (cs[i].id === id) return cs[i];
    return null;
  }
  function selClip() { return selection ? findClip(selection.lane, selection.id) : null; }

  /* ---- drag: move + trim ---- */
  function snapX(x) {
    if (!magnetOn) return x;
    var cands = [t * PX], best = x, bd = 10;
    LANES.forEach(function (L) {
      project.lanes[L.id].forEach(function (c) { cands.push(c.start * PX, (c.start + c.dur) * PX); });
    });
    cands.forEach(function (cx) { var d = Math.abs(cx - x); if (d < bd) { bd = d; best = cx; } });
    return best;
  }
  function maxDurFor(c) {
    if (c.lane !== 'video' && c.lane !== 'audio') return 3600;
    var m = media.get(c.mediaId);
    if (!m || !m.duration) return 3600;
    return Math.max(0.3, m.duration - (c.offset || 0));
  }
  function onClipPointerDown(e, lane, c, el) {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    select(lane, c.id);
    if (laneState[lane].locked) { NX.toast('Track is locked'); return; }
    var handle = e.target.closest('.trim-handle');
    var mode = handle ? (handle.classList.contains('l') ? 'trimL' : 'trimR') : 'move';
    if (mode !== 'move' && (lane === 'captions' || lane === 'fx')) mode = 'move';
    e.preventDefault();
    var startX = e.clientX;
    var orig = { start: c.start, dur: c.dur, offset: c.offset || 0 };
    pushUndo();
    var moved = false;
    function mv(ev) {
      var dx = (ev.clientX - startX) / PX;
      if (Math.abs(ev.clientX - startX) > 3) moved = true;
      if (mode === 'move') {
        c.start = Math.max(0, snapX((orig.start + dx) * PX) / PX);
      } else if (mode === 'trimL') {
        var ns = Math.max(0, Math.min(orig.start + orig.dur - 0.3, orig.start + dx));
        ns = snapX(ns * PX) / PX;
        var delta = ns - orig.start;
        c.start = ns; c.offset = orig.offset + delta; c.dur = orig.dur - delta;
      } else {
        c.dur = Math.max(0.3, Math.min(maxDurFor(c), snapX((orig.start + orig.dur + dx) * PX) / PX - orig.start));
      }
      el.style.left = (c.start * PX) + 'px';
      el.style.width = Math.max(14, c.dur * PX) + 'px';
    }
    function up() {
      window.removeEventListener('pointermove', mv);
      window.removeEventListener('pointerup', up);
      if (!moved) { undoStack.pop(); return; }
      afterMutation();
    }
    window.addEventListener('pointermove', mv);
    window.addEventListener('pointerup', up);
  }

  /* ---- ruler scrub ---- */
  var ruler = $('tlRuler'), scrubbing = false;
  function scrubTo(clientX) {
    var r = $('tlInner').getBoundingClientRect();
    seek((clientX - r.left) / PX);
  }
  ruler.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    scrubbing = true;
    try { ruler.setPointerCapture(e.pointerId); } catch (err) {}
    scrubTo(e.clientX);
  });
  ruler.addEventListener('pointermove', function (e) { if (scrubbing) scrubTo(e.clientX); });
  ruler.addEventListener('pointerup', function () { scrubbing = false; });
  ruler.addEventListener('contextmenu', function (e) { e.preventDefault(); laneMenu(e.clientX, e.clientY, 'video'); });

  $('zoomRange').addEventListener('input', function (e) {
    PX = parseInt(e.target.value, 10);
    recomputeDUR(); buildRuler(); buildLanes(); render(t);
  });

  /* ================= clip operations ================= */
  function afterMutation() {
    recomputeDUR(); buildRuler(); buildLanes(); render(t); updateTimeUI(); saveSoon();
  }
  function splitClipAt(lane, id, at) {
    var c = findClip(lane, id); if (!c) return false;
    if (at <= c.start + 0.05 || at >= c.start + c.dur - 0.05) return false;
    pushUndo();
    var cut = at - c.start;
    var b = Object.assign({}, c, { id: NX.uid(), start: at, dur: c.dur - cut, offset: (c.offset || 0) + cut });
    c.dur = cut;
    project.lanes[lane].push(b);
    project.lanes[lane].sort(function (x, y) { return x.start - y.start; });
    selection = { lane: lane, id: b.id };
    afterMutation();
    return true;
  }
  function splitAtPlayhead() {
    if (selection && splitClipAt(selection.lane, selection.id, t)) { NX.toast('Clip split'); return; }
    var c = clipAt('video', t) || clipAt('audio', t);
    if (c && splitClipAt(c.lane, c.id, t)) NX.toast('Clip split');
    else NX.toast('Move the playhead over a clip to split it');
  }
  function deleteSelection() {
    var c = selClip(); if (!c) return;
    if (laneState[selection.lane].locked) return NX.toast('Track is locked');
    pushUndo();
    project.lanes[selection.lane] = project.lanes[selection.lane].filter(function (x) { return x.id !== c.id; });
    selection = null; afterMutation(); NX.toast('Clip deleted');
  }
  function duplicateSelection() {
    var c = selClip(); if (!c) return NX.toast('Select a clip first');
    pushUndo();
    var n = Object.assign({}, c, { id: NX.uid(), start: c.start + c.dur + 0.2 });
    project.lanes[selection.lane].push(n);
    selection = { lane: selection.lane, id: n.id };
    afterMutation(); NX.toast('Clip duplicated');
  }
  function copySelection() {
    var c = selClip(); if (!c) return NX.toast('Select a clip first');
    clipboard = JSON.parse(JSON.stringify(c));
    NX.toast('Clip copied');
  }
  function pasteClipboard() {
    if (!clipboard) return NX.toast('Clipboard is empty');
    if (laneState[clipboard.lane].locked) return NX.toast('Track is locked');
    pushUndo();
    var n = Object.assign({}, clipboard, { id: NX.uid(), start: t });
    project.lanes[n.lane].push(n);
    selection = { lane: n.lane, id: n.id };
    afterMutation(); NX.toast('Clip pasted at playhead');
  }
  function trimStartToPlayhead(lane, id) {
    var c = findClip(lane, id); if (!c) return;
    if (t <= c.start || t >= c.start + c.dur) return NX.toast('Playhead is outside the clip');
    pushUndo();
    var delta = t - c.start;
    c.start = t; c.offset = (c.offset || 0) + delta; c.dur = c.dur - delta;
    afterMutation(); NX.toast('Trimmed start to playhead');
  }
  function trimEndToPlayhead(lane, id) {
    var c = findClip(lane, id); if (!c) return;
    if (t <= c.start || t >= c.start + c.dur) return NX.toast('Playhead is outside the clip');
    pushUndo();
    c.dur = t - c.start;
    afterMutation(); NX.toast('Trimmed end to playhead');
  }
  function toggleMuteClip(lane, id) {
    var c = findClip(lane, id); if (!c) return;
    pushUndo(); c.muted = !c.muted; afterMutation();
    NX.toast(c.muted ? 'Clip muted' : 'Clip unmuted');
  }
  function renameClip(lane, id) {
    var c = findClip(lane, id); if (!c) return;
    var n = prompt('Rename clip', c.label || clipLabel(c));
    if (n && n.trim()) { pushUndo(); c.label = n.trim(); afterMutation(); }
  }
  function editCaption(c) {
    var n = prompt('Caption text', c.text);
    if (n !== null) { pushUndo(); c.text = n; afterMutation(); }
  }
  function addCaption(text, at, dur) {
    pushUndo();
    var c = { id: NX.uid(), lane: 'captions', start: at == null ? t : at, dur: dur || 3, text: text || 'New caption' };
    project.lanes.captions.push(c);
    selection = { lane: 'captions', id: c.id };
    afterMutation();
    return c;
  }
  function addEffect(name, at, dur) {
    pushUndo();
    var c = { id: NX.uid(), lane: 'fx', start: at == null ? t : at, dur: dur || 2.5, effect: name };
    project.lanes.fx.push(c);
    selection = { lane: 'fx', id: c.id };
    afterMutation();
  }
  function addMediaToTimeline(m) {
    if (m.missing) return NX.toast('Media file is missing — re-import it');
    pushUndo();
    var c;
    if (m.kind === 'image') c = { id: NX.uid(), lane: 'video', mediaId: m.id, start: laneEnd('video'), dur: 3, offset: 0, label: m.name };
    else if (m.kind === 'video') c = { id: NX.uid(), lane: 'video', mediaId: m.id, start: laneEnd('video'), dur: m.duration || 5, offset: 0, label: m.name };
    else c = { id: NX.uid(), lane: 'audio', mediaId: m.id, start: laneEnd('audio'), dur: m.duration || 5, offset: 0, label: m.name };
    project.lanes[c.lane].push(c);
    selection = { lane: c.lane, id: c.id };
    afterMutation();
    NX.toast('Added to timeline');
  }

  /* ================= custom context menu ================= */
  var ctxMenu = $('ctxMenu');
  function hideMenu() { ctxMenu.classList.remove('show'); ctxMenu.innerHTML = ''; }
  function showMenu(x, y, items) {
    ctxMenu.innerHTML = '';
    items.forEach(function (it) {
      if (it.sep) { var s = document.createElement('div'); s.className = 'ctx-sep'; ctxMenu.appendChild(s); return; }
      if (it.title) { var tt = document.createElement('div'); tt.className = 'ctx-title'; tt.textContent = it.title; ctxMenu.appendChild(tt); return; }
      var b = document.createElement('button');
      b.className = 'ctx-item' + (it.danger ? ' danger' : '');
      b.innerHTML = (it.icon || '') + '<span>' + escapeHtml(it.label) + '</span>' + (it.kbd ? '<span class="kbd">' + it.kbd + '</span>' : '');
      if (it.disabled) b.disabled = true;
      else b.addEventListener('click', function () { hideMenu(); if (it.fn) it.fn(); });
      ctxMenu.appendChild(b);
    });
    ctxMenu.classList.add('show');
    var r = ctxMenu.getBoundingClientRect();
    ctxMenu.style.left = Math.max(8, Math.min(x, window.innerWidth - r.width - 8)) + 'px';
    ctxMenu.style.top = Math.max(8, Math.min(y, window.innerHeight - r.height - 8)) + 'px';
  }
  document.addEventListener('pointerdown', function (e) { if (!ctxMenu.contains(e.target)) hideMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hideMenu(); });
  $('tlScroll').addEventListener('scroll', hideMenu);

  function clipMenu(x, y, lane, id) {
    var c = findClip(lane, id); if (!c) return;
    var items = [{ title: clipLabel(c).slice(0, 32) }];
    if (lane === 'video' || lane === 'audio') {
      items.push(
        { icon: SVG.scissors, label: 'Trim start to playhead', fn: function () { trimStartToPlayhead(lane, id); } },
        { icon: SVG.scissors, label: 'Trim end to playhead', fn: function () { trimEndToPlayhead(lane, id); } },
        { icon: SVG.scissors, label: 'Split at playhead', kbd: 'S', fn: function () { if (splitClipAt(lane, id, t)) NX.toast('Clip split'); else NX.toast('Playhead is outside the clip'); } },
        { sep: true },
        { icon: SVG.copy, label: 'Copy', kbd: 'Ctrl+C', fn: copySelection },
        { icon: SVG.copy, label: 'Duplicate', kbd: 'Ctrl+D', fn: duplicateSelection },
        { sep: true },
        { icon: c.muted ? SVG.vol : SVG.volx, label: c.muted ? 'Unmute clip' : 'Mute clip', fn: function () { toggleMuteClip(lane, id); } },
        { icon: SVG.edit, label: 'Rename clip', fn: function () { renameClip(lane, id); } },
        { sep: true },
        { icon: SVG.trash, label: 'Delete clip', kbd: 'Del', danger: true, fn: deleteSelection }
      );
    } else if (lane === 'captions') {
      items.push(
        { icon: SVG.edit, label: 'Edit text', fn: function () { editCaption(c); } },
        { icon: SVG.copy, label: 'Duplicate', kbd: 'Ctrl+D', fn: duplicateSelection },
        { sep: true },
        { icon: SVG.trash, label: 'Delete caption', kbd: 'Del', danger: true, fn: deleteSelection }
      );
    } else {
      items.push(
        { icon: SVG.copy, label: 'Duplicate', kbd: 'Ctrl+D', fn: duplicateSelection },
        { icon: SVG.trash, label: 'Delete effect', kbd: 'Del', danger: true, fn: deleteSelection }
      );
    }
    showMenu(x, y, items);
  }
  function laneMenu(x, y, lane) {
    var items = [{ title: 'Timeline' }];
    if (lane === 'captions') items.push({ icon: SVG.cap, label: 'Add caption at playhead', fn: function () { var c = addCaption('', t, 3); editCaption(c); } });
    if (lane === 'fx') {
      items.push(
        { icon: SVG.spark, label: 'Add "Dream Glow" here', fn: function () { addEffect('glow', t, 2.5); } },
        { icon: SVG.spark, label: 'Add "Zoom Punch" here', fn: function () { addEffect('zoom', t, 2); } }
      );
    }
    items.push(
      { icon: SVG.paste, label: 'Paste clip', kbd: 'Ctrl+V', disabled: !clipboard, fn: pasteClipboard },
      { icon: SVG.select, label: 'Select all clips', fn: function () {
          var n = 0;
          LANES.forEach(function (L) { n += project.lanes[L.id].length; });
          NX.toast(n + ' clips on timeline');
        } }
    );
    showMenu(x, y, items);
  }
  function mediaMenu(x, y, m) {
    showMenu(x, y, [
      { title: m.name.slice(0, 32) },
      { icon: SVG.plus, label: 'Add to timeline', fn: function () { addMediaToTimeline(m); } },
      { icon: SVG.edit, label: 'Rename', fn: function () {
          var n = prompt('Rename media', m.name);
          if (n && n.trim()) { m.name = n.trim(); renderMedia(); saveSoon(); }
        } },
      { sep: true },
      { icon: SVG.trash, label: 'Remove from library', danger: true, fn: function () { removeMedia(m.id); } }
    ]);
  }
  function removeMedia(id) {
    if (!confirm('Remove this media and all its timeline clips?')) return;
    pushUndo();
    LANES.forEach(function (L) { project.lanes[L.id] = project.lanes[L.id].filter(function (c) { return c.mediaId !== id; }); });
    var m = media.get(id);
    media.delete(id);
    if (m && m.url) URL.revokeObjectURL(m.url);
    NX.idb.del('blob-' + id).catch(function () {});
    vidPool.delete(id); audPool.delete(id); imgPool.delete(id);
    selection = null;
    renderMedia(); afterMutation();
    NX.toast('Media removed');
  }

  /* preview right-click */
  $('previewFrame').addEventListener('contextmenu', function (e) {
    e.preventDefault();
    showMenu(e.clientX, e.clientY, [
      { icon: playing ? SVG.pause : SVG.play, label: playing ? 'Pause' : 'Play', kbd: 'Space', fn: function () { setPlaying(!playing); } },
      { icon: SVG.fs, label: 'Fullscreen preview', fn: function () { $('fsBtn').click(); } }
    ]);
  });

  /* ================= media panel ================= */
  var curTab = 'all';
  function renderMedia() {
    var q = $('mediaSearch').value.trim().toLowerCase();
    var grid = $('mediaGrid');
    var items = Array.from(media.values()).filter(function (m) {
      return (curTab === 'all' || m.kind === curTab) && m.name.toLowerCase().indexOf(q) !== -1;
    });
    var html = '<div class="media-card import" id="importCard"><div class="media-thumb">' + SVG.upload + '</div><div class="media-name">Import files</div></div>';
    html += items.map(function (m) {
      var thumb;
      if (m.kind === 'audio') thumb = '<div class="media-thumb" style="background:#eef0f6;color:#8e8aa3">' + SVG.music + '</div>';
      else if (m.thumb) thumb = '<div class="media-thumb"><img src="' + m.thumb + '" style="width:100%;height:100%;object-fit:cover" alt="" /></div>';
      else thumb = '<div class="media-thumb" style="background:#eef0f6;color:#8e8aa3">' + (m.kind === 'video' ? SVG.film : SVG.image) + '</div>';
      return '<div class="media-card" data-id="' + m.id + '" style="position:relative">' + thumb +
        (m.duration ? '<span style="position:absolute;right:7px;top:74px;background:rgba(10,12,20,.72);color:#fff;font-size:.64rem;padding:2px 8px;border-radius:6px;font-weight:600">' + fmtDur(m.duration) + '</span>' : '') +
        '<div class="media-name">' + escapeHtml(m.name) + (m.missing ? ' (missing)' : '') + '</div></div>';
    }).join('');
    if (!items.length && media.size) html += '<div class="media-empty">No media matches your search.</div>';
    if (!media.size) html += '<div class="media-empty">Your library is empty.<br/>Import video, audio or image files to start.</div>';
    grid.innerHTML = html;
    $('importCard').addEventListener('click', function () { fileInput.click(); });
    grid.querySelectorAll('.media-card[data-id]').forEach(function (card) {
      var m = media.get(card.dataset.id);
      card.addEventListener('click', function () { if (m) addMediaToTimeline(m); });
      card.addEventListener('contextmenu', function (e) { e.preventDefault(); e.stopPropagation(); if (m) mediaMenu(e.clientX, e.clientY, m); });
    });
  }
  document.querySelectorAll('#mediaTabs .media-tab').forEach(function (bt) {
    bt.addEventListener('click', function () {
      document.querySelectorAll('#mediaTabs .media-tab').forEach(function (x) { x.classList.remove('on'); });
      bt.classList.add('on'); curTab = bt.dataset.tab; renderMedia();
    });
  });
  $('mediaSearch').addEventListener('input', renderMedia);

  /* ================= side panel ================= */
  var mediaPanel = $('mediaPanel'), sidePanel = $('sidePanel'), scrim = $('drawerScrim');
  var mediaToggle = $('mediaToggle'), sideToggle = $('sideToggle');
  function closeDrawers() {
    mediaPanel.classList.remove('open'); sidePanel.classList.remove('open');
    mediaToggle.classList.remove('on'); sideToggle.classList.remove('on');
    scrim.classList.remove('show');
  }
  function toggleDrawer(panel, btn) {
    var will = !panel.classList.contains('open');
    closeDrawers();
    if (will) { panel.classList.add('open'); btn.classList.add('on'); scrim.classList.add('show'); }
  }
  mediaToggle.addEventListener('click', function () { toggleDrawer(mediaPanel, mediaToggle); });
  sideToggle.addEventListener('click', function () { toggleDrawer(sidePanel, sideToggle); });
  scrim.addEventListener('click', closeDrawers);
  document.querySelectorAll('.drawer-close').forEach(function (b) { b.addEventListener('click', closeDrawers); });

  document.querySelectorAll('#rail .rail-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('#rail .rail-btn').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
    });
  });

  var genMode = 't2v';
  document.querySelectorAll('#sideTabs .side-tab').forEach(function (bt) {
    bt.addEventListener('click', function () {
      document.querySelectorAll('#sideTabs .side-tab').forEach(function (x) { x.classList.remove('on'); });
      bt.classList.add('on');
      var k = bt.dataset.sidetab;
      $('pane-assistant').hidden = k !== 'assistant';
      $('pane-generate').hidden = k === 'assistant';
      if (k !== 'assistant') {
        genMode = k;
        var isImg = k === 'img';
        $('genDescLabel').textContent = isImg ? 'Image prompt' : 'Description';
        $('modelRow').style.display = isImg ? 'none' : '';
        $('durRowWrap').style.display = isImg ? 'none' : '';
        $('provBox').style.display = isImg ? 'none' : '';
        $('genLabel').textContent = isImg ? 'Generate image' : 'Generate video';
      }
    });
  });
  function pillRow(id, attr, cb) {
    var row = $(id);
    row.querySelectorAll('.ratio-pill').forEach(function (p) {
      p.addEventListener('click', function () {
        row.querySelectorAll('.ratio-pill').forEach(function (x) { x.classList.remove('on'); });
        p.classList.add('on'); cb(p.dataset[attr]);
      });
    });
  }
  var aspect = '16:9', genSecs = 5;
  pillRow('ratioRow', 'ar', function (v) { aspect = v; });
  pillRow('durRow', 'd', function (v) { genSecs = parseInt(v, 10); });

  /* provider settings (bring your own key) */
  var prov = NX.lsGet('nythedit_t2v', { url: '', key: '', model: 'veo-3' });
  function paintProv() {
    $('provUrl').value = prov.url || ''; $('provKey').value = prov.key || ''; $('provModel').value = prov.model || '';
    var ok = !!(prov.url && prov.key);
    $('provState').textContent = ok ? 'configured' : 'not configured';
    $('provState').classList.toggle('ok', ok);
  }
  $('provSave').addEventListener('click', function () {
    prov = { url: $('provUrl').value.trim(), key: $('provKey').value, model: $('provModel').value.trim() || 'veo-3' };
    NX.lsSet('nythedit_t2v', prov);
    paintProv();
    NX.toast('Provider settings saved');
  });
  paintProv();

  /* generate */
  var genBtn = $('genBtn');
  function hint(msg) {
    var h = $('genHint');
    h.style.display = 'flex'; h.innerHTML = '';
    var s = document.createElement('span'); s.textContent = msg; h.appendChild(s);
  }
  genBtn.addEventListener('click', function () {
    if (genMode === 'img') genImage(); else genVideo();
  });
  function genImage() {
    var prompt = $('genDesc').value.trim();
    if (!prompt) return NX.toast('Describe the image first');
    genBtn.disabled = true; $('genLabel').textContent = 'Generating…';
    hint('Contacting image service…');
    var seed = Math.floor(Math.random() * 999999);
    var dims = aspect === '9:16' ? [768, 1344] : aspect === '1:1' ? [1024, 1024] : aspect === '4:5' ? [880, 1100] : [1344, 768];
    var url = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt) +
      '?width=' + dims[0] + '&height=' + dims[1] + '&nologo=true&seed=' + seed;
    fetch(url).then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.blob(); })
      .then(function (blob) {
        processFile(new File([blob], 'ai-image-' + Date.now() + '.jpg', { type: 'image/jpeg' }));
        hint('Image added to your media library.');
        NX.toast('Image generated and added to library');
      })
      .catch(function () { hint('Image generation failed — check your connection and try again.'); NX.toast('Image generation failed'); })
      .then(function () { genBtn.disabled = false; $('genLabel').textContent = 'Generate image'; });
  }
  function genVideo() {
    var prompt = $('genDesc').value.trim();
    if (!prompt) return NX.toast('Describe the video first');
    if (!prov.url || !prov.key) {
      $('provBox').open = true;
      return NX.toast('Add your provider endpoint + API key first');
    }
    genBtn.disabled = true; $('genLabel').textContent = 'Generating…';
    hint('Sending to provider…');
    fetch(prov.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + prov.key },
      body: JSON.stringify({ prompt: prompt, model: $('provModel').value || prov.model, aspect_ratio: aspect, duration_seconds: genSecs })
    })
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function (j) {
        var vu = j.video_url || j.url || j.output || (j.data && j.data.video_url);
        if (!vu) throw new Error('no video_url in response');
        return fetch(vu).then(function (r2) { if (!r2.ok) throw new Error('download failed'); return r2.blob(); });
      })
      .then(function (blob) {
        processFile(new File([blob], 'ai-video-' + Date.now() + '.mp4', { type: blob.type || 'video/mp4' }));
        hint('Video added to your media library.');
        NX.toast('Video generated and added to library');
      })
      .catch(function (err) { hint('Generation failed: ' + err.message); NX.toast('Video generation failed'); })
      .then(function () { genBtn.disabled = false; $('genLabel').textContent = 'Generate video'; });
  }

  /* assistant commands (real) */
  var asstLog = $('asstLog');
  function asstSay(who, text) {
    var d = document.createElement('div');
    d.className = 'asst-msg' + (who === 'me' ? ' me' : who === 'sys' ? ' sys' : '');
    d.textContent = text;
    asstLog.appendChild(d);
    asstLog.scrollTop = asstLog.scrollHeight;
  }
  asstSay('sys', 'I can control the editor. Try "help".');
  $('asstForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var inp = $('asstInput'), raw = inp.value.trim();
    if (!raw) return;
    asstSay('me', raw); inp.value = '';
    var cmd = raw.toLowerCase();
    if (cmd === 'help') asstSay('ai', 'Commands: play, pause, split, export, add caption <text>, mute, unmute, status, clear');
    else if (cmd === 'play') { setPlaying(true); asstSay('ai', 'Playing.'); }
    else if (cmd === 'pause') { setPlaying(false); asstSay('ai', 'Paused.'); }
    else if (cmd === 'split') { splitAtPlayhead(); asstSay('ai', 'Split attempted at ' + fmt(t) + '.'); }
    else if (cmd === 'export') { openExport(); asstSay('ai', 'Export dialog opened.'); }
    else if (cmd === 'mute') { laneState.audio.muted = true; buildLanes(); asstSay('ai', 'Audio track muted.'); }
    else if (cmd === 'unmute') { laneState.audio.muted = false; buildLanes(); asstSay('ai', 'Audio track unmuted.'); }
    else if (cmd === 'clear') { asstLog.innerHTML = ''; }
    else if (cmd === 'status') {
      var n = 0; LANES.forEach(function (L) { n += project.lanes[L.id].length; });
      asstSay('ai', n + ' clips on the timeline, ' + media.size + ' media files, duration ' + fmt(DUR) + '.');
    }
    else if (cmd.indexOf('add caption ') === 0) {
      var txt = raw.slice(12).trim() || 'New caption';
      addCaption(txt, t, 3);
      asstSay('ai', 'Caption added at ' + fmt(t) + '.');
    }
    else asstSay('ai', 'I did not understand that. Try "help".');
  });

  /* ================= export (real) ================= */
  var modal = $('exportModal');
  document.querySelectorAll('#expRow .exp-opt').forEach(function (o) {
    o.addEventListener('click', function () {
      document.querySelectorAll('#expRow .exp-opt').forEach(function (x) { x.classList.remove('on'); });
      o.classList.add('on');
    });
  });
  function openExport() {
    if (!project.lanes.video.length && !project.lanes.audio.length) {
      NX.toast('Timeline is empty — import media first');
      return;
    }
    setPlaying(false);
    modal.classList.add('show');
    $('expBar').style.display = 'none'; $('expFill').style.width = '0';
    $('expStatus').textContent = '';
  }
  $('exportBtn').addEventListener('click', openExport);
  $('expCancel').addEventListener('click', function () { modal.classList.remove('show'); });
  modal.addEventListener('click', function (e) { if (e.target === modal) modal.classList.remove('show'); });
  $('expStart').addEventListener('click', function () {
    modal.classList.remove('show');
    doExport();
  });

  function doExport() {
    var q = document.querySelector('#expRow .exp-opt.on').textContent.trim();
    var W = q === '1080p' ? 1920 : 1280, H = q === '1080p' ? 1080 : 720;
    var ow = canvas.width, oh = canvas.height;
    canvas.width = W; canvas.height = H;
    var stream;
    try { stream = canvas.captureStream(30); }
    catch (e) { canvas.width = ow; canvas.height = oh; NX.toast('Export not supported in this browser'); return; }
    var a = ensureAC();
    var tracks = stream.getVideoTracks().slice();
    exportGains = [];
    if (a) {
      try {
        exportDest = a.createMediaStreamDestination();
        vidPool.forEach(function (el) { var g = ensureGraph(el); if (g) { g.gain.connect(exportDest); exportGains.push(g); } });
        audPool.forEach(function (el) { var g = ensureGraph(el); if (g) { g.gain.connect(exportDest); exportGains.push(g); } });
        tracks = tracks.concat(exportDest.stream.getAudioTracks());
      } catch (e) {}
    }
    var mime = ['video/webm;codecs=vp9,opus', 'video/webm', 'video/mp4'].filter(function (m) {
      try { return window.MediaRecorder && MediaRecorder.isTypeSupported(m); } catch (e) { return false; }
    })[0];
    if (!mime) { canvas.width = ow; canvas.height = oh; NX.toast('Export not supported in this browser'); return; }
    recChunks = [];
    try { recorder = new MediaRecorder(new MediaStream(tracks), { mimeType: mime, videoBitsPerSecond: 8000000 }); }
    catch (e) { canvas.width = ow; canvas.height = oh; NX.toast('Could not start export'); return; }
    recorder.ondataavailable = function (e) { if (e.data && e.data.size) recChunks.push(e.data); };
    recorder.onstop = function () {
      exportGains.forEach(function (g) { try { g.gain.disconnect(exportDest); } catch (e) {} });
      exportGains = []; exportDest = null;
      canvas.width = ow; canvas.height = oh;
      render(t);
      var isMp4 = mime.indexOf('mp4') === 0;
      var blob = new Blob(recChunks, { type: isMp4 ? 'video/mp4' : 'video/webm' });
      var aEl = document.createElement('a');
      aEl.href = URL.createObjectURL(blob);
      aEl.download = (project.name || 'nythedit').replace(/[^\w\-]+/g, '-').toLowerCase() + '-export.' + (isMp4 ? 'mp4' : 'webm');
      document.body.appendChild(aEl); aEl.click();
      setTimeout(function () { URL.revokeObjectURL(aEl.href); aEl.remove(); }, 4000);
      NX.toast('Export downloaded');
    };
    $('expBar').style.display = 'block';
    exporting = true;
    seek(0);
    try { recorder.start(250); } catch (e) { exporting = false; canvas.width = ow; canvas.height = oh; NX.toast('Could not start export'); return; }
    setPlaying(true);
    NX.toast('Rendering timeline…');
  }
  function finishExport() {
    setPlaying(false);
    exporting = false;
    try { recorder.stop(); } catch (e) {}
  }

  /* ================= header ================= */
  $('backBtn').addEventListener('click', function () { saveNow(); location.href = 'projects.html'; });
  $('renameBtn').addEventListener('click', function () {
    var n = prompt('Rename project', project.name);
    if (n && n.trim()) { project.name = n.trim(); $('projName').textContent = project.name; saveNow(); }
  });
  $('shareBtn').addEventListener('click', function () {
    var link = location.origin + location.pathname + '?project=' + project.id;
    function done() { NX.toast('Share link copied to clipboard'); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).then(done, done);
    else done();
  });

  /* toolbar buttons */
  $('splitBtn').addEventListener('click', splitAtPlayhead);
  $('delBtn').addEventListener('click', deleteSelection);
  $('dupBtn').addEventListener('click', duplicateSelection);
  $('undoBtn').addEventListener('click', doUndo);
  $('redoBtn').addEventListener('click', doRedo);
  $('magnetBtn').addEventListener('click', function () {
    magnetOn = !magnetOn; $('magnetBtn').classList.toggle('on', magnetOn);
    NX.toast(magnetOn ? 'Snapping on' : 'Snapping off');
  });
  document.querySelectorAll('#tlTools .tool-btn').forEach(function (b) {
    if (!b.id) b.addEventListener('click', function () { NX.toast((b.title || 'Tool') + ' is not available yet'); });
  });

  /* ================= init ================= */
  function init() {
    $('playBtn').innerHTML = SVG.play;
    var id = params.get('project');
    if (!id) { id = NX.uid(); history.replaceState(null, '', 'editor.html?project=' + id); }
    project = loadProjectData(id);
    $('projName').textContent = project.name || 'Untitled project';
    document.title = (project.name || 'Untitled project') + ' — NythEdit';
    restoreMedia(project.media).then(function () {
      renderMedia();
      recomputeDUR(); buildRuler(); buildLanes(); render(0); updateTimeUI();
      saveNow();
    });
  }
  window.addEventListener('resize', function () { recomputeDUR(); buildRuler(); });
  init();
})();
