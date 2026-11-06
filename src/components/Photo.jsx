/* Кадр из архива. Кадрирование задаётся через ratio + position,
   чтобы не резать исходники: в архиве есть кадры с чужими логотипами
   по краям — они уходят за границу кропа. */

export default function Photo({
  src,
  alt,
  w,
  h,
  ratio,
  position = "50% 50%",
  className = "",
  loading = "lazy",
  style,
}) {
  return (
    <img
      className={`photo ${className}`}
      src={src}
      alt={alt}
      width={w}
      height={h}
      loading={loading}
      decoding="async"
      style={{ aspectRatio: ratio, objectPosition: position, ...style }}
    />
  );
}
