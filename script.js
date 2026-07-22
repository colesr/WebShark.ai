// 0. Shared cursor position — used by block 4 (shark cursor) and block 6 (bubble trail).
//    Single mousemove listener so the values are always current; the trail's spawn
//    logic is gated on shark-cursor-mode, so the per-frame cost is one write.
let _lastMouseX = null;
let _lastMouseY = null;
window.addEventListener('mousemove', (e) => {
    _lastMouseX = e.clientX;
    _lastMouseY = e.clientY;
}, { passive: true });

// 1. Dynamic Cursor Light Tracking + Subtle 3D Tilt
const cards = document.querySelectorAll('.card');
const prefersReducedMotionEarly = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        if (!prefersReducedMotionEarly) {
            const centerX = x - rect.width / 2;
            const centerY = y - rect.height / 2;
            const rotateY = (centerX / (rect.width / 2)) * 6;
            const rotateX = -(centerY / (rect.height / 2)) * 6;
            card.style.transform = `translateY(-6px) scale(1.01) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        }
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

// 2. Performance-Optimized Parallax Background on Scroll
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (!scrollTimeout) {
        window.requestAnimationFrame(() => {
            const depth = window.pageYOffset * 0.12;
            document.body.style.setProperty('--scroll-y', `${depth}px`);
            scrollTimeout = null;
        });
        scrollTimeout = true;
    }
}, { passive: true });

// 3. Smooth Intersection Observer for Content Entry
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach((el, index) => {
    el.style.transitionDelay = `${index * 120}ms`;
    revealObserver.observe(el);
});

// 4. Interactive Shark Badge & Custom Cursor State Engines
const badge = document.getElementById('visitor-badge');
const sharkCursor = document.getElementById('custom-shark-cursor');
let isSharkMode = false;

window.addEventListener('mousemove', (e) => {
    if (isSharkMode) {
        sharkCursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
    }
});

badge.addEventListener('click', (e) => {
    e.stopPropagation();
    isSharkMode = !isSharkMode;

    if (isSharkMode) {
        document.body.classList.add('shark-cursor-mode');
        badge.classList.add('shark-active');
        badge.textContent = "Swimming with the sharks is easy now.";
    } else {
        document.body.classList.remove('shark-cursor-mode');
        badge.classList.remove('shark-active');
        badge.textContent = "It takes bytes to do your work...";
    }
});

window.addEventListener('mousedown', () => {
    if (isSharkMode) {
        sharkCursor.textContent = "😬";
    }
});

window.addEventListener('mouseup', () => {
    if (isSharkMode) {
        sharkCursor.textContent = "🦈";
    }
});

// 5. Cursor-Following Ambient Glow (adds a lively, interactive feel to the background)
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
    let glowActivated = false;
    window.addEventListener('mousemove', (e) => {
        if (!glowActivated) {
            document.body.classList.add('glow-active');
            glowActivated = true;
        }
        document.documentElement.style.setProperty('--glow-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--glow-y', `${e.clientY}px`);
    }, { passive: true });
}

// 6. Ambient Rising Bubble Field — a tasteful, low-cost canvas animation for the ocean/shark theme.
//    #1: while in shark-cursor-mode, a small wake of trail particles follows the mouse.
(function initBubbleField() {
    const canvas = document.getElementById('bubble-field');
    if (!canvas || prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    let width, height, bubbles, rafId;
    let isVisible = true;

    // #1 cursor trail state. Spawn is gated on the existing shark-mode class — when the
    // visitor leaves shark mode the array is wiped so stale particles don't keep rendering.
    const TRAIL_MAX = 12;
    let trail = [];
    let lastTrailSpawn = 0;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function createBubbles() {
        const count = Math.min(36, Math.floor((width * height) / 45000));
        bubbles = Array.from({ length: count }, () => spawnBubble(true));
    }

    function spawnBubble(randomY = false) {
        const radius = 2 + Math.random() * 6;
        return {
            x: Math.random() * width,
            y: randomY ? Math.random() * height : height + radius,
            radius,
            speed: 0.3 + Math.random() * 0.9,
            drift: (Math.random() - 0.5) * 0.4,
            wobble: Math.random() * Math.PI * 2,
            opacity: 0.08 + Math.random() * 0.18
        };
    }

    function spawnTrailParticle(x, y) {
        return {
            x,
            y,
            radius: 1 + Math.random() * 2,
            speed: 0.8 + Math.random() * 1.2,   // faster than ambient bubbles
            drift: (Math.random() - 0.5) * 0.3,
            wobble: Math.random() * Math.PI * 2,
            opacity: 0.10 + Math.random() * 0.12,
            age: 0
        };
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        const sharkMode = document.body.classList.contains('shark-cursor-mode');

        // Spawn a trail particle ~every 30ms while shark mode is on. The cap of TRAIL_MAX
        // keeps the wake short — older particles fall off the end as new ones arrive.
        if (sharkMode) {
            const now = performance.now();
            if (now - lastTrailSpawn > 30 && _lastMouseX !== null) {
                trail.push(spawnTrailParticle(_lastMouseX, _lastMouseY));
                if (trail.length > TRAIL_MAX) trail.shift();
                lastTrailSpawn = now;
            }
        } else if (trail.length) {
            // Clean up immediately on exit so we don't render stragglers.
            trail = [];
        }

        // Ambient bubbles first (under the trail).
        bubbles.forEach((b) => {
            b.wobble += 0.01;
            b.y -= b.speed;
            b.x += b.drift + Math.sin(b.wobble) * 0.3;

            if (b.y + b.radius < 0) {
                Object.assign(b, spawnBubble(false));
            }

            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(56, 189, 248, ${b.opacity})`;
            ctx.fillStyle = `rgba(56, 189, 248, ${b.opacity * 0.35})`;
            ctx.lineWidth = 1;
            ctx.fill();
            ctx.stroke();
        });

        // Trail particles on top. They age and fade so the wake dissolves naturally.
        for (let i = trail.length - 1; i >= 0; i--) {
            const t = trail[i];
            t.wobble += 0.015;
            t.y -= t.speed;
            t.x += t.drift + Math.sin(t.wobble) * 0.25;
            t.age += 1;
            const fade = Math.max(0, 1 - t.age / 60); // ~1s lifetime at 60fps
            const alpha = t.opacity * fade;

            ctx.beginPath();
            ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.fillStyle = `rgba(56, 189, 248, ${alpha * 0.5})`;
            ctx.lineWidth = 1;
            ctx.fill();
            ctx.stroke();

            if (t.y + t.radius < 0 || fade <= 0) {
                trail.splice(i, 1);
            }
        }

        if (isVisible) {
            rafId = requestAnimationFrame(draw);
        }
    }

    document.addEventListener('visibilitychange', () => {
        isVisible = document.visibilityState === 'visible';
        if (isVisible) {
            rafId = requestAnimationFrame(draw);
        } else {
            cancelAnimationFrame(rafId);
        }
    });

    window.addEventListener('resize', () => {
        resize();
        createBubbles();
    }, { passive: true });

    resize();
    createBubbles();
    draw();
})();

