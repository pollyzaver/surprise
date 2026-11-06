import { useEffect } from "react";
import { useReducedMotion } from "motion/react";

/* Живое розовое пятно.

   Контур строится из N опорных точек по кругу и пересобирается каждый
   кадр (замкнутый Catmull-Rom → кубические безье, поэтому изломов нет).
   Радиус каждой точки складывается из трёх частей:
   — база: мягкая неровность формы, чтобы пятно не было эллипсом;
   — дыхание: медленное колыхание во времени, пятно живое даже без мыши;
   — курсор: точки, смотрящие в сторону мыши, тянутся к ней. Чем ближе
     курсор к краю пятна, тем сильнее тянется; издалека почти не реагирует.
   Радиусы не прыгают к цели, а догоняют её — отсюда «желейность».

   reduced motion — статичная база; тач-экран — только дыхание.
   Когда первый экран уходит из видимости, цикл ставится на паузу. */

const N = 14;
const CX = 500;
const CY = 400;
const RX = 470;
const RY = 370;

const baseRadius = (a) =>
  0.93 + 0.035 * Math.sin(2 * a + 1.1) + 0.025 * Math.sin(3 * a + 2.3);

export function blobPath(radii) {
  const pts = radii.map((r, i) => {
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    return [CX + RX * r * Math.cos(a), CY + RY * r * Math.sin(a)];
  });
  const f = (v) => v.toFixed(1);
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < N; i += 1) {
    const p0 = pts[(i - 1 + N) % N];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % N];
    const p3 = pts[(i + 2) % N];
    d +=
      `C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ` +
      `${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ` +
      `${f(p2[0])},${f(p2[1])}`;
  }
  return `${d}Z`;
}

const BASE = Array.from({ length: N }, (_, i) =>
  baseRadius((i / N) * Math.PI * 2 - Math.PI / 2),
);

export const BLOB_VIEWBOX = "-80 -80 1160 960";
export const BLOB_STATIC_PATH = blobPath(BASE);

export function useBlobMorph(svgRef, pathRefs) {
  const reduce = useReducedMotion();

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || reduce) return undefined;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const current = BASE.slice();
    const pointer = { x: 0, y: 0, active: false };
    let raf = 0;
    let visible = true;

    const onMove = (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };

    const tick = (now) => {
      const t = now / 1000;

      // курсор в координатах viewBox пятна
      let px = 0;
      let py = 0;
      let near = 0;
      if (pointer.active) {
        const ctm = svg.getScreenCTM();
        if (ctm) {
          const p = new DOMPoint(pointer.x, pointer.y).matrixTransform(
            ctm.inverse(),
          );
          px = (p.x - CX) / RX;
          py = (p.y - CY) / RY;
          const dist = Math.hypot(px, py);
          // максимум отклика у самого края, плавно гаснет к 1.9 радиуса
          near = Math.max(0, 1 - Math.abs(dist - 0.95) / 0.95);
        }
      }
      const pa = Math.atan2(py, px);

      for (let i = 0; i < N; i += 1) {
        const a = (i / N) * Math.PI * 2 - Math.PI / 2;
        const breath =
          0.022 * Math.sin(t * 0.7 + i * 1.35) +
          0.014 * Math.sin(t * 1.1 - i * 0.8);
        let pull = 0;
        if (near > 0) {
          let da = Math.abs(a - pa) % (Math.PI * 2);
          if (da > Math.PI) da = Math.PI * 2 - da;
          pull = 0.16 * near * Math.exp(-(da * da) / (2 * 0.42 * 0.42));
        }
        const target = BASE[i] + breath + pull;
        current[i] += (target - current[i]) * 0.075;
      }

      const d = blobPath(current);
      pathRefs.forEach((ref) => ref.current?.setAttribute("d", d));
      raf = visible ? requestAnimationFrame(tick) : 0;
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    });
    io.observe(svg);

    if (fine) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce, svgRef, pathRefs]);
}
