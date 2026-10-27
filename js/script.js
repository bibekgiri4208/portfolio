const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navbar = document.querySelector('.navbar');

// Optimized scroll handler with requestAnimationFrame
let ticking = false;

const updateNavbarAppearance = () => {
  if (!navbar) return;
  
  const scrolled = window.scrollY > 50;
  
  // Use class-based styling instead of inline styles for better performance
  navbar.classList.toggle('navbar-scrolled', scrolled);
};

// Throttled scroll listener using requestAnimationFrame
window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      updateNavbarAppearance();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

updateNavbarAppearance();

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
  });
}

// Close menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    if (navMenu) {
      navMenu.classList.remove('active');
    }
    if (hamburger) {
      hamburger.classList.remove('active');
    }
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
const revealElements = document.querySelectorAll('.skill-card, .project-card, .stat-card, .contact-form, .section-kicker, .section-title, .projects-subtitle');
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
