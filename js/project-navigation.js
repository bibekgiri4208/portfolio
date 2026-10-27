// Keep project navigation separate from the homepage's animations and controls.
(() => {
  const RETURN_KEY = 'portfolioProjectReturn';
  const RETURN_PARAM = 'returnToProjects';
  const isPortfolio = window.location.pathname.endsWith('/') ||
    window.location.pathname.endsWith('/index.html');

  const readReturnPosition = () => {
    try {
      return JSON.parse(sessionStorage.getItem(RETURN_KEY));
    } catch {
      return null;
    }
  };

  const isValidPosition = position => position &&
    Number.isFinite(position.x) && Number.isFinite(position.y) &&
    position.x >= 0 && position.y >= 0;

  if (isPortfolio) {
    const url = new URL(window.location.href);
    const isExplicitReturn = url.searchParams.has(RETURN_PARAM);
    const isHistoryReturn = performance.getEntriesByType('navigation')[0]?.type === 'back_forward';
    const position = isExplicitReturn
      ? readReturnPosition()
      : isHistoryReturn ? history.state?.portfolioScroll : null;

    if (isExplicitReturn) {
      url.searchParams.delete(RETURN_PARAM);
      history.replaceState(history.state, '', url.href);
    }

    const prepareRestoration = () => {
      history.scrollRestoration = 'manual';
      const root = document.documentElement;
      root.style.visibility = 'hidden';
      root.classList.add('restoring-project-position');
    };

    const restorePosition = position => {
      const root = document.documentElement;
      window.scrollTo({ left: position.x, top: position.y, behavior: 'instant' });
      window.requestAnimationFrame(() => {
        // Let the homepage reveal its cards before the final scroll measurement.
        window.scrollTo({ left: position.x, top: position.y, behavior: 'instant' });
        root.style.visibility = '';
        window.requestAnimationFrame(() => {
          root.classList.remove('restoring-project-position');
          history.scrollRestoration = 'auto';
        });
      });
    };

    const releaseRestoredHover = () => {
      document.documentElement.classList.remove('project-return-restored');
    };
    window.PortfolioProjectNavigation = {
      restore() {
        let target = history.state?.portfolioScroll || position;
        if (!isValidPosition(target) && isExplicitReturn) {
          document.getElementById('projects')?.scrollIntoView({ behavior: 'instant' });
        }
        target ||= { x: scrollX, y: scrollY };
        if (!isValidPosition(target)) return;
        // The return preview needs the final homepage layout before taking a snapshot.
        // Do not leave scroll restoration or reveal animations for a later frame.
        const root = document.documentElement;
        root.classList.add('restoring-project-position', 'project-return-restored');
        // BFCache can retain the clicked card's :hover state until the mouse moves.
        // Match the non-hovered preview instead of jumping by the card's hover lift.
        document.addEventListener('pointermove', releaseRestoredHover, { once: true });
        window.scrollTo({ left: target.x, top: target.y, behavior: 'instant' });
        document.querySelectorAll('.skill-card, .project-card, .stat-card, .contact-form, .section-kicker, .section-title, .projects-subtitle').forEach(element => {
          if (element.getBoundingClientRect().top < innerHeight * 0.9) {
            element.classList.add('animate-in', 'reveal');
          }
        });
        document.querySelector('.navbar')?.classList.toggle('navbar-scrolled', target.y > 50);
        root.style.visibility = '';
        requestAnimationFrame(() => root.classList.remove('restoring-project-position'));
      }
    };

    if (isValidPosition(position)) {
      // Restore before revealing the page, rather than animating from the hero.
      prepareRestoration();
      window.addEventListener('load', () => restorePosition(position), { once: true });
    } else if (isExplicitReturn) {
      // Direct project visits have no saved click position; settle the Projects
      // anchor and reveals before showing the real page, just like its preview.
      prepareRestoration();
      window.addEventListener('load', () => {
        document.getElementById('projects')?.scrollIntoView({ behavior: 'instant' });
        window.PortfolioProjectNavigation.restore();
        history.scrollRestoration = 'auto';
      }, { once: true });
    }

    const savePosition = () => {
      const position = { x: window.scrollX, y: window.scrollY };
      history.replaceState({ ...history.state, portfolioScroll: position }, '');
      return position;
    };

    let isOpeningProject = false;
    window.addEventListener('pagehide', () => {
      // Keep the click position even if an entrance animation shifts scroll during departure.
      if (!isOpeningProject) savePosition();
    });
    window.addEventListener('pageshow', event => {
      isOpeningProject = false;
      const position = history.state?.portfolioScroll;
      if (event.persisted && isValidPosition(position)) {
        // A cached document already has its layout and assets. Restore synchronously
        // so the browser never presents a hidden/intermediate frame on history return.
        window.PortfolioProjectNavigation.restore();
        history.scrollRestoration = 'auto';
      }
    });
    document.addEventListener('click', event => {
      const link = event.target.closest('a.project-card');
      if (!link || isOpeningProject || event.defaultPrevented || event.button !== 0 ||
          event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
          link.target === '_blank') return;

      const position = savePosition();
      const rect = (link.querySelector('.project-link') || link).getBoundingClientRect();
      isOpeningProject = true;
      try {
        sessionStorage.setItem(RETURN_KEY, JSON.stringify({
          ...position,
          origin: {
            x: (event.detail ? event.clientX : rect.left + rect.width / 2) / innerWidth,
            y: (event.detail ? event.clientY : rect.top + rect.height / 2) / innerHeight,
            scale: Math.max(0.14, Math.min(0.28, rect.width / innerWidth))
          },
          url: window.location.href,
          projectUrl: link.href
        }));
      } catch {
        // Browser history still works if session storage is unavailable.
      }
    });
    return;
  }

  const savedPosition = readReturnPosition();
  const isProject = window.location.pathname.endsWith('/project_description.html');
  if (isProject && savedPosition?.projectUrl === window.location.href &&
      savedPosition.url.split('#')[0] === document.referrer.split('#')[0] && history.length > 1) {
    history.replaceState({ ...history.state, portfolioProjectSource: savedPosition.url }, '');
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-project-return]');
    if (!link || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    let returnHref = link.href;
    let navigate = () => { window.location.href = returnHref; };
    if (isProject && history.state?.portfolioProjectSource && history.length > 1) {
      returnHref = history.state.portfolioProjectSource;
      navigate = () => history.back();
    } else if (isValidPosition(savedPosition)) {
      const returnUrl = new URL(savedPosition.url, window.location.href);
      if (returnUrl.origin !== window.location.origin) return;
      returnUrl.searchParams.set(RETURN_PARAM, '1');
      returnHref = returnUrl.href;
      navigate = () => { window.location.href = returnUrl.href; };
    } else {
      const returnUrl = new URL(link.href);
      returnUrl.searchParams.set(RETURN_PARAM, '1');
      returnHref = returnUrl.href;
      navigate = () => { window.location.href = returnUrl.href; };
    }
    event.preventDefault();
    if (window.PortfolioPageTransition && isProject) {
      window.PortfolioPageTransition.close(navigate, savedPosition?.origin, returnHref);
    } else {
      navigate();
    }
  });
})();
