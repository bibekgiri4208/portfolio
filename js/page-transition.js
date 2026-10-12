// Scale project pages in and out from the original click position, without curtains.
(() => {
  const KEY = 'pageTransition';
  const DURATION = 600;
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const supportsNativeScale = CSS.supports('selector(:active-view-transition-type(page-expand))');
  root.style.setProperty('--page-transition-duration', `${DURATION}ms`);
  let incoming;
  try {
    incoming = JSON.parse(sessionStorage.getItem(KEY));
    sessionStorage.removeItem(KEY);
  } catch {
    // Links still navigate normally when storage is unavailable.
  }

  const isCloseArrival = record => {
    if (record?.kind !== 'close' || typeof record.preview !== 'string') return false;
    try {
      const target = new URL(record.href);
      const current = new URL(window.location.href);
      target.searchParams.delete('returnToProjects');
      current.searchParams.delete('returnToProjects');
      return target.href === current.href;
    } catch {
      return false;
    }
  };
  const shouldClose = isCloseArrival(incoming) && !reducedMotion.matches;
  const shouldExpand = incoming?.kind !== 'close' && incoming?.href === window.location.href &&
    Number.isFinite(incoming.x) && Number.isFinite(incoming.y) && !reducedMotion.matches;
  const setOrigin = position => {
    root.style.setProperty('--page-origin-x', `${Math.round(Math.max(0, Math.min(1, position.x)) * window.innerWidth)}px`);
    root.style.setProperty('--page-origin-y', `${Math.round(Math.max(0, Math.min(1, position.y)) * window.innerHeight)}px`);
    root.style.setProperty('--page-start-scale', String(Number.isFinite(position.scale) ? position.scale : 0.18));
  };
  let navigationStyle;
  const enableNativeNavigation = () => {
    if (!supportsNativeScale || reducedMotion.matches || navigationStyle) return;
    navigationStyle = document.createElement('style');
    navigationStyle.textContent = '@view-transition { navigation: auto; }';
    document.head.append(navigationStyle);
    // Make the opt-in visible to the browser before the link's default navigation starts.
    void root.offsetWidth;
  };
  if (shouldExpand) {
    enableNativeNavigation();
    setOrigin(incoming);
    root.classList.add('page-expand-pending');
  }

  let outgoing;
  let arrivalPending = shouldExpand;
  let nativeTransition;
  let timer;
  let firstFrame;
  let secondFrame;
  let phase = 'waiting';
  let generation = 0;
  let closeOverlay;
  const reset = (keepNavigationStyle = false) => {
    generation++;
    clearTimeout(timer);
    window.cancelAnimationFrame(firstFrame);
    window.cancelAnimationFrame(secondFrame);
    root.classList.remove('page-expand-pending', 'page-expanding', 'page-closing');
    closeOverlay?.remove();
    closeOverlay = null;
    delete root.dataset.pageTransitionMode;
    outgoing = null;
    arrivalPending = false;
    phase = 'done';
    if (!keepNavigationStyle && navigationStyle) {
      navigationStyle.remove();
      navigationStyle = null;
      // Commit opt-out before a Back/demo link can start another navigation.
      void root.offsetWidth;
    }
  };

  const startFallback = async () => {
    if (phase === 'preparing' || phase === 'fallback' || phase === 'done') return;
    if (reducedMotion.matches) {
      reset();
      return;
    }
    phase = 'preparing';
    root.classList.add('page-expand-pending');
    const activeGeneration = generation;
    if (document.readyState === 'loading') {
      await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }));
    }

    // Avoid font/image changes halfway through the zoom, without waiting indefinitely.
    const preview = document.querySelector('.pd-preview img');
    let assetTimer;
    await Promise.race([
      Promise.all([
        (document.fonts?.ready || Promise.resolve()).catch(() => {}),
        preview?.decode ? preview.decode().catch(() => {}) : Promise.resolve()
      ]),
      new Promise(resolve => { assetTimer = setTimeout(resolve, 1000); })
    ]);
    clearTimeout(assetTimer);
    if (generation !== activeGeneration) return;
    if (reducedMotion.matches) {
      reset();
      return;
    }
    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        if (generation !== activeGeneration || phase !== 'preparing') return;
        root.classList.remove('page-expand-pending');
        root.classList.add('page-expanding');
        root.dataset.pageTransitionMode = 'fallback';
        phase = 'fallback';
        // animationend normally cleans up; this also handles a backgrounded tab.
        timer = setTimeout(reset, DURATION + 150);
      });
    });
  };

  document.addEventListener('animationend', event => {
    if (phase === 'fallback' && event.target === document.body && event.animationName === 'pageExpand') reset();
  });

  // Warm the next page while the visitor hovers/focuses a project, especially its preview.
  const warmedAssets = new Set();
  const warmProject = event => {
    if (navigator.connection?.saveData || reducedMotion.matches) return;
    const link = event.target.closest('a[data-page-transition]');
    if (!link || new URL(link.href).pathname !== new URL('project_description.html', window.location.href).pathname) return;
    const assets = [
      [link.href, 'document'],
      [new URL('css/project_description.css', window.location.href).href, 'style'],
      [new URL('js/project-description.js', window.location.href).href, 'script']
    ];
    if (link.dataset.projectPreview) {
      assets.push([new URL(link.dataset.projectPreview, window.location.href).href, 'image']);
    }
    assets.forEach(([href, as]) => {
      if (warmedAssets.has(href)) return;
      warmedAssets.add(href);
      const preload = document.createElement('link');
      preload.rel = as === 'image' ? 'preload' : 'prefetch';
      preload.as = as;
      preload.href = href;
      document.head.append(preload);
    });
  };
  document.addEventListener('pointerover', warmProject);
  document.addEventListener('focusin', warmProject);
  document.addEventListener('pointerdown', warmProject);

  document.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
        (link.target && link.target !== '_self') || link.hasAttribute('download') ||
        reducedMotion.matches) return;

    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin ||
        (url.pathname === window.location.pathname && url.search === window.location.search)) return;

    if (!link.hasAttribute('data-page-transition')) {
      if (link.hasAttribute('data-project-return')) return;
      // Back/demo links must not inherit a still-running entrance transition.
      nativeTransition?.skipTransition();
      reset();
      return;
    }

    const rect = (link.querySelector('.project-link') || link).getBoundingClientRect();
    // Do not let completion of an earlier entrance clear the next navigation's intent.
    nativeTransition?.skipTransition();
    reset();
    nativeTransition = null;
    phase = 'waiting';
    outgoing = {
      href: url.href,
      x: (event.detail ? event.clientX : rect.left + rect.width / 2) / window.innerWidth,
      y: (event.detail ? event.clientY : rect.top + rect.height / 2) / window.innerHeight,
      scale: Math.max(0.14, Math.min(0.28, rect.width / window.innerWidth))
    };
    setOrigin(outgoing);
    enableNativeNavigation();
    try {
      sessionStorage.setItem(KEY, JSON.stringify(outgoing));
    } catch {
      // Do not intercept the link or delay navigation.
    }
  });

  // Cross-document View Transitions keep the homepage visible behind the expanding page.
  const observeTransition = transition => {
    if (!transition) return;
    // All three promises can reject if navigation, opt-in, or motion preference changes.
    transition.ready.catch(() => {});
    transition.updateCallbackDone.catch(() => {});
    transition.finished.catch(() => {});
  };

  // Return first, then shrink a frozen copy above the restored homepage.
  // Neither document is faded to an empty background during the handoff.
  const startClose = async record => {
    if (reducedMotion.matches || !isCloseArrival(record)) return;
    const activeGeneration = generation;
    phase = 'closing-arrival';
    setOrigin(record);
    root.classList.add('page-closing');
    if (document.readyState === 'loading') {
      await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }));
    }
    if (generation !== activeGeneration) return;
    const overlay = document.createElement('div');
    overlay.className = 'page-close-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.inert = true;
    overlay.style.background = record.background;
    const template = document.createElement('template');
    template.innerHTML = record.preview;
    const preview = template.content.querySelector('.pd-page');
    if (!preview) {
      reset();
      return;
    }
    // The copy is visual only; avoid duplicate IDs and script execution.
    preview.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
    preview.querySelectorAll('script').forEach(element => element.remove());
    preview.style.position = 'absolute';
    preview.style.top = `${-record.scrollY}px`;
    preview.style.left = '0';
    preview.style.width = '100%';
    overlay.append(preview);
    document.body.append(overlay);
    closeOverlay = overlay;

    // Decode only visible images, including neighbors when closing a scrolled page.
    // Keep fonts and image rasterization from changing the copy midway through zoom.
    const images = Array.from(preview.querySelectorAll('img')).filter(image => {
      const rect = image.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
    });
    images.forEach(image => { image.loading = 'eager'; });
    let assetTimer;
    await Promise.race([
      Promise.all([
        (document.fonts?.ready || Promise.resolve()).catch(() => {}),
        ...images.map(image => image.decode ? image.decode().catch(() => {}) : Promise.resolve())
      ]),
      new Promise(resolve => { assetTimer = setTimeout(resolve, 1000); })
    ]);
    clearTimeout(assetTimer);
    if (document.readyState !== 'complete') {
      await new Promise(resolve => window.addEventListener('load', resolve, { once: true }));
    }
    if (generation !== activeGeneration) return;
    firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        if (generation !== activeGeneration) return;
        // The homepage restoration has completed; it stays visible under the copy.
        root.dataset.pageTransitionMode = 'close-overlay';
        overlay.classList.add('is-closing');
        phase = 'closing-overlay';
        overlay.addEventListener('animationend', event => {
          if (event.target === overlay && event.animationName === 'pageCollapse') reset();
        }, { once: true });
        timer = setTimeout(reset, DURATION + 150);
      });
    });
  };

  window.PortfolioPageTransition = {
    close(navigate, origin, href) {
      if (phase === 'closing-departure') return;
      if (reducedMotion.matches) {
        navigate();
        return;
      }
      nativeTransition?.skipTransition();
      // Keep the document opted in until any arriving snapshot has been released.
      reset(true);
      nativeTransition = null;
      const position = origin && Number.isFinite(origin.x) && Number.isFinite(origin.y)
        ? origin : { x: 0.5, y: 0.5, scale: 0.18 };
      try {
        const preview = document.querySelector('.pd-page');
        if (preview) {
          sessionStorage.setItem(KEY, JSON.stringify({
            ...position,
            kind: 'close',
            href,
            preview: preview.outerHTML,
            scrollY: window.scrollY,
            background: getComputedStyle(document.body).background
          }));
        }
      } catch {
        // If storage is unavailable, return normally rather than fade to a blank screen.
      }
      phase = 'closing-departure';
      navigate();
      timer = setTimeout(reset, 1500);
    }
  };
  window.addEventListener('pageswap', event => {
    observeTransition(event.viewTransition);
    if (!outgoing || reducedMotion.matches || !supportsNativeScale) {
      // Browser-toolbar Back can happen before the current entrance has finished.
      event.viewTransition?.skipTransition();
      return;
    }
    if (event.viewTransition?.types) {
      event.viewTransition.types.add('page-expand');
    }
  });
  window.addEventListener('pagereveal', event => {
    observeTransition(event.viewTransition);
    if (!event.viewTransition || !arrivalPending || reducedMotion.matches) return;
    arrivalPending = false;
    nativeTransition = event.viewTransition;
    if (!supportsNativeScale || !nativeTransition.types) {
      nativeTransition.skipTransition();
      startFallback();
      return;
    }
    phase = 'native-pending';
    root.classList.remove('page-expand-pending');
    root.classList.add('page-expanding');
    root.dataset.pageTransitionMode = 'native';
    nativeTransition.types.add('page-expand');
    const activeGeneration = generation;
    nativeTransition.ready.then(() => {
      if (generation !== activeGeneration) return;
      const animation = getComputedStyle(root, '::view-transition-new(root)').animationName;
      if (animation !== 'pageExpand') {
        nativeTransition.skipTransition();
        startFallback();
      } else {
        phase = 'native';
      }
    }, () => {
      if (generation === activeGeneration) startFallback();
    });
    // A rejected/skipped native transition must not cancel the fallback that replaces it.
    nativeTransition.finished.then(() => {
      if (phase === 'native') reset();
    }, () => {
      if (generation === activeGeneration) startFallback();
    });
  });

  // Browsers without cross-document transitions get the same click-origin scale entrance.
  document.addEventListener('DOMContentLoaded', () => {
    if (shouldClose) {
      startClose(incoming);
      return;
    }
    if (!shouldExpand) return;
    firstFrame = window.requestAnimationFrame(() => {
      if (!nativeTransition) startFallback();
    });
  }, { once: true });

  window.addEventListener('pagehide', () => reset(true));
  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    reset();
    try {
      const record = JSON.parse(sessionStorage.getItem(KEY));
      if (isCloseArrival(record)) {
        sessionStorage.removeItem(KEY);
        startClose(record);
      }
    } catch {
      // Browser Back still works when storage is unavailable.
    }
  });
  reducedMotion.addEventListener('change', event => {
    if (!event.matches) return;
    nativeTransition?.skipTransition();
    reset();
  });
})();
