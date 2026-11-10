import { useState } from "react";
import { org, venues } from "../data/content.js";

/* Форма записи на пробное — одна и та же в блоке «Запись» и во
   всплывающем окне. Поля по вайрфрейму (практика 3, попап 1):
   имя родителя, телефон, возраст ребёнка, площадка, согласие.

   На опубликованном сайте заявка уходит в функцию /api/signup
   (файл api/signup.js), а та пересылает её в Телеграм.
   При локальной разработке (npm run dev) функции нет, поэтому форма
   работает как макет: сразу показывает «Заявка записана».
   Адрес можно переопределить переменной VITE_SIGNUP_URL. */

const SIGNUP_URL =
  import.meta.env.VITE_SIGNUP_URL || (import.meta.env.PROD ? "/api/signup" : "");

async function sendSignup(data) {
  if (!SIGNUP_URL) {
    console.info("VITE_SIGNUP_URL не задан — заявка не отправлена (режим макета)", data);
    return;
  }
  const res = await fetch(SIGNUP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) throw new Error(json.error || `HTTP ${res.status}`);
}

export default function SignupForm({ idPrefix, onSent, className = "", autoFocus = false }) {
  const [status, setStatus] = useState("idle"); // idle | sending | error

  async function handleSubmit(e) {
    e.preventDefault();
    if (status === "sending") return;
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setStatus("sending");
    try {
      await sendSignup(data);
      setStatus("idle");
      onSent?.(data);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  const id = (name) => `${idPrefix}-${name}`;

  return (
    <form className={`signup__form ${className}`} onSubmit={handleSubmit}>
      {/* ловушка для спам-ботов: людям не видна, боты её заполняют */}
      <input
        className="signup__trap"
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <label className="field" htmlFor={id("parent")}>
        <span>Имя родителя</span>
        <input
          id={id("parent")}
          name="parent"
          type="text"
          required
          autoComplete="name"
          autoFocus={autoFocus}
        />
      </label>

      <label className="field" htmlFor={id("phone")}>
        <span>Телефон</span>
        <input
          id={id("phone")}
          name="phone"
          type="tel"
          required
          placeholder="+7 ___ ___-__-__"
          autoComplete="tel"
        />
      </label>

      <label className="field field--narrow" htmlFor={id("age")}>
        <span>Возраст ребёнка</span>
        <input
          id={id("age")}
          name="age"
          type="number"
          min="3"
          max="16"
          required
          inputMode="numeric"
        />
      </label>

      <label className="field" htmlFor={id("venue")}>
        <span>Площадка</span>
        <select id={id("venue")} name="venue" defaultValue={venues.items[0].address}>
          {venues.items.map((v) => (
            <option key={v.id} value={v.address}>
              {v.address} · {v.area}
            </option>
          ))}
        </select>
      </label>

      <label className="check" htmlFor={id("consent")}>
        <input id={id("consent")} name="consent" type="checkbox" required />
        <span>
          Даю{" "}
          <a href="/consent.html" target="_blank" rel="noreferrer">
            согласие на обработку персональных данных
          </a>
        </span>
      </label>
      <p className="note signup__policy">
        Как мы храним и используем данные — в{" "}
        <a href="/privacy.html" target="_blank" rel="noreferrer">
          политике конфиденциальности
        </a>
        .
      </p>

      {status === "error" && (
        <p className="signup__error" role="alert">
          Не получилось отправить заявку. Попробуйте ещё раз или позвоните:{" "}
          <a href={org.phoneHref}>{org.phone}</a>
        </p>
      )}

      <button
        className="btn btn-primary signup__submit"
        type="submit"
        disabled={status === "sending"}
        aria-busy={status === "sending"}
      >
        {status === "sending" ? "Отправляем…" : "Отправить заявку"}
      </button>
    </form>
  );
}
