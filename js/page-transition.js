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
    // A hidden return preview must not consume another top-level navigation's intent.
    if (!window.frameElement?.classList.contains('page-return-preview')) {
      incoming = JSON.parse(sessionStorage.getItem(KEY));
      sessionStorage.removeItem(KEY);
    }
  } catch {
    // Links still navigate normally when storage is unavailable.
  }

  const isReturnArrival = record => {
    if (record?.kind !== 'return') return false;
    try {
      const target = new URL(record.href);
      const current = new URL(location.href);
      target.searchParams.delete('returnToProjects');
      current.searchParams.delete('returnToProjects');
      return target.href === current.href;
    } catch {
      return false;
    }
  };
  let returnArrival = isReturnArrival(incoming);

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
  if (returnArrival) enableNativeNavigation();

  let outgoing;
  let arrivalPending = shouldExpand;
  let nativeTransition;
  let timer;
  let firstFrame;
  let secondFrame;
  let phase = 'waiting';
  let generation = 0;
  let closeOverlay;
  let returnPreview;
  let returnPreviewReady;
  let returnPreviewHref;
  let closeNavigation;
  const reset = (keepNavigationStyle = false, keepReturnPreview = false) => {
    generation++;
    clearTimeout(timer);
    window.cancelAnimationFrame(firstFrame);
    window.cancelAnimationFrame(secondFrame);
    root.classList.remove('page-expand-pending', 'page-expanding', 'page-closing', 'page-close-background-visible');
    closeOverlay?.remove();
    closeOverlay = null;
    delete root.dataset.pageTransitionMode;
    outgoing = null;
    arrivalPending = false;
    returnArrival = false;
    closeNavigation = null;
    if (!keepReturnPreview) {
      returnPreview?.remove();
      returnPreview = null;
      returnPreviewReady = null;
      returnPreviewHref = null;
    }
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

  // Prepare the homepage offscreen, then finish the collapse BEFORE history.back().
  // A cached homepage can be painted before pageshow; adding a closing copy after
  // that navigation caused the homepage -> project -> homepage flash.
  const warmReturn = href => {
    const url = new URL(href, window.location.href);
    if (url.origin !== location.origin ||
        !(url.pathname.endsWith('/') || url.pathname.endsWith('/index.html'))) return null;
    url.searchParams.set('returnToProjects', '1');
    if (returnPreviewHref === url.href) return returnPreviewReady;
    returnPreview?.remove();
    const frame = document.createElement('iframe');
    frame.className = 'page-return-preview';
    frame.title = 'Homepage transition preview';
    frame.setAttribute('aria-hidden', 'true');
    frame.tabIndex = -1;
    frame.inert = true;
    returnPreview = frame;
    returnPreviewHref = url.href;
    returnPreviewReady = new Promise(resolve => {
      frame.addEventListener('load', async () => {
        try {
          const home = frame.contentWindow;
          if (!home.document.querySelector('#projects')) {
            resolve(null);
            return;
          }
          home.PortfolioProjectNavigation?.restore();
          await home.document.fonts?.ready;
          const images = Array.from(home.document.images).filter(image => {
            const rect = image.getBoundingClientRect();
            return rect.bottom > 0 && rect.top < innerHeight;
          });
          await Promise.all(images.map(image => image.decode?.().catch(() => {})));
          requestAnimationFrame(() => requestAnimationFrame(() => resolve(frame)));
        } catch {
          resolve(null);
        }
      }, { once: true });
      frame.addEventListener('error', () => resolve(null), { once: true });
    });
    frame.src = url.href;
    document.body.append(frame);
    return returnPreviewReady;
  };
  const warmReturnLink = event => {
    if (navigator.connection?.saveData || reducedMotion.matches) return;
    if (!event.target.closest('a[data-project-return]')) return;
    try {
      const saved = JSON.parse(sessionStorage.getItem('portfolioProjectReturn'));
      warmReturn(saved?.url || new URL('index.html#projects', location.href).href);
    } catch {
      // The close handler can still use its normal navigation fallback.
    }
  };
  document.addEventListener('pointerover', warmReturnLink);
  document.addEventListener('focusin', warmReturnLink);

  window.PortfolioPageTransition = {
    async close(navigate, origin, href) {
      if (phase.startsWith('closing-')) return;
      if (reducedMotion.matches) {
        navigate();
        return;
      }
      nativeTransition?.skipTransition();
      reset(false, true);
      nativeTransition = null;
      phase = 'closing-preparation';
      closeNavigation = navigate;
      const activeGeneration = generation;
      let preparationTimer;
      const frame = await Promise.race([
        warmReturn(href),
        new Promise(resolve => { preparationTimer = setTimeout(() => resolve(null), 2000); })
      ]);
      clearTimeout(preparationTimer);
      if (generation !== activeGeneration) return;
      if (!frame || !document.querySelector('.pd-page')) {
        reset();
        navigate();
        return;
      }
      setOrigin(origin && Number.isFinite(origin.x) && Number.isFinite(origin.y)
        ? origin : { x: 0.5, y: 0.5, scale: 0.18 });
      root.classList.add('page-closing');
      const showHome = () => {
        frame.classList.add('is-visible');
        root.classList.add('page-close-background-visible');
      };
      let departed = false;
      const depart = () => {
        if (departed || generation !== activeGeneration) return;
        departed = true;
        clearTimeout(timer);
        phase = 'closing-departure';
        closeNavigation = null;
        // An unanimated cross-document handoff holds this finished homepage image
        // while a non-cached destination restores its layout before first paint.
        outgoing = { kind: 'return' };
        enableNativeNavigation();
        try {
          sessionStorage.setItem(KEY, JSON.stringify({ kind: 'return', href }));
        } catch {
          // Normal navigation remains available without storage.
        }
        // Keep the prepared homepage visible until the real one replaces it.
        navigate();
        timer = setTimeout(reset, 1500);
      };
      if (supportsNativeScale && document.startViewTransition) {
        root.dataset.pageTransitionMode = 'native-close';
        nativeTransition = document.startViewTransition(showHome);
        nativeTransition.types.add('page-collapse');
        observeTransition(nativeTransition);
        nativeTransition.finished.then(depart, depart);
        timer = setTimeout(depart, DURATION + 1000);
        return;
      }

      // Older browsers get a compositor-only copy, built in the source document
      // where its layout, scroll position, fonts and images are already settled.
      const page = document.querySelector('.pd-page');
      const overlay = document.createElement('div');
      overlay.className = 'page-close-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.inert = true;
      overlay.style.background = getComputedStyle(document.body).background;
      const preview = page.cloneNode(true);
      preview.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
      preview.querySelectorAll('script').forEach(element => element.remove());
      preview.style.position = 'absolute';
      preview.style.top = `${-scrollY}px`;
      preview.style.width = `${root.clientWidth}px`;
      overlay.append(preview);
      document.body.append(overlay);
      closeOverlay = overlay;
      firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => {
          if (generation !== activeGeneration) return;
          showHome();
          phase = 'closing-overlay';
          overlay.classList.add('is-closing');
          overlay.addEventListener('animationend', event => {
            if (event.target === overlay && event.animationName === 'pageCollapse') depart();
          });
          timer = setTimeout(depart, DURATION + 150);
        });
      });
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
      event.viewTransition.types.add(outgoing.kind === 'return' ? 'page-return' : 'page-expand');
    }
  });
  window.addEventListener('pagereveal', event => {
    observeTransition(event.viewTransition);
    if (returnArrival) {
      window.PortfolioProjectNavigation?.restore();
      if (event.viewTransition) {
        nativeTransition = event.viewTransition;
        const activeGeneration = generation;
        const finishReturn = () => {
          if (generation === activeGeneration) reset();
        };
        event.viewTransition.types?.add('page-return');
        event.viewTransition.finished.then(finishReturn, finishReturn);
      } else {
        reset();
      }
      return;
    }
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
    if (!shouldExpand) return;
    firstFrame = window.requestAnimationFrame(() => {
      if (!nativeTransition) startFallback();
    });
  }, { once: true });

  window.addEventListener('pagehide', () => reset(true));
  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    let returning = false;
    try {
      returning = isReturnArrival(JSON.parse(sessionStorage.getItem(KEY)));
      if (returning) sessionStorage.removeItem(KEY);
    } catch {
      // Browser Back still works when storage is unavailable.
    }
    reset(returning);
    returnArrival = returning;
    nativeTransition = null;
  });
  reducedMotion.addEventListener('change', event => {
    if (!event.matches) return;
    const navigate = closeNavigation;
    nativeTransition?.skipTransition();
    reset();
    navigate?.();
  });
})();
