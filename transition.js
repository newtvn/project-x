/**
 * Pixel Disintegration — LEFT-direction transition
 * Exit : tiles scatter to the LEFT  → navigate
 * Entry: tiles assemble FROM the LEFT → reveal page
 */
(function () {
  const PX       = 22;
  const EXIT_MS  = 680;
  const ENTRY_MS = 950;

  let canvas, ctx;
  let W, H, cols, rows;
  let tiles   = [];
  let animId  = null;
  let phase   = null;
  let t0      = null;
  let destUrl = null;

  /* ─── Bootstrap ─────────────────────────────────────────── */
  function boot() {
    canvas = document.createElement('canvas');
    ctx    = canvas.getContext('2d');
    Object.assign(canvas.style, {
      position: 'fixed', top: '0', left: '0',
      width: '100%', height: '100%',
      zIndex: '9998', pointerEvents: 'none', display: 'block',
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

  /* ─── Tile generation — LEFT scatter ────────────────────── */
  function buildTiles(mode) {
    tiles = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const gx = c * PX;
        const gy = r * PX;

        /* All tiles scatter to / come from the LEFT */
        const dist = (0.55 + Math.random() * 0.75) * W;
        const sx   = gx - dist;
        const sy   = gy + (Math.random() - 0.5) * H * 0.10;

        let delay;
        if (mode === 'exit') {
          /* Right-most tiles leave first → wave travels rightward */
          delay = (1 - c / cols) * 0.38 + Math.random() * 0.07;
        } else {
          /* Left-most tiles arrive first → assembles left → right */
          delay = (c / cols) * 0.32 + Math.random() * 0.07;
        }

        tiles.push({ gx, gy, sx, sy, delay });
      }
    }
  }

  /* ─── Easing ─────────────────────────────────────────────── */
  function easeIn3(t)  { return t * t * t; }
  function easeOut3(t) { return 1 - Math.pow(1 - t, 3); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ─── Draw frame ─────────────────────────────────────────── */
  function draw(gp) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#ffffff';

    for (const t of tiles) {
      const win   = phase === 'exit' ? 0.62 : 0.68;
      const local = Math.max(0, Math.min(1, (gp - t.delay) / win));
      if (local === 0) continue;

      let x, y, alpha;

      if (phase === 'exit') {
        const e = easeIn3(local);
        x     = lerp(t.gx, t.sx, e);
        y     = lerp(t.gy, t.sy, e);
        alpha = 1 - easeIn3(local) * 0.96;
      } else {
        if (local < 0.62) {
          const e = easeOut3(local / 0.62);
          x     = lerp(t.sx, t.gx, e);
          y     = lerp(t.sy, t.gy, e);
          alpha = local / 0.62;
        } else {
          x     = t.gx;
          y     = t.gy;
          alpha = 1 - ((local - 0.62) / 0.38);
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
      if (phase === 'exit' && destUrl) window.location.href = destUrl;
    }
  }

  function playExit(url) {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    destUrl = url; phase = 'exit'; t0 = null;
    buildTiles('exit');
    animId = requestAnimationFrame(loop);
  }

  function playEntry() {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    phase = 'entry'; t0 = null;
    buildTiles('entry');
    animId = requestAnimationFrame(loop);
  }

  /* ─── Link interception ──────────────────────────────────── */
  function interceptLinks() {
    document.addEventListener('click', function (e) {
      const a = e.target.closest('a[href]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href) return;
      if (href.startsWith('#') || href.startsWith('mailto') ||
          href.startsWith('tel') || href.startsWith('http') ||
          href.startsWith('//')) return;
      e.preventDefault();
      playExit(href);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
