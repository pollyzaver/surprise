import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Stagger, Item } from "../components/Reveal.jsx";
import { reviews } from "../data/content.js";

/* Отзывы — как кусок родительского чата (идея с lapochka.team):
   белые пузыри-сообщения раскиданы в три неровные колонки на розовом
   фоне с волнистыми краями, каждый чуть наклонён.

   При прокрутке пузыри плавно скользят вверх-вниз, каждый со своей
   скоростью: у одних сдвиг больше, у других меньше, у части — в обратную
   сторону. Так блок «дышит», а не едет одной плитой.
   reduced motion — сдвиг выключен. */

/* наклон для каждого пузыря по порядку */
const TILT = [-2, 5, 1.5, -1, 1, 2.5, -1.5, 1, -2];

/* «глубина» параллакса: колонки едут с разной скоростью (средняя —
   навстречу), а внутри колонки пузыри почти синхронны — разброс ±8 px.
   Раньше у соседних пузырей одной колонки сдвиг шёл в разные стороны
   до 110 px и они наезжали друг на друга; теперь сближение не больше
   16 px при промежутке 40 px. */
const COL_DEPTH = [40, -55, 60];
const JITTER = [0, 8, -8, 4, -4, 8, -8, 4, 0];

const HEARTS = [
  { s: 54, l: "4%", t: "16%", r: -12 },
  { s: 34, l: "34%", t: "46%", r: 10 },
  { s: 44, l: "63%", t: "28%", r: -8 },
  { s: 60, l: "92%", t: "74%", r: 14 },
  { s: 36, l: "33%", t: "86%", r: -6 },
];

/* на узком экране пузыри идут одной лентой вплотную — сдвиг втрое меньше,
   иначе соседние сообщения наезжают друг на друга */
function useNarrow() {
  const query = "(max-width: 900px)";
  const [narrow, setNarrow] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = (e) => setNarrow(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return narrow;
}

/* цвет кружка-аватарки по порядку */
const AVA = ["pink", "sapphire", "peach", "icy", "navy"];
/* у каких сообщений «поставлено сердечко» */
const LIKED = new Set([0, 4, 7]);
/* какие пузыри тонированы — как ответы в чате, для ритма */
const TINT = { 2: "peach", 6: "icy" };

function Ticks() {
  return (
    <svg className="review__ticks" viewBox="0 0 18 10" aria-hidden="true">
      <path d="M1 5.5 3.8 8.3 9.6 1.7M7.2 7.4l.9.9 5.8-6.6" />
    </svg>
  );
}

function Bubble({ item, index, progress, reduce, narrow }) {
  const jitter = JITTER[index % JITTER.length];
  /* в мобильной ленте соседние пузыри — из разных колонок, поэтому
     там оставляем только лёгкий разброс без разницы колонок */
  const base = narrow ? jitter : COL_DEPTH[item.col ?? 0] + jitter;
  const depth = reduce ? 0 : base;
  const y = useTransform(progress, [0, 1], [depth, -depth]);
  const side = index % 2 ? "end" : "start";

  return (
    <motion.div
      className={`review-wrap review-wrap--${side}${item.short ? " review-wrap--short" : ""}`}
      style={{ y, rotate: TILT[index % TILT.length], order: index }}
    >
      <Item
        as="figure"
        className={`review${TINT[index] ? ` review--${TINT[index]}` : ""}`}
      >
        <figcaption className="review__author">
          <span className={`review__ava review__ava--${AVA[index % AVA.length]}`} aria-hidden="true">
            {item.author.trim().charAt(0)}
          </span>
          <span className="review__who">
            <span className="review__name">{item.author}</span>
            {item.context && <span className="review__context">{item.context}</span>}
          </span>
        </figcaption>
        <blockquote className="review__quote">
          <p>{item.quote}</p>
        </blockquote>
        {item.time && (
          <p className="review__time">
            {item.time}
            <Ticks />
          </p>
        )}
        {LIKED.has(index) && (
          <span className="review__like" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.9 4.5 6.6 4.5c2.2 0 3.9 1.2 5.4 3.1 1.5-1.9 3.2-3.1 5.4-3.1 3.7 0 5.7 3.9 4.2 7.3C19.5 16.4 12 21 12 21z" />
            </svg>
          </span>
        )}
      </Item>
    </motion.div>
  );
}

export default function Reviews() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const narrow = useNarrow();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const cols = [0, 1, 2].map((c) =>
    reviews.items
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.col === c),
  );

  return (
    <section className="reviews" id="reviews" ref={ref}>
      {HEARTS.map((h, i) => (
        <svg
          key={i}
          className="reviews__heart"
          aria-hidden="true"
          viewBox="0 0 24 24"
          style={{ width: h.s, height: h.s, left: h.l, top: h.t, rotate: `${h.r}deg` }}
        >
          <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.9 4.5 6.6 4.5c2.2 0 3.9 1.2 5.4 3.1 1.5-1.9 3.2-3.1 5.4-3.1 3.7 0 5.7 3.9 4.2 7.3C19.5 16.4 12 21 12 21z" />
        </svg>
      ))}

      <div className="wrap">
        <Stagger className="reviews__head">
          <Item as="p" className="reviews__kicker">
            {reviews.kicker}
          </Item>
          <Item as="h2" className="reviews__title">
            <span className="reviews__pre">{reviews.pre}</span>
            <span className="reviews__big">{reviews.heading}</span>
          </Item>
          <Item as="p" className="reviews__sticker">
            {reviews.sticker}
          </Item>
        </Stagger>

        <Stagger className="reviews__list" amount={0.05}>
          {cols.map((col, c) => (
            <div key={c} className={`reviews__col reviews__col--${c}`}>
              {col.map(({ item, index }) => (
                <Bubble
                  key={index}
                  item={item}
                  index={index}
                  progress={scrollYProgress}
                  reduce={reduce}
                  narrow={narrow}
                />
              ))}
            </div>
          ))}
        </Stagger>

        <Stagger className="reviews__cta">
          <Item>
            <a
              className="btn btn-primary reviews__link"
              href={reviews.linkHref}
              target="_blank"
              rel="noreferrer"
            >
              {reviews.linkLabel}
            </a>
          </Item>
        </Stagger>
      </div>
    </section>
  );
}
