import { useRef, useState } from "react";
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

/* ---------- проверка полей ----------
   Сообщения пишем по-человечески и подсказываем, как исправить.
   Ошибка поля появляется, когда человек ушёл из него (blur) или нажал
   «Отправить»; после этого она обновляется прямо при вводе. */

const NAME_RE = /^[A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё\s'’-]*$/;

function phoneDigits(value) {
  let d = value.replace(/\D/g, "");
  if (d.startsWith("8")) d = "7" + d.slice(1);
  else if (d && !d.startsWith("7")) d = "7" + d;
  return d.slice(0, 11);
}

/* +7 (900) 123-45-67 — маска собирается по мере ввода */
function formatPhone(d) {
  if (!d) return "";
  const p = d.slice(1);
  let out = "+7";
  if (p.length) out += " (" + p.slice(0, 3);
  if (p.length >= 3) out += ")";
  if (p.length > 3) out += " " + p.slice(3, 6);
  if (p.length > 6) out += "-" + p.slice(6, 8);
  if (p.length > 8) out += "-" + p.slice(8, 10);
  return out;
}

const RULES = {
  parent(v) {
    const t = v.trim();
    if (!t) return "Напишите, как к вам обращаться";
    if (t.length < 2) return "Имя слишком короткое";
    if (!NAME_RE.test(t)) return "Имя может состоять только из букв, пробела и дефиса";
    return "";
  },
  phone(v) {
    const d = phoneDigits(v);
    if (!d) return "Оставьте телефон — педагог перезвонит";
    if (d.length < 11) return "В номере не хватает цифр: нужно 11, например +7 900 123-45-67";
    return "";
  },
  age(v) {
    if (!v) return "Укажите возраст ребёнка";
    const n = Number(v);
    if (n < 3 || n > 16) return "Принимаем детей от 3 до 16 лет";
    return "";
  },
  consent(v) {
    return v ? "" : "Без согласия мы не сможем записать ребёнка";
  },
};

const ORDER = ["parent", "phone", "age", "consent"];

export default function SignupForm({ idPrefix, onSent, className = "", autoFocus = false }) {
  const [status, setStatus] = useState("idle"); // idle | sending | error
  const [values, setValues] = useState({ parent: "", phone: "", age: "", consent: false });
  const [touched, setTouched] = useState({});
  const refs = useRef({});

  const errors = Object.fromEntries(ORDER.map((k) => [k, RULES[k](values[k])]));
  const shown = (k) => (touched[k] ? errors[k] : "");

  const set = (k, v) => setValues((prev) => ({ ...prev, [k]: v }));
  const touch = (k) => setTouched((prev) => (prev[k] ? prev : { ...prev, [k]: true }));

  function onPhoneChange(e) {
    const raw = e.target.value;
    let d = phoneDigits(raw);
    /* стёрли скобку или дефис — цифры не поменялись; стираем цифру перед ними */
    if (raw.length < values.phone.length && d === phoneDigits(values.phone)) d = d.slice(0, -1);
    set("phone", formatPhone(d));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (status === "sending") return;

    const firstBad = ORDER.find((k) => errors[k]);
    if (firstBad) {
      setTouched({ parent: true, phone: true, age: true, consent: true });
      refs.current[firstBad]?.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(e.currentTarget));
    data.parent = data.parent.trim();
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

  /* общие атрибуты: связь поля с текстом ошибки для экранных читалок */
  const a11y = (k) => ({
    id: id(k),
    name: k,
    ref: (el) => {
      refs.current[k] = el;
    },
    "aria-invalid": shown(k) ? true : undefined,
    "aria-describedby": shown(k) ? id(`${k}-error`) : undefined,
    onBlur: () => touch(k),
  });

  const FieldError = ({ k }) =>
    shown(k) ? (
      <p className="field__error" id={id(`${k}-error`)}>
        {shown(k)}
      </p>
    ) : null;

  return (
    <form className={`signup__form ${className}`} onSubmit={handleSubmit} noValidate>
      {/* ловушка для спам-ботов: людям не видна, боты её заполняют */}
      <input
        className="signup__trap"
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className={`field${shown("parent") ? " is-invalid" : ""}`}>
        <label htmlFor={id("parent")}>Имя родителя</label>
        <input
          {...a11y("parent")}
          type="text"
          required
          maxLength={80}
          autoComplete="name"
          autoFocus={autoFocus}
          value={values.parent}
          onChange={(e) => set("parent", e.target.value)}
        />
        <FieldError k="parent" />
      </div>

      <div className={`field${shown("phone") ? " is-invalid" : ""}`}>
        <label htmlFor={id("phone")}>Телефон</label>
        <input
          {...a11y("phone")}
          type="tel"
          required
          inputMode="tel"
          placeholder="+7 (___) ___-__-__"
          autoComplete="tel"
          value={values.phone}
          onChange={onPhoneChange}
        />
        <FieldError k="phone" />
      </div>

      <div className={`field field--narrow${shown("age") ? " is-invalid" : ""}`}>
        <label htmlFor={id("age")}>Возраст ребёнка</label>
        <input
          {...a11y("age")}
          type="text"
          required
          inputMode="numeric"
          maxLength={2}
          placeholder="от 3 до 16"
          value={values.age}
          onChange={(e) => set("age", e.target.value.replace(/\D/g, "").slice(0, 2))}
        />
        <FieldError k="age" />
      </div>

      <div className="field">
        <label htmlFor={id("venue")}>Площадка</label>
        <select id={id("venue")} name="venue" defaultValue={venues.items[0].address}>
          {venues.items.map((v) => (
            <option key={v.id} value={v.address}>
              {v.address} · {v.area}
            </option>
          ))}
        </select>
      </div>

      <div className={`signup__consent${shown("consent") ? " is-invalid" : ""}`}>
        <label className="check" htmlFor={id("consent")}>
          <input
            {...a11y("consent")}
            type="checkbox"
            required
            checked={values.consent}
            onChange={(e) => {
              set("consent", e.target.checked);
              touch("consent");
            }}
          />
          <span>
            Даю{" "}
            <a href="/consent.html" target="_blank" rel="noreferrer">
              согласие на обработку персональных данных
            </a>
          </span>
        </label>
        <FieldError k="consent" />
      </div>
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
