/* ============================================
   LOADER
   ============================================ */
const loaderSteps = [
  { text: 'N', sub: 'Initializing...' },
  { text: 'NB', sub: 'Loading Assets...' },
  { text: 'NBN', sub: 'Building UI...' },
  { text: 'Newton', sub: 'Almost Ready...' },
  { text: 'Newton Brian', sub: 'Finalizing...' },
  { text: 'Newton Brian Nyongesa', sub: 'Welcome.' },
];

const loaderName = document.getElementById('loaderName');
const loaderSub = document.getElementById('loaderSub');
const loaderProgress = document.getElementById('loaderProgress');
const loader = document.getElementById('loader');
const main = document.getElementById('main');

let stepIndex = 0;
let progress = 0;

function advanceLoader() {
  if (stepIndex >= loaderSteps.length) return;

  const step = loaderSteps[stepIndex];
  const targetProgress = Math.round(((stepIndex + 1) / loaderSteps.length) * 100);

  // Morph text with a brief flicker
  loaderName.style.opacity = '0';
  loaderName.style.transform = 'translateY(-8px)';

  setTimeout(() => {
    loaderName.textContent = step.text;
    loaderSub.textContent = step.sub;
    loaderName.style.transition = 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.23,1,0.32,1)';
    loaderName.style.opacity = '1';
    loaderName.style.transform = 'translateY(0)';
  }, 180);

  // Animate progress bar
  animateProgress(progress, targetProgress, 300);
  progress = targetProgress;
  stepIndex++;
}

function animateProgress(from, to, duration) {
  const start = performance.now();
  function update(now) {
    const elapsed = now - start;
    const t = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const current = from + (to - from) * eased;
    loaderProgress.style.width = current + '%';
    if (t < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function runLoader() {
  advanceLoader(); // Step 1 immediately

  const intervals = [300, 350, 400, 500, 600];
  intervals.forEach((delay, i) => {
    setTimeout(() => {
      advanceLoader();
      if (i === intervals.length - 1) {
        // Final step — dismiss loader
        setTimeout(dismissLoader, 600);
      }
    }, intervals.slice(0, i + 1).reduce((a, b) => a + b, 0));
  });
}

function dismissLoader() {
  loader.classList.add('fade-out');
  main.classList.remove('hidden');
  // Tiny delay before showing main so transition is smooth
  setTimeout(() => {
    main.classList.add('visible');
    loader.style.display = 'none';
  }, 800);
}

/* ============================================
   NAVIGATION SCROLL STATE
   ============================================ */
const navbar = document.getElementById('navbar');

function handleNavScroll() {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleNavScroll, { passive: true });

/* ============================================
   HAMBURGER MENU
   ============================================ */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-link');

let menuOpen = false;

function toggleMenu(forceClose = false) {
  menuOpen = forceClose ? false : !menuOpen;

  hamburger.classList.toggle('open', menuOpen);
  mobileMenu.classList.toggle('open', menuOpen);
  hamburger.setAttribute('aria-expanded', menuOpen);

  // Prevent body scroll when menu is open
  document.body.style.overflow = menuOpen ? 'hidden' : '';
}

hamburger.addEventListener('click', () => toggleMenu());

mobileLinks.forEach(link => {
  link.addEventListener('click', () => toggleMenu(true));
});

// Close menu on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menuOpen) toggleMenu(true);
});

/* ============================================
   SCROLL REVEAL (Intersection Observer)
   ============================================ */
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings within same parent
        const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal:not(.visible)'));
        const idx = siblings.indexOf(entry.target);

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, idx * 60);

        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

revealEls.forEach(el => revealObserver.observe(el));

/* ============================================
   SMOOTH SECTION TRANSITIONS (nav active state)
   ============================================ */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${id}`
            ? 'var(--white)'
            : '';
        });
      }
    });
  },
  { threshold: 0.4 }
);

sections.forEach(section => sectionObserver.observe(section));

/* ============================================
   CUSTOM CURSOR (Desktop)
   ============================================ */
const isTouchDevice = () => window.matchMedia('(hover: none)').matches;

if (!isTouchDevice()) {
  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  document.body.appendChild(cursor);

  let mouseX = 0, mouseY = 0;
  let curX = 0, curY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    curX += (mouseX - curX) * 0.18;
    curY += (mouseY - curY) * 0.18;
    cursor.style.left = curX + 'px';
    cursor.style.top = curY + 'px';
    requestAnimationFrame(animateCursor);
  }

  animateCursor();

  // Expand cursor on interactive elements
  const interactiveEls = document.querySelectorAll('a, button, .skill-card, .project-card, .timeline-item');
  interactiveEls.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('expand'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('expand'));
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
  });
}

/* ============================================
   FOOTER YEAR
   ============================================ */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ============================================
   INIT
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  runLoader();
});
