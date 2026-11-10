// One theme preference and one set of icons for every portfolio page.
(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileView = window.matchMedia('(max-width: 768px)');
  let currentTheme = 'light';
  let requestedTheme = currentTheme;
  let themeTransition;
  let rippleCapture;
  let refraction;
  let displacementTexture;
  let neutralTransfer;
  const waterMapPadding = 1.15;

  const clearTransition = () => {
    themeTransition = null;
    rippleCapture?.remove();
    rippleCapture = null;
    refraction = null;
    root.classList.remove('theme-transitioning');
    ['--theme-origin-x', '--theme-origin-y', '--theme-radius', '--theme-water-filter'].forEach(property => root.style.removeProperty(property));
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

  const waterTexture = () => {
    // Mobile must never allocate/decode the displacement texture, even on idle.
    if (mobileView.matches || reducedMotion.matches) return null;
    if (displacementTexture !== undefined) return displacementTexture;
    displacementTexture = null;
    try {
      // A radial normal/displacement field, generated once and reused. Its red
      // and green channels bend the snapshot along each wave's surface slope.
      // Keep the animated texture small; smoothing its normals in the filter
      // avoids stair steps without resampling a large image every frame.
      const size = 512;
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const context = canvas.getContext('2d');
      if (!context) return null;
      const image = context.createImageData(size, size);
      const rings = [1, 0.67, 0.34];
      for (let py = 0; py < size; py++) {
        for (let px = 0; px < size; px++) {
          const nx = ((px + 0.5) / size * 2 - 1) * waterMapPadding;
          const ny = ((py + 0.5) / size * 2 - 1) * waterMapPadding;
          const distance = Math.hypot(nx, ny);
          let slope = 0;
          let coverage = 0;
          rings.forEach((radius, index) => {
            // Keep the optical disturbance near the crest, rather than bending
            // whole paragraphs between waves. Smooth tails return to neutral.
            const t = (distance - radius) / 0.04;
            if (Math.abs(t) < 3) {
              slope += -t * 1.8 * Math.exp(-t * t * 1.2) * (1 - index * 0.18);
              coverage = Math.max(coverage, Math.exp(-t * t * 0.6));
            }
          });
          const magnitude = Math.max(-1, Math.min(1, slope)) * 127;
          const offset = (py * size + px) * 4;
          image.data[offset] = Math.round(128 + (distance ? nx / distance : 0) * magnitude);
          image.data[offset + 1] = Math.round(128 + (distance ? ny / distance : 0) * magnitude);
          // The unused blue channel marks the crests for localized anti-aliasing.
          image.data[offset + 2] = Math.round(coverage * 255);
          image.data[offset + 3] = 255;
        }
      }
      context.putImageData(image, 0, 0);
      // Pre-filter once instead of blurring a full-viewport vector field on
      // every frame. Keep transparent edges over an exactly neutral backdrop.
      const smoothed = document.createElement('canvas');
      smoothed.width = smoothed.height = size;
      const smoothContext = smoothed.getContext('2d');
      if (smoothContext) {
        smoothContext.fillStyle = 'rgb(128, 128, 0)';
        smoothContext.fillRect(0, 0, size, size);
        smoothContext.filter = 'blur(0.4px)';
        smoothContext.drawImage(canvas, 0, 0);
      }
      displacementTexture = (smoothContext ? smoothed : canvas).toDataURL();
      const decodedTexture = new Image();
      decodedTexture.src = displacementTexture;
      decodedTexture.decode?.().catch(() => {});
    } catch {
      // The circular reveal and shaded waves still work without canvas support.
    }
    return displacementTexture;
  };

  const prepareRefraction = (x, y, radius) => {
    const texture = waterTexture();
    if (!texture) return;
    const reach = radius * 1.15 * waterMapPadding;
    // Keep the lens gentle enough that letterforms bend instead of folding
    // over themselves when a crest crosses smaller text.
    const strength = 14;
    // Use a consistent subpixel feather on thin borders at different display
    // densities; high-DPI screens need less smoothing in CSS pixels.
    const edgeSmoothing = Math.max(0.28, 0.65 / Math.max(1, window.devicePixelRatio || 1));
    const edgeKernel = amount => {
      const weight = Math.min(1, 2 * (edgeSmoothing * amount) ** 2);
      const corner = weight / 16;
      const side = weight / 8;
      return [corner, side, corner, side, 1 - weight * 0.75, side, corner, side, corner].join(' ');
    };
    const styles = getComputedStyle(root);
    const duration = styles.getPropertyValue('--theme-water-duration').trim() || '1800ms';
    const curve = styles.getPropertyValue('--theme-water-easing').match(/cubic-bezier\(([^)]+)\)/)?.[1].replace(/,/g, ' ') || '0 0 1 1';
    const animation = (attribute, values, extra = '') => `<animate attributeName="${attribute}" values="${values}" dur="${duration}" begin="indefinite" fill="freeze" calcMode="spline" ${extra}/>`;
    const travel = `keyTimes="0;1" keySplines="${curve}"`;
    const envelope = 'keyTimes="0;0.18;0.62;1" keySplines="0.35 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1"';
    // Correct the 8-bit midpoint and make transparent samples neutral without
    // introducing a displacement seam at fractional image bounds.
    neutralTransfer ||= Array.from({ length: 256 }, (_, index) =>
      (index < 16 ? 0.5 : (index - 1) / 254).toFixed(8)
    ).join(' ');
    refraction = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    refraction.classList.add('theme-water-filter');
    refraction.setAttribute('width', '0');
    refraction.setAttribute('height', '0');
    refraction.setAttribute('aria-hidden', 'true');
    refraction.innerHTML = `<defs>
      <filter id="theme-water-refraction" x="0" y="0" width="${innerWidth}" height="${innerHeight}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feImage href="${texture}" x="${x - waterMapPadding}" y="${y - waterMapPadding}" width="${waterMapPadding * 2}" height="${waterMapPadding * 2}" preserveAspectRatio="none" result="waves">
          ${animation('x', `${x - waterMapPadding};${x - reach}`, travel)}
          ${animation('y', `${y - waterMapPadding};${y - reach}`, travel)}
          ${animation('width', `${waterMapPadding * 2};${reach * 2}`, travel)}
          ${animation('height', `${waterMapPadding * 2};${reach * 2}`, travel)}
        </feImage>
        <feComponentTransfer in="waves" x="0" y="0" width="${innerWidth}" height="${innerHeight}" result="displacement">
          <feFuncR type="table" tableValues="${neutralTransfer}"/>
          <feFuncG type="table" tableValues="${neutralTransfer}"/>
          <feFuncB type="identity"/>
          <feFuncA type="linear" slope="0" intercept="1"/>
        </feComponentTransfer>
        <feColorMatrix in="displacement" type="matrix" values="
          0 0 0 0 0
          0 0 0 0 0
          0 0 0 0 0
          0 0 3 0 -0.3" result="crest-mask"/>
        <feComposite in="SourceGraphic" in2="crest-mask" operator="in" result="water-surface"/>
        <feDisplacementMap in="water-surface" in2="displacement" scale="0" xChannelSelector="R" yChannelSelector="G" result="refracted-water">
          ${animation('scale', `0;${strength};${strength * 0.64};0`, envelope)}
        </feDisplacementMap>
        <!-- Anti-alias the displaced contour, not just its vector field. Keep
             the untouched snapshot beneath it so thin borders/viewport edges
             never turn into transparent, pixel-stepped gaps. -->
        <!-- A single 3x3 pass replaces the two-pass animated Gaussian while
             preserving subpixel edge coverage and fading back to sharpness. -->
        <feConvolveMatrix in="refracted-water" order="3" kernelMatrix="${edgeKernel(0)}" divisor="1" targetX="1" targetY="1" edgeMode="duplicate" preserveAlpha="false" result="antialiased-water">
          ${animation('kernelMatrix', `${edgeKernel(0)};${edgeKernel(1)};${edgeKernel(0.8)};${edgeKernel(0)}`, envelope)}
        </feConvolveMatrix>
        <feMerge>
          <feMergeNode in="SourceGraphic"/>
          <feMergeNode in="antialiased-water"/>
        </feMerge>
      </filter>
    </defs>`;
    rippleCapture.append(refraction);
    root.style.setProperty('--theme-water-filter', 'url(#theme-water-refraction)');
  };

  const prepareRipple = (x, y, radius) => {
    // Keep the water's highlights/troughs separate from the theme snapshot, so
    // concentric waves can fade away after the new palette has filled the page.
    rippleCapture = document.createElement('div');
    rippleCapture.className = 'theme-ripple-capture';
    rippleCapture.setAttribute('aria-hidden', 'true');
    rippleCapture.inert = true;
    const reflection = document.createElement('div');
    reflection.className = 'theme-ripple-reflection';
    rippleCapture.append(reflection);
    document.body.append(rippleCapture);
    prepareRefraction(x, y, radius);
  };

  const toggleTheme = (button, event) => {
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
    const x = Math.max(0, Math.min(innerWidth, event.detail ? event.clientX : rect.left + rect.width / 2));
    const y = Math.max(0, Math.min(innerHeight, event.detail ? event.clientY : rect.top + rect.height / 2));
    const distance = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const radius = Math.ceil(distance) + 2;
    root.style.setProperty('--theme-origin-x', `${x}px`);
    root.style.setProperty('--theme-origin-y', `${y}px`);
    root.style.setProperty('--theme-radius', `${radius}px`);
    root.classList.add('theme-transitioning');
    if (!mobileView.matches) prepareRipple(x, y, radius);

    try {
      // Read the latest request: a skipped transition can still run its callback.
      const transition = document.startViewTransition(() => applyTheme(requestedTheme));
      themeTransition = transition;
      transition.ready.then(() => {
        if (themeTransition !== transition) return;
        if (refraction) {
          // Begin every primitive at exactly the same SVG time.
          refraction.pauseAnimations();
          refraction.setCurrentTime(0);
          refraction.querySelectorAll('animate').forEach(animation => animation.beginElement());
          refraction.unpauseAnimations();
        }
      }, () => {
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
  mobileView.addEventListener('change', () => {
    // Cancel snapshots captured for the old viewport, and release desktop data.
    cancelTransition();
    applyTheme(requestedTheme);
    if (mobileView.matches) displacementTexture = undefined;
  });

  const warmWater = event => {
    if (!mobileView.matches && !reducedMotion.matches && document.startViewTransition && event.target.closest('button.theme-toggle')) waterTexture();
  };
  document.addEventListener('pointerover', warmWater, { passive: true });
  document.addEventListener('focusin', warmWater);
  // Prepare/decode during idle time so the first press doesn't generate a map
  // while the view-transition snapshot is being captured.
  if (!mobileView.matches && window.requestIdleCallback) {
    requestIdleCallback(() => {
      if (!mobileView.matches && !reducedMotion.matches && document.startViewTransition) waterTexture();
    }, { timeout: 2000 });
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('button.theme-toggle');
    if (event.defaultPrevented || !button) return;
    toggleTheme(button, event);
  });
})();
