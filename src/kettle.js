// Coffee Kettle: hidden until purchased, then drops onto the back counter.

const $coffee = document.getElementById('coffee-decor');

function dropIn() {
  if (!$coffee) return;
  $coffee.classList.remove('hidden');
  $coffee.classList.remove('appear');
  void $coffee.offsetWidth;
  $coffee.classList.add('appear');
  setTimeout(() => $coffee.classList.remove('appear'), 600);
}

export function animateKettleAppear() { dropIn(); }

// Restore on load if previously owned (silent — no animation).
export function restoreKettleIfOwned(state) {
  if (state.bought.kettle && $coffee) $coffee.classList.remove('hidden');
}
