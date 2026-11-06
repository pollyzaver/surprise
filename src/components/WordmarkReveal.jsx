import { motion } from "motion/react";
import { WORDMARK_PATHS, WORDMARK_VIEWBOX } from "./wordmarkPaths.js";

/* Вордмарк, который собирается по буквам при загрузке первого экрана.
   Идея бренда: «сюрприз случается в названии, до всякой фотографии» —
   поэтому имя не просто проявляется, а выходит буква за буквой.
   При prefers-reduced-motion MotionConfig в App.jsx оставляет только
   прозрачность и убирает сдвиг. */

const EASE = [0.23, 1, 0.32, 1];

const group = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.22 } },
};

const letter = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
};

export default function WordmarkReveal({ className = "", title = "Сюрприз" }) {
  return (
    <motion.svg
      className={className}
      viewBox={WORDMARK_VIEWBOX}
      role="img"
      aria-label={title}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      variants={group}
      initial="hidden"
      animate="show"
    >
      {WORDMARK_PATHS.map((d, i) => (
        <motion.path key={i} d={d} variants={letter} />
      ))}
    </motion.svg>
  );
}
