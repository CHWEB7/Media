/**
 * Summit Digital — static shell with app-ready hooks.
 * Future: swap form handler, add router, auth, client portal.
 */

const STORAGE_KEY = 'summit-theme';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate() {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function applyTheme(theme) {
  const isNight = theme === 'night';
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEY, theme);

  const toggle = $('.theme-toggle');
  if (toggle) {
    toggle.setAttribute('aria-pressed', String(isNight));
    const label = $('.theme-toggle__label', toggle);
    if (label) label.textContent = isNight ? 'Night' : 'Day';
  }
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'night' ? 'day' : 'night';
  applyTheme(next);
}

function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (prefersDark ? 'night' : 'day'));

  $('.theme-toggle')?.addEventListener('click', toggleTheme);
  $('[data-theme-shortcut]')?.addEventListener('click', toggleTheme);
}

function initHero() {
  const greeting = $('[data-greeting]');
  const date = $('[data-date]');
  if (greeting) greeting.textContent = getTimeGreeting();
  if (date) date.textContent = formatDate();
}

function setActiveSection(id) {
  $$('.bottom-nav__link[data-nav]').forEach((link) => {
    const active = link.dataset.nav === id;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  $$('.scroll-rail__markers a[data-rail]').forEach((link) => {
    link.classList.toggle('is-active', link.dataset.rail === id);
  });
}

function initSectionMotion() {
  const sections = $$('[data-section]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  sections.forEach((section) => {
    section.querySelectorAll('.glass-card').forEach((card, i) => {
      card.style.setProperty('--card-i', String(i));
    });
  });

  if (reducedMotion) {
    sections.forEach((s) => s.classList.add('is-visible'));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    },
    { threshold: 0.22, rootMargin: '-8% 0px -12% 0px' }
  );

  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    },
    { threshold: 0.45, rootMargin: '-20% 0px -35% 0px' }
  );

  sections.forEach((section) => {
    revealObserver.observe(section);
    activeObserver.observe(section);
  });

  if (sections[0]) sections[0].classList.add('is-visible');
}

function initScrollRail() {
  const fill = $('[data-scroll-fill]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fill || reducedMotion) return;

  let ticking = false;

  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
    fill.style.height = `${progress}%`;
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateProgress);
      }
    },
    { passive: true }
  );

  updateProgress();
}

function initParallax() {
  const layers = $$('[data-parallax]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!layers.length || reducedMotion) return;

  let ticking = false;

  const updateParallax = () => {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;

    layers.forEach((layer) => {
      const rate = parseFloat(layer.dataset.parallax) || 0.2;
      const rect = layer.getBoundingClientRect();
      const offset = (rect.top + scrollY - vh * 0.5) * rate * 0.15;
      layer.style.transform = `translate3d(0, ${offset}px, 0)`;
    });

    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateParallax);
      }
    },
    { passive: true }
  );

  updateParallax();
}

function initContactForm() {
  const form = $('[data-form="contact"]');
  const note = $('[data-form-note]');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('[type="submit"]');
    const data = Object.fromEntries(new FormData(form));

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
    }
    if (note) {
      note.hidden = true;
      note.textContent = '';
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(body.error || 'Something went wrong. Please try again.');
      }

      if (note) {
        note.textContent = 'Thanks — we received your inquiry and will reply soon.';
        note.hidden = false;
        note.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      form.reset();
    } catch (err) {
      if (note) {
        note.textContent = err.message || 'Could not send. Please email us directly.';
        note.hidden = false;
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send inquiry';
      }
    }
  });
}

function initFab() {
  $('.fab')?.addEventListener('click', () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initHero();
  initSectionMotion();
  initScrollRail();
  initParallax();
  initContactForm();
  initFab();
});

// App extension point — import modules here later:
// import { router } from './router.js';
