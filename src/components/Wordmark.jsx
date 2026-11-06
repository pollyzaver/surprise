import { WORDMARK_PATHS, WORDMARK_VIEWBOX } from "./wordmarkPaths.js";

/* Вордмарк «Сюрприз» — контуры из Illustrator, не шрифт.
   Цвет задаётся через CSS color (fill="currentColor"). */

export default function Wordmark({ className = "", title = "Сюрприз" }) {
  return (
    <svg
      className={className}
      viewBox={WORDMARK_VIEWBOX}
      role="img"
      aria-label={title}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {WORDMARK_PATHS.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
