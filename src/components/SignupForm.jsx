import { venues } from "../data/content.js";

/* Форма записи на пробное — одна и та же в блоке «Запись» и во
   всплывающем окне. Поля по вайрфрейму (практика 3, попап 1):
   имя родителя, телефон, возраст ребёнка, площадка, согласие.

   TODO: подключить отправку заявки (почта, Телеграм-бот или форма Яндекса).
   Пока браузер проверяет обязательные поля, и форма сообщает onSent(). */

export default function SignupForm({ idPrefix, onSent, className = "", autoFocus = false }) {
  function handleSubmit(e) {
    e.preventDefault();
    onSent?.(Object.fromEntries(new FormData(e.currentTarget)));
  }

  const id = (name) => `${idPrefix}-${name}`;

  return (
    <form className={`signup__form ${className}`} onSubmit={handleSubmit}>
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
        <span>Согласен(на) на обработку персональных данных</span>
      </label>

      <button className="btn btn-primary signup__submit" type="submit">
        Отправить заявку
      </button>
    </form>
  );
}
