// Shared, dependency-free sakura decoration for the portfolio pages.
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileView = window.matchMedia('(max-width: 768px), (hover: none) and (pointer: coarse)');
  const storageKey = 'portfolio-sakura-hidden';
  let petalsHidden = false;
  let layer;
  let toggle;
  let hideTimer;
  let motionFrame = 0;
  let previousFrame = 0;
  let lastScrollY = window.scrollY;
  let depthLayers = [];
  let waterPetals = [];
  let waterSession;
  const spriteBase = new URL('../assets/img/', document.currentScript.src);
  const waterSprites = new Map();
  const warmWaterSprites = () => {
    if (mobileView.matches || reducedMotion.matches || waterSprites.size) return;
    ['sakura-petal.svg', 'sakura-petal-curled.svg', 'sakura-petal-side.svg'].forEach(file => {
      const image = new Image();
      const sprite = { image, sharp: null };
      waterSprites.set(file, sprite);
      image.onload = () => {
        const sharp = document.createElement('canvas');
        sharp.width = sharp.height = 64;
        const sharpContext = sharp.getContext('2d');
        if (sharpContext) {
          sharpContext.drawImage(image, 0, 0, 64, 64);
          sprite.sharp = sharp;
        }
      };
      image.src = new URL(file, spriteBase).href;
    });
  };
  const breezeKeys = ['x', 'y', 'tilt'];
  const isPaused = () => layer?.hidden || document.hidden ||
    window.frameElement?.classList.contains('page-return-preview') ||
    document.documentElement.classList.contains('project-modal-open') ||
    document.documentElement.classList.contains('theme-transitioning') ||
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
    warmWaterSprites();
    waterSession?.finish();
    waterPetals = [];
    const count = 26;
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
      const water = document.createElement('span');
      const petal = document.createElement('span');
      const duration = random(18, 32);
      const depth = random(0.45, 1.3);

      fall.className = 'sakura-fall';
      sway.className = 'sakura-sway';
      water.className = 'sakura-water';
      petal.className = 'sakura-petal';

      const properties = {
        '--petal-left': `${(index / count) * 105 - 5}%`,
        '--petal-size': `${(30 * depth).toFixed(1)}px`,
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
      water.append(sway);
      fall.append(water);
      const plane = depthLayers[depth < 0.7 ? 0 : depth < 1 ? 1 : 2];
      plane.element.append(fall);
      const record = { fall, water, sway, petal, duration: Number(duration.toFixed(2)) * 1000, depth, x: 0, y: 0, angle: 0 };
      waterPetals.push(record);
      fall.addEventListener('animationiteration', event => {
        if (event.animationName !== 'sakura-fall' || waterSession) return;
        // A petal is transparent as it recycles: reset accumulated water drift here.
        record.x = record.y = record.angle = 0;
        water.style.transform = '';
      });
    }

    layer.replaceChildren(petals);
    // A breakpoint change should not reset a gust in progress.
    depthLayers.forEach(({ element, depth }) => {
      element.style.transform = `translate3d(${breeze.x * depth}px, ${breeze.y * depth}px, 0) rotate(${breeze.tilt * depth}deg)`;
    });
  };

  const smoothStep = (from, to, value) => {
    const t = clamp((value - from) / (to - from), 0, 1);
    return t * t * (3 - 2 * t);
  };

  const colorAlpha = color => {
    const channels = color.match(/[\d.]+/g) || [];
    return channels.length === 4 ? Number(channels[3]) : channels.length === 3 ? 1 : 0;
  };

  const glassGradient = image => {
    if (!image.startsWith('linear-gradient(')) return null;
    const angle = Number(image.match(/^linear-gradient\(([-\d.]+)deg/)?.[1] ?? 180) * Math.PI / 180;
    // Computed gradients retain implicit first/last positions in some browsers.
    const stops = [...image.matchAll(/(rgba?\([^)]*\)|transparent)(?:\s+([\d.]+)%)?/g)]
      .map((match, index, matches) => ({ alpha: colorAlpha(match[1]), position: match[2] === undefined ? index / Math.max(1, matches.length - 1) : Number(match[2]) / 100 }));
    return stops.length ? { x: Math.sin(angle), y: -Math.cos(angle), stops } : null;
  };

  const glassAlphaAt = (cover, x, y) => {
    let transmission = 1 - cover.alpha;
    const gradient = cover.gradient;
    if (gradient) {
      const { rect } = cover;
      const length = Math.abs(rect.width * gradient.x) + Math.abs(rect.height * gradient.y);
      const t = clamp(0.5 + ((x - rect.x - rect.width / 2) * gradient.x + (y - rect.y - rect.height / 2) * gradient.y) / Math.max(1, length), 0, 1);
      const after = gradient.stops.findIndex(stop => stop.position >= t);
      const b = gradient.stops[after < 0 ? gradient.stops.length - 1 : after];
      const a = gradient.stops[Math.max(0, after - 1)];
      const mix = clamp((t - a.position) / Math.max(0.0001, b.position - a.position), 0, 1);
      transmission *= 1 - (a.alpha + (b.alpha - a.alpha) * mix);
    }
    return 1 - transmission;
  };

  const glassInfluence = ({ rect, radius }, x, y) => {
    const dx = Math.abs(x - rect.x - rect.width / 2) - (rect.width / 2 - radius);
    const dy = Math.abs(y - rect.y - rect.height / 2) - (rect.height / 2 - radius);
    const distance = Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0) - radius;
    return smoothStep(-10, 10, -distance);
  };

  const waterOccluders = () => [...document.querySelectorAll(
    '.hero-content, .profile-image-wrapper, .profile-badge, .hero-eyebrow, .stat-item, .stat-card, .about-text, .skill-card, .project-card, .contact-content, .contact-form, .navbar .container, .secondary-btn, .hero .primary-btn, .theme-toggle, .sakura-toggle, .pd-preview, .pd-sidebar, .pd-feature-list li, .pd-neighbor, .profile-image-wrapper img, .project-thumb img, .pd-preview-image img, .pd-neighbor img'
  )].map(element => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const filter = style.backdropFilter || style.webkitBackdropFilter || '';
    const saturation = filter.match(/saturate\(([\d.]+)(%)?\)/);
    return {
      rect,
      alpha: element.matches('img') ? 1 : colorAlpha(style.backgroundColor),
      gradient: element.matches('img') ? null : glassGradient(style.backgroundImage),
      radius: Math.min(parseFloat(style.borderTopLeftRadius) || 0, rect.width / 2, rect.height / 2),
      blur: Number(filter.match(/blur\(([\d.]+)px\)/)?.[1] || 0),
      saturation: saturation ? Number(saturation[1]) * (saturation[2] ? 1 : 100) : 100
    };
  }).filter(({ rect }) => rect.width && rect.height && rect.bottom > 0 && rect.top < innerHeight);

  const waterStamp = (sprite, shape, size, softness, blur, saturation, pixelRatio) => {
    // Blur in screen pixels AFTER projecting the flutter. Scaling a generic
    // blurred SVG shrinks its blur too, making petals look sharp through glass.
    const extent = Math.ceil(size * Math.max(Math.abs(shape.a) + Math.abs(shape.c), Math.abs(shape.b) + Math.abs(shape.d)) + 8 + softness * 6);
    const sharp = document.createElement('canvas');
    sharp.width = sharp.height = Math.ceil(extent * pixelRatio);
    const sharpContext = sharp.getContext('2d');
    if (!sharpContext) return null;
    sharpContext.setTransform(pixelRatio * shape.a, pixelRatio * shape.b, pixelRatio * shape.c, pixelRatio * shape.d, sharp.width / 2, sharp.height / 2);
    sharpContext.filter = `blur(${softness * pixelRatio}px)`;
    sharpContext.drawImage(sprite.sharp || sprite.image, -size / 2, -size / 2, size, size);
    const soft = document.createElement('canvas');
    const padding = Math.ceil(blur * 3 * pixelRatio);
    soft.width = soft.height = sharp.width + padding * 2;
    const softContext = soft.getContext('2d');
    if (!softContext) return null;
    softContext.filter = `blur(${blur * pixelRatio}px) saturate(${saturation}%)`;
    softContext.drawImage(sharp, padding, padding);
    return { sharp, soft, blur };
  };

  const prepareWater = options => {
    if (!layer || layer.hidden || petalsHidden || document.hidden || reducedMotion.matches || mobileView.matches ||
        !CSS.supports('selector(::view-transition-group(.sakura-ripple))')) return null;
    waterSession?.finish();
    warmWaterSprites();
    if ([...waterSprites.values()].some(({ image }) => !image.complete || !image.naturalWidth)) return null;
    stopBreeze();
    // Freeze before measuring, not in the later class observer: a capture frame
    // must not advance the fall after we save its handoff position and time.
    layer.classList.add('is-paused');
    layer.getAnimations({ subtree: true }).forEach(animation => {
      if (['sakura-fall', 'sakura-sway', 'sakura-flutter'].includes(animation.animationName)) {
        // Resolve a pending CSS pause now; snapshot preparation can otherwise
        // move its hold time to the next frame, after positions were measured.
        animation.currentTime = Number(animation.currentTime || 0);
      }
    });
    const oldOccluders = waterOccluders();
    const glassBlur = Math.max(1, ...oldOccluders.map(cover => cover.blur));
    const glassSaturation = Math.max(100, ...oldOccluders.map(cover => cover.saturation));
    const pixelRatio = Math.min(devicePixelRatio || 1, 1.5);
    const count = Math.max(60, Math.ceil(options.duration / 12));
    const seconds = options.duration / 1000;
    const entries = waterPetals.map((record, index) => {
      const rect = record.water.getBoundingClientRect();
      const fallAnimation = record.fall.getAnimations().find(animation => animation.animationName === 'sakura-fall');
      if (!fallAnimation || rect.bottom < -40 || rect.top > innerHeight + 40 || rect.right < -40 || rect.left > innerWidth + 40) return null;
      const progress = fallAnimation.effect.getComputedTiming().progress || 0;
      const fallStyle = getComputedStyle(record.fall);
      const petalStyle = getComputedStyle(record.petal);
      const alpha = Number(fallStyle.opacity);
      if (alpha < 0.015) return null;
      const transform = getComputedStyle(record.fall.parentElement).transform;
      const plane = new DOMMatrixReadOnly(transform === 'none' ? undefined : transform);
      const vx = parseFloat(fallStyle.getPropertyValue('--petal-drift')) / (record.duration / 1000);
      const vy = (innerHeight + 64) / (record.duration / 1000);
      const fallX = plane.a * vx + plane.c * vy;
      const fallY = plane.b * vx + plane.d * vy;
      const center = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
      const file = petalStyle.backgroundImage.match(/sakura-petal(?:-curled|-side)?\.svg/)?.[0];
      const sprite = waterSprites.get(file);
      if (!sprite) return null;
      const petalRect = record.petal.getBoundingClientRect();
      const matrix = value => new DOMMatrixReadOnly(value === 'none' ? undefined : value);
      const shape = plane.multiply(matrix(getComputedStyle(record.water).transform))
        .multiply(matrix(getComputedStyle(record.sway).transform)).multiply(matrix(petalStyle.transform));
      const size = parseFloat(fallStyle.width);
      const stamp = waterStamp(sprite, shape, size, Number(petalStyle.filter.match(/blur\(([\d.]+)px\)/)?.[1] || 0), glassBlur, glassSaturation, pixelRatio);
      if (!stamp) return null;
      let dx = 0, dy = 0, velocityX = 0, velocityY = 0, angle = 0, spin = 0;
      const poses = [];
      const dt = seconds / count;
      for (let frame = 0; frame <= count; frame++) {
        const t = frame / count;
        const elapsed = t * seconds;
        const outer = options.radius * options.reach * t;
        const px = center.x + fallX * elapsed + dx;
        const py = center.y + fallY * elapsed + dy;
        const distance = Math.max(1, Math.hypot(px - options.x, py - options.y));
        const nx = (px - options.x) / distance;
        const ny = (py - options.y) / distance;
        const envelope = t < 0.216 ? smoothStep(0, 0.216, t)
          : t < 0.744 ? 1 - 0.36 * smoothStep(0.216, 0.744, t)
          : 0.64 * (1 - smoothStep(0.744, 1, t));
        let force = 0;
        let bob = 0;
        options.rings.forEach((radius, ring) => {
          const phase = (outer * radius - distance) / Math.max(12, outer * options.width);
          const pulse = Math.exp(-phase * phase * 0.85) * (1 - ring * 0.18) * envelope;
          force += pulse * options.strength * 8 * record.depth;
          bob += Math.sin(phase * 1.3) * pulse * 4 * record.depth;
        });
        if (frame) {
          const follow = 1 - Math.exp(-dt / 0.085);
          const swirl = (index % 2 ? 1 : -1) * 0.13;
          velocityX += (force * (nx - ny * swirl) - velocityX) * follow;
          velocityY += (force * (ny + nx * swirl) - velocityY) * follow;
          spin += (force * (index % 2 ? 0.13 : -0.13) - spin) * follow;
          dx += velocityX * dt;
          dy += velocityY * dt;
          angle += spin * dt;
        }
        poses.push({ t, dx: fallX * elapsed + dx, dy: fallY * elapsed + dy + bob, waterX: dx, waterY: dy + bob, angle });
      }
      return { record, center, stamp,
        offsetX: petalRect.x + petalRect.width / 2 - center.x,
        offsetY: petalRect.y + petalRect.height / 2 - center.y,
        peakAlpha: parseFloat(fallStyle.getPropertyValue('--petal-opacity')),
        poses, progress, alpha, plane, fallAnimation, initialTime: Number(fallAnimation.currentTime || 0) };
    }).filter(Boolean);
    if (!entries.length) return null;
    // One live canvas snapshot replaces dozens of independently animated view-
    // transition groups. Only drawing/interpolation runs per frame, not physics,
    // DOM style updates or live blur filters.
    const surface = document.createElement('canvas');
    surface.className = 'sakura-water-surface';
    surface.setAttribute('aria-hidden', 'true');
    surface.width = Math.ceil(innerWidth * pixelRatio);
    surface.height = Math.ceil(innerHeight * pixelRatio);
    const context = surface.getContext('2d');
    if (!context) return null;
    let finished = false;
    let started = false;
    let motion;
    let drawFrame = 0;
    const paint = (elapsed, occluders) => {
      const position = clamp(elapsed / options.duration, 0, 1) * count;
      const first = Math.floor(position);
      const second = Math.min(count, first + 1);
      const mix = position - first;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, innerWidth, innerHeight);
      entries.forEach(entry => {
        const { center, poses, stamp, offsetX, offsetY } = entry;
        const a = poses[first], b = poses[second];
        const lerp = key => a[key] + (b[key] - a[key]) * mix;
        const x = center.x + lerp('dx'), y = center.y + lerp('dy');
        const angle = lerp('angle') * Math.PI / 180;
        const petalX = x + offsetX * Math.cos(angle) - offsetY * Math.sin(angle);
        const petalY = y + offsetX * Math.sin(angle) + offsetY * Math.cos(angle);
        let opacity, blur;
        if (occluders) {
          // The old palette is painted once before capture. Animated appearance
          // is precomputed after the new palette is applied.
          opacity = entry.alpha;
          blur = 0;
          occluders.forEach(cover => {
            const influence = glassInfluence(cover, petalX, petalY);
            opacity *= 1 - glassAlphaAt(cover, petalX, petalY) * influence;
            blur = Math.max(blur, cover.blur * influence);
          });
        } else {
          opacity = lerp('opacity');
          blur = lerp('blur');
        }
        if (opacity < 0.005 || x < -80 || x > innerWidth + 80 || y < -80 || y > innerHeight + 80) return;
        context.save();
        context.translate(x, y);
        context.rotate(angle);
        context.translate(offsetX, offsetY);
        const soft = clamp(blur / stamp.blur, 0, 1);
        context.globalAlpha = opacity * (1 - soft);
        const sharpExtent = stamp.sharp.width / pixelRatio;
        if (soft < 1) context.drawImage(stamp.sharp, -sharpExtent / 2, -sharpExtent / 2, sharpExtent, sharpExtent);
        if (soft > 0) {
          context.globalAlpha = opacity * soft;
          const extent = stamp.soft.width / pixelRatio;
          context.drawImage(stamp.soft, -extent / 2, -extent / 2, extent, extent);
        }
        context.restore();
      });
    };
    paint(0, oldOccluders);
    document.body.append(surface);
    layer.classList.add('is-water-captured');
    const session = {
      start() {
        if (finished || started) return;
        started = true;
        const occluders = waterOccluders();
        entries.forEach(entry => {
          const { record, center, offsetX, offsetY, poses, progress, alpha, peakAlpha } = entry;
          poses.forEach(pose => {
            const p = progress + pose.t * options.duration / record.duration;
            const fallAlpha = p >= 1 ? 0 : peakAlpha * Math.min(1, p / 0.08, (1 - p) / 0.12);
            let opacity = Math.min(alpha, fallAlpha);
            let blur = 0;
            const angle = pose.angle * Math.PI / 180;
            const x = center.x + pose.dx + offsetX * Math.cos(angle) - offsetY * Math.sin(angle);
            const y = center.y + pose.dy + offsetX * Math.sin(angle) + offsetY * Math.cos(angle);
            const newPalette = smoothStep(-12, 12, options.radius * options.reach * pose.t - Math.hypot(x - options.x, y - options.y));
            occluders.forEach((cover, index) => {
              const newAlpha = glassAlphaAt(cover, x, y);
              const oldAlpha = oldOccluders[index] ? glassAlphaAt(oldOccluders[index], x, y) : newAlpha;
              const coverAlpha = oldAlpha + (newAlpha - oldAlpha) * newPalette;
              const influence = glassInfluence(cover, x, y);
              opacity *= 1 - coverAlpha * influence;
              blur = Math.max(blur, cover.blur * influence);
            });
            pose.opacity = opacity;
            pose.blur = blur;
          });
        });
        try {
          motion = document.documentElement.animate([{ opacity: 1 }, { opacity: 1 }], {
            duration: options.duration, fill: 'both', pseudoElement: '::view-transition-group(sakura-surface)'
          });
        } catch {
          // A browser may support named snapshots but not pseudo-element clocks.
          session.finish();
          return;
        }
        motion.startTime = document.getAnimations().find(animation => animation.animationName === 'themeReveal')?.startTime ?? document.timeline.currentTime;
        motion.finished.catch(() => {});
        const draw = () => {
          if (finished) return;
          paint(Number(motion.currentTime || 0));
          if (motion.playState !== 'finished') drawFrame = requestAnimationFrame(draw);
        };
        draw();
      },
      finish() {
        if (finished) return;
        finished = true;
        cancelAnimationFrame(drawFrame);
        const elapsed = motion ? clamp(Number(motion.currentTime || 0), 0, options.duration) : 0;
        entries.forEach(({ record, poses, progress, alpha, peakAlpha, plane, fallAnimation, initialTime }) => {
          const position = elapsed / options.duration * count;
          const first = poses[Math.floor(position)];
          const second = poses[Math.min(count, Math.floor(position) + 1)];
          const mix = position - Math.floor(position);
          const x = first.waterX + (second.waterX - first.waterX) * mix;
          const y = first.waterY + (second.waterY - first.waterY) * mix;
          const inverse = plane.inverse();
          record.x += inverse.a * x + inverse.c * y;
          record.y += inverse.b * x + inverse.d * y;
          record.angle += first.angle + (second.angle - first.angle) * mix;
          record.water.style.transform = `translate3d(${record.x}px, ${record.y}px, 0) rotate(${record.angle}deg)`;
          // Finish a near-complete fall just before recycling, while transparent.
          const advance = Math.min(elapsed, Math.max(0, (1 - progress) * record.duration - 1));
          fallAnimation.currentTime = initialTime + advance;
          const peak = peakAlpha;
          const finalProgress = progress + advance / record.duration;
          const finalAlpha = peak * Math.min(1, finalProgress / 0.08, (1 - finalProgress) / 0.12);
          if (!reducedMotion.matches && finalAlpha > alpha + 0.08) {
            // Newly arriving petals finish their fade-in instead of brightening
            // abruptly when their snapshot hands back to the live page.
            const futureProgress = finalProgress + 180 / record.duration;
            const futureAlpha = peak * Math.min(1, futureProgress / 0.08, (1 - futureProgress) / 0.12);
            record.fall.animate([{ opacity: alpha }, { opacity: futureAlpha }], { duration: 180, easing: 'ease-out' }).finished.catch(() => {});
          }
        });
        motion?.cancel();
        surface.remove();
        layer?.classList.remove('is-water-captured');
        if (waterSession === session) waterSession = null;
      }
    };
    waterSession = session;
    return session;
  };

  const syncVisibility = () => {
    lastScrollY = window.scrollY;
    if (!layer) return;
    layer.classList.toggle('is-paused', isPaused());
    if (isPaused()) stopBreeze();
    else startBreeze();
    toggle.querySelector('span').textContent = petalsHidden ? 'Show petals' : 'Hide petals';
    toggle.setAttribute('aria-label', petalsHidden ? 'Show sakura petals' : 'Hide sakura petals');
    toggle.setAttribute('aria-pressed', String(!petalsHidden));
  };

  const finishHide = () => {
    clearTimeout(hideTimer);
    if (!layer || !petalsHidden) return;
    layer.hidden = true;
    syncVisibility();
  };

  const animateVisibility = () => {
    clearTimeout(hideTimer);
    if (!layer) return;
    if (reducedMotion.matches || document.hidden) {
      layer.hidden = petalsHidden;
      layer.classList.toggle('is-hidden', petalsHidden);
    } else if (petalsHidden) {
      // Let the petals keep drifting until the fade finishes, then stop all work.
      layer.classList.add('is-hidden');
      hideTimer = setTimeout(finishHide, 1000);
    } else {
      if (layer.hidden) {
        layer.hidden = false;
        // Establish the transparent starting state after display:none.
        void layer.offsetWidth;
      }
      // CSS transitions reverse naturally if the control is clicked mid-fade.
      layer.classList.remove('is-hidden');
    }
    syncVisibility();
  };

  const syncMotion = () => {
    if (reducedMotion.matches || mobileView.matches) {
      waterSession?.finish();
      clearTimeout(hideTimer);
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
      waterPetals = [];
      return;
    }

    if (layer) return;
    layer = document.createElement('div');
    layer.className = 'sakura-layer';
    layer.setAttribute('aria-hidden', 'true');
    // Respect the saved preference on arrival without playing a toggle animation.
    layer.hidden = petalsHidden;
    layer.classList.toggle('is-hidden', petalsHidden);
    layer.addEventListener('transitionend', event => {
      if (event.target === layer && event.propertyName === 'opacity' && petalsHidden) finishHide();
    });

    toggle = document.createElement('button');
    toggle.className = 'sakura-toggle';
    toggle.type = 'button';
    // Same artwork as assets/img/sakura-petal.svg, framed tightly for the control.
    toggle.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="4 3 52 56" width="24" height="24" fill="none" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="sakura-toggle-pink" x1="15" y1="8" x2="36" y2="54" gradientUnits="userSpaceOnUse">
            <stop stop-color="#ffd5ed"/>
            <stop offset=".32" stop-color="#ff8dc8"/>
            <stop offset=".72" stop-color="#ff56a7"/>
            <stop offset="1" stop-color="#ee3189"/>
          </linearGradient>
          <linearGradient id="sakura-toggle-light" x1="12" y1="14" x2="28" y2="40" gradientUnits="userSpaceOnUse">
            <stop stop-color="#fff1fa" stop-opacity=".95"/>
            <stop offset="1" stop-color="#ffbddf" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <path d="M13 57C17 46 6 34 7 22 8 11 17 5 27 7l4 7 6-8c12 2 20 13 15 25-6 14-22 23-39 26Z" fill="url(#sakura-toggle-pink)"/>
        <path d="M13 57c19-13 28-28 24-51 12 2 20 13 15 25-6 14-22 23-39 26Z" fill="#f43892" fill-opacity=".24"/>
        <path d="M12 27C9 15 17 8 25 10l4 7c-9-3-15 3-17 10Z" fill="url(#sakura-toggle-light)"/>
        <path d="M9 22C9 12 18 6 27 8l4 6" stroke="#ffe5f4" stroke-opacity=".7" stroke-width="1.1" stroke-linecap="round"/>
      </svg>
      <span></span>`;
    toggle.addEventListener('click', () => {
      petalsHidden = !petalsHidden;
      animateVisibility();
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
  mobileView.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', syncVisibility);
  new MutationObserver(syncVisibility).observe(document.documentElement, {
    attributes: true, attributeFilter: ['class']
  });
  window.addEventListener('scroll', reactToScroll, { passive: true });
  window.PortfolioSakura = Object.freeze({ prepareWater });
  syncMotion();
})();
