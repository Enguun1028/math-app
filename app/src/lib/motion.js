// Shared motion settings: one feel for every transition, and none for people who turned motion off.
import { cubicOut } from 'svelte/easing';

export const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
export const ms = (n) => (reduced ? 0 : n);
export const ease = cubicOut;

// Bottom sheets slide up; the dark layer behind them fades.
export const sheetIn = { y: 60, duration: ms(300), easing: cubicOut, opacity: 0 };
export const sheetOut = { y: 60, duration: ms(200), easing: cubicOut, opacity: 0 };
export const scrimFade = { duration: ms(220) };
