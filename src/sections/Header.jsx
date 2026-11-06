import { useEffect, useState } from "react";
import { nav } from "../data/content.js";

/* Шапка без вордмарка: имя крупно стоит на первом экране прямо под ней,
   второй раз в шапке оно перегружало строку.
   На десктопе меню в строку. До 900px меню прячется под кнопку
   «Меню» и открывается панелью под шапкой: пункты крупные, по 48px
   высотой — в них удобно попадать пальцем. Панель закрывается по клику
   на пункт, по Esc и при переходе на широкий экран. */

export default function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const wide = window.matchMedia("(min-width: 901px)");
    const onWide = (e) => e.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  return (
    <header className={`site-header${open ? " is-open" : ""}`}>
      <div className="wrap site-header__inner">
        <nav className="site-nav" id="site-nav" aria-label="Разделы страницы">
          <ul>
            {nav.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} onClick={() => setOpen(false)}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <a className="btn btn-primary site-header__cta" href="#signup" data-signup-open>
          Пробное занятие
        </a>

        <button
          type="button"
          className="site-header__toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="site-header__burger" aria-hidden="true" />
          <span className="visually-hidden">{open ? "Закрыть меню" : "Открыть меню"}</span>
        </button>
      </div>
    </header>
  );
}
