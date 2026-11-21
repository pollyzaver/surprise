import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/sections.css";

/* режим для скриншотов в портфолио (…/?pin): лица детей размыты,
   адреса площадок скрыты */
if (new URLSearchParams(window.location.search).has("pin")) {
  document.documentElement.classList.add("pin-mode");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
