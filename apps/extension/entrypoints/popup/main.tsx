import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Popup } from "./popup";
import "./style.css";

const root = document.querySelector("#root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <Popup />
  </StrictMode>,
);
