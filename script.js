/* ═══════════════════════════════════════
   EDITORIAL LUXURY — Interactions
   ═══════════════════════════════════════ */

(() => {
  'use strict';

  const $  = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  /* ─── ۱. Cursor ─── */
  const cursor = $('#cursor');
  if (cursor && matchMedia('(pointer: fine)').matches) {
    let mx = innerWidth / 2, my = innerHeight / 2;
    let cx = mx, cy = my;

    addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
    });

    const loop = () => {
      cx += (mx - cx) * 0.2;
      cy += (my - cy) * 0.2;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();

    document.addEventListener('mouseover', (e) => {
      const t = e.target.closest('a, button, .service, .channel, .stat');
      cursor.classList.toggle('big', !!t);
    });
  }

  /* ─── ۲. Progress bar ─── */
  const progress = $('#progress');
  const onScrollProgress = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.width = (scrollY / h * 100) + '%';
  };

  /* ─── ۳. Nav state ─── */
  const nav = $('#nav');
  const onScrollNav = () => {
    if (nav) nav.classList.toggle('on', scrollY > 40);
  };

  /* ─── ۴. Scroll binding ─── */
  addEventListener('scroll', () => {
    onScrollProgress();
    onScrollNav();
  }, { passive: true });
  onScrollProgress();
  onScrollNav();

  /* ─── ۵. Reveal on scroll ─── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });

  $$('.reveal, .about-title').forEach((el) => io.observe(el));

  /* ─── ۶. عدد پروانه — شمارنده ─── */
  const licNum = $('.lic-num');
  if (licNum) {
    const target = 37970;
    const faDigits = '۰۱۲۳۴۵۶۷۸۹';
    const toFa = (n) => String(n).split('').map(d => faDigits[+d]).join('');

    let triggered = false;
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !triggered) {
          triggered = true;
          const dur = 1800;
          const start = performance.now();
          const tick = (now) => {
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 4);
            const val = Math.floor(eased * target);
            licNum.textContent = toFa(val);
            if (p < 1) requestAnimationFrame(tick);
            else licNum.textContent = toFa(target);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.4 });
    io2.observe(licNum);
  }

  /* ─── ۷. Smooth scroll ─── */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      const y = t.getBoundingClientRect().top + scrollY - 60;
      scrollTo({ top: y, behavior: 'smooth' });
    });
  });

})();