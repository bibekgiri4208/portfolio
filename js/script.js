const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navbar = document.querySelector('.navbar');
const navLinks = [...document.querySelectorAll('.nav-menu .nav-link')];
const navSections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
let activeNavLink = navLinks.find(link => link.hasAttribute('aria-current')) || navLinks[0];
let navigationTarget = null;
let navigationSettleTimer;

const positionNavCapsule = (animate = true) => {
  if (!navMenu || !activeNavLink) return;
  const menuRect = navMenu.getBoundingClientRect();
  if (!menuRect.width || !menuRect.height) {
    navMenu.classList.remove('capsule-ready');
    return;
  }

  if (!animate) navMenu.classList.remove('capsule-ready');
  const linkRect = activeNavLink.getBoundingClientRect();
  navMenu.style.setProperty('--capsule-x', `${linkRect.left - menuRect.left - navMenu.clientLeft}px`);
  navMenu.style.setProperty('--capsule-y', `${linkRect.top - menuRect.top - navMenu.clientTop}px`);
  navMenu.style.setProperty('--capsule-width', `${linkRect.width}px`);
  navMenu.style.setProperty('--capsule-height', `${linkRect.height}px`);
  navMenu.classList.add('has-nav-capsule');
  if (!navMenu.classList.contains('capsule-ready')) {
    requestAnimationFrame(() => navMenu.classList.add('capsule-ready'));
  }
};

const setActiveNavLink = link => {
  if (!link || link === activeNavLink) return;
  activeNavLink = link;
  navLinks.forEach(item => {
    if (item === link) item.setAttribute('aria-current', 'page');
    else item.removeAttribute('aria-current');
  });
  positionNavCapsule();
};

const setMenuOpen = open => {
  const wasOpen = navMenu?.classList.contains('active') || false;
  navMenu?.classList.toggle('active', open);
  hamburger?.classList.toggle('active', open);
  hamburger?.setAttribute('aria-expanded', String(open));
  hamburger?.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  if (open !== wasOpen) positionNavCapsule(false);
};

// Optimized scroll handler with requestAnimationFrame
let ticking = false;

const updateNavbarAppearance = () => {
  if (!navbar) return;
  
  const scrolled = window.scrollY > 50;
  
  // Use class-based styling instead of inline styles for better performance
  navbar.classList.toggle('navbar-scrolled', scrolled);

  // Match the reference's inset navigation pill to the section being read.
  const activeSection = [...navSections].reverse().find(section => section.getBoundingClientRect().top <= window.innerHeight * 0.35) || navSections[0];
  if (!navigationTarget) {
    setActiveNavLink(navLinks.find(link => link.getAttribute('href') === `#${activeSection?.id}`));
  }
};

const finishNavScroll = () => {
  clearTimeout(navigationSettleTimer);
  navigationTarget = null;
  updateNavbarAppearance();
};

// Throttled scroll listener using requestAnimationFrame
window.addEventListener('scroll', () => {
  // Keep a clicked destination selected while smooth scrolling past other sections.
  if (navigationTarget) {
    clearTimeout(navigationSettleTimer);
    navigationSettleTimer = setTimeout(finishNavScroll, 180);
  }
  if (!ticking) {
    window.requestAnimationFrame(() => {
      updateNavbarAppearance();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

updateNavbarAppearance();
positionNavCapsule(false);

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navigationTarget = link;
    setActiveNavLink(link);
    clearTimeout(navigationSettleTimer);
    navigationSettleTimer = setTimeout(finishNavScroll, 1500);
  });
});

window.addEventListener('scrollend', finishNavScroll);
window.addEventListener('wheel', finishNavScroll, { passive: true });
window.addEventListener('touchstart', finishNavScroll, { passive: true });
window.addEventListener('keydown', event => {
  if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) finishNavScroll();
});

// Re-measure when fonts load, links resize, or the mobile dropdown opens.
if (navMenu) {
  const navResizeObserver = new ResizeObserver(() => positionNavCapsule(false));
  navResizeObserver.observe(navMenu);
  navLinks.forEach(link => navResizeObserver.observe(link));
  document.fonts.ready.then(() => positionNavCapsule(false));
}

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    setMenuOpen(!navMenu.classList.contains('active'));
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navMenu.classList.contains('active')) {
      setMenuOpen(false);
      hamburger.focus();
    }
  });

  document.addEventListener('click', event => {
    if (!navbar.contains(event.target)) setMenuOpen(false);
  });

  window.matchMedia('(max-width: 768px)').addEventListener('change', () => setMenuOpen(false));
}

// Close menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    setMenuOpen(false);
  });
});

// ============================================
// SCROLL ANIMATIONS
// ============================================

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in', 'reveal');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe cards, section headers, and content elements
const revealElements = document.querySelectorAll('.skill-card, .project-card, .stat-card, .contact-details, .contact-form, .section-kicker, .section-title, .projects-subtitle');
revealElements.forEach(el => {
  observer.observe(el);
});

// ============================================
// SMOOTH SCROLL BEHAVIOR
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.getElementById(this.getAttribute('href').slice(1));
    if (target) {
      target.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        block: 'start'
      });
    }
  });
});

// ============================================
// INITIAL VIEWPORT REVEALS
// ============================================

// This script runs after the page markup; don't wait for images or window.load.
revealElements.forEach(el => {
  const rect = el.getBoundingClientRect();
  if (rect.top < window.innerHeight * 0.9) {
    el.classList.add('animate-in', 'reveal');
  }
});
