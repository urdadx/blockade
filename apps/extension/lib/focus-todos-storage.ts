import type { FocusTodo } from "../../web/src/components/focus-todo-list";
import { defineStorageItem } from "./storage-item";

const MAX_ACTIVE_TASKS = 7;
const MAX_TITLE_LENGTH = 120;

export const focusTodosItem = defineStorageItem({
  key: "focusTodos",
  sanitize: sanitizeFocusTodos,
});

export const getFocusTodos = focusTodosItem.get;

export function addFocusTodo(title: string) {
  return focusTodosItem.update((todos) => {
    if (todos.filter((todo) => !todo.completed).length >= MAX_ACTIVE_TASKS) return todos;
    const normalizedTitle = title.trim().slice(0, MAX_TITLE_LENGTH);
    if (!normalizedTitle) return todos;
    return [...todos, { id: crypto.randomUUID(), title: normalizedTitle, completed: false }];
  });
}

export function toggleFocusTodo(id: string) {
  return focusTodosItem.update((todos) =>
    todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
  );
}

export function deleteFocusTodo(id: string) {
  return focusTodosItem.update((todos) => todos.filter((todo) => todo.id !== id));
}

function sanitizeFocusTodos(value: unknown): FocusTodo[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): FocusTodo[] => {
    if (!item || typeof item !== "object") return [];
    const todo = item as Partial<FocusTodo>;
    const title =
      typeof todo.title === "string" ? todo.title.trim().slice(0, MAX_TITLE_LENGTH) : "";
    if (typeof todo.id !== "string" || !title) return [];
    return [{ id: todo.id, title, completed: todo.completed === true }];
  });
}
