// An optional shortcut; the mailto link and native form work without JavaScript.
(() => {
  const button = document.querySelector('.contact-copy-email');
  const email = document.querySelector('.contact-email');
  const status = document.querySelector('.contact-copy-status');
  if (!button || !email || !status || !window.isSecureContext || !navigator.clipboard?.writeText) return;

  let resetTimer;
  button.hidden = false;
  button.addEventListener('click', async () => {
    clearTimeout(resetTimer);
    button.disabled = true;
    status.textContent = '';
    try {
      await navigator.clipboard.writeText(email.getAttribute('href').slice('mailto:'.length));
      status.textContent = 'Email copied!';
    } catch {
      status.textContent = 'Couldn’t copy. Please use the email link instead.';
    } finally {
      button.disabled = false;
      resetTimer = setTimeout(() => { status.textContent = ''; }, 5000);
    }
  });
})();
