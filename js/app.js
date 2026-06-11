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

function initNavHighlight() {
  const links = $$('.bottom-nav__link[data-nav]');
  const sections = links
    .map((link) => {
      const id = link.getAttribute('href')?.slice(1);
      const el = id ? document.getElementById(id) : null;
      return el ? { link, el } : null;
    })
    .filter(Boolean);

  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => {
          const active = l.dataset.nav === entry.target.id;
          l.classList.toggle('is-active', active);
          if (active) l.setAttribute('aria-current', 'page');
          else l.removeAttribute('aria-current');
        });
      });
    },
    { rootMargin: '-40% 0px -45% 0px', threshold: 0 }
  );

  sections.forEach(({ el }) => observer.observe(el));
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
  initNavHighlight();
  initContactForm();
  initFab();
});

// App extension point — import modules here later:
// import { router } from './router.js';
