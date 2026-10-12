// One theme preference and one set of icons for every portfolio page.
(() => {
  let currentTheme = 'light';

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
    document.documentElement.dataset.theme = currentTheme;
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

  const syncTheme = () => applyTheme(readTheme());
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

  document.addEventListener('click', event => {
    if (event.defaultPrevented || !event.target.closest('button.theme-toggle')) return;
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    try {
      localStorage.setItem('theme', currentTheme);
    } catch {
      // Keep the toggle usable even when browser storage is blocked.
    }
  });
})();
