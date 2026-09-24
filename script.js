/* ═══════════════════════════════════════════════
   LUXURY LAWYER — Interactions
   ═══════════════════════════════════════════════ */

(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  /* ─── 1. PRELOADER ─── */
  const preloader   = $('#preloader');
  const preNum      = $('#preloaderNum');
  const preBar      = $('#preloaderBar');

  function runPreloader() {
    let progress = 0;
    const target = 100;
    const step = () => {
      progress += Math.random() * 8 + 2;
      if (progress > target) progress = target;
      if (preNum) preNum.textContent = Math.floor(progress);
      if (preBar) preBar.style.width = progress + '%';
      if (progress < target) {
        setTimeout(step, 60 + Math.random() * 80);
      } else {
        setTimeout(() => {
          preloader?.classList.add('done');
          document.body.style.overflow = '';
          // trigger hero reveal
          $$('.reveal-up').forEach(el => el.classList.add('in'));
        }, 350);
      }
    };
    document.body.style.overflow = 'hidden';
    setTimeout(step, 200);
  }
  window.addEventListener('load', runPreloader);

  /* ─── 2. CUSTOM CURSOR ─── */
  if (isFinePointer && !prefersReducedMotion) {
    const dot  = $('#cursorDot');
    const ring = $('#cursorRing');
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });

    const loop = () => {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();

    // Hover state
    document.addEventListener('mouseover', e => {
      const t = e.target.closest('[data-cursor="hover"], a, button, .service-row');
      if (t) ring.classList.add('hover');
    });
    document.addEventListener('mouseout', e => {
      const t = e.target.closest('[data-cursor="hover"], a, button, .service-row');
      if (t) ring.classList.remove('hover');
    });

    // Hide when leaving window
    document.addEventListener('mouseleave', () => {
      dot.style.opacity = '0'; ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      dot.style.opacity = '1'; ring.style.opacity = '1';
    });
  }

  /* ─── 3. MAGNETIC BUTTONS ─── */
  if (isFinePointer && !prefersReducedMotion) {
    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* ─── 4. NAV SCROLL STATE ─── */
  const nav = $('#nav');
  const onScroll = () => {
    const y = window.scrollY;
    nav?.classList.toggle('scrolled', y > 40);
    $('#scrollProgress').style.width =
      ((y / (document.documentElement.scrollHeight - window.innerHeight)) * 100) + '%';
    $('#backTop')?.classList.toggle('show', y > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ─── 5. MOBILE MENU ─── */
  const toggle = $('#navToggle');
  const mobile = $('#mobileMenu');
  toggle?.addEventListener('click', () => {
    toggle.classList.toggle('open');
    mobile?.classList.toggle('open');
    document.body.style.overflow = mobile?.classList.contains('open') ? 'hidden' : '';
  });
  $$('.mobile-menu a').forEach(a => a.addEventListener('click', () => {
    toggle?.classList.remove('open');
    mobile?.classList.remove('open');
    document.body.style.overflow = '';
  }));

  /* ─── 6. REVEAL ON SCROLL ─── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  $$('.reveal-up').forEach(el => revealObserver.observe(el));

  /* ─── 7. STAT COUNTER ─── */
  const statNums = $$('.stat-num[data-count]');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 1400;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = Math.floor(eased * target);
        // Convert to Persian digits
        el.textContent = val.toLocaleString('fa-IR');
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      statObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  statNums.forEach(el => statObserver.observe(el));

  /* ─── 8. SMOOTH ANCHOR SCROLL ─── */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ─── 9. BACK TO TOP ─── */
  $('#backTop')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ─── 10. SERVICE ROWS — click for mobile ─── */
  if (!isFinePointer) {
    $$('.service-row').forEach(row => {
      row.addEventListener('click', () => {
        const desc = row.querySelector('.service-desc');
        const isOpen = row.classList.toggle('open');
        // handled via CSS for mobile already (desc always visible), so this is just for future
      });
    });
  }

})();