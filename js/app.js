/**
 * Voltron Digital — static shell with app-ready hooks.
 * Future: swap form handler, add router, auth, client portal.
 */

const STORAGE_KEY = 'voltron-theme';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatHeroDateTime() {
  const now = new Date();
  const date = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const time = now.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  return { date, time, iso: now.toISOString() };
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
  applyTheme(saved || 'night');

  $('.theme-toggle')?.addEventListener('click', toggleTheme);
  $('[data-theme-shortcut]')?.addEventListener('click', toggleTheme);
}

function initHero() {
  const greeting = $('[data-greeting]');
  const datetime = $('[data-datetime]');
  if (greeting) greeting.textContent = getTimeGreeting();
  if (datetime) {
    const { date, time, iso } = formatHeroDateTime();
    datetime.textContent = `${date} · ${time}`;
    datetime.setAttribute('datetime', iso);
  }
}

function initChat() {
  const trigger = $('[data-open-chat]');
  if (!trigger) return;

  trigger.addEventListener('click', () => {
    if (window.$crisp) {
      window.$crisp.push(['do', 'chat:open']);
      return;
    }
    trigger.textContent = 'Chat coming soon';
    trigger.disabled = true;
  });
}

function setActiveSection(id) {
  $$('[data-nav]').forEach((link) => {
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

  window.addEventListener('load', positionScrollRailMarkers, { once: true });
  window.addEventListener('resize', positionScrollRailMarkers, { passive: true });
}

function positionScrollRailMarkers() {
  const markerList = $$('[data-scroll-markers] li');
  if (!markerList.length) return;

  const count = markerList.length;
  markerList.forEach((marker, i) => {
    const pct = count <= 1 ? 0 : (i / (count - 1)) * 100;
    marker.style.top = `${pct}%`;
  });
}

function initScrollRail() {
  const fill = $('[data-scroll-fill]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fill) return;

  let ticking = false;

  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
    fill.style.height = `${progress}%`;
    positionScrollRailMarkers();
    ticking = false;
  };

  const scheduleUpdate = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateProgress);
    }
  };

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });
  window.addEventListener('load', updateProgress);

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

function initCaseStudyImages() {
  $$('.case-study__img[data-fallback]').forEach((img) => {
    img.addEventListener('error', () => {
      const fallback = img.dataset.fallback;
      if (fallback && img.src !== fallback) img.src = fallback;
    }, { once: true });
  });
}

function initMobileMenu() {
  const header = $('.site-header');
  const toggle = $('.menu-toggle');
  const panel = $('#nav-panel');
  if (!header || !toggle || !panel) return;

  const closeMenu = () => {
    header.classList.remove('is-menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  };

  toggle.addEventListener('click', () => {
    const open = !header.classList.contains('is-menu-open');
    header.classList.toggle('is-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  $$('.site-nav a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  window.matchMedia('(min-width: 720px)').addEventListener('change', (e) => {
    if (e.matches) closeMenu();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initHero();
  initSectionMotion();
  initScrollRail();
  initParallax();
  initCaseStudyImages();
  initMobileMenu();
  initChat();
});

// App extension point — import modules here later:
// import { router } from './router.js';
