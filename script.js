/* ═══════════════════════════════════════════════════════════
   CINEMATIC EDITORIAL — Interactions
   ═══════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── ۱. لودر ─── */
  (() => {
    const loader = $('#loader');
    const bar = $('#loaderBar');
    const pct = $('#loaderPct');
    if (!loader) return;
    let p = 0;
    const step = () => {
      p += Math.random() * 8 + 2;
      if (p > 100) p = 100;
      if (bar) bar.style.width = p + '%';
      if (pct) pct.textContent = Math.floor(p);
      if (p < 100) {
        setTimeout(step, 60 + Math.random() * 80);
      } else {
        setTimeout(() => {
          loader.classList.add('done');
          document.body.classList.remove('loading');
          $$('[data-reveal]').forEach(el => el.classList.add('in'));
        }, 400);
      }
    };
    document.body.classList.add('loading');
    setTimeout(step, 200);
  })();

  /* ─── ۲. ویدیو/کانواس هیرو ─── */
  (() => {
    const video = $('#heroVideo');
    const canvas = $('#heroCanvas');
    const media = $('#heroMedia');
    if (!media) return;

    // بررسی وجود ویدیو
    const videoLoaded = () => {
      if (video && video.readyState >= 2 && video.duration > 0) {
        media.classList.remove('no-video');
      } else {
        media.classList.add('no-video');
        startCanvas();
      }
    };

    if (video) {
      video.addEventListener('loadeddata', () => {
        if (video.duration > 0) {
          media.classList.remove('no-video');
        }
      });
      video.addEventListener('error', () => {
        media.classList.add('no-video');
        startCanvas();
      });
      // بررسی اولیه
      setTimeout(() => {
        if (!video.duration || video.duration === 0) {
          media.classList.add('no-video');
          startCanvas();
        }
      }, 1500);
    } else {
      media.classList.add('no-video');
      startCanvas();
    }

    // کانواس پلیسهولدر (وقتی ویدیو نیست)
    function startCanvas() {
      if (!canvas || reduce) return;
      const ctx = canvas.getContext('2d');
      let W, H;
      const resize = () => {
        W = canvas.width  = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
      };
      resize();
      window.addEventListener('resize', resize);

      const particles = [];
      const COUNT = 60;
      for (let i = 0; i < COUNT; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: Math.random() * 1.4 + 0.4,
          a: Math.random() * 0.3 + 0.1
        });
      }

      const draw = () => {
        ctx.clearRect(0, 0, W, H);
        ctx.strokeStyle = 'rgba(201, 168, 106, 0.05)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 20000) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
          g.addColorStop(0, `rgba(201, 168, 106, ${p.a})`);
          g.addColorStop(1, 'rgba(201, 168, 106, 0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
          ctx.fill();
        });
        requestAnimationFrame(draw);
      };
      draw();
    }
  })();

  /* ─── ۳. کنترل ویدیو/متن با اسکرول ─── */
  (() => {
    const hero = $('#hero');
    const video = $('#heroVideo');
    const lines = $$('.hero-line');
    if (!hero || !lines.length) return;

    let videoReady = false;
    if (video) {
      video.addEventListener('loadedmetadata', () => {
        if (video.duration > 0) videoReady = true;
      });
    }

    const onScroll = () => {
      const rect = hero.getBoundingClientRect();
      const total = rect.height;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / total));

      // کنترل ویدیو
      if (videoReady && video.duration) {
        try {
          video.currentTime = progress * video.duration;
        } catch (e) { /* ignore */ }
      }

      // کنترل متن‌ها
      const idx = Math.min(lines.length - 1, Math.floor(progress * lines.length));
      lines.forEach((l, i) => {
        l.classList.toggle('active', i === idx);
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* ─── ۴. ناوبری ─── */
  (() => {
    const nav = $('#nav');
    const bar = $('#scrollBar');
    const onScroll = () => {
      const y = window.scrollY;
      nav?.classList.toggle('on', y > 40);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.width = (y / h * 100) + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* ─── ۵. منوی موبایل ─── */
  (() => {
    const burger = $('#burger');
    const menu = $('#menu');
    burger?.addEventListener('click', () => {
      burger.classList.toggle('open');
      menu?.classList.toggle('open');
      document.body.style.overflow = menu?.classList.contains('open') ? 'hidden' : '';
    });
    $$('[data-menu]').forEach(a => a.addEventListener('click', () => {
      burger?.classList.remove('open');
      menu?.classList.remove('open');
      document.body.style.overflow = '';
    }));
  })();

  /* ─── ۶. ظاهر شدن با اسکرول ─── */
  (() => {
    if (reduce) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    $$('[data-reveal]').forEach(el => io.observe(el));
  })();

  /* ─── ۷. اسکرول افقی خدمات ─── */
  (() => {
    const el = $('#expScroll');
    if (!el) return;
    let down = false, sx = 0, sl = 0;
    el.addEventListener('mousedown', e => {
      down = true;
      el.classList.add('dragging');
      sx = e.pageX;
      sl = el.scrollLeft;
    });
    window.addEventListener('mouseup', () => {
      down = false;
      el.classList.remove('dragging');
    });
    el.addEventListener('mousemove', e => {
      if (!down) return;
      e.preventDefault();
      el.scrollLeft = sl - (e.pageX - sx) * 1.5;
    });
    el.addEventListener('touchstart', e => {
      down = true;
      sx = e.touches[0].pageX;
      sl = el.scrollLeft;
    }, { passive: true });
    el.addEventListener('touchend', () => { down = false; });
    el.addEventListener('touchmove', e => {
      if (!down) return;
      el.scrollLeft = sl - (e.touches[0].pageX - sx);
    }, { passive: true });
  })();

  /* ─── ۸. اسکرول نرم ─── */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      const top = t.getBoundingClientRect().top + window.scrollY - 60;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

})();