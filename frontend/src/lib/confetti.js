import confetti from 'canvas-confetti';

const COLORS = ['#8EC5FF', '#FFD978', '#FFB8C6', '#9FE3C4', '#CDBDFF'];

export function celebrate() {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  confetti({ particleCount: 70, spread: 75, startVelocity: 38, origin: { y: 0.7 }, colors: COLORS });
  setTimeout(() => {
    confetti({ particleCount: 40, spread: 100, startVelocity: 28, origin: { y: 0.65 }, colors: COLORS });
  }, 180);
}
