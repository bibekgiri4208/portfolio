// One theme preference and one set of icons for every portfolio page.
(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let currentTheme = 'light';
  let requestedTheme = currentTheme;
  let themeTransition;

  const clearTransition = () => {
    themeTransition = null;
    root.classList.remove('theme-transitioning');
    ['--theme-origin-x', '--theme-origin-y', '--theme-radius'].forEach(property => root.style.removeProperty(property));
  };

  const cancelTransition = () => {
    themeTransition?.skipTransition();
    clearTransition();
  };

  const readTheme = () => {
    try {
      return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
    } catch {
      return currentTheme;
    }
  };

  const applyTheme = theme => {
    currentTheme = theme === 'dark' ? 'dark' : 'light';
    const isDark = currentTheme === 'dark';
    root.dataset.theme = currentTheme;
    document.body?.classList.toggle('dark-mode', isDark);

    document.querySelectorAll('.theme-toggle').forEach(button => {
      const iconClass = isDark ? 'fas fa-sun' : 'fas fa-moon';
      if (button.querySelector('i')?.className !== iconClass) {
        button.innerHTML = `<i class="${iconClass}" aria-hidden="true"></i>`;
      }
      button.setAttribute('aria-label', isDark ? 'Enable light mode' : 'Enable dark mode');
      button.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    });
  };

  const syncTheme = () => {
    cancelTransition();
    requestedTheme = readTheme();
    applyTheme(requestedTheme);
  };

  const toggleTheme = button => {
    requestedTheme = requestedTheme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem('theme', requestedTheme);
    } catch {
      // Keep the toggle usable even when browser storage is blocked.
    }

    // A second click finishes the reveal immediately rather than queuing animations.
    if (themeTransition) {
      cancelTransition();
      applyTheme(requestedTheme);
      return;
    }

    // Never animate initial loads, reduced-motion changes, or over a page entrance.
    if (reducedMotion.matches || !document.startViewTransition ||
        root.matches('.page-expand-pending, .page-expanding, .page-closing')) {
      applyTheme(requestedTheme);
      return;
    }

    const rect = button.getBoundingClientRect();
    const x = Math.max(0, Math.min(innerWidth, rect.left + rect.width / 2));
    const y = Math.max(0, Math.min(innerHeight, rect.top + rect.height / 2));
    const radius = Math.ceil(Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)));
    root.style.setProperty('--theme-origin-x', `${x}px`);
    root.style.setProperty('--theme-origin-y', `${y}px`);
    root.style.setProperty('--theme-radius', `${radius}px`);
    root.classList.add('theme-transitioning');

    try {
      // Read the latest request: a skipped transition can still run its callback.
      const transition = document.startViewTransition(() => applyTheme(requestedTheme));
      themeTransition = transition;
      transition.ready.catch(() => {
        if (themeTransition === transition) applyTheme(requestedTheme);
      });
      transition.updateCallbackDone.catch(() => {});
      const finish = () => {
        if (themeTransition === transition) clearTransition();
      };
      transition.finished.then(finish, finish);
    } catch {
      clearTransition();
      applyTheme(requestedTheme);
    }
  };

  syncTheme();

  // This script runs in the head: apply the saved theme as soon as the body exists.
  if (!document.body) {
    const observer = new MutationObserver(() => {
      if (!document.body) return;
      document.body.classList.toggle('dark-mode', currentTheme === 'dark');
      observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true });
  }

  document.addEventListener('DOMContentLoaded', syncTheme, { once: true });
  window.addEventListener('pageshow', syncTheme);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') syncTheme();
  });
  window.addEventListener('storage', event => {
    if (event.key === 'theme' || event.key === null) syncTheme();
  });
  window.addEventListener('pagehide', cancelTransition);
  reducedMotion.addEventListener('change', event => {
    if (!event.matches) return;
    cancelTransition();
    applyTheme(requestedTheme);
  });

  document.addEventListener('click', event => {
    const button = event.target.closest('button.theme-toggle');
    if (event.defaultPrevented || !button) return;
    toggleTheme(button);
  });
})();
