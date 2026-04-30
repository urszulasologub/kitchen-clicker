// Tiny utility helpers used across modules.

export function fmt(n) {
  if (n < 1000) return Math.floor(n).toString();
  if (n < 1e6)  return (n / 1e3).toFixed(1) + 'K';
  if (n < 1e9)  return (n / 1e6).toFixed(2) + 'M';
  return (n / 1e9).toFixed(2) + 'B';
}

export function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const SPRITES = 'Sprites/Sprites';

export function spritePath(rel) {
  return `${SPRITES}/${rel}`;
}
