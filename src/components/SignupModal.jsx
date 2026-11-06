import { useEffect, useRef, useState } from "react";
import SignupForm from "./SignupForm.jsx";
import { signup, org } from "../data/content.js";

/* Всплывающее окно записи на пробное (практика 3, попапы 1 и 2).

   Открывается любой кнопкой с атрибутом data-signup-open: шапка, первый
   экран, блок цены, подвал. У этих ссылок остаётся href="#signup", так что
   без JavaScript они просто ведут к форме внизу страницы.

   Нативный <dialog> с showModal(): фокус остаётся внутри окна, Esc
   закрывает, страница под окном не прокручивается и не нажимается.
   Клик по затемнению вокруг окна тоже закрывает. */

export default function SignupModal() {
  const ref = useRef(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    const onClick = (e) => {
      const trigger = e.target.closest?.("[data-signup-open]");
      if (!trigger || !dialog) return;
      e.preventDefault();
      setSent(false);
      dialog.showModal();
    };
    const onClose = () => document.documentElement.classList.remove("has-modal");
    const onOpen = () => document.documentElement.classList.add("has-modal");
    document.addEventListener("click", onClick);
    dialog?.addEventListener("close", onClose);
    // класс на <html> гасит прокрутку страницы, пока окно открыто
    const mo = new MutationObserver(() => (dialog.open ? onOpen() : onClose()));
    if (dialog) mo.observe(dialog, { attributes: true, attributeFilter: ["open"] });
    return () => {
      document.removeEventListener("click", onClick);
      dialog?.removeEventListener("close", onClose);
      mo.disconnect();
    };
  }, []);

  const close = () => ref.current?.close();

  // клик по самому <dialog> — это клик по затемнению вокруг карточки
  const onBackdrop = (e) => {
    if (e.target === ref.current) close();
  };

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="signup-modal-title"
      onClick={onBackdrop}
    >
      <div className="modal__card">
        <button type="button" className="modal__close" onClick={close}>
          <span aria-hidden="true">×</span>
          <span className="visually-hidden">Закрыть</span>
        </button>

        {sent ? (
          <div className="modal__done">
            <h2 id="signup-modal-title" className="modal__title">
              Заявка отправлена
            </h2>
            <p className="lead">{signup.success}</p>
            <p className="note">
              {signup.successNote}{" "}
              <a href={org.phoneHref}>{org.phone}</a>
            </p>
            <button type="button" className="btn btn-primary" onClick={close} autoFocus>
              Закрыть
            </button>
          </div>
        ) : (
          <>
            <h2 id="signup-modal-title" className="modal__title">
              Запись на пробное занятие
            </h2>
            <p className="modal__lead">{signup.lead}</p>
            <SignupForm idPrefix="modal" onSent={() => setSent(true)} autoFocus />
          </>
        )}
      </div>
    </dialog>
  );
}
