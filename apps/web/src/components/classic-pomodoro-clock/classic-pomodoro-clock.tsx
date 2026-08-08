import { ListPlusIcon, PauseIcon, PlayIcon, SettingsIcon } from "lucide-react";

import { Button } from "@/components/button";
import { cn } from "@/lib/utils";

export type ClassicPomodoroClockProps = {
  className?: string;
  formattedTime: string;
  isRunning: boolean;
  stepMinutes: number;
  canAdjust: boolean;
  caption?: string;
  onToggle: () => void;
  onDecrease: () => void;
  onIncrease: () => void;
};

export function ClassicPomodoroClock({
  className,
  formattedTime,
  isRunning,
  stepMinutes,
  canAdjust,
  caption = "Get Llama Life!",
  onToggle,
  onDecrease,
  onIncrease,
}: ClassicPomodoroClockProps) {
  return (
    <section
      className={cn(
        "relative flex min-h-72 w-full max-w-md flex-col overflow-hidden rounded-2xl border bg-card px-5 py-5 text-card-foreground sm:px-6",
        className,
      )}
      aria-label="Classic Pomodoro timer"
    >
      <div className="flex items-start justify-between text-muted-foreground/55" aria-hidden="true">
        <SettingsIcon className="size-5" strokeWidth={2} />
        <ListPlusIcon className="size-5" strokeWidth={2} />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
        <p className="font-roobert text-5xl leading-none font-semibold tracking-[-0.055em] tabular-nums text-foreground sm:text-6xl">
          {formattedTime}
        </p>
        <p className="mt-3 text-sm font-medium text-muted-foreground">{caption}</p>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-5 pb-2">
        <Button
          type="button"
          variant="ghost"
          size="default"
          className="justify-self-end px-3 text-lg font-semibold tabular-nums"
          onClick={onDecrease}
          disabled={!canAdjust}
          aria-label={`Decrease timer by ${stepMinutes} minutes`}
        >
          -{stepMinutes}
        </Button>

        <Button
          type="button"
          size="icon"
          onClick={onToggle}
          aria-label={isRunning ? "Pause timer" : "Start timer"}
          className="size-14 rounded-full border-2 border-background bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
        >
          <span className="relative size-6" aria-hidden="true">
            <PlayIcon
              className={cn(
                "absolute inset-0 size-6 translate-x-px fill-current transition-[opacity,scale,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none",
                isRunning ? "scale-25 opacity-0 blur-[4px]" : "scale-100 opacity-100 blur-0",
              )}
            />
            <PauseIcon
              className={cn(
                "absolute inset-0 size-6 fill-current transition-[opacity,scale,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none",
                isRunning ? "scale-100 opacity-100 blur-0" : "scale-25 opacity-0 blur-[4px]",
              )}
            />
          </span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="default"
          className="justify-self-start px-3 text-lg font-semibold tabular-nums"
          onClick={onIncrease}
          disabled={!canAdjust}
          aria-label={`Increase timer by ${stepMinutes} minutes`}
        >
          +{stepMinutes}
        </Button>
      </div>
    </section>
  );
}
