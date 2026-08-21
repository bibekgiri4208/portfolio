// ============================================
// CONSISTENT PAGE SWITCH TRANSITION
// ============================================

const PAGE_TRANSITION_DURATION = 700;
const PAGE_TRANSITION_KEY = 'pageTransition';

const initPageTransition = () => {
  const shouldAnimateIn = sessionStorage.getItem(PAGE_TRANSITION_KEY) === 'true';
  const root = document.documentElement;

  if (shouldAnimateIn) {
    document.body.classList.add('page-transition-in');

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        root.classList.remove('page-transition-preload');
        document.body.classList.add('page-transition-ready');

        setTimeout(() => {
          document.body.classList.remove('page-transition-in', 'page-transition-ready');
          sessionStorage.removeItem(PAGE_TRANSITION_KEY);
        }, PAGE_TRANSITION_DURATION);
      });
    });
  } else {
    root.classList.remove('page-transition-preload');
  }

  let isPageLeaving = false;

  document.querySelectorAll('a[data-page-transition]').forEach(link => {
    link.addEventListener('click', event => {
      const href = link.getAttribute('href');

      if (
        isPageLeaving ||
        !href ||
        href.startsWith('#') ||
        link.target === '_blank' ||
        link.hasAttribute('download') ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      event.preventDefault();
      isPageLeaving = true;

      sessionStorage.setItem(PAGE_TRANSITION_KEY, 'true');
      document.body.classList.remove('page-transition-in', 'page-transition-ready');
      document.body.classList.add('page-transition-out');

      setTimeout(() => {
        window.location.href = href;
      }, PAGE_TRANSITION_DURATION);
    });
  });

  window.addEventListener('pageshow', () => {
    isPageLeaving = false;
    document.body.classList.remove('page-transition-out');
  });
};

initPageTransition();

const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const themeToggle = document.querySelector('.theme-toggle');
const navbar = document.querySelector('.navbar');

// Optimized scroll handler with requestAnimationFrame
let ticking = false;

const updateNavbarAppearance = () => {
  if (!navbar) return;
  
  const isDark = document.body.classList.contains('dark-mode');
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

// ============================================
// THEME TOGGLE (LIGHT/DARK)
// ============================================

const applyTheme = theme => {
  const isDark = theme === 'dark';
  document.body.classList.toggle('dark-mode', isDark);

  if (themeToggle) {
    themeToggle.innerHTML = isDark
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
    themeToggle.setAttribute(
      'aria-label',
      isDark ? 'Enable light mode' : 'Enable dark mode'
    );
    themeToggle.setAttribute(
      'title',
      isDark ? 'Switch to light mode' : 'Switch to dark mode'
    );
  }

  updateNavbarAppearance();
};

const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const nextTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
    applyTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  });
}

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
document.querySelectorAll('.skill-card, .project-card, .stat-card, .contact-form, .section-kicker, .section-title, .projects-subtitle').forEach(el => {
  observer.observe(el);
});

// ============================================
// SMOOTH SCROLL BEHAVIOR
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ============================================
// HERO ENTRANCE + PAGE LOAD ANIMATIONS
// ============================================

window.addEventListener('load', () => {
  // Trigger hero staggered entrance
  const hero = document.querySelector('.hero');
  if (hero) hero.classList.add('loaded');

  // Instantly reveal elements already in viewport
  document.querySelectorAll('.skill-card, .project-card, .stat-card, .contact-form, .section-kicker, .section-title, .projects-subtitle').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      el.classList.add('animate-in', 'reveal');
    }
  });
});

// ============================================
// PROJECT CARD VIDEO HOVER PLAYBACK HOOKS
// ============================================

document.querySelectorAll('.project-card').forEach(card => {
  const video = card.querySelector('.project-video');
  
  if (video) {
    const source = video.querySelector('source');
    let playPromise = null;
    let isHovered = false;

    card.addEventListener('mouseenter', () => {
      isHovered = true;

      // Force the video element to explicitly take the source URL directly
      if (!video.src && source) {
        video.src = source.getAttribute('src');
        video.load();
      }
      
      // Fire playback
      playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          if (error.name !== "AbortError") {
            console.log("Playback policy block:", error);
          }
        });
      }
    });

    card.addEventListener('mouseleave', () => {
      isHovered = false;

      if (playPromise) {
        playPromise.then(() => {
          if (!isHovered) {
            video.pause();
            video.currentTime = 0;
          }
        }).catch(() => {
          video.pause();
        });
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }
});