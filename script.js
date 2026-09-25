/* ═══════════════════════════════════════
   VIDEO SCROLL CONTROL
   ═══════════════════════════════════════ */

(() => {
  'use strict';

  const $  = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  const hero = $('#hero');
  const video = $('#video');
  const texts = $$('.text');
  const heroInfo = $('.hero-info');
  const nav = $('#nav');
  const progressBar = $('#progress');

  let videoReady = false;
  let duration = 0;
  let targetTime = 0;
  let currentTime = 0;
  let rafId = null;

  /* ─── آماده‌سازی ویدیو ─── */
  const onReady = () => {
    if (video.duration > 0 && isFinite(video.duration)) {
      duration = video.duration;
      videoReady = true;
      console.log('✅ ویدیو آماده — مدت:', duration.toFixed(2), 'ثانیه');
    }
  };

  if (video) {
    video.addEventListener('loadedmetadata', onReady);
    video.addEventListener('loadeddata', onReady);
    video.addEventListener('canplay', onReady);

    // برای iOS: یک بار play/pause تا seek آزاد بشه
    video.addEventListener('loadeddata', () => {
      const p = video.play();
      if (p && p.then) {
        p.then(() => {
          video.pause();
          video.currentTime = 0;
        }).catch(() => {});
      }
    }, { once: true });

    video.addEventListener('error', () => {
      console.error('❌ خطای ویدیو:', video.error);
    });

    // چک دوره‌ای برای اطمینان
    const check = setInterval(() => {
      if (video.duration > 0 && isFinite(video.duration)) {
        duration = video.duration;
        videoReady = true;
        clearInterval(check);
      }
    }, 300);
  }

  /* ─── به‌روزرسانی نرم زمان ویدیو ─── */
  const updateVideoTime = () => {
    if (!videoReady) {
      rafId = null;
      return;
    }
    const diff = targetTime - currentTime;
    if (Math.abs(diff) > 0.005) {
      currentTime += diff * 0.2; // نرم‌سازی
      try {
        video.currentTime = currentTime;
      } catch (e) {}
      rafId = requestAnimationFrame(updateVideoTime);
    } else {
      rafId = null;
    }
  };

  /* ─── کنترل با اسکرول ─── */
  const onScroll = () => {
    const y = window.scrollY;

    // نوار پیشرفت
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar) progressBar.style.width = (y / docH * 100) + '%';

    // ناوبری
    if (nav) nav.classList.toggle('on', y > 40);

    // کنترل ویدیو
    if (hero && videoReady) {
      const rect = hero.getBoundingClientRect();
      const total = rect.height;
      const scrolled = Math.max(0, Math.min(total, -rect.top));
      const progress = Math.min(1, scrolled / total);

      // هدف زمانی
      targetTime = progress * duration;
      if (!rafId) rafId = requestAnimationFrame(updateVideoTime);

      // کنترل متن‌ها
      const idx = Math.min(texts.length - 1, Math.floor(progress * texts.length));
      texts.forEach((t, i) => {
        t.classList.toggle('active', i === idx);
      });

      // پنهان کردن اطلاعات وقتی از هیرو خارج شدیم
      if (heroInfo) {
        heroInfo.classList.toggle('hide', progress > 0.9);
      }
    }
  };

  /* ─── ظاهر شدن با اسکرول ─── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
      }
    });
  }, { threshold: 0.15 });

  $$('.section h2, .section .lead, .section .label, .card, .contact-card, .contact-tel')
    .forEach((el) => io.observe(el));

  /* ─── اتصال رویدادها ─── */
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  // چک اولیه
  onScroll();
  setTimeout(onScroll, 500);
  setTimeout(onScroll, 1500);

})();