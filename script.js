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

// 6. Ambient Rising Bubble Field — a tasteful, low-cost canvas animation for the ocean/shark theme
(function initBubbleField() {
    const canvas = document.getElementById('bubble-field');
    if (!canvas || prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    let width, height, bubbles, rafId;
    let isVisible = true;

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

    function draw() {
        ctx.clearRect(0, 0, width, height);
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

const shimmerElement = document.querySelector('.shimmer-word');

if (shimmerElement) {
  // Speed up and brighten on hover
  shimmerElement.addEventListener('mouseenter', () => {
    shimmerElement.style.animationDuration = '1s';
    shimmerElement.style.filter = 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.6))';
  });

  // Return to elegant ambient speed when leaving
  shimmerElement.addEventListener('mouseleave', () => {
    shimmerElement.style.animationDuration = '3.5s';
    shimmerElement.style.filter = 'none';
  });
}

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

// 10. Live Search/Filter for the Suite Grid
(function initSuiteSearch() {
    const input = document.getElementById('suite-search');
    const emptyState = document.getElementById('suite-empty-state');
    const suiteCards = Array.from(document.querySelectorAll('.suite-grid .card'));
    if (!input) return;

    input.addEventListener('input', () => {
        const query = input.value.trim().toLowerCase();
        let visibleCount = 0;

        suiteCards.forEach((card) => {
            const name = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const desc = card.querySelector('p')?.textContent.toLowerCase() || '';
            const matches = !query || name.includes(query) || desc.includes(query);
            card.classList.toggle('filtered-out', !matches);
            if (matches) visibleCount += 1;
        });

        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
        }
    });
})();

// 11. Optional Ambient Background Audio (YouTube IFrame API), muted by default
(function initAmbientAudio() {
    const toggle = document.getElementById('audio-toggle');
    const icon = toggle ? toggle.querySelector('.audio-icon') : null;
    if (!toggle) return;

    const STORAGE_KEY = 'webshark-audio-unmuted';
    let player = null;
    let playerReady = false;
    let wantsUnmuted = localStorage.getItem(STORAGE_KEY) === 'true';

    function setToggleState(unmuted) {
        toggle.setAttribute('aria-pressed', String(unmuted));
        toggle.title = unmuted ? 'Ambient audio: playing (click to mute)' : 'Ambient audio: muted (click to play)';
        if (icon) icon.textContent = unmuted ? '🔊' : '🔇';
    }

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
                    if (wantsUnmuted) {
                        player.unMute();
                        player.playVideo();
                        setToggleState(true);
                    }
                }
            }
        });
    };

    toggle.addEventListener('click', () => {
        if (!playerReady || !player) return;
        wantsUnmuted = !wantsUnmuted;
        localStorage.setItem(STORAGE_KEY, String(wantsUnmuted));

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