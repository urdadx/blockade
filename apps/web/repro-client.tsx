import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { createRequire } from "node:module";
import { defaultBlockingSchedule } from "@blockade/core";
import { ScheduleTimerDialog } from "./src/components/schedule-timer-dialog";

const require = createRequire(import.meta.url);
const { JSDOM } = require("/tmp/opencode/node_modules/jsdom") as typeof import("jsdom");

const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
  url: "http://localhost/",
});
for (const key of ["window", "document", "navigator", "HTMLElement", "Element", "Node", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame", "ResizeObserver", "MutationObserver", "PointerEvent", "MouseEvent", "KeyboardEvent", "TouchEvent", "FocusEvent", "CustomEvent", "Event"] as const) {
  try {
    (globalThis as any)[key] = (dom.window as any)[key];
  } catch {
    Object.defineProperty(globalThis, key, { value: (dom.window as any)[key], configurable: true, writable: true });
  }
}

async function run() {
  let crash: Error | null = null;
  const origError = console.error;
  console.error = (...args: any[]) => {
    const msg = args.map(String).join(" ");
    if (/cannot read|undefined is not|is not a function|Invalid hook|Minified React|TypeError|Error:/i.test(msg)) {
      crash = new Error(msg.slice(0, 400));
    }
    origError(...args);
  };

  const enabledSchedule = {
    enabled: true,
    days: Array.from({ length: 7 }, (_, i) =>
      i >= 1 && i <= 5 ? { startMinute: 9 * 60, endMinute: 17 * 60 } : null,
    ),
  };

  const root = createRoot(dom.window.document.getElementById("app")!);
  root.render(
    createElement(ScheduleTimerDialog, { schedule: enabledSchedule, onSave: async () => {} }),
  );
  await new Promise((r) => setTimeout(r, 300));

  const trigger = dom.window.document.querySelector("[data-slot=dialog-trigger]") as HTMLElement;
  if (!trigger) {
    console.log("NO TRIGGER");
    return;
  }
  console.log("trigger found:", trigger.textContent?.trim());

  try {
    (trigger as any).click();
    await new Promise((r) => setTimeout(r, 2000));
    const content = dom.window.document.querySelector("[data-slot=dialog-content]");
    console.log("dialog content mounted:", !!content);
    console.log("body snippet:", dom.window.document.body.innerHTML.slice(0, 300).replace(/\s+/g, " "));
  } catch (e) {
    console.log("CLICK THREW:", (e as Error).message);
  }

  await new Promise((r) => setTimeout(r, 300));
  if (crash) {
    console.log("CRASH DETECTED:", crash.message);
  } else {
    console.log("NO CRASH DETECTED");
  }
  process.exit(0);
}

run().catch((e) => {
  console.log("TOP LEVEL ERROR:", e);
  process.exit(1);
});