// Shared, dependency-free sakura decoration for the portfolio pages.
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const smallScreen = window.matchMedia('(max-width: 600px)');
  const storageKey = 'portfolio-sakura-hidden';
  let petalsHidden = false;
  let layer;
  let toggle;
  let motionFrame = 0;
  let previousFrame = 0;
  let lastScrollY = window.scrollY;
  let depthLayers = [];
  const breezeKeys = ['x', 'y', 'tilt'];
  const isPaused = () => petalsHidden || document.hidden ||
    window.frameElement?.classList.contains('page-return-preview') ||
    document.documentElement.classList.contains('project-modal-open') ||
    document.documentElement.classList.contains('page-closing');
  const breeze = { x: 0, y: 0, tilt: 0 };
  const targetBreeze = { x: 0, y: 0, tilt: 0 };

  try {
    // Carry over the previous off preference from the old pause control.
    petalsHidden = (localStorage.getItem(storageKey) ?? localStorage.getItem('portfolio-sakura-paused')) === 'true';
  } catch {
    // The effect and its control still work when storage is unavailable.
  }

  const random = (min, max) => min + Math.random() * (max - min);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const hasBreeze = () => breezeKeys.some(key =>
    Math.abs(breeze[key]) > 0.05 || Math.abs(targetBreeze[key]) > 0.05
  );

  const stopBreeze = () => {
    window.cancelAnimationFrame(motionFrame);
    motionFrame = 0;
    previousFrame = 0;
  };

  const animateBreeze = timestamp => {
    motionFrame = 0;
    if (!layer || isPaused()) return;

    // Time-based easing feels the same on high-refresh displays and mobile.
    const elapsed = previousFrame ? clamp(timestamp - previousFrame, 1, 48) : 16.67;
    previousFrame = timestamp;
    const follow = 1 - Math.exp(-elapsed / 65);
    const decay = Math.exp(-elapsed / 450);

    breezeKeys.forEach(key => {
      breeze[key] += (targetBreeze[key] - breeze[key]) * follow;
      targetBreeze[key] *= decay;
    });

    const moving = hasBreeze();
    if (!moving) {
      breezeKeys.forEach(key => {
        breeze[key] = 0;
        targetBreeze[key] = 0;
      });
      previousFrame = 0;
    }

    // Move three depth planes rather than invalidating inherited variables on
    // every petal and its descendants each frame. Falling/flutter stay in CSS.
    depthLayers.forEach(({ element, depth }) => {
      element.style.transform = `translate3d(${(breeze.x * depth).toFixed(2)}px, ${(breeze.y * depth).toFixed(2)}px, 0) rotate(${(breeze.tilt * depth).toFixed(2)}deg)`;
    });
    if (moving) motionFrame = window.requestAnimationFrame(animateBreeze);
  };

  const startBreeze = () => {
    if (!motionFrame && layer && !isPaused() && hasBreeze()) {
      motionFrame = window.requestAnimationFrame(animateBreeze);
    }
  };

  const reactToScroll = () => {
    const scrollY = window.scrollY;
    const delta = clamp(scrollY - lastScrollY, -160, 160);
    lastScrollY = scrollY;
    if (!layer || isPaused() || delta === 0) return;

    // Downward scrolling lifts petals; reversing direction reverses the gust.
    targetBreeze.y = clamp(targetBreeze.y - delta * 0.65, -190, 190);
    targetBreeze.x = clamp(targetBreeze.x + delta * 0.12, -42, 42);
    targetBreeze.tilt = clamp(targetBreeze.tilt + delta * 0.04, -12, 12);
    startBreeze();
  };

  const populatePetals = () => {
    if (!layer) return;
    const count = smallScreen.matches ? 12 : 26;
    const petals = document.createDocumentFragment();
    depthLayers = [0.55, 0.85, 1.15].map(depth => {
      const element = document.createElement('div');
      element.className = 'sakura-depth';
      petals.append(element);
      return { element, depth };
    });

    for (let index = 0; index < count; index += 1) {
      const fall = document.createElement('span');
      const sway = document.createElement('span');
      const petal = document.createElement('span');
      const duration = random(18, 32);
      const depth = random(0.45, 1.3);

      fall.className = 'sakura-fall';
      sway.className = 'sakura-sway';
      petal.className = 'sakura-petal';

      const properties = {
        '--petal-left': `${(index / count) * 105 - 5}%`,
        '--petal-size': `${((smallScreen.matches ? 22 : 30) * depth).toFixed(1)}px`,
        '--petal-opacity': random(0.78, 1).toFixed(2),
        '--petal-softness': depth < 0.65 ? '0.4px' : '0px',
        '--petal-drift': `${random(-80, 160).toFixed(0)}px`,
        '--petal-sway': `${random(16, 42).toFixed(0)}px`,
        '--petal-rotation': `${random(0, 360).toFixed(0)}deg`,
        '--fall-duration': `${duration.toFixed(2)}s`,
        '--fall-delay': `${(-random(0, duration)).toFixed(2)}s`,
        '--sway-duration': `${random(3, 6).toFixed(2)}s`,
        '--flutter-duration': `${random(6, 12).toFixed(2)}s`
      };

      Object.entries(properties).forEach(([name, value]) => fall.style.setProperty(name, value));
      sway.append(petal);
      fall.append(sway);
      const plane = depthLayers[depth < 0.7 ? 0 : depth < 1 ? 1 : 2];
      plane.element.append(fall);
    }

    layer.replaceChildren(petals);
    // A breakpoint change should not reset a gust in progress.
    depthLayers.forEach(({ element, depth }) => {
      element.style.transform = `translate3d(${breeze.x * depth}px, ${breeze.y * depth}px, 0) rotate(${breeze.tilt * depth}deg)`;
    });
  };

  const syncVisibility = () => {
    lastScrollY = window.scrollY;
    if (!layer) return;
    layer.hidden = petalsHidden;
    layer.classList.toggle('is-paused', isPaused());
    if (isPaused()) stopBreeze();
    else startBreeze();
    toggle.querySelector('span').textContent = petalsHidden ? 'Show petals' : 'Hide petals';
    toggle.setAttribute('aria-label', petalsHidden ? 'Show sakura petals' : 'Hide sakura petals');
    toggle.setAttribute('aria-pressed', String(!petalsHidden));
  };

  const syncMotion = () => {
    if (reducedMotion.matches) {
      stopBreeze();
      breezeKeys.forEach(key => {
        breeze[key] = 0;
        targetBreeze[key] = 0;
      });
      layer?.remove();
      toggle?.remove();
      layer = null;
      toggle = null;
      depthLayers = [];
      return;
    }

    if (layer) return;
    layer = document.createElement('div');
    layer.className = 'sakura-layer';
    layer.setAttribute('aria-hidden', 'true');

    toggle = document.createElement('button');
    toggle.className = 'sakura-toggle';
    toggle.type = 'button';
    toggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M12 9C5-2 0 9 8 12c-11 3-4 13 2 5-1 12 11 9 6 1 10 6 14-6 3-6C29 5 16-1 15 9Z"/><circle cx="13" cy="13" r="2"/></svg><span></span>';
    toggle.addEventListener('click', () => {
      petalsHidden = !petalsHidden;
      syncVisibility();
      try {
        localStorage.setItem(storageKey, String(petalsHidden));
      } catch {
        // Keep the in-memory preference for this page.
      }
    });

    populatePetals();
    syncVisibility();
    document.body.append(layer, toggle);
  };

  reducedMotion.addEventListener('change', syncMotion);
  smallScreen.addEventListener('change', populatePetals);
  document.addEventListener('visibilitychange', syncVisibility);
  new MutationObserver(syncVisibility).observe(document.documentElement, {
    attributes: true, attributeFilter: ['class']
  });
  window.addEventListener('scroll', reactToScroll, { passive: true });
  syncMotion();
})();
