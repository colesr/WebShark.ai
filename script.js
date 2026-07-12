// 1. Dynamic Cursor Light Tracking
const cards = document.querySelectorAll('.card');
cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
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