/* ============================================
   LOADER  (only present on index.html)
   ============================================ */
const loaderSteps = [
  { text: 'N',                    sub: 'Initializing...'  },
  { text: 'NB',                   sub: 'Loading Assets...' },
  { text: 'NBN',                  sub: 'Building UI...'    },
  { text: 'Newton',               sub: 'Almost Ready...'   },
  { text: 'Newton Brian',         sub: 'Finalizing...'     },
  { text: 'Newton Brian Nyongesa',sub: 'Welcome.'          },
];

const loaderEl   = document.getElementById('loader');
const loaderName = document.getElementById('loaderName');
const loaderSub  = document.getElementById('loaderSub');
const loaderProg = document.getElementById('loaderProgress');

if (loaderEl) {
  let stepIdx = 0;
  let progress = 0;

  function advanceLoader() {
    if (stepIdx >= loaderSteps.length) return;
    const step   = loaderSteps[stepIdx];
    const target = Math.round(((stepIdx + 1) / loaderSteps.length) * 100);

    loaderName.style.opacity   = '0';
    loaderName.style.transform = 'translateY(-8px)';

    setTimeout(() => {
      loaderName.textContent     = step.text;
      loaderSub.textContent      = step.sub;
      loaderName.style.transition = 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.23,1,0.32,1)';
      loaderName.style.opacity   = '1';
      loaderName.style.transform = 'translateY(0)';
    }, 180);

    animProgress(progress, target, 300);
    progress = target;
    stepIdx++;
  }

  function animProgress(from, to, dur) {
    const t0 = performance.now();
    function step(now) {
      const t  = Math.min((now - t0) / dur, 1);
      const e  = 1 - Math.pow(1 - t, 3);
      loaderProg.style.width = (from + (to - from) * e) + '%';
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function runLoader() {
    advanceLoader();
    const delays = [300, 350, 400, 500, 600];
    let acc = 0;
    delays.forEach((d, i) => {
      acc += d;
      setTimeout(() => {
        advanceLoader();
        if (i === delays.length - 1) {
          setTimeout(dismissLoader, 600);
        }
      }, acc);
    });
  }

  function dismissLoader() {
    loaderEl.classList.add('fade-out');
    setTimeout(() => { loaderEl.style.display = 'none'; }, 800);
  }

  runLoader();
}

/* ============================================
   NAV — scroll background
   ============================================ */
const navbar = document.getElementById('navbar');
if (navbar) {
  function handleScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ============================================
   NAV — active link for current page
   ============================================ */
(function markActive() {
  const path  = window.location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll('.nav-link, .mobile-link');
  links.forEach(a => {
    const href = (a.getAttribute('href') || '').split('/').pop();
    if (href === path) {
      a.classList.add('active');
    }
  });
})();

/* ============================================
   HAMBURGER MENU
   ============================================ */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
  let menuOpen = false;

  function toggleMenu(forceClose) {
    menuOpen = forceClose ? false : !menuOpen;
    hamburger.classList.toggle('open', menuOpen);
    mobileMenu.classList.toggle('open', menuOpen);
    hamburger.setAttribute('aria-expanded', menuOpen);
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  }

  hamburger.addEventListener('click', () => toggleMenu());

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => toggleMenu(true));
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuOpen) toggleMenu(true);
  });
}

/* ============================================
   SCROLL REVEAL
   ============================================ */
const revealEls = document.querySelectorAll('.reveal');

if (revealEls.length) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const siblings = Array.from(
        entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')
      );
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('visible'), idx * 55);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));
}

/* ============================================
   MAIN FADE-IN (non-loader pages)
   ============================================ */
const mainEl = document.getElementById('main');
if (mainEl) {
  window.addEventListener('load', () => {
    requestAnimationFrame(() => mainEl.classList.add('visible'));
  });
}

/* ============================================
   FOOTER YEAR
   ============================================ */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
