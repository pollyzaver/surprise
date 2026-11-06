import { Stagger, Item } from "../components/Reveal.jsx";
import Photo from "../components/Photo.jsx";
import { about } from "../data/content.js";

/* «О коллективе» — один лёгкий тёмно-синий блок вместо полосы регалий
   и прежнего блока с цифрами. Слева текст, справа вырезка с педагогами
   на мягком розовом пятне (перекличка с кляксой первого экрана), сверху
   наклонённая плашка «с 2006 года» и мерцающие искры, как на lapochka.team.
   Искры — только CSS-анимация, при «уменьшить движение» стоят. */

const SPARK = "M12 0C13 7 17 11 24 12C17 13 13 17 12 24C11 17 7 13 0 12C7 11 11 7 12 0Z";

/* позиции в процентах от своей колонки, размер в px, задержка в секундах */
const TEXT_SPARKS = [
  { l: "-3%", t: "-4%", s: 22, d: 0 },
  { l: "88%", t: "14%", s: 14, d: 1.2, dark: true },
  { l: "70%", t: "58%", s: 10, d: 2.1 },
  { l: "96%", t: "86%", s: 16, d: 0.7, dark: true },
];
const MEDIA_SPARKS = [
  { l: "-4%", t: "6%", s: 18, d: 0.6 },
  { l: "97%", t: "-2%", s: 26, d: 1.8 },
  { l: "101%", t: "74%", s: 14, d: 0.3, dark: true },
  { l: "2%", t: "96%", s: 20, d: 2.6 },
  { l: "52%", t: "-8%", s: 12, d: 1.4, dark: true },
  { l: "80%", t: "104%", s: 16, d: 0.9 },
];

function Sparks({ list }) {
  return list.map((p, i) => (
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
  ));
}

export default function About() {
  return (
    <section className="about on-dark" id="about">
      <Stagger className="wrap about__inner">
        <div className="about__text">
          <Sparks list={TEXT_SPARKS} />
          <Item as="p" className="about__kicker">
            {about.kicker}
          </Item>
          <Item as="h2" className="about__heading">
            {about.heading}
          </Item>
          <Item as="p" className="lead about__lead">
            {about.lead}
          </Item>
          <Item as="p" className="about__awards">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 2.8l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7z" />
            </svg>
            <span>{about.awards}</span>
          </Item>
        </div>

        <Item className="about__media">
          <svg className="about__blob" viewBox="0 0 1000 800" aria-hidden="true" focusable="false">
            <path d="M500,73.6C561.6,77 621.8,89.2 678.7,107.9C735.5,126.6 797,150 851,190C905,230 955,290 963,350C971,410 948,470 920,525C892,580 850,630 790,670C730,710 655,730 580,738C505,746 430,742 360,722C290,702 220,665 165,615C110,565 70,500 55,435C40,370 52,300 85,240C118,180 175,135 240,110C305,85 438,70 500,73.6Z" />
          </svg>
          <Photo
            src={about.photo.src}
            alt={about.photo.alt}
            w={about.photo.w}
            h={about.photo.h}
            ratio={`${about.photo.w} / ${about.photo.h}`}
            className="about__photo"
          />
          <p className="about__sticker">{about.sticker}</p>
          <Sparks list={MEDIA_SPARKS} />
        </Item>
      </Stagger>
    </section>
  );
}
