import { Stagger, Item } from "../components/Reveal.jsx";
import Photo from "../components/Photo.jsx";
import { directions } from "../data/content.js";

export default function Directions() {
  return (
    <section className="section directions" id="directions">
      <div className="wrap">
        <Stagger className="directions__head">
          <Item as="h2">{directions.heading}</Item>
          <Item as="p" className="lead">
            {directions.lead}
          </Item>
        </Stagger>

        <Stagger className="directions__grid grid-12" amount={0.1}>
          {directions.items.map((d) => (
            <Item
              key={d.id}
              as="article"
              className={`direction direction--span-${d.span}${
                d.highlight ? " direction--highlight" : ""
              }`}
            >
              <Photo
                src={d.src}
                alt={d.alt}
                w={d.w}
                h={d.h}
                ratio={d.ratio}
                position={d.position}
                className="direction__photo"
              />
              <h3 className="direction__title">{d.title}</h3>
              <p className="kicker direction__age">{d.age}</p>
              <p className="note direction__text">{d.text}</p>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
