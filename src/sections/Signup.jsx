import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Stagger, Item } from "../components/Reveal.jsx";
import SignupForm from "../components/SignupForm.jsx";
import { signup, org } from "../data/content.js";

const EASE = [0.23, 1, 0.32, 1];

export default function Signup() {
  const [sent, setSent] = useState(false);

  return (
    <section className="signup" id="signup">
      <Stagger className="wrap signup__inner">
        <div className="signup__text">
          <Item as="h2">{signup.heading}</Item>
          <Item as="p" className="lead">
            {signup.lead}
          </Item>
          <Item as="p" className="signup__contacts">
            <a href={org.phoneHref}>{org.phone}</a>
            <a href={org.vk} target="_blank" rel="noreferrer">
              {org.vkLabel}
            </a>
          </Item>
        </div>

        <Item className="signup__formwrap">
          <AnimatePresence mode="wait" initial={false}>
            {sent ? (
              <motion.div
                key="done"
                className="signup__done"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <p className="statement">{signup.success}</p>
                <p className="note">{signup.successNote}</p>
                <button
                  type="button"
                  className="btn btn-quiet"
                  onClick={() => setSent(false)}
                >
                  Записать ещё одного ребёнка
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                <SignupForm idPrefix="section" onSent={() => setSent(true)} />
              </motion.div>
            )}
          </AnimatePresence>
        </Item>
      </Stagger>
    </section>
  );
}
