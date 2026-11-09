(() => {
  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const mobileNavigation = matchMedia('(max-width: 768px)');
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  const navbar = document.querySelector('.navbar');
  const navLinks = [...document.querySelectorAll('.nav-menu .nav-link')];
  const navSections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  let activeNavLink = navLinks.find(link => link.hasAttribute('aria-current')) || navLinks[0];
  let navigationTarget = null;
  let navigationSettleTimer;
  let sectionPositions = [];
  let scrollFrame = 0;
  let layoutFrame = 0;
  let capsuleFrame = 0;

  const positionNavCapsule = (animate = true) => {
    if (!navMenu || !activeNavLink || !navMenu.offsetWidth) return;
    // Layout coordinates stay accurate while the mobile menu itself is scaling.
    const x = activeNavLink.offsetLeft;
    const y = activeNavLink.offsetTop;
    const width = activeNavLink.offsetWidth;
    const height = activeNavLink.offsetHeight;
    if (!animate) navMenu.classList.remove('capsule-ready');
    navMenu.style.setProperty('--capsule-x', `${x}px`);
    navMenu.style.setProperty('--capsule-y', `${y}px`);
    navMenu.style.setProperty('--capsule-width', `${width}px`);
    navMenu.style.setProperty('--capsule-height', `${height}px`);
    navMenu.classList.add('has-nav-capsule');
    cancelAnimationFrame(capsuleFrame);
    capsuleFrame = requestAnimationFrame(() => navMenu.classList.add('capsule-ready'));
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
    if (!navMenu) return;
    open = open && mobileNavigation.matches;
    if (!open && mobileNavigation.matches && navMenu.contains(document.activeElement)) {
      hamburger?.focus({ preventScroll: true });
    }
    navMenu.inert = mobileNavigation.matches && !open;
    navMenu.classList.toggle('active', open);
    hamburger?.classList.toggle('active', open);
    hamburger?.setAttribute('aria-expanded', String(open));
    hamburger?.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    if (open) positionNavCapsule(false);
  };

  const updateNavbarAppearance = () => {
    const scrolled = scrollY > 50;
    if (navbar && navbar.classList.contains('navbar-scrolled') !== scrolled) {
      navbar.classList.toggle('navbar-scrolled', scrolled);
    }
    if (navigationTarget) return;
    const readingLine = scrollY + innerHeight * 0.35;
    let index = sectionPositions.length - 1;
    while (index > 0 && sectionPositions[index] > readingLine) index -= 1;
    setActiveNavLink(navLinks[Math.max(0, index)]);
  };

  const measureLayout = () => {
    layoutFrame = 0;
    // Read geometry together, only when layout changes — never once per scroll frame.
    sectionPositions = navSections.map(section => section.getBoundingClientRect().top + scrollY);
    positionNavCapsule(false);
    updateNavbarAppearance();
  };
  const scheduleLayout = () => {
    if (!layoutFrame) layoutFrame = requestAnimationFrame(measureLayout);
  };
  const finishNavScroll = () => {
    clearTimeout(navigationSettleTimer);
    navigationTarget = null;
    updateNavbarAppearance();
  };

  window.addEventListener('scroll', () => {
    if (navigationTarget) {
      clearTimeout(navigationSettleTimer);
      navigationSettleTimer = setTimeout(finishNavScroll, 180);
    }
    if (!scrollFrame) {
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        updateNavbarAppearance();
      });
    }
  }, { passive: true });
  navLinks.forEach(link => {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
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
  if ('ResizeObserver' in window) {
    // Measure actual layout changes, not the transforms used by our animations.
    const resizeObserver = new ResizeObserver(measureLayout);
    resizeObserver.observe(document.body);
    navSections.forEach(section => resizeObserver.observe(section));
    if (navMenu) resizeObserver.observe(navMenu);
    navLinks.forEach(link => resizeObserver.observe(link));
  }
  window.addEventListener('resize', measureLayout, { passive: true });
  window.addEventListener('pageshow', scheduleLayout);
  document.fonts?.ready.then(scheduleLayout);

  hamburger?.addEventListener('click', () => setMenuOpen(!navMenu.classList.contains('active')));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navMenu?.classList.contains('active')) {
      setMenuOpen(false);
      hamburger?.focus({ preventScroll: true });
    }
  });
  document.addEventListener('click', event => {
    if (!navbar?.contains(event.target)) setMenuOpen(false);
  });
  mobileNavigation.addEventListener('change', () => {
    setMenuOpen(false);
    measureLayout();
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => setMenuOpen(false));
  });
  setMenuOpen(false);
  measureLayout();

  // One-shot reveals use the independent translate property, leaving hover transforms
  // free to respond immediately. Nothing is hidden when JavaScript is unavailable.
  const revealElements = [...document.querySelectorAll('.about-text, .skill-card, .project-card, .stat-card, .contact-details, .contact-form, .section-kicker, .section-title, .projects-subtitle')];
  const revealMotions = new Map();
  const markRevealed = element => {
    element.classList.remove('reveal-pending');
    element.classList.add('animate-in', 'reveal');
    observer?.unobserve(element);
  };
  const reveal = (element, delay = 0, immediate = false) => {
    if (!element.classList.contains('reveal-pending')) return;
    markRevealed(element);
    if (immediate || reducedMotion.matches || root.classList.contains('restoring-project-position')) return;
    const animation = element.animate([
      { opacity: 0, translate: '0 18px' },
      { opacity: 1, translate: '0 0' }
    ], { duration: 620, delay, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' });
    revealMotions.set(element, animation);
    const cleanup = () => {
      if (revealMotions.get(element) === animation) revealMotions.delete(element);
    };
    animation.finished.then(cleanup, cleanup);
  };
  const observer = 'IntersectionObserver' in window && typeof Element.prototype.animate === 'function'
    ? new IntersectionObserver(entries => {
      const groups = new Map();
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        const group = element.parentElement;
        const index = groups.get(group) || 0;
        groups.set(group, index + 1);
        reveal(element, Math.min(index * 65, 160));
      });
    }, { threshold: 0.06, rootMargin: '0px 0px 32px 0px' })
    : null;

  // Batch initial reads before writes; direct/deep arrivals stay immediately readable.
  const initialBounds = revealElements.map(element => element.getBoundingClientRect());
  revealElements.forEach((element, index) => {
    if (!observer || reducedMotion.matches || initialBounds[index].top < innerHeight) {
      markRevealed(element);
    } else {
      element.classList.add('reveal-pending');
      observer.observe(element);
    }
  });
  const settleReveals = (all = false) => {
    revealMotions.forEach(animation => animation.cancel());
    revealMotions.clear();
    const visible = revealElements.filter(element => all || element.getBoundingClientRect().top < innerHeight);
    visible.forEach(element => reveal(element, 0, true));
  };
  reducedMotion.addEventListener('change', event => {
    if (event.matches) settleReveals(true);
  });
  window.addEventListener('portfolio:restore', () => {
    settleReveals();
    scheduleLayout();
  });
  document.addEventListener('focusin', event => {
    const element = event.target.closest('.reveal-pending, .animate-in');
    if (!element) return;
    revealMotions.get(element)?.cancel();
    reveal(element, 0, true);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) settleReveals();
  });

  // Keep native wheel/touch scrolling; only explicit anchor clicks request smoothing.
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = document.getElementById(anchor.getAttribute('href').slice(1));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
    });
  });
})();
