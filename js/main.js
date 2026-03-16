/* ============================================================
   INDIBIOTEK — Main JavaScript  v2.0
   ============================================================ */

'use strict';

// ─── Page progress bar ──────────────────────────────────────
(function () {
  const bar = document.createElement('div');
  bar.style.cssText = 'position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg,#00C9A7,#0066FF);z-index:9999;width:0;transition:width 0.15s ease;pointer-events:none';
  document.body.prepend(bar);

  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
    bar.style.width = pct + '%';
  }, { passive: true });
})();


// ─── Particle canvas ────────────────────────────────────────
(function () {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx    = canvas.getContext('2d');
  let particles = [];
  let animId;

  const CFG = {
    count:     window.innerWidth < 768 ? 40 : 72,
    maxDist:   140,
    speed:     0.4,
    radius:    2,
    color:     '0, 201, 167',
    lineAlpha: 0.13,
  };

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function mkParticle() {
    return {
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * CFG.speed * 2,
      vy: (Math.random() - 0.5) * CFG.speed * 2,
      r:  Math.random() * CFG.radius + 1,
      a:  Math.random() * 0.35 + 0.15,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: CFG.count }, mkParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      for (let j = i + 1; j < particles.length; j++) {
        const q  = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const d  = Math.sqrt(dx * dx + dy * dy);

        if (d < CFG.maxDist) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${CFG.color},${(1 - d / CFG.maxDist) * CFG.lineAlpha})`;
          ctx.lineWidth = 0.75;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CFG.color},${p.a})`;
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    }

    animId = requestAnimationFrame(draw);
  }

  window.addEventListener('DOMContentLoaded', () => {
    init();
    draw();
    new ResizeObserver(() => { cancelAnimationFrame(animId); init(); draw(); }).observe(canvas);
  });
})();


// ─── Sticky navbar ──────────────────────────────────────────
(function () {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 50), { passive: true });
})();


// ─── Mobile menu ────────────────────────────────────────────
(function () {
  const btn    = document.querySelector('.nav-hamburger');
  const drawer = document.querySelector('.nav-drawer');
  if (!btn || !drawer) return;

  function close() {
    btn.classList.remove('open');
    drawer.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    drawer.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
})();


// ─── Scroll reveal (IntersectionObserver) ───────────────────
(function () {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -48px 0px' });

  document.querySelectorAll('.reveal, .reveal-stagger, .section-underline').forEach(el => obs.observe(el));
})();


// ─── Active nav link on scroll ──────────────────────────────
(function () {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !links.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const a = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (a) a.classList.add('active');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => obs.observe(s));
})();


// ─── Animated counters ──────────────────────────────────────
(function () {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;

  function run(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const target   = parseInt(el.dataset.count, 10);
    const suffix   = el.dataset.suffix || '';
    const duration = 1800;
    const start    = performance.now();

    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      // easeOutExpo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      el.textContent = Math.round(eased * target) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) run(e.target); });
  }, { threshold: 0.6 });

  els.forEach(el => obs.observe(el));
})();


// ─── Smooth scroll with nav offset ──────────────────────────
(function () {
  const H = 72;
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - H;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


// ─── Contact form ────────────────────────────────────────────
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn   = form.querySelector('button[type="submit"]');
    const orig  = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Sent Successfully!';
    btn.disabled  = true;

    setTimeout(() => {
      btn.innerHTML = orig;
      btn.disabled  = false;
      form.reset();
    }, 4000);
  });
})();


// ─── DNA helix — trigger draw after load ─────────────────────
// (Handled entirely by CSS animation on .dna-strand-1 / .dna-strand-2)
// No JS needed — CSS stroke-dashoffset animation handles the draw-in.
