import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// Telegram WebApp bootstrap
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  try {
    tg.setHeaderColor?.("#07110d");
    tg.setBackgroundColor?.("#07110d");
    tg.disableVerticalSwipes?.();
  } catch {
    /* older clients */
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
