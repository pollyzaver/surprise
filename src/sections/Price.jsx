import { Stagger, Item } from "../components/Reveal.jsx";
import { price, org } from "../data/content.js";

export default function Price() {
  return (
    <section className="price" id="price">
      <Stagger className="wrap price__inner">
        <Item className="price__figure">
          <p className="num price__value">{org.price}</p>
          <p className="price__period">{org.pricePeriod}</p>
        </Item>

        <div className="price__text">
          <Item as="h2">{price.heading}</Item>

          <Item as="ul" className="price__includes">
            {price.includes.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </Item>

          <Item as="p" className="note price__extras">
            {price.extras}
          </Item>

          <Item className="price__trial">
            <p className="statement">{price.trial}</p>
            <a className="btn btn-primary" href="#signup" data-signup-open>
              Записаться на пробное
            </a>
          </Item>
        </div>
      </Stagger>
    </section>
  );
}
