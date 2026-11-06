import { Stagger, Item } from "../components/Reveal.jsx";
import { venues } from "../data/content.js";

export default function Venues() {
  return (
    <section className="section venues" id="venues">
      <div className="wrap">
        <Stagger className="venues__head">
          <Item as="h2">{venues.heading}</Item>
          <Item as="p" className="lead">
            {venues.lead}
          </Item>
        </Stagger>

        <Stagger className="venues__list" amount={0.15}>
          {venues.items.map((v) => (
            <Item key={v.id} as="article" className="venue">
              <p className="kicker venue__area">{v.area}</p>
              <h3 className="venue__address">{v.address}</h3>
              <p className="note venue__place">{v.place}</p>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
