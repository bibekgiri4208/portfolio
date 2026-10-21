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
  const skeleton = dialog.querySelector('.project-skeleton');
  const gallery = dialog.querySelector('.project-dialog-gallery');
  const galleryTrack = document.getElementById('project-gallery-track');
  const galleryControls = dialog.querySelector('.project-gallery-controls');
  const galleryCounter = document.getElementById('project-gallery-counter');
  const previousScreenshot = document.getElementById('project-gallery-previous');
  const nextScreenshot = document.getElementById('project-gallery-next');
  const screenshotPreview = document.getElementById('screenshot-preview');
  const previewImage = document.getElementById('screenshot-preview-image');
  const previewCaption = document.getElementById('screenshot-preview-caption');
  const previewCounter = document.getElementById('screenshot-preview-counter');
  const previewClose = screenshotPreview.querySelector('.screenshot-preview-close');
  const previewPrevious = document.getElementById('screenshot-preview-previous');
  const previewNext = document.getElementById('screenshot-preview-next');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const warmedImages = new Map();
  const openDuration = 580;
  const closeDuration = 380;
  dialog.style.setProperty('--project-open-duration', `${openDuration}ms`);
  dialog.style.setProperty('--project-close-duration', `${closeDuration}ms`);
  let opener;
  let position;
  let closeTimer;
  let motion;
  let detailMotions = [];
  let morphFace;
  let pressedBackdrop = false;
  let screenshotCount = 0;
  let screenshots = [];
  let previewIndex = 0;
  let previewOpener;
  let pressedPreviewBackdrop = false;

  const textElement = (tag, text) => {
    const element = document.createElement(tag);
    element.textContent = text;
    return element;
  };

  const updateGalleryControls = () => {
    const maxScroll = galleryTrack.scrollWidth - galleryTrack.clientWidth;
    const canScroll = maxScroll > 2;
    previousScreenshot.hidden = !canScroll;
    nextScreenshot.hidden = !canScroll;
    previousScreenshot.disabled = galleryTrack.scrollLeft <= 2;
    nextScreenshot.disabled = galleryTrack.scrollLeft >= maxScroll - 2;
  };

  const showPreviewScreenshot = index => {
    if (!screenshots.length) return;
    previewIndex = (index + screenshots.length) % screenshots.length;
    const screenshot = screenshots[previewIndex];
    previewImage.alt = screenshot.alt || `${title.textContent} screenshot ${previewIndex + 1}`;
    previewImage.src = screenshot.src;
    previewCaption.textContent = previewImage.alt;
    previewCounter.textContent = `${previewIndex + 1} / ${screenshots.length}`;
    previewPrevious.hidden = screenshots.length <= 1;
    previewNext.hidden = screenshots.length <= 1;
  };

  const openScreenshotPreview = (index, trigger) => {
    if (!dialog.open || dialog.classList.contains('is-closing') || screenshotPreview.open) return;
    previewOpener = trigger;
    pressedPreviewBackdrop = false;
    showPreviewScreenshot(index);
    // A second native dialog sits above the project and contains keyboard focus.
    screenshotPreview.showModal();
  };

  previewClose.addEventListener('click', () => screenshotPreview.close());
  previewPrevious.addEventListener('click', () => showPreviewScreenshot(previewIndex - 1));
  previewNext.addEventListener('click', () => showPreviewScreenshot(previewIndex + 1));
  screenshotPreview.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const targets = { ArrowLeft: previewIndex - 1, ArrowRight: previewIndex + 1, Home: 0, End: screenshots.length - 1 };
    if (!(event.key in targets)) return;
    event.preventDefault();
    showPreviewScreenshot(targets[event.key]);
  });
  const isOutsidePreview = event => {
    const rect = screenshotPreview.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right ||
      event.clientY < rect.top || event.clientY > rect.bottom;
  };
  screenshotPreview.addEventListener('pointerdown', event => {
    pressedPreviewBackdrop = event.target === screenshotPreview && isOutsidePreview(event);
  });
  screenshotPreview.addEventListener('click', event => {
    if (pressedPreviewBackdrop && event.target === screenshotPreview && isOutsidePreview(event)) screenshotPreview.close();
    pressedPreviewBackdrop = false;
  });
  screenshotPreview.addEventListener('close', () => {
    if (screenshotPreview.open) return;
    previewImage.removeAttribute('src');
    if (dialog.open && previewOpener?.isConnected) previewOpener.focus({ preventScroll: true });
    previewOpener = null;
  });

  const renderScreenshots = project => {
    screenshots = (project.screenshots || []).filter(screenshot => screenshot.src);
    screenshotCount = screenshots.length;
    gallery.hidden = screenshotCount === 0;
    galleryControls.hidden = screenshotCount <= 1;
    galleryCounter.textContent = `${screenshotCount} screenshots`;
    galleryTrack.replaceChildren(...screenshots.map((screenshot, index) => {
      const slide = document.createElement('figure');
      slide.className = 'project-gallery-slide';
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-label', `${index + 1} of ${screenshotCount}`);
      const expand = document.createElement('button');
      expand.type = 'button';
      expand.className = 'project-gallery-expand';
      expand.setAttribute('aria-label', `Expand screenshot ${index + 1} of ${screenshotCount}: ${screenshot.alt || project.title}`);
      expand.setAttribute('aria-haspopup', 'dialog');
      expand.setAttribute('aria-controls', 'screenshot-preview');
      expand.addEventListener('click', () => openScreenshotPreview(index, expand));
      const screenshotImage = new Image();
      screenshotImage.loading = index < 2 ? 'eager' : 'lazy';
      screenshotImage.decoding = 'async';
      screenshotImage.alt = screenshot.alt || `${project.title} screenshot ${index + 1}`;
      screenshotImage.addEventListener('load', () => {
        // Each preview keeps its own proportions, including mixed portrait/landscape sets.
        if (!galleryTrack.contains(slide) || !screenshotImage.naturalHeight) return;
        slide.style.setProperty('--screenshot-ratio', screenshotImage.naturalWidth / screenshotImage.naturalHeight);
        updateGalleryControls();
      }, { once: true });
      screenshotImage.src = screenshot.src;
      screenshotImage.draggable = false;
      const expandIcon = document.createElement('span');
      expandIcon.className = 'project-gallery-expand-icon';
      expandIcon.setAttribute('aria-hidden', 'true');
      const expandSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      expandSvg.setAttribute('viewBox', '0 0 24 24');
      expandSvg.setAttribute('focusable', 'false');
      const expandPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      expandPath.setAttribute('d', 'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5');
      expandSvg.append(expandPath);
      expandIcon.append(expandSvg);
      expand.append(screenshotImage, expandIcon);
      slide.append(expand);
      return slide;
    }));
    updateGalleryControls();
  };

  const scrollScreenshots = left => {
    galleryTrack.scrollTo({
      left,
      behavior: reducedMotion.matches ? 'instant' : 'smooth'
    });
  };

  previousScreenshot.addEventListener('click', () => scrollScreenshots(galleryTrack.scrollLeft - galleryTrack.clientWidth * 0.85));
  nextScreenshot.addEventListener('click', () => scrollScreenshots(galleryTrack.scrollLeft + galleryTrack.clientWidth * 0.85));
  galleryTrack.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const targets = {
      ArrowLeft: galleryTrack.scrollLeft - galleryTrack.clientWidth * 0.85,
      ArrowRight: galleryTrack.scrollLeft + galleryTrack.clientWidth * 0.85,
      Home: 0,
      End: galleryTrack.scrollWidth
    };
    if (!(event.key in targets)) return;
    event.preventDefault();
    scrollScreenshots(targets[event.key]);
  });
  galleryTrack.addEventListener('scroll', updateGalleryControls, { passive: true });
  new ResizeObserver(() => {
    if (dialog.open && !gallery.hidden) updateGalleryControls();
  }).observe(galleryTrack);

  const cancelMotion = () => {
    motion?.cancel();
    motion = null;
    detailMotions.forEach(animation => animation.cancel());
    detailMotions = [];
    morphFace?.remove();
    morphFace = null;
    skeleton.hidden = true;
    opener?.classList.remove('is-project-source');
    dialog.classList.remove('is-animating');
  };

  const animateDialog = (keyframes, duration, easing, onFinish = () => {}) => {
    motion?.cancel();
    dialog.classList.add('is-animating');
    const animation = dialog.animate(keyframes, { duration, easing, fill: 'both' });
    motion = animation;
    animation.finished.then(() => {
      if (motion !== animation) return;
      cancelMotion();
      onFinish();
    }, () => {
      // Closing early or changing motion preferences can cancel an entrance.
    });
  };

  const getCardGeometry = (card = opener?.getBoundingClientRect()) => {
    const width = dialog.offsetWidth;
    const height = dialog.offsetHeight;
    if (!card?.width || !card.height || card.bottom <= 0 || card.top >= innerHeight ||
        card.right <= 0 || card.left >= innerWidth || !width || !height) return null;
    // Use the untransformed, centered dialog bounds, including during an interruption.
    return {
      width: card.width,
      height: card.height,
      scaleX: card.width / width,
      scaleY: card.height / height,
      x: card.left + card.width / 2 - dialog.offsetLeft - width / 2,
      y: card.top + card.height / 2 - dialog.offsetTop - height / 2
    };
  };

  const cardTransform = geometry => geometry
    ? `translate3d(${geometry.x}px, ${geometry.y}px, 0) scale(${geometry.scaleX}, ${geometry.scaleY})`
    : 'translate3d(0, 24px, 0) scale(0.94)';

  const createMorphFace = geometry => {
    if (!geometry || !opener?.isConnected) return;
    // Reuse the actual card artwork/title so the first and last frames match it.
    // The temporary face is inert and never duplicates IDs or live controls.
    const face = document.createElement('div');
    face.className = 'projects project-morph-face';
    face.inert = true;
    face.setAttribute('aria-hidden', 'true');
    const copy = opener.cloneNode(true);
    copy.classList.remove('is-project-source');
    ['id', 'href', 'aria-labelledby', 'aria-controls', 'aria-haspopup', 'data-project-modal'].forEach(name => copy.removeAttribute(name));
    copy.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
    copy.tabIndex = -1;
    face.style.width = `${geometry.width}px`;
    face.style.height = `${geometry.height}px`;
    face.style.transform = `scale(${1 / geometry.scaleX}, ${1 / geometry.scaleY})`;
    face.append(copy);
    dialog.append(face);
    morphFace = face;
    opener.classList.add('is-project-source');
  };

  const detailGroups = () => [
    { element: dialog.querySelector('.project-dialog-header'), delay: 260, from: 'translateY(-16px)' },
    { element: dialog.querySelector('.project-dialog-preview'), delay: 250, from: 'translateY(24px) rotate(-4deg) scale(0.94)' },
    { element: dialog.querySelector('.project-dialog-description'), delay: 290, from: 'translateX(24px)' },
    { element: gallery, delay: 310, from: 'translateY(24px)' },
    { element: dialog.querySelector('.project-dialog-features'), delay: 320, from: 'translateY(20px)' },
    { element: dialog.querySelector('.project-dialog-actions'), delay: 330, from: 'translateY(18px)' }
  ].filter(({ element }) => element && !element.hidden);

  const revealDetails = () => {
    detailGroups().forEach(({ element, delay, from }) => {
      detailMotions.push(element.animate([
        { opacity: 0, transform: from },
        { opacity: 1, transform: 'none' }
      ], { delay, duration: 240, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'both' }));
    });
    // Crossfade placeholders into the staged content without extending the morph.
    detailMotions.push(skeleton.animate([{ opacity: 1 }, { opacity: 0 }], {
      delay: 230, duration: 240, easing: 'ease-in-out', fill: 'both'
    }));
    if (morphFace) {
      detailMotions.push(morphFace.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 140, easing: 'ease-out', fill: 'both'
      }));
    }
  };

  const openProject = (project, trigger) => {
    if (dialog.open) return;
    clearTimeout(closeTimer);
    cancelMotion();
    dialog.classList.remove('is-closing');
    pressedBackdrop = false;
    const sourceRect = trigger.getBoundingClientRect();
    title.textContent = project.title;
    image.src = project.image;
    image.alt = project.imageAlt;
    description.replaceChildren(...project.description.split('\n\n').map(text => textElement('p', text)));
    features.replaceChildren(...project.features.map(text => textElement('li', text)));
    renderScreenshots(project);
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
    galleryTrack.scrollTo({ left: 0, behavior: 'instant' });
    content.scrollTop = 0;
    if (!reducedMotion.matches && typeof dialog.animate === 'function') {
      const geometry = getCardGeometry(sourceRect);
      skeleton.hidden = false;
      createMorphFace(geometry);
      animateDialog([
        { opacity: geometry ? 1 : 0, transform: cardTransform(geometry), easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
        { offset: 0.78, opacity: 1, transform: 'translate3d(0, 0, 0) scale(1.012)', easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
        { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' }
      ], openDuration, 'linear');
      revealDetails();
    }
  };

  const finishClose = () => {
    clearTimeout(closeTimer);
    cancelMotion();
    if (screenshotPreview.open) screenshotPreview.close();
    if (dialog.open) dialog.close();
  };
  const requestClose = () => {
    if (!dialog.open || dialog.classList.contains('is-closing')) return;
    if (reducedMotion.matches || typeof dialog.animate !== 'function') {
      finishClose();
      return;
    }
    // Start from the painted frame, including an unfinished entrance animation.
    const current = getComputedStyle(dialog);
    const start = { opacity: current.opacity, transform: current.transform };
    const faceOpacity = morphFace ? getComputedStyle(morphFace).opacity : '0';
    const skeletonOpacity = skeleton.hidden ? '0' : getComputedStyle(skeleton).opacity;
    const details = detailGroups().map(({ element }) => {
      const style = getComputedStyle(element);
      return { element, start: { opacity: style.opacity, transform: style.transform } };
    });
    const geometry = getCardGeometry();
    cancelMotion();
    dialog.classList.add('is-closing');
    skeleton.hidden = false;
    createMorphFace(geometry);
    animateDialog([
      start,
      { opacity: geometry ? 1 : 0, transform: cardTransform(geometry) }
    ], closeDuration, 'cubic-bezier(0.65, 0, 0.35, 1)', finishClose);
    details.forEach(({ element, start }, index) => {
      detailMotions.push(element.animate([start, { opacity: 0, transform: 'translateY(12px) scale(0.98)' }], {
        duration: 140, delay: Math.max(0, 4 - index) * 12, easing: 'ease-in', fill: 'both'
      }));
    });
    detailMotions.push(skeleton.animate([
      { opacity: skeletonOpacity },
      { offset: 0.35, opacity: 1 },
      { offset: 0.65, opacity: 1 },
      { opacity: 0 }
    ], { duration: closeDuration, easing: 'ease-in-out', fill: 'both' }));
    if (morphFace) {
      detailMotions.push(morphFace.animate([
        { opacity: faceOpacity },
        { offset: 0.52, opacity: faceOpacity },
        { opacity: 1 }
      ], { duration: closeDuration, easing: 'ease-in-out', fill: 'both' }));
    }
    // Also unlock the page if a browser suspends animation completion events.
    closeTimer = setTimeout(finishClose, closeDuration + 100);
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
  dialog.addEventListener('close', () => {
    clearTimeout(closeTimer);
    cancelMotion();
    if (screenshotPreview.open) screenshotPreview.close();
    dialog.classList.remove('is-closing');
    root.classList.remove('project-modal-open');
    opener?.focus({ preventScroll: true });
    if (position) window.scrollTo({ left: position.x, top: position.y, behavior: 'instant' });
    opener = null;
  });
  reducedMotion.addEventListener('change', event => {
    if (!event.matches) return;
    if (dialog.classList.contains('is-closing')) finishClose();
    else cancelMotion();
  });
})();
