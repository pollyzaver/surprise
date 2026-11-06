import { useEffect } from "react";
import { useMotionValue, useSpring, useReducedMotion } from "motion/react";

/* Параллакс от курсора: возвращает две пружинные величины в диапазоне
   примерно −0.5…0.5 — доля смещения курсора от центра экрана.
   Пружина нужна, чтобы ничего не дёргалось: значения догоняют курсор,
   а не прыгают за ним.

   Отключается там, где движение не нужно или мешает:
   — prefers-reduced-motion;
   — тач-устройства (нет точного указателя). */

export function usePointerParallax({ stiffness = 55, damping = 18 } = {}) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness, damping, mass: 0.7 });
  const springY = useSpring(y, { stiffness, damping, mass: 0.7 });

  useEffect(() => {
    if (reduce) return undefined;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return undefined;

    const onMove = (event) => {
      x.set(event.clientX / window.innerWidth - 0.5);
      y.set(event.clientY / window.innerHeight - 0.5);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, x, y]);

  return { x: springX, y: springY, enabled: !reduce };
}
