import { SleepIcon } from "@/assets/icons/sleep-icon";
import { TimerIcon } from "@/assets/icons/timer";
import type { ReactNode } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select";

const durationLengths = Array.from({ length: 12 }, (_, index) => {
  const minutes = (index + 1) * 5;
  return { label: `${minutes} min`, value: String(minutes) };
});

export function PomodoroSettings({
  sessionDuration = 25,
  breakDuration = 5,
  onSessionDurationChange,
  onBreakDurationChange,
}: {
  sessionDuration?: number;
  breakDuration?: number;
  onSessionDurationChange?: (minutes: number) => void;
  onBreakDurationChange?: (minutes: number) => void;
}) {
  return (
    <div className="grid gap-8 p-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
      <div className="space-y-5">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Pomodoro Settings
          </h3>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Customize your pomodoro settings to control your focus and break intervals
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <DurationSetting
          label="Default session duration"
          icon={<TimerIcon className="shrink-0" />}
          value={sessionDuration}
          onChange={onSessionDurationChange}
        />
        <DurationSetting
          label="Default break duration"
          icon={<SleepIcon className="shrink-0" />}
          value={breakDuration}
          onChange={onBreakDurationChange}
        />
      </div>
    </div>
  );
}

function DurationSetting({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon: ReactNode;
  value: number;
  onChange?: (minutes: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2 py-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="flex min-w-0 items-center gap-3 text-sm text-foreground sm:truncate">
        {icon}
        {label}
      </span>
      <Select
        items={durationLengths}
        value={String(value)}
        onValueChange={(nextValue) => {
          if (nextValue) onChange?.(Number(nextValue));
        }}
      >
        <SelectTrigger className="w-full sm:w-45">
          <SelectValue placeholder="Select a duration" />
        </SelectTrigger>
        <SelectContent>
          {durationLengths.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
