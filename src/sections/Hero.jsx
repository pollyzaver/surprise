import { useRef } from "react";
import { motion, useReducedMotion, useTransform } from "motion/react";
import WordmarkReveal from "../components/WordmarkReveal.jsx";
import {
  CORE_PATH,
  CORE_VIEWBOX,
} from "../components/lightPool.js";
import { usePointerParallax } from "../hooks/usePointerParallax.js";
import {
  useBlobMorph,
  BLOB_VIEWBOX,
  BLOB_STATIC_PATH,
} from "../hooks/useBlobMorph.js";
import { hero, org } from "../data/content.js";

/* ПЕРВЫЙ ЭКРАН

   Композиция. Кремовая страница и на ней одно органическое розовое пятно —
   «софит». По пятну медленно переливаются оттенки розового (градиент
   поворачивается, а светлый блик гуляет по нему). Фигура стоит поверх
   пятна целиком, ничем не обрезана. Вордмарк хвостом выходит из кремового
   на розовое.

   Фигура — настоящее фото (archive, без обработки), как и весь остальной
   архив кейса. Никаких синтетических элементов на сайте нет.

   Движение. Один сценарий на загрузке (имя выходит буква за буквой, за ним
   текст и кнопки), дальше живёт только розовое пятно: параллакс от курсора,
   перелив света и контур, который тянется к курсору (useBlobMorph).
   Фигура, текст и кнопки неподвижны. MotionConfig reducedMotion="user" в App.jsx снимает
   сдвиги и пульсацию для тех, кто просил меньше анимации. */

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
  const reduce = useReducedMotion();
  const { x, y } = usePointerParallax();

  /* живой контур пятна: тянется к курсору и медленно колышется */
  const poolSvg = useRef(null);
  const toneRef = useRef(null);
  const sheenRef = useRef(null);
  const poolPaths = useRef([toneRef, sheenRef]).current;
  useBlobMorph(poolSvg, poolPaths);

  /* Двигается только пятно: параллакс от курсора есть у розовых слоёв,
     фигура, текст и кнопки стоят на месте.
     Разная глубина слоёв. Пишем готовую строку transform —
     так слой уходит на видеокарту и не считается в основном потоке. */
  const poolShift = useTransform(
    () => `translate3d(${x.get() * 24}px, ${y.get() * 17}px, 0)`,
  );
  const coreShift = useTransform(
    () => `translate3d(${x.get() * 40}px, ${y.get() * 27}px, 0)`,
  );

  const breathe = reduce
    ? undefined
    : { opacity: [0.6, 0.92, 0.6], scale: [1, 1.055, 1] };

  return (
    <>
      <section className="hero paper" id="top">
        <motion.div
          className="hero__stage"
          aria-hidden="true"
          variants={stageIn}
          initial="hidden"
          animate="show"
        >
          <motion.div className="hero__pool" style={{ transform: poolShift }}>
            <svg ref={poolSvg} viewBox={BLOB_VIEWBOX} preserveAspectRatio="none">
              <defs>
                {/* основной перелив: три оттенка розового, градиент медленно
                    поворачивается вокруг центра пятна */}
                <linearGradient id="hero-pool-tone" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" style={{ stopColor: "var(--c-peach)" }} />
                  <stop offset="0.5" style={{ stopColor: "var(--c-pink)" }} />
                  <stop offset="1" style={{ stopColor: "var(--c-pink-soft)" }} />
                  {!reduce && (
                    <animateTransform
                      attributeName="gradientTransform"
                      type="rotate"
                      values="0 0.5 0.5; 360 0.5 0.5"
                      dur="22s"
                      repeatCount="indefinite"
                    />
                  )}
                </linearGradient>
                {/* светлый блик, который гуляет по пятну */}
                <radialGradient id="hero-pool-sheen" cx="0.35" cy="0.4" r="0.45">
                  <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                  {!reduce && (
                    <>
                      <animate
                        attributeName="cx"
                        values="0.3; 0.7; 0.55; 0.3"
                        dur="14s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="cy"
                        values="0.35; 0.5; 0.7; 0.35"
                        dur="14s"
                        repeatCount="indefinite"
                      />
                    </>
                  )}
                </radialGradient>
              </defs>
              <path ref={toneRef} d={BLOB_STATIC_PATH} fill="url(#hero-pool-tone)" />
              <path ref={sheenRef} d={BLOB_STATIC_PATH} fill="url(#hero-pool-sheen)" />
            </svg>
          </motion.div>

          <motion.div className="hero__core" style={{ transform: coreShift }}>
            <motion.svg
              viewBox={CORE_VIEWBOX}
              preserveAspectRatio="none"
              animate={breathe}
              transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <path d={CORE_PATH} fill="var(--c-pink)" />
            </motion.svg>
          </motion.div>

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
