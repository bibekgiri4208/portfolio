// Optional features load on proximity/intent, not on the critical rendering path.
(() => {
  const base = new URL('../', document.currentScript.src);
  const mobileView = matchMedia('(max-width: 768px), (hover: none) and (pointer: coarse)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const resources = new Map();

  const load = (path, stylesheet = false) => {
    if (resources.has(path)) return resources.get(path);
    const promise = new Promise((resolve, reject) => {
      const element = document.createElement(stylesheet ? 'link' : 'script');
      if (stylesheet) {
        element.rel = 'stylesheet';
        element.href = new URL(path, base).href;
      } else {
        element.src = new URL(path, base).href;
      }
      element.onload = resolve;
      element.onerror = () => {
        resources.delete(path);
        element.remove();
        reject(new Error(`Could not load ${path}`));
      };
      document.head.append(element);
    });
    resources.set(path, promise);
    return promise;
  };

  const near = (element, callback) => {
    if (!element) return;
    if (!('IntersectionObserver' in window)) {
      callback();
      return;
    }
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      callback();
    }, { rootMargin: '600px 0px' });
    observer.observe(element);
  };

  let projectReady;
  const loadProjects = () => {
    if (projectReady) return projectReady;
    const template = document.getElementById('project-dialog-template');
    if (template) template.replaceWith(template.content);
    projectReady = Promise.all([
      load('css/project_modal.css?v=mobile-smooth-20261112', true),
      load('js/projects-data.js?v=project-github-links-20261029')
    ]).then(() => load('js/project-modal.js?v=mobile-smooth-20261112'))
      .then(() => {
        if (!window.PortfolioProjectModal) throw new Error('Project dialog unavailable');
      }).catch(error => {
        projectReady = null;
        throw error;
      });
    return projectReady;
  };

  const projects = document.getElementById('projects');
  if (projects) {
    near(projects, () => { loadProjects().catch(() => {}); });
    // A fast jump/keyboard activation can beat the proximity loader. Preserve
    // that first click, and use the real standalone URL if enhancement fails.
    document.addEventListener('click', event => {
      const link = event.target.closest('a[data-project-modal]');
      if (!link || window.PortfolioProjectModal || event.defaultPrevented ||
          event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey ||
          event.altKey || (link.target && link.target !== '_self') || link.hasAttribute('download')) return;
      event.preventDefault();
      link.setAttribute('aria-busy', 'true');
      loadProjects().then(() => {
        if (!window.PortfolioProjectModal.open(Number(link.dataset.projectModal), link)) {
          window.location.assign(link.href);
        }
      }, () => window.location.assign(link.href))
        .finally(() => link.removeAttribute('aria-busy'));
    }, true);
  }

  near(document.getElementById('contact'), () => { load('js/contact.js').catch(() => {}); });

  // Phones never download/parse desktop-only petal physics. Recheck on resize
  // and preference changes so rotating/resizing into desktop still works.
  const loadDecoration = () => {
    if (mobileView.matches || reducedMotion.matches || navigator.connection?.saveData) return;
    const start = () => {
      if (mobileView.matches || reducedMotion.matches || navigator.connection?.saveData) return;
      load('css/sakura.css?v=mobile-performance-20261111', true)
        .then(() => load('js/sakura.js?v=mobile-performance-20261111'))
        .catch(() => {});
    };
    if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 2500 });
    else setTimeout(start, 0);
  };
  mobileView.addEventListener('change', loadDecoration);
  reducedMotion.addEventListener('change', loadDecoration);
  if (document.readyState === 'complete') loadDecoration();
  else window.addEventListener('load', loadDecoration, { once: true });
})();
