import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { RedirectPage } from "../../../web/src/components/redirect-page";
import {
  addFocusTodo,
  deleteFocusTodo,
  focusTodosItem,
  toggleFocusTodo,
} from "../../lib/focus-todos-storage";
import { usePomodoroSettings } from "../../hooks/use-pomodoro-settings";
import { useRedirectSettings } from "../../hooks/use-redirect-settings";
import { useStorageItem } from "../../hooks/use-storage-item";
import "./style.css";

function ExtensionRedirectPage() {
  const { value: todos } = useStorageItem(focusTodosItem, []);
  const pomodoroSettings = usePomodoroSettings();
  const redirectSettings = useRedirectSettings();

  return (
    <RedirectPage
      todos={todos}
      sessionDuration={pomodoroSettings.sessionDuration}
      breakDuration={pomodoroSettings.breakDuration}
      showPomodoroTimer={redirectSettings.showPomodoroTimer}
      onAddTodo={(title) => void addFocusTodo(title)}
      onToggleTodo={(id) => void toggleFocusTodo(id)}
      onDeleteTodo={(id) => void deleteFocusTodo(id)}
      onManageBlockList={() => void browser.runtime.openOptionsPage()}
    />
  );
}

const root = document.querySelector("#root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <ExtensionRedirectPage />
  </StrictMode>,
);
