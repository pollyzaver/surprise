import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { Stagger, Item } from "../components/Reveal.jsx";
import { price } from "../data/content.js";

/* Цена — театральный билет в два шага.
   Корешок (тёмно-синий) — шаг 1, бесплатное пробное с кнопкой записи.
   Основная часть (светлая) — шаг 2, абонемент: цена досчитывает от нуля,
   когда билет появляется на экране. Между ними перфорация с вырезами
   и кружок со стрелкой. При наведении корешок отгибается, будто его
   отрывают (только мышь). reduced motion — цена сразу целиком. */

const SPARK = "M12 0C13 7 17 11 24 12C17 13 13 17 12 24C11 17 7 13 0 12C7 11 11 7 12 0Z";
const SPARKS = [
  { l: "-2%", t: "-6%", s: 24, d: 0.3 },
  { l: "98%", t: "-10%", s: 20, d: 1.6, dark: true },
  { l: "100%", t: "96%", s: 16, d: 0.8 },
  { l: "34%", t: "104%", s: 14, d: 2.3, dark: true },
];

function useCountUp(target, start, reduce) {
  const [value, setValue] = useState(reduce ? target : 0);
  useEffect(() => {
    if (reduce) {
      setValue(target);
      return undefined;
    }
    if (!start) return undefined;
    const controls = animate(0, target, {
      duration: 1.4,
      ease: [0.23, 1, 0.32, 1],
      onUpdate: (v) => setValue(Math.round(v / 10) * 10),
    });
    return () => controls.stop();
  }, [target, start, reduce]);
  return value;
}

export default function Price() {
  const ticketRef = useRef(null);
  const inView = useInView(ticketRef, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const amount = useCountUp(price.amount, inView, reduce);

  return (
    <section className="price" id="price">
      <div className="wrap">
        <Stagger className="price__head">
          <Item as="p" className="price__kicker">
            {price.kicker}
          </Item>
          <Item as="h2" className="price__title">
            {price.heading}
          </Item>
        </Stagger>

        <div className="ticket-wrap">
          {SPARKS.map((p, i) => (
            <span
              key={i}
              className={`spark${p.dark ? " spark--dark" : ""}`}
              aria-hidden="true"
              style={{ left: p.l, top: p.t, width: p.s, height: p.s, animationDelay: `-${p.d}s` }}
            >
              <svg viewBox="0 0 24 24">
                <path d={SPARK} />
              </svg>
            </span>
          ))}

          <div className="ticket" ref={ticketRef}>
            <div className="ticket__stub">
              <div>
                <p className="ticket__label ticket__label--dark">
                  <span className="ticket__step">1</span>
                  {price.trialLabel}
                </p>
                <p className="ticket__value ticket__value--trial">{price.trialValue}</p>
                <p className="ticket__trial">{price.trial}</p>
              </div>
              <a className="btn ticket__cta" href="#signup" data-signup-open>
                Записаться на пробное
              </a>
            </div>

            <div className="ticket__main">
              {/* вырезы и стрелка стоят на линии отрыва — у левого края
                  основной части (на телефоне — у верхнего) */}
              <span className="ticket__arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
              <span className="ticket__notch ticket__notch--a" aria-hidden="true" />
              <span className="ticket__notch ticket__notch--b" aria-hidden="true" />
              <p className="ticket__label">
                <span className="ticket__step ticket__step--dark">2</span>
                {price.passLabel}
              </p>
              <p className="ticket__price">
                <span className="ticket__value" aria-hidden="true">
                  {amount} ₽
                </span>
                <span className="visually-hidden">
                  {price.amount} ₽ {price.period}
                </span>
                <span className="ticket__period" aria-hidden="true">
                  {price.period}
                </span>
              </p>
              <ul className="ticket__rows">
                {price.includes.map((i) => (
                  <li key={i}>
                    <span className="ticket__row-tag">входит</span>
                    <span>{i}</span>
                  </li>
                ))}
              </ul>
              <p className="ticket__extras">* {price.extras}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
