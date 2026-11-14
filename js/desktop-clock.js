// Desktop-only local time. No ticking animation or background/mobile timer.
(() => {
  const clock = document.querySelector('.desktop-clock');
  if (!clock) return;

  // Match the visibility query in css/style.css, including landscape phones.
  const desktopView = matchMedia('(min-width: 1025px) and (hover: hover) and (pointer: fine)');
  const digits = clock.querySelector('[data-clock-time]');
  const period = clock.querySelector('[data-clock-period]');
  let formatter;
  let timer;

  const stop = () => {
    clearTimeout(timer);
    timer = undefined;
  };

  const sync = () => {
    stop();
    clock.hidden = !desktopView.matches;
    if (clock.hidden || document.hidden) return;

    formatter ||= new Intl.DateTimeFormat('en', {
      hour: 'numeric', minute: '2-digit', hour12: true
    });
    const now = new Date();
    const parts = formatter.formatToParts(now);
    const part = type => parts.find(value => value.type === type)?.value || '';
    const time = `${part('hour')}:${part('minute')}`;
    const dayPeriod = part('dayPeriod');

    digits.textContent = time;
    period.textContent = dayPeriod;
    clock.dateTime = now.toISOString();
    clock.setAttribute('aria-label', `Local time: ${time} ${dayPeriod}`);
    clock.title = 'Your local time';

    // Align to the next minute rather than waking the page every second.
    timer = setTimeout(sync, 60000 - (now.getTime() % 60000));
  };

  desktopView.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', sync);
  sync();
})();
