import { useState } from "react";
import { Stagger, Item } from "../components/Reveal.jsx";
import { directions } from "../data/content.js";

/* Направления — гармошка из вертикальных полос с фото со сцены.
   Подписи лежат прямо на фото, без плашек: внизу кадра мягкое затемнение,
   на раскрытой полосе номер, название и описание, на свёрнутых —
   вертикальная подпись.
   Мышь: раскрывает наведение. Клавиатура: Tab (фокус раскрывает).
   Телефон: полосы идут столбиком, раскрывает нажатие. */

export default function Directions() {
  const [active, setActive] = useState(0);

  return (
    <section className="section directions" id="directions">
      <div className="wrap">
        <Stagger className="directions__head">
          <Item as="h2">{directions.heading}</Item>
          <Item as="p" className="lead">
            {directions.lead}
          </Item>
        </Stagger>

        <Stagger className="accordion" amount={0.15}>
          {directions.items.map((d, i) => {
            const on = i === active;
            const n = String(i + 1).padStart(2, "0");
            return (
              <Item
                key={d.id}
                as="button"
                type="button"
                className={`accordion__panel${on ? " is-open" : ""}`}
                aria-expanded={on}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
              >
                <span className="accordion__media">
                  <img
                    className="accordion__photo"
                    src={d.src}
                    alt={d.alt}
                    width={d.w}
                    height={d.h}
                    loading="lazy"
                    decoding="async"
                    style={{
                      objectPosition: d.position ?? "50% 50%",
                      ...(d.lift && { top: `-${d.lift}`, height: `calc(100% + ${d.lift})` }),
                    }}
                  />
                  <span className="accordion__label" aria-hidden={on}>
                    {n} · {d.title}
                  </span>
                  <span className="accordion__caption" aria-hidden={!on}>
                    <span className="accordion__num">{n}</span>
                    <span className="accordion__title">{d.title}</span>
                    <span className="accordion__text">{d.text}</span>
                  </span>
                </span>
              </Item>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
