import { motion } from "motion/react";
import { Stagger, Item } from "../components/Reveal.jsx";
import Photo from "../components/Photo.jsx";
import { stage, awards } from "../data/content.js";

/* Единственный тёмный блок страницы: архив постановок и достижения.
   Приём из brand kit: кадры разного масштаба выхватываются по одному,
   кластер = одна постановка, подписи вертикальные, тонкая направляющая. */

const EASE = [0.23, 1, 0.32, 1];

const clusterVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.16 } },
};

const frameVariants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE } },
};

const captionVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.9, delay: 0.45 } },
};

export default function Stage() {
  return (
    <section className="stage paper-dark on-dark" id="stage">
      <div className="stage__guide" aria-hidden="true" />

      <div className="wrap stage__head">
        <Stagger>
          <Item as="h2">{stage.heading}</Item>
          <Item as="p" className="lead">
            {stage.lead}
          </Item>
        </Stagger>
      </div>

      <div className="stage__track">
        {stage.clusters.map((c) => (
          <motion.div
            key={c.id}
            className="cluster"
            variants={clusterVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.p className="cluster__caption" variants={captionVariants}>
              <span className="todo">{c.todo}</span>
              <span className="cluster__group">{c.caption}</span>
            </motion.p>

            {/* на телефоне — горизонтальная лента со свайпом,
                на десктопе display: contents, кадры стоят как раньше */}
            <div className="cluster__strip">
            {c.photos.map((p) => (
              <motion.figure
                key={p.src}
                className="cluster__frame"
                variants={frameVariants}
                style={{
                  "--l": p.style.left,
                  "--t": p.style.top,
                  "--r": p.style.right,
                  "--b": p.style.bottom,
                  "--w": p.style.width,
                  "--ar": p.style.aspectRatio,
                }}
              >
                <Photo
                  src={p.src}
                  alt={p.alt}
                  w={p.w}
                  h={p.h}
                  position={p.position}
                />
              </motion.figure>
            ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="wrap awards">
        <Stagger className="awards__inner">
          <div className="awards__text">
            <Item as="h2">{awards.heading}</Item>
            <Item as="p" className="lead">
              {awards.lead}
            </Item>
            <Item as="p" className="note awards__footnote">
              {awards.footnote}
            </Item>
          </div>

          <Item as="ul" className="awards__list">
            {awards.list.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </Item>
        </Stagger>
      </div>
    </section>
  );
}
