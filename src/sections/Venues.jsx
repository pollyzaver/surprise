import { useState } from "react";
import { Stagger, Item } from "../components/Reveal.jsx";
import { venues } from "../data/content.js";

/* Площадки на схеме города. Слева нарисованная схема Оренбурга в цветах
   сайта: три района условными зонами, река Урал и точки площадок.
   Справа список адресов. Схема и список связаны: наведение или фокус на
   адресе подсвечивает его точку (она пульсирует), и наоборот.
   «Маршрут» открывает Яндекс.Карты с адресом — без встраивания карты. */

const routeUrl = (address) =>
  `https://yandex.ru/maps/?text=${encodeURIComponent(`Оренбург, ${address}`)}`;

function CityMap() {
  return (
    <svg className="venues__svg" viewBox="0 0 720 620" aria-hidden="true" focusable="false">
      {/* районы — мягкие зоны, границы условные */}
      <path
        className="venues__zone"
        d="M60 70 C150 40 330 50 380 110 C420 170 380 250 300 270 C210 290 110 260 70 200 C40 150 30 100 60 70 Z"
      />
      <path
        className="venues__zone venues__zone--center"
        d="M245 305 C315 285 430 292 465 335 C495 375 470 432 400 450 C320 468 245 448 222 402 C204 360 208 320 245 305 Z"
      />
      <path
        className="venues__zone"
        d="M548 130 C610 108 690 135 703 205 C714 265 690 330 635 348 C585 364 545 335 532 285 C520 235 510 150 548 130 Z"
      />
      {/* река Урал */}
      <path
        className="venues__river"
        d="M-30 486 C90 446 200 528 340 492 C470 458 560 532 760 478"
      />
      <path
        className="venues__river-line"
        d="M-30 486 C90 446 200 528 340 492 C470 458 560 532 760 478"
      />
      <text className="venues__river-label" x="470" y="548">
        р. Урал
      </text>
      <g className="venues__area-labels">
        <text x="110" y="112">СЕВЕРНЫЙ</text>
        <text x="262" y="336">ЦЕНТР</text>
        <text x="566" y="178">СТЕПНОЙ</text>
      </g>
    </svg>
  );
}

export default function Venues() {
  const [active, setActive] = useState(0);

  return (
    <section className="section venues" id="venues">
      <Stagger className="wrap venues__inner">
        <Item as="figure" className="venues__map" role="img" aria-label={venues.mapLabel}>
          <CityMap />
          {venues.items.map((v, i) => (
            <span
              key={v.id}
              className={`venues__pin${i === active ? " is-active" : ""}`}
              style={{ left: `${v.x * 100}%`, top: `${v.y * 100}%` }}
            >
              <span className="venues__ring" aria-hidden="true" />
              <button
                type="button"
                className="venues__dot"
                aria-label={`${i + 1}. ${v.area}, ${v.address}`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
              >
                {i + 1}
              </button>
            </span>
          ))}
          <figcaption className="venues__note">{venues.mapNote}</figcaption>
        </Item>

        <div className="venues__text">
          <Item as="p" className="venues__kicker">
            {venues.kicker}
          </Item>
          <Item as="h2" className="venues__title">
            {venues.heading}
          </Item>
          <Item as="p" className="venues__lead">
            {venues.lead}
          </Item>

          <Item as="ol" className="venues__list">
            {venues.items.map((v, i) => (
              <li
                key={v.id}
                className={`venue${i === active ? " is-active" : ""}`}
                onMouseEnter={() => setActive(i)}
              >
                <span className="venue__num" aria-hidden="true">
                  {i + 1}
                </span>
                <button
                  type="button"
                  className="venue__main"
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                >
                  <span className="venue__area">{v.area}</span>
                  <span className="venue__address">{v.address}</span>
                  <span className="venue__place">{v.place}</span>
                </button>
                <a
                  className="venue__route"
                  href={routeUrl(v.address)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Маршрут: ${v.address}, откроется Яндекс.Карты`}
                >
                  Маршрут
                  {/* стрелка рисуется SVG: символ «↗» на iPhone превращается в эмодзи */}
                  <svg className="venue__arrow" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                    <path d="M5 11 11 5M6 5h5v5" />
                  </svg>
                </a>
              </li>
            ))}
          </Item>
        </div>
      </Stagger>
    </section>
  );
}
