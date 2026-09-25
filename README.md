# NythEdit — Video Editor Website (front-end demo)

A complete multi-page video editor website with separate HTML / CSS / JS files.
All auth, rendering and AI generation are **front-end demos** (localStorage + timers) —
plug in your real backend where marked in the code.

## Pages & flow

```
index.html     →  landing page, "Continue" goes to login
login.html     →  login / signup (demo: any valid email + 6-char password works)
projects.html  →  project grid, search, filters, "New Project"
editor.html    →  the editor (like the reference screenshot)
```

Login is required for `projects.html` and `editor.html` (guard in `js/main.js`).
Add `?demo=1` to preview the editor without logging in.

## Files

| File | What it is |
|---|---|
| `index.html` | Landing page |
| `login.html` | Login / signup |
| `projects.html` | Projects dashboard |
| `editor.html` | Video editor UI |
| `css/main.css` | Shared styles (landing, auth, projects) |
| `css/editor.css` | Editor-only styles |
| `js/main.js` | Toast, nav, demo auth, route guard |
| `js/editor.js` | Media tabs, AI panel, timeline, playback, export |

## Run it

No build step. Serve the folder (needed for clean relative paths in some browsers):

```bash
cd videoeditor
python3 -m http.server 8000
# open http://localhost:8000
```

Or just double-click `index.html` — everything works from `file://` too.

## Editor features (demo)

- Media / Text / Effects / Transitions tabs with search
- Assistant / Text-to-Video / Image side panel (model picker, ratio pills, credits, fake Generate)
- Multi-track timeline: effects, captions, 2 video tracks, audio waveform
- Click ruler to scrub, Space to play/pause, zoom slider + zoom-to-fit
- Live caption preview synced to the playhead
- Export modal with resolution picker and fake render progress
- Rename project, "last saved" indicator

## Make it yours

- Brand name: search for `NythEdit` in all files
- Colors: `:root` variables at the top of `css/main.css`
- Real backend: replace the `setTimeout` demos in `js/main.js` (login) and
  `js/editor.js` (generate, export) with your API calls
- Thumbnails: swap the CSS gradients for real `<img>`/`<video>` tags
