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

    if (isValidPosition(position)) {
      // Restore before revealing the page, rather than animating from the hero.
      prepareRestoration();
      window.addEventListener('load', () => restorePosition(position), { once: true });
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
        prepareRestoration();
        restorePosition(position);
      }
    });
    document.addEventListener('click', event => {
      const link = event.target.closest('a.project-card');
      if (!link || event.defaultPrevented || event.button !== 0 ||
          event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
          link.target === '_blank') return;

      const position = savePosition();
      isOpeningProject = true;
      try {
        sessionStorage.setItem(RETURN_KEY, JSON.stringify({
          ...position,
          url: window.location.href,
          projectUrl: link.href
        }));
      } catch {
        // Browser history still works if session storage is unavailable.
      }
    });
    return;
  }

  const pageReturnLink = document.querySelector('a[data-page-return]');
  if (pageReturnLink) {
    // Keep the originating page through reloads, and support links opened in a new tab.
    try {
      const sourceUrl = new URL(history.state?.pageReturnUrl || document.referrer);
      if (sourceUrl.origin === window.location.origin && sourceUrl.href !== window.location.href) {
        pageReturnLink.href = sourceUrl.href;
        history.replaceState({ ...history.state, pageReturnUrl: sourceUrl.href }, '');
      }
    } catch {
      // Direct visits without a referrer retain the Projects fallback.
    }

    pageReturnLink.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey ||
          event.ctrlKey || event.shiftKey || event.altKey || history.length <= 1) return;

      event.preventDefault();
      history.back();
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

    if (isProject && history.state?.portfolioProjectSource && history.length > 1) {
      event.preventDefault();
      history.back();
    } else if (isValidPosition(savedPosition)) {
      const returnUrl = new URL(savedPosition.url, window.location.href);
      if (returnUrl.origin !== window.location.origin) return;
      returnUrl.searchParams.set(RETURN_PARAM, '1');
      event.preventDefault();
      window.location.href = returnUrl.href;
    }
  });
})();
