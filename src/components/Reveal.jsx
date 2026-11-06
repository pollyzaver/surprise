import { motion } from "motion/react";
import { groupVariants, itemVariants } from "./revealVariants.js";

/* MotionConfig reducedMotion="user" в App.jsx отключает сдвиг по Y
   тем, кто просил уменьшить движение, и оставляет только прозрачность. */

export function Stagger({ children, className, amount = 0.2, ...rest }) {
  return (
    <motion.div
      className={className}
      variants={groupVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function Item({ children, className, as = "div", ...rest }) {
  const Tag = motion[as] ?? motion.div;
  return (
    <Tag className={className} variants={itemVariants} {...rest}>
      {children}
    </Tag>
  );
}
