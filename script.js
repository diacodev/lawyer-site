// script.js – Luxury Persian Lawyer Interactions

(() => {
  'use strict';

  // ---------- PRELOADER ----------
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    if (preloader) {
      preloader.classList.add('hidden');
    }
  });

  // ---------- SCROLL PROGRESS ----------
  const progressBar = document.getElementById('scrollProgress');
  window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + '%';
  });

  // ---------- REVEAL ON SCROLL (Intersection Observer) ----------
  const revealElements = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // optional: keep visible; no need to unobserve if we want them to stay
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

  revealElements.forEach(el => observer.observe(el));

  // ---------- BACK TO TOP BUTTON ----------
  const backBtn = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 600) {
      backBtn.classList.add('visible');
    } else {
      backBtn.classList.remove('visible');
    }
  });

  backBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---------- STICKY NAVBAR (glass remains, no extra change needed) ----------
  // optional: reduce transparency on scroll
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(15, 6, 27, 0.5)';
      navbar.style.backdropFilter = 'blur(20px)';
    } else {
      navbar.style.background = 'rgba(15, 6, 27, 0.2)';
      navbar.style.backdropFilter = 'blur(16px)';
    }
  });

  // ---------- FLOATING CALL BUTTON smooth appearance (already there) ----------

  // ---------- FUTURE EDITING: all texts are in HTML; change phone or name in <span> or <p> -----
  // for convenience, phone number can be updated in one place (tel: link and visible texts)
  // current phone: ۰۹۱۲۴۲۶۳۵۸۷ appears in hero CTA, cta banner, contact, and floating call.
  // to change, edit href="tel:..." and visible digits.
  // Name appears in hero, navbar, footer, about.

})();