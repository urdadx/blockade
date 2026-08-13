import type { FocusTodo } from "../../web/src/components/focus-todo-list";

const STORAGE_KEY = "focusTodos";
const MAX_ACTIVE_TASKS = 7;
const MAX_TITLE_LENGTH = 120;
let updateQueue = Promise.resolve();

export async function getFocusTodos(): Promise<FocusTodo[]> {
  const stored = await browser.storage.local.get(STORAGE_KEY);
  return sanitizeFocusTodos(stored[STORAGE_KEY]);
}

export async function addFocusTodo(title: string) {
  return updateFocusTodos((todos) => {
    if (todos.filter((todo) => !todo.completed).length >= MAX_ACTIVE_TASKS) return todos;
    const normalizedTitle = title.trim().slice(0, MAX_TITLE_LENGTH);
    if (!normalizedTitle) return todos;
    return [...todos, { id: crypto.randomUUID(), title: normalizedTitle, completed: false }];
  });
}

export async function toggleFocusTodo(id: string) {
  return updateFocusTodos((todos) =>
    todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
  );
}

export async function deleteFocusTodo(id: string) {
  return updateFocusTodos((todos) => todos.filter((todo) => todo.id !== id));
}

export function subscribeToFocusTodos(listener: (todos: FocusTodo[]) => void) {
  const onChanged = (changes: Record<string, Browser.storage.StorageChange>, areaName: string) => {
    if (areaName !== "local" || !changes[STORAGE_KEY]) return;
    listener(sanitizeFocusTodos(changes[STORAGE_KEY].newValue));
  };
  browser.storage.onChanged.addListener(onChanged);
  return () => browser.storage.onChanged.removeListener(onChanged);
}

async function updateFocusTodos(update: (todos: FocusTodo[]) => FocusTodo[]) {
  const operation = updateQueue.then(async () => {
    const next = sanitizeFocusTodos(update(await getFocusTodos()));
    await browser.storage.local.set({ [STORAGE_KEY]: next });
    return next;
  });
  updateQueue = operation.then(
    () => undefined,
    () => undefined,
  );
  return operation;
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