// Shimmer hover effect — attach to every .shimmer-word on the page
document.querySelectorAll('.shimmer-word').forEach((shimmerElement) => {
  shimmerElement.addEventListener('mouseenter', () => {
    shimmerElement.style.animationDuration = '1s';
    shimmerElement.style.filter = 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.6))';
  });

  shimmerElement.addEventListener('mouseleave', () => {
    shimmerElement.style.animationDuration = '3.5s';
    shimmerElement.style.filter = 'none';
  });
});

// 7. Scroll Progress Bar — fills like a rising water level as the user scrolls
(function initScrollProgress() {
    const bar = document.documentElement;
    function updateProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.setProperty('--scroll-progress', `${progress}%`);
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    updateProgress();
})();

// 8. Scroll Cue — clicking scrolls smoothly to the suite grid, and it hides once scrolled past
(function initScrollCue() {
    const cue = document.getElementById('scroll-cue');
    const suite = document.getElementById('suite');
    if (!cue || !suite) return;

    cue.addEventListener('click', () => {
        suite.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    const cueObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            cue.style.opacity = entry.isIntersecting ? '1' : '0';
            cue.style.pointerEvents = entry.isIntersecting ? 'auto' : 'none';
        });
    }, { threshold: 0.3 });
    cueObserver.observe(document.querySelector('.hero'));
})();

