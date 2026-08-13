import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { RedirectPage } from "../../../web/src/components/redirect-page";
import "./style.css";

const root = document.querySelector("#root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <RedirectPage onManageBlockList={() => void browser.runtime.openOptionsPage()} />
  </StrictMode>,
);
