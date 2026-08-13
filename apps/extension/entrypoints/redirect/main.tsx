import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import { RedirectPage } from "../../../web/src/components/redirect-page";
import type { FocusTodo } from "../../../web/src/components/focus-todo-list";
import {
  addFocusTodo,
  deleteFocusTodo,
  getFocusTodos,
  subscribeToFocusTodos,
  toggleFocusTodo,
} from "../../lib/focus-todos-storage";
import "./style.css";

function ExtensionRedirectPage() {
  const [todos, setTodos] = useState<FocusTodo[]>([]);

  useEffect(() => {
    let active = true;
    let receivedUpdate = false;
    const unsubscribe = subscribeToFocusTodos((nextTodos) => {
      receivedUpdate = true;
      setTodos(nextTodos);
    });
    void getFocusTodos().then((nextTodos) => {
      if (active && !receivedUpdate) setTodos(nextTodos);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return (
    <RedirectPage
      todos={todos}
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