// 9. Back-to-Surface Button — appears once you've scrolled past the hero
(function initBackToTop() {
    const button = document.getElementById('back-to-top');
    if (!button) return;

    window.addEventListener('scroll', () => {
        button.classList.toggle('visible', window.pageYOffset > window.innerHeight * 0.6);
    }, { passive: true });

    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();

// 10. Live Search/Filter for the Suite Grid (with URL state sync)
(function initSuiteSearch() {
    const input = document.getElementById('suite-search');
    const emptyState = document.getElementById('suite-empty-state');
    const chipsContainer = document.getElementById('suite-chips');
    const suiteCards = Array.from(document.querySelectorAll('.suite-grid .card'));
    if (!input) return;

    const chips = chipsContainer
        ? Array.from(chipsContainer.querySelectorAll('.chip'))
        : [];
    let activeTag = 'all';
    let suppressUrlWrite = false; // skip the URL push while we're applying URL state on init

    // URL state — kept inline here; will be promoted to features/urlstate.js when #15 ships.
    function buildURL(query, tag) {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (tag && tag !== 'all') params.set('tag', tag);
        const qs = params.toString();
        return qs ? `${location.pathname}?${qs}` : location.pathname;
    }

    function readURLState() {
        const params = new URLSearchParams(location.search);
        return {
            query: params.get('q') || '',
            tag: params.get('tag') || 'all'
        };
    }

    function writeURL() {
        const query = input.value.trim();
        const url = buildURL(query, activeTag);
        // replaceState avoids polluting the browser history on every keystroke.
        if (url !== location.pathname + location.search) {
            history.replaceState(null, '', url);
        }
    }

    function applyFilters() {
        const query = input.value.trim().toLowerCase();
        let visibleCount = 0;

        suiteCards.forEach((card) => {
            const name = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const desc = card.querySelector('p')?.textContent.toLowerCase() || '';
            const tags = (card.dataset.tags || '').toLowerCase();
            const matchesQuery = !query || name.includes(query) || desc.includes(query) || tags.includes(query);
            const matchesTag = activeTag === 'all' || tags.split(/\s+/).includes(activeTag);
            const visible = matchesQuery && matchesTag;
            card.classList.toggle('filtered-out', !visible);
            if (visible) visibleCount += 1;
        });

        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
        }
    }

    function syncChipsToTag(tag) {
        chips.forEach((c) => {
            const isActive = c.dataset.tag === tag;
            c.classList.toggle('is-active', isActive);
            c.setAttribute('aria-pressed', String(isActive));
        });
    }

    // Apply URL state on init, before the first filter pass.
    {
        const initial = readURLState();
        if (initial.query) input.value = initial.query;
        if (initial.tag && initial.tag !== 'all') {
            activeTag = initial.tag;
            syncChipsToTag(initial.tag);
        }
        suppressUrlWrite = true;
        applyFilters();
        suppressUrlWrite = false;
    }

    input.addEventListener('input', () => {
        applyFilters();
        if (!suppressUrlWrite) writeURL();
    });

    if (chipsContainer) {
        chipsContainer.addEventListener('click', (e) => {
            const chip = e.target.closest('.chip');
            if (!chip || !chipsContainer.contains(chip)) return;
            activeTag = chip.dataset.tag || 'all';
            syncChipsToTag(activeTag);
            applyFilters();
            if (!suppressUrlWrite) writeURL();
        });
    }
})();

// 11. Optional Ambient Background Audio (YouTube IFrame API), muted by default
(function initAmbientAudio() {
    const toggle = document.getElementById('audio-toggle');
    const icon = toggle ? toggle.querySelector('.audio-icon') : null;
    if (!toggle) return;

    const STORAGE_KEY = 'webshark-audio-unmuted';
    let player = null;
    let playerReady = false;
    // On by default — only stays muted if the visitor explicitly muted it before.
    let wantsUnmuted = localStorage.getItem(STORAGE_KEY) !== 'false';
    let autoplayEngaged = false;

    function setToggleState(unmuted) {
        toggle.setAttribute('aria-pressed', String(unmuted));
        toggle.title = unmuted ? 'Ambient audio: playing (click to mute)' : 'Ambient audio: muted (click to play)';
        if (icon) icon.textContent = unmuted ? '🔊' : '🔇';
    }

    const engageEvents = ['click', 'keydown', 'touchstart', 'scroll'];

    function stopListeningForEngagement() {
        engageEvents.forEach((evt) => document.removeEventListener(evt, tryEngageAutoplay));
    }

    function tryEngageAutoplay() {
        // Not ready yet, or nothing to do — leave the listeners in place to retry
        // on the next interaction rather than giving up after the first attempt.
        if (autoplayEngaged || !wantsUnmuted || !player || !playerReady) return;

        player.unMute();
        player.playVideo();
        autoplayEngaged = true;
        setToggleState(true);
        stopListeningForEngagement();
    }

    // Most browsers refuse unmuted autoplay until the visitor has interacted with
    // the page at all, so the player always starts muted (which is always allowed)
    // and gets unmuted the instant a real interaction happens — making music-on-
    // by-default work in practice as soon as the visitor does anything on the page.
    engageEvents.forEach((evt) => {
        document.addEventListener(evt, tryEngageAutoplay, { passive: true });
    });

    window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady() {
        player = new YT.Player('yt-audio-player', {
            videoId: 'vIDr8ZnCLQw',
            playerVars: {
                autoplay: 1,
                mute: 1,
                loop: 1,
                playlist: 'vIDr8ZnCLQw',
                controls: 0,
                disablekb: 1,
                fs: 0,
                modestbranding: 1
            },
            events: {
                onReady: () => {
                    playerReady = true;
                    player.playVideo();
                    if (wantsUnmuted) {
                        // If the browser already allows unmuted autoplay (e.g. the
                        // visitor has a high media engagement score on this site),
                        // this succeeds immediately; otherwise the interaction
                        // listeners above will unmute on the first gesture.
                        tryEngageAutoplay();
                    }
                }
            }
        });
    };

    toggle.addEventListener('click', () => {
        if (!playerReady || !player) return;
        wantsUnmuted = !wantsUnmuted;
        autoplayEngaged = wantsUnmuted;
        localStorage.setItem(STORAGE_KEY, String(wantsUnmuted));
        // The visitor has now explicitly chosen a state — no need to keep
        // listening for a later interaction to auto-engage playback.
        stopListeningForEngagement();

        if (wantsUnmuted) {
            player.unMute();
            player.playVideo();
        } else {
            player.mute();
        }
        setToggleState(wantsUnmuted);
    });
})();

// 12. Shark Bite Click Feedback on Cards
(function initCardBiteFeedback() {
    if (prefersReducedMotionEarly) return;
    const suiteCards = document.querySelectorAll('.suite-grid .card');

    suiteCards.forEach((card) => {
        card.addEventListener('click', (e) => {
            const href = card.getAttribute('href');
            if (href) {
                e.preventDefault();
            }

            card.classList.add('bite-active');

            const bite = document.createElement('span');
            bite.className = 'bite-mark';
            bite.textContent = '🦈';
            const rect = card.getBoundingClientRect();
            bite.style.left = `${e.clientX - rect.left - 12}px`;
            bite.style.top = `${e.clientY - rect.top - 12}px`;
            card.appendChild(bite);

            if (href) {
                setTimeout(() => {
                    window.open(href, '_self');
                }, 260);
            }
        });
    });
})();

// 13. Shark Swarm Easter Egg — triple-click the badge to send sharks swimming across the screen
(function initSharkSwarmEasterEgg() {
    const swarmContainer = document.getElementById('shark-swarm');
    if (!badge || !swarmContainer || prefersReducedMotionEarly) return;

    let clickTimes = [];

    badge.addEventListener('click', () => {
        const now = Date.now();
        clickTimes = clickTimes.filter((t) => now - t < 900);
        clickTimes.push(now);

        if (clickTimes.length >= 3) {
            clickTimes = [];
            spawnSharkSwarm();
        }
    });

    function spawnSharkSwarm() {
        const count = 6;
        for (let i = 0; i < count; i += 1) {
            const shark = document.createElement('span');
            shark.className = 'swarm-shark';
            shark.textContent = '🦈';
            shark.style.top = `${10 + Math.random() * 70}%`;
            shark.style.left = '-80px';
            const duration = 2.5 + Math.random() * 1.5;
            const delay = i * 120;
            shark.style.animationDuration = `${duration}s`;
            shark.style.animationDelay = `${delay}ms`;
            swarmContainer.appendChild(shark);
            setTimeout(() => shark.remove(), (duration * 1000) + delay + 200);
        }
    }
})();

// 14. Keyboard Shortcuts Overlay — ? toggles, g-then-X sequences for nav, / focuses search.
//     Skips when the visitor is typing in any text input, so the keys keep working normally
//     inside the search box itself.
(function initKeyboardShortcuts() {
    const overlay = document.getElementById('shortcuts-overlay');
    const closeBtn = document.getElementById('shortcuts-close');
    if (!overlay) return;

    const badgeEl = document.getElementById('visitor-badge');
    const audioToggleEl = document.getElementById('audio-toggle');
    const searchEl = document.getElementById('suite-search');

    // Remember the element that had focus before we opened the overlay, so we can
    // return to it on close. Without this, focus drops to <body> and the next Tab
    // starts from the top of the page, which feels broken.
    let returnFocus = null;

    // "g" prefix state: a single 'g' sets pendingG=true; if the next key arrives
    // within 800ms it's consumed as a sequence; otherwise pendingG decays and the
    // next key is treated normally.
    let pendingG = false;
    let pendingGTimer = null;
    const G_WINDOW_MS = 800;

    function openOverlay() {
        returnFocus = document.activeElement;
        overlay.hidden = false;
        // Defer the focus so the [hidden] removal and the focus call don't race.
        requestAnimationFrame(() => {
            const firstKbd = overlay.querySelector('kbd');
            if (firstKbd) firstKbd.focus();
        });
    }

    function closeOverlay() {
        if (overlay.hidden) return;
        overlay.hidden = true;
        if (returnFocus && typeof returnFocus.focus === 'function') {
            returnFocus.focus();
        }
        returnFocus = null;
    }

    function isTypingTarget(t) {
        if (!t) return false;
        const tag = t.tagName;
        return tag === 'INPUT' || tag === 'TEXTAREA' || t.isContentEditable;
    }

    function setPendingG() {
        pendingG = true;
        clearTimeout(pendingGTimer);
        pendingGTimer = setTimeout(() => { pendingG = false; }, G_WINDOW_MS);
    }

    function handleKeydown(e) {
        // Escape closes regardless of focus context, except inside text inputs where
        // the user may be cancelling IME composition. We let it through there too —
        // it's a globally useful key.
        if (e.key === 'Escape') {
            if (!overlay.hidden) {
                e.preventDefault();
                closeOverlay();
                return;
            }
        }

        // Don't steal keys from text inputs. '/' is the only exception: the spec
        // says press / to focus search, and that only makes sense if the user isn't
        // already typing in something — which is exactly when isTypingTarget is false.
        if (isTypingTarget(e.target)) return;

        // '?' is shift+/ on most keyboards. e.key normalises to '?' either way.
        if (e.key === '?') {
            e.preventDefault();
            if (overlay.hidden) openOverlay(); else closeOverlay();
            return;
        }

        if (e.key === '/') {
            if (searchEl) {
                e.preventDefault();
                searchEl.focus();
                searchEl.select();
            }
            return;
        }

        if (e.key === 'm' && badgeEl) {
            e.preventDefault();
            badgeEl.click();
            return;
        }

        if (e.key === 'a' && audioToggleEl) {
            e.preventDefault();
            audioToggleEl.click();
            return;
        }

        if (e.key === 'g') {
            // Don't preventDefault on the first 'g' — it might be a normal keypress
            // that just happens to start a sequence. We only consume the second key.
            setPendingG();
            return;
        }

        if (pendingG) {
            pendingG = false;
            clearTimeout(pendingGTimer);
            if (e.key === 'h') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            if (e.key === 's') {
                e.preventDefault();
                const suite = document.getElementById('suite');
                if (suite) suite.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }
        }
    }

    window.addEventListener('keydown', handleKeydown);

    if (closeBtn) {
        closeBtn.addEventListener('click', closeOverlay);
    }

    // Clicking the backdrop (but not the card itself) closes the overlay too.
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeOverlay();
    });
})();