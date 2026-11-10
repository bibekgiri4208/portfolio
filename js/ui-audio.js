// Short, gesture-triggered UI sounds shared by both portfolio pages.
(() => {
  const base = new URL('../assets/audio/', document.currentScript.src);
  const clips = {};
  for (const [name, file] of Object.entries({ selection: 'selection-button.mp3', back: 'back-button.mp3', water: 'water_droplet.mp3' })) {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = 0.4;
    audio.src = new URL(file, base).href;
    clips[name] = audio;
  }

  const stop = () => {
    Object.values(clips).forEach(audio => {
      audio.pause();
      try { audio.currentTime = 0; } catch { /* Metadata may not be ready yet. */ }
    });
  };

  const play = name => {
    if (!Object.hasOwn(clips, name) || document.hidden) return;
    stop();
    try {
      // Reuse and restart the clips: rapid clicks never build up overlapping audio.
      clips[name].play()?.catch(() => {});
    } catch {
      // Audio restrictions or a failed download must never block an interaction.
    }
  };
  window.PortfolioAudio = Object.freeze({ play });

  document.addEventListener('click', event => {
    if (!event.isTrusted || event.button !== 0 || !(event.target instanceof Element)) return;
    const control = event.target.closest('button, a[href], input[type="button"], input[type="submit"], input[type="reset"], [role="button"]');
    if (!control || control.matches(':disabled, [aria-disabled="true"]') || control.closest('[inert], .is-closing')) return;
    // Dialog close controls are managed by their actual dismissal handlers,
    // covering cross clicks, Escape, and backdrop dismissal without duplicates.
    const back = control.matches('[data-project-return], .pd-nav .logo, .hamburger[aria-expanded="true"]');
    play(control.dataset.uiSound || (back ? 'back' : 'selection'));
  }, true);

  window.addEventListener('pagehide', stop);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
  });
})();
