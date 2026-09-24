/* ═══════════════════════════════════════
   3D Cinematic — Interactions
   ═══════════════════════════════════════ */
(() => {
'use strict';

const $  = (s,c=document) => c.querySelector(s);
const $$ = (s,c=document) => [...c.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine   = matchMedia('(pointer: fine)').matches;

/* ─── 1. LOADER ─── */
window.addEventListener('load', () => {
  setTimeout(() => $('#loader')?.classList.add('done'), 700);
});

/* ─── 2. PARTICLE CANVAS ─── */
(() => {
  const canvas = $('#particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const COUNT = window.innerWidth < 768 ? 40 : 90;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function init() {
    particles = [];
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - .5) * 0.3,
        vy: (Math.random() - .5) * 0.3,
        r: Math.random() * 1.6 + 0.4,
        a: Math.random() * 0.4 + 0.15
      });
    }
  }

  const mouse = { x: -9999, y: -9999 };
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // draw connections
    ctx.strokeStyle = 'rgba(212,175,55,0.06)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 18000) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // draw particles
    particles.forEach(p => {
      // mouse attraction
      if (fine) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const d = Math.hypot(dx, dy);
        if (d < 180) {
          p.vx += dx * 0.00015;
          p.vy += dy * 0.00015;
        }
      }

      p.x += p.vx;
      p.y += p.vy;

      // damping
      p.vx *= 0.995;
      p.vy *= 0.995;

      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      grad.addColorStop(0, `rgba(212,175,55,${p.a})`);
      grad.addColorStop(1, 'rgba(212,175,55,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(247,233,184,${p.a})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  resize();
  init();
  draw();
  window.addEventListener('resize', () => { resize(); init(); });
})();

/* ─── 3. NAV SCROLL ─── */
(() => {
  const nav = $('#nav');
  const prog = $('#scrollProgress');
  const topBtn = $('#toTop');
  const onScroll = () => {
    const y = window.scrollY;
    nav?.classList.toggle('on', y > 40);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (prog) prog.style.width = (y / h * 100) + '%';
    topBtn?.classList.toggle('show', y > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  topBtn?.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ─── 4. MOBILE MENU ─── */
(() => {
  const btn = $('#burger');
  const menu = $('#mMenu');
  btn?.addEventListener('click', () => {
    btn.classList.toggle('open');
    menu?.classList.toggle('open');
    document.body.style.overflow =
      menu?.classList.contains('open') ? 'hidden' : '';
  });
  $$('.m-menu a').forEach(a => a.addEventListener('click', () => {
    btn?.classList.remove('open');
    menu?.classList.remove('open');
    document.body.style.overflow = '';
  }));
})();

/* ─── 5. 3D TILT CARDS ─── */
(() => {
  if (!fine || reduce) return;
  const MAX = 12;

  $$('.tilt-wrap').forEach(wrap => {
    const card = wrap.querySelector('.tilt-card, .creds-box, .cta-banner');
    if (!card) return;
    let raf;

    wrap.addEventListener('mousemove', e => {
      const r = wrap.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top)  / r.height;

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rx = (py - 0.5) * -MAX * 2;
        const ry = (px - 0.5) *  MAX * 2;

        card.style.transform =
          `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(8px)`;

        card.style.setProperty('--mx', (px * 100) + '%');
        card.style.setProperty('--my', (py * 100) + '%');
      });
    });

    wrap.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);
      card.style.transform = '';
    });
  });
})();

/* ─── 6. HERO SCALES PARALLAX ─── */
(() => {
  if (!fine || reduce) return;
  const scales = $('#scales');
  const heroTitle = $('#heroTitle');
  if (!scales) return;

  let raf;
  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      scales.style.transform =
        `rotateY(${dx * 12}deg) rotateX(${-dy * 8}deg) translateZ(0)`;
      if (heroTitle) {
        heroTitle.style.transform =
          `translate(${dx * -8}px, ${dy * -6}px)`;
      }
    });
  });
})();

/* ─── 7. SMOOTH ANCHORS ─── */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#' || id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ─── 8. SECTION REVEAL ─── */
(() => {
  if (reduce) return;
  const els = $$('.sec-head, .about-card, .svc, .tile, .creds-box, .cta-banner');
  els.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(40px)';
    el.style.transition = 'opacity .9s cubic-bezier(.2,.9,.2,1), transform .9s cubic-bezier(.2,.9,.2,1)';
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 60);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  els.forEach(el => io.observe(el));
})();

})();