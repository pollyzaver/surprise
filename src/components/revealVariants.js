/* Единый сценарий появления секций: заголовок → текст → изображение,
   сдвиг 70 мс между элементами. */

export const EASE = [0.23, 1, 0.32, 1];

export const groupVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};
