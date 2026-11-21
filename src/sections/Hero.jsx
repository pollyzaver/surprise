import { useRef } from "react";
import { motion } from "motion/react";
import WordmarkReveal from "../components/WordmarkReveal.jsx";
import {
  CORE_PATH,
  CORE_VIEWBOX,
} from "../components/lightPool.js";
import { BLOB_VIEWBOX, BLOB_STATIC_PATH } from "../hooks/useBlobMorph.js";
import { useWebglScene } from "../hooks/useWebglScene.js";
import { hero, org } from "../data/content.js";

/* ПЕРВЫЙ ЭКРАН

   Композиция. Кремовая страница и на ней розовое шёлковое полотно —
   тот же материал, что драпировка на костюме. Фигура стоит поверх ткани
   целиком, ничем не обрезана. Вордмарк хвостом выходит из кремового
   на розовое.

   Фигура — настоящее фото (archive, без обработки), как и весь остальной
   архив кейса.

   Движение. Один сценарий на загрузке (имя выходит буква за буквой, за ним
   текст и кнопки), дальше живёт только ткань: колышется сама и отвечает
   на курсор или палец (three/cloth.js, подгружается лениво).
   Фигура, текст и кнопки неподвижны.

   Запасной вариант. Пока 3D не загрузилось, а также без WebGL и при
   «уменьшении движения» на месте ткани стоит статичное розовое пятно
   (SVG ниже) — страница выглядит законченной и без 3D. */

const loadCloth = () => import("../three/cloth.js");

const EASE = [0.23, 1, 0.32, 1];

const sequence = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.62 } },
};

const rise = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const stageIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 1.1, ease: "easeOut" } },
};

export default function Hero() {
  const clothCanvas = useRef(null);
  const clothReady = useWebglScene(clothCanvas, loadCloth);

  return (
    <>
      <section className="hero paper" id="top">
        <motion.div
          className="hero__stage"
          data-cloth={clothReady ? "on" : "off"}
          aria-hidden="true"
          variants={stageIn}
          initial="hidden"
          animate="show"
        >
          {/* запасное статичное пятно: видно, пока ткань не готова */}
          <div className="hero__pool">
            <svg viewBox={BLOB_VIEWBOX} preserveAspectRatio="none">
              <defs>
                <linearGradient id="hero-pool-tone" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" style={{ stopColor: "var(--c-peach)" }} />
                  <stop offset="0.5" style={{ stopColor: "var(--c-pink)" }} />
                  <stop offset="1" style={{ stopColor: "var(--c-pink-soft)" }} />
                </linearGradient>
              </defs>
              <path d={BLOB_STATIC_PATH} fill="url(#hero-pool-tone)" />
            </svg>
          </div>

          <div className="hero__core">
            <svg viewBox={CORE_VIEWBOX} preserveAspectRatio="none">
              <path d={CORE_PATH} fill="var(--c-pink)" />
            </svg>
          </div>

          <div className="hero__cloth">
            <canvas ref={clothCanvas} />
          </div>

          <div className="hero__scene">
            {/* без маски и без фона: вырезка с альфой целиком поверх пятна */}
            <img
              className="hero__figure"
              src="/media/fig-drapery.webp"
              alt={hero.figureAlt}
              loading="eager"
              decoding="async"
            />
          </div>
        </motion.div>

        <motion.div
          className="hero__copy"
          variants={sequence}
          initial="hidden"
          animate="show"
        >
          <motion.p className="kicker hero__kicker" variants={rise}>
            {org.status}
            <br />
            {org.kind}
          </motion.p>

          <h1 className="hero__title">
            <span className="visually-hidden">
              Ансамбль танца «Сюрприз», {org.city}
            </span>
            <WordmarkReveal className="wordmark wordmark--hero" />
          </h1>

          <motion.p className="statement hero__statement" variants={rise}>
            {hero.statement}
          </motion.p>

          <motion.div className="hero__actions" variants={rise}>
            <a className="btn btn-primary" href="#signup" data-signup-open>
              {hero.ctaPrimary}
            </a>
          </motion.div>

          <motion.ul className="hero__facts" variants={rise}>
            {hero.facts.map((f) => (
              <li key={f.label}>
                <span className="num hero__fact-value">{f.value}</span>
                <span className="hero__fact-label">{f.label}</span>
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </section>

    </>
  );
}
