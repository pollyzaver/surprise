import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/* Общая обвязка для 3D-сцен (ткань на первом экране, кубок в наградах).

   — three.js и сама сцена подгружаются лениво: только когда блок
     впервые подходит к экрану (dynamic import → отдельный чанк);
   — кадры рисуются, только пока блок виден и вкладка активна;
   — devicePixelRatio не выше 2;
   — курсор / палец передаются сцене в координатах canvas (0…1);
   — если WebGL недоступен или включено «уменьшение движения»,
     сцена не создаётся вовсе, хук возвращает false — снаружи остаётся
     статичная картинка.

   load   — () => import("../three/что-то.js"); модуль по умолчанию
            экспортирует create(canvas, { mobile }) и возвращает
            { resize(w, h, dpr), frame(t, dt), pointer?(x, y, active), dispose() }.
   Возвращает true, когда первый кадр нарисован. */

export function useWebglScene(canvasRef, load) {
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduce) return undefined;

    let scene = null;
    let disposed = false;
    let loading = false;
    let visible = false;
    let raf = 0;
    let last = 0;
    let time = 0;
    const pointer = { x: 0, y: 0, active: false, dirty: false };

    const fit = () => {
      if (!scene) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w && h) scene.resize(w, h, Math.min(window.devicePixelRatio || 1, 2));
    };

    const tick = (now) => {
      raf = 0;
      if (!scene || !visible || document.hidden) return;
      // после паузы время не прыгает: шаг кадра ограничен
      const dt = Math.min((now - (last || now)) / 1000, 0.05);
      last = now;
      time += dt;

      if (scene.pointer && pointer.dirty) {
        pointer.dirty = false;
        const r = canvas.getBoundingClientRect();
        scene.pointer(
          (pointer.x - r.left) / r.width,
          (pointer.y - r.top) / r.height,
          pointer.active,
        );
      }
      scene.frame(time, dt);
      raf = requestAnimationFrame(tick);
    };

    const play = () => {
      if (!raf && scene && visible && !document.hidden) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    };

    const boot = async () => {
      if (loading || scene) return;
      loading = true;
      try {
        const mod = await load();
        if (disposed) return;
        const mobile = window.matchMedia("(max-width: 900px)").matches;
        scene = mod.default(canvas, { mobile });
        fit();
        scene.frame(0, 0);
        setReady(true);
        play();
      } catch {
        // WebGL недоступен или чанк не загрузился — остаётся запасная картинка
        scene = null;
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          if (scene) play();
          else boot();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(canvas);

    const ro = new ResizeObserver(fit);
    ro.observe(canvas);

    const onVisibility = () => play();
    const onMouse = (e) => {
      if (e.pointerType === "touch") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
      pointer.dirty = true;
    };
    const onTouch = (e) => {
      const t = e.touches[0];
      if (!t) return;
      pointer.x = t.clientX;
      pointer.y = t.clientY;
      pointer.active = true;
      pointer.dirty = true;
    };
    const onLeave = () => {
      pointer.active = false;
      pointer.dirty = true;
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pointermove", onMouse, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", onLeave, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onMouse);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onLeave);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      scene?.dispose();
      setReady(false);
    };
  }, [canvasRef, load, reduce]);

  return ready;
}
