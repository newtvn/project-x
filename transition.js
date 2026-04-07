/**
 * Pixel Disintegration Transition Engine
 * On exit : tiles scatter outward from centre → navigate
 * On entry: tiles assemble from scatter positions → fade out to reveal page
 */
(function () {
  const PX         = 22;      // tile size in px
  const EXIT_MS    = 650;     // exit animation duration
  const ENTRY_MS   = 900;     // entry animation duration
  const TILE_COLOR = '#ffffff';

  let canvas, ctx;
  let W, H, cols, rows;
  let tiles   = [];
  let animId  = null;
  let phase   = null;         // 'exit' | 'entry'
  let t0      = null;         // animation start timestamp
  let destUrl = null;

  /* ─── Bootstrap ─────────────────────────────────────────── */
  function boot() {
    canvas = document.createElement('canvas');
    ctx    = canvas.getContext('2d');

    Object.assign(canvas.style, {
      position : 'fixed',
      top      : '0',
      left     : '0',
      width    : '100%',
      height   : '100%',
      zIndex   : '9998',
      pointerEvents: 'none',
      display  : 'block',
    });

    document.body.appendChild(canvas);
    onResize();
    window.addEventListener('resize', onResize, { passive: true });
    interceptLinks();
    playEntry();
  }

  function onResize() {
    W    = canvas.width  = window.innerWidth;
    H    = canvas.height = window.innerHeight;
    cols = Math.ceil(W / PX) + 1;
    rows = Math.ceil(H / PX) + 1;
  }

  /* ─── Tile generation ────────────────────────────────────── */
  function buildTiles(mode) {
    tiles = [];
    const halfW = W / 2;
    const halfH = H / 2;
    const maxD  = Math.sqrt(halfW * halfW + halfH * halfH);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const gx   = c * PX;                   // grid x
        const gy   = r * PX;                   // grid y
        const dx   = gx + PX / 2 - halfW;
        const dy   = gy + PX / 2 - halfH;
        const ang  = Math.atan2(dy, dx);
        const norm = Math.sqrt(dx * dx + dy * dy) / maxD;  // 0–1

        /* scatter destination — push far beyond viewport */
        const mag = (0.5 + Math.random() * 0.7) * Math.max(W, H) * 1.1;
        const sx  = gx + Math.cos(ang) * mag;
        const sy  = gy + Math.sin(ang) * mag;

        /* stagger: exit → centre tiles move first (norm ≈ 0 → low delay)
                    entry → all start together, different scatter origins  */
        const delay = mode === 'exit'
          ? norm * 0.40 + Math.random() * 0.08
          : Math.random() * 0.15;

        tiles.push({ gx, gy, sx, sy, delay });
      }
    }
  }

  /* ─── Easing helpers ─────────────────────────────────────── */
  function easeIn3(t)  { return t * t * t; }
  function easeOut3(t) { return 1 - Math.pow(1 - t, 3); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ─── Draw one frame ─────────────────────────────────────── */
  function draw(globalProg) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = TILE_COLOR;

    for (const t of tiles) {
      /* local progress per tile, clamped [0,1] */
      const window  = phase === 'exit' ? 0.60 : 0.65;
      const local   = Math.max(0, Math.min(1, (globalProg - t.delay) / window));
      if (local === 0) continue;

      let x, y, alpha;

      if (phase === 'exit') {
        /* grid → scatter, fade out */
        const e = easeIn3(local);
        x     = lerp(t.gx, t.sx, e);
        y     = lerp(t.gy, t.sy, e);
        alpha = 1 - easeIn3(local) * 0.95;
      } else {
        /* entry: scatter → grid (first 65%) then fade out (last 35%) */
        if (local < 0.65) {
          const e = easeOut3(local / 0.65);
          x     = lerp(t.sx, t.gx, e);
          y     = lerp(t.sy, t.gy, e);
          alpha = local / 0.65;
        } else {
          x     = t.gx;
          y     = t.gy;
          alpha = 1 - ((local - 0.65) / 0.35);
        }
      }

      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillRect(x, y, PX - 1, PX - 1);
    }

    ctx.globalAlpha = 1;
  }

  /* ─── RAF loop ───────────────────────────────────────────── */
  function loop(ts) {
    if (!t0) t0 = ts;
    const dur  = phase === 'exit' ? EXIT_MS : ENTRY_MS;
    const prog = Math.min((ts - t0) / dur, 1);

    draw(prog);

    if (prog < 1) {
      animId = requestAnimationFrame(loop);
    } else {
      animId = null;
      ctx.clearRect(0, 0, W, H);
      if (phase === 'exit' && destUrl) {
        window.location.href = destUrl;
      }
    }
  }

  /* ─── Public: play exit then navigate ───────────────────── */
  function playExit(url) {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    destUrl = url;
    phase   = 'exit';
    t0      = null;
    buildTiles('exit');
    animId  = requestAnimationFrame(loop);
  }

  /* ─── Public: play entry on page load ───────────────────── */
  function playEntry() {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    phase   = 'entry';
    t0      = null;
    buildTiles('entry');
    animId  = requestAnimationFrame(loop);
  }

  /* ─── Link interception ──────────────────────────────────── */
  function interceptLinks() {
    document.addEventListener('click', function (e) {
      const a = e.target.closest('a[href]');
      if (!a) return;

      const href = a.getAttribute('href');
      if (!href) return;

      /* skip anchors, mailto, tel, external URLs */
      if (
        href.startsWith('#')      ||
        href.startsWith('mailto') ||
        href.startsWith('tel')    ||
        href.startsWith('http')   ||
        href.startsWith('//')
      ) return;

      e.preventDefault();
      playExit(href);
    });
  }

  /* ─── Init ───────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
