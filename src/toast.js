// Stack of small auto-dismissing toast notifications, top-right area.

const $stack = document.getElementById('toast-stack');
const TOAST_TTL_MS = 4500;
const TOAST_TTL_LONG_MS = 7000;

export function toast(message, opts = {}) {
  const el = document.createElement('div');
  el.className = 'toast' + (opts.kind ? ' toast-' + opts.kind : '');
  if (opts.icon) {
    const img = document.createElement('img');
    img.src = opts.icon;
    img.className = 'toast-icon';
    el.appendChild(img);
  }
  const body = document.createElement('div');
  body.className = 'toast-body';
  if (opts.title) {
    const t = document.createElement('div');
    t.className = 'toast-title';
    t.textContent = opts.title;
    body.appendChild(t);
  }
  const m = document.createElement('div');
  m.className = 'toast-msg';
  m.textContent = message;
  body.appendChild(m);
  el.appendChild(body);

  $stack.appendChild(el);
  // entry animation
  requestAnimationFrame(() => el.classList.add('show'));

  const ttl = opts.long ? TOAST_TTL_LONG_MS : TOAST_TTL_MS;
  setTimeout(() => {
    el.classList.remove('show');
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 400);
  }, ttl);
}
