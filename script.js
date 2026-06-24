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