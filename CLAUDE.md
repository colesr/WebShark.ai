# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project shape

Static single-page site for the WebShark.ai suite landing page. Three files, no build, no framework, no package manager:

- `index.html` — markup, references `styles.css`, `https://www.youtube.com/iframe_api`, and `script.js`.
- `script.js` — vanilla JS, 13 numbered feature blocks (see below), runs top-to-bottom on load.
- `styles.css` — vanilla CSS, custom properties on `:root`, two `body::before/::after` background layers, plus a fixed `#cursor-glow`, `#bubble-field` canvas, and `#scroll-progress-bar`.

There is no `package.json`, no bundler, no linter, no test framework, and no transpilation. Open `index.html` directly or serve the folder statically (e.g. `python -m http.server 8000`) — that is the entire dev loop.

## Develop / preview

- **Local preview**: any static server pointed at this folder. No build step required.
- **Verify a change**: reload in a browser. Visual/JS changes are all observable in the running page; there is no automated test to run.

## Architecture conventions

### Suite cards are the heart of the page

Each entry in `.suite-grid` is an `<a class="card reveal" data-tags="...">` with:
- `href` to the external tool (GitHub Pages, `pages.dev`, `hf.space`, etc.).
- `data-tags` — **space-separated** keyword list used by the search/filter (must match a chip `data-tag` value or the card is unreachable via chip filter).
- `<div class="card-icon">emoji</div>`, `<h3>title</h3>`, `<p><span class="shimmer-word">description</span></p>`.

Adding/removing a card means also updating the chip set in the same file if a new tag is needed. The card contract is read by `initSuiteSearch` (`script.js`), `initCardBiteFeedback`, and the IntersectionObserver-driven `.reveal` stagger.

### `script.js` is organized as 13 numbered feature blocks

They are sequential, top-level statements (not a single IIFE), and several rely on DOM order — do not reorder without checking. In order:

1. Card 3D tilt + cursor light tracking (reads `prefersReducedMotionEarly`).
2. Scroll-driven `--scroll-y` parallax on `body`.
3. `.reveal` IntersectionObserver (staggered by `transitionDelay`).
4. Shark-cursor mode toggle (bound to the visitor badge; click also triggers the swarm easter egg at the same target).
5. Cursor-following `--glow-x`/`--glow-y` on `document.documentElement` (reads its own `prefersReducedMotion`).
6. `#bubble-field` canvas — rising bubbles, paused on `visibilitychange`.
7. `#scroll-progress-bar` (sets `--scroll-progress` on `document.documentElement`).
8. `#scroll-cue` smooth-scroll to `#suite`; hidden when the hero is out of view.
9. `#back-to-top` shark-fin button.
10. `initSuiteSearch` — text + chip filter (chip set lives at the top of `.suite-grid`).
11. `initAmbientAudio` — YouTube IFrame API, muted-by-default, auto-unmuted on first user gesture.
12. `initCardBiteFeedback` — `🦈` bite mark on click, 260ms delay before navigation.
13. `initSharkSwarmEasterEgg` — triple-click the visitor badge within 900ms to spawn a swarm.

`prefersReducedMotionEarly` is captured once at the top of the file (used by blocks 1, 4, 12, 13) and a second `prefersReducedMotion` is captured later for blocks 5 and 6. Don't merge them — block 5/6 only run when the second one is `false`, and the early one gates the more aggressive animations.

### CSS custom properties written from JS

When touching these, update both sides:
- `--mouse-x`, `--mouse-y` (per-card, written by block 1; consumed by `.card::before` radial gradient).
- `--scroll-y` (on `body`, written by block 2; consumed by `body::before` transform).
- `--glow-x`, `--glow-y` (on `documentElement`, written by block 5; consumed by `#cursor-glow`).
- `--scroll-progress` (on `documentElement`, written by block 7; consumed by `#scroll-progress-bar` width).

### Ambient audio (YouTube IFrame API)

- `window.onYouTubeIframeAPIReady` must stay a **global** — the YouTube API calls it.
- The video ID is hard-coded in `initAmbientAudio` (currently `vIDr8ZnCLQw`); change it there.
- Player is created muted (`mute: 1`) because most browsers block unmuted autoplay. The first user gesture (`click` / `keydown` / `touchstart` / `scroll`) flips to unmuted if the visitor hasn't explicitly muted before.
- The visitor's preference is persisted in `localStorage` under the key `webshark-audio-unmuted` (string `"true"` / `"false"`). The default is unmuted — i.e. music-on unless the visitor has muted it before.

### Motion / accessibility

- The whole file honors `prefers-reduced-motion: reduce` aggressively — bubble field, cursor glow, aurora drift, chevron bounce, card bite, and shark swarm all disable. New animations should follow the same pattern.
- All interactive elements (cards, chips, search, audio toggle, back-to-top) have explicit `:focus-visible` outlines; preserve them when restyling.

### External links

Card hrefs point to subdomains owned by the author (`colesr.github.io`, `webshark-email.pages.dev`, `colesr-insight-engine-docker.hf.space`, etc.). These are not in this repo — they are separate deployments. When updating copy or icons in a card, do not assume the linked app reflects the same description.
