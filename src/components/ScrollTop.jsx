import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/* Кнопка «наверх»: появляется, когда долистали до подвала,
   и плавно возвращает к началу страницы.
   reduced motion — без плавной прокрутки и без «выпрыгивания». */
export default function ScrollTop() {
  const [show, setShow] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    /* показываем, когда до конца страницы осталось меньше
       одного экрана — то есть подвал уже на виду */
    let raf = 0;
    const check = () => {
      raf = 0;
      const doc = document.documentElement;
      const left = doc.scrollHeight - (window.scrollY + window.innerHeight);
      setShow(left < window.innerHeight * 0.9);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const toTop = () => {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          className="scroll-top"
          aria-label="Наверх"
          onClick={toTop}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.8 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
