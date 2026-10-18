// Native dialog provides focus containment and makes the background non-interactive.
(() => {
  const dialog = document.getElementById('project-dialog');
  const projects = window.PortfolioProjects;
  if (!dialog?.showModal || !Array.isArray(projects)) return;

  const root = document.documentElement;
  const title = document.getElementById('project-dialog-title');
  const image = document.getElementById('project-dialog-image');
  const description = document.getElementById('project-dialog-description');
  const features = document.getElementById('project-dialog-features');
  const github = document.getElementById('project-dialog-github');
  const demo = document.getElementById('project-dialog-demo');
  const unavailable = document.getElementById('project-dialog-demo-unavailable');
  const content = dialog.querySelector('.project-dialog-content');
  const closeButton = dialog.querySelector('.project-dialog-close');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const warmedImages = new Map();
  let opener;
  let position;
  let closeTimer;
  let pressedBackdrop = false;

  const textElement = (tag, text) => {
    const element = document.createElement(tag);
    element.textContent = text;
    return element;
  };

  const openProject = (project, trigger) => {
    if (dialog.open) return;
    clearTimeout(closeTimer);
    dialog.classList.remove('is-closing');
    title.textContent = project.title;
    image.src = project.image;
    image.alt = project.imageAlt;
    description.replaceChildren(...project.description.split('\n\n').map(text => textElement('p', text)));
    features.replaceChildren(...project.features.map(text => textElement('li', text)));
    github.href = project.source;
    github.setAttribute('aria-label', `${project.title} on GitHub (opens in a new tab)`);
    demo.hidden = !project.demo;
    unavailable.hidden = !!project.demo;
    if (project.demo) {
      demo.href = project.demo;
      demo.setAttribute('aria-label', `${project.title} live demo (opens in a new tab)`);
    } else {
      demo.removeAttribute('href');
      demo.removeAttribute('aria-label');
    }
    opener = trigger;
    position = { x: scrollX, y: scrollY };
    root.classList.add('project-modal-open');
    dialog.showModal();
    content.scrollTop = 0;
  };

  const finishClose = () => {
    clearTimeout(closeTimer);
    if (dialog.open) dialog.close();
  };
  const requestClose = () => {
    if (!dialog.open || dialog.classList.contains('is-closing')) return;
    if (reducedMotion.matches) {
      finishClose();
      return;
    }
    dialog.classList.add('is-closing');
    closeTimer = setTimeout(finishClose, 220);
  };

  // Capture before the legacy page-navigation listeners so no departure animation
  // or saved navigation intent is started for an in-page project window.
  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-project-modal]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey ||
        event.ctrlKey || event.shiftKey || event.altKey ||
        (link.target && link.target !== '_self') || link.hasAttribute('download')) return;
    const project = projects.find(project => project.id === Number(link.dataset.projectModal));
    if (!project) return;
    event.preventDefault();
    openProject(project, link);
  }, true);

  const warmProject = event => {
    if (navigator.connection?.saveData) return;
    const link = event.target.closest('a[data-project-modal]');
    if (!link) return;
    const project = projects.find(project => project.id === Number(link.dataset.projectModal));
    if (!project || warmedImages.has(project.id)) return;
    const preview = new Image();
    preview.src = project.image;
    warmedImages.set(project.id, preview);
    preview.decode?.().catch(() => {});
  };
  document.addEventListener('pointerover', warmProject);
  document.addEventListener('focusin', warmProject);
  document.addEventListener('pointerdown', warmProject);

  closeButton.addEventListener('click', requestClose);
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    requestClose();
  });
  const isOutside = event => {
    const rect = dialog.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right ||
      event.clientY < rect.top || event.clientY > rect.bottom;
  };
  dialog.addEventListener('pointerdown', event => {
    pressedBackdrop = event.target === dialog && isOutside(event);
  });
  dialog.addEventListener('click', event => {
    if (pressedBackdrop && event.target === dialog && isOutside(event)) requestClose();
    pressedBackdrop = false;
  });
  dialog.addEventListener('animationend', event => {
    if (event.target === dialog && event.animationName === 'projectDialogOut') finishClose();
  });
  dialog.addEventListener('close', () => {
    clearTimeout(closeTimer);
    dialog.classList.remove('is-closing');
    root.classList.remove('project-modal-open');
    opener?.focus({ preventScroll: true });
    if (position) window.scrollTo({ left: position.x, top: position.y, behavior: 'instant' });
    opener = null;
  });
})();
