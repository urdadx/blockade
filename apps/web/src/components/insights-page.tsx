import { BlockAttemptsChart } from "@/components/block-attempts-chart";
import { FocusTimeChart } from "@/components/focus-time-chart";
import { MetricCard } from "@/components/metric-card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import { TopBlockedSites } from "@/components/top-blocked-sites";
import { TopCategoriesChart } from "@/components/top-categories-chart";
import { useState } from "react";

export type InsightsDay = {
  date: string;
  tracked: boolean;
  scheduled: boolean;
  usageMinutes: number;
  focusMinutes: number;
  blockAttempts: number;
  blockedAttemptsByWebsite: Record<string, number>;
  blockedAttemptsByCategory: Record<string, number>;
  limitsApplicable: boolean;
  limitsMet: boolean;
};

const rangeItems = [
  { label: "Last 24 hours", value: "1" },
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
];

export function InsightsPage({ days = [] }: { days?: InsightsDay[] }) {
  const [range, setRange] = useState("7");
  const periodLabel = rangeItems.find((item) => item.value === range)?.label ?? "Last 7 days";
  const selectedDays = days.slice(-Number(range));
  const trackedDays = selectedDays.filter((day) => day.tracked);
  const scheduledDays = trackedDays.filter((day) => day.scheduled);
  const totalFocus = selectedDays.reduce((total, day) => total + day.focusMinutes, 0);
  const totalAttempts = selectedDays.reduce((total, day) => total + day.blockAttempts, 0);
  const scheduledAttempts = scheduledDays.reduce((total, day) => total + day.blockAttempts, 0);
  const websiteAttempts = sumMaps(selectedDays.map((day) => day.blockedAttemptsByWebsite));
  const categoryAttempts = sumMaps(selectedDays.map((day) => day.blockedAttemptsByCategory));
  const topSites = Object.entries(websiteAttempts)
    .map(([domain, attempts]) => ({ domain, attempts }))
    .sort((a, b) => b.attempts - a.attempts);
  const topCategories = Object.entries(categoryAttempts)
    .map(([category, attempts]) => ({ category, attempts }))
    .sort((a, b) => b.attempts - a.attempts);
  const streak = getCurrentStreak(days);
  const score = scheduledDays.length
    ? Math.round(
        (scheduledDays.filter(isSuccessfulDay).length / scheduledDays.length) * 100 -
          Math.min(20, scheduledAttempts * 2),
      )
    : null;
  const chartData = selectedDays.map((day) => ({
    ...day,
    dateLabel: new Date(`${day.date}T00:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
  }));
  const dateRange = chartData.length
    ? `${chartData[0].dateLabel} - ${chartData.at(-1)?.dateLabel}`
    : "No data yet";

  return (
    <main className="mx-auto w-full max-w-7xl p-4 md:p-5">
      <div className="flex items-center justify-between pb-6">
        <h2 className="font-display text-2xl font-semibold text-foreground">Insights</h2>
        <Select
          items={rangeItems}
          value={range}
          onValueChange={(value) => {
            if (value) setRange(value);
          }}
        >
          <SelectTrigger className="w-full max-w-48 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Period</SelectLabel>
              {rangeItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <MetricCard
        focusTime={{
          value: formatMinutes(scheduledDays.length ? totalFocus / scheduledDays.length : 0),
        }}
        blocksTriggered={{ value: String(totalAttempts) }}
        currentStreak={{ value: `${streak} ${streak === 1 ? "day" : "days"}` }}
        focusScore={{ value: score === null ? "-" : String(Math.max(0, score)) }}
        topBlocked={{ value: topSites[0]?.domain ?? "-" }}
      />
      <div className="mt-5 grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
        <FocusTimeChart data={chartData} dateRange={dateRange} periodLabel={periodLabel} />
        <BlockAttemptsChart data={chartData} dateRange={dateRange} periodLabel={periodLabel} />
      </div>
      <div className="mt-5 grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
        <TopBlockedSites sites={topSites} />
        <TopCategoriesChart data={topCategories} />
      </div>
    </main>
  );
}

function sumMaps(maps: Record<string, number>[]) {
  const result: Record<string, number> = {};
  for (const map of maps) {
    for (const [key, value] of Object.entries(map)) result[key] = (result[key] ?? 0) + value;
  }
  return result;
}

function getCurrentStreak(days: InsightsDay[]) {
  let streak = 0;
  let index = days.length - 1;
  while (index >= 0) {
    const day = days[index];
    if (!day.tracked || !day.scheduled) {
      index -= 1;
      continue;
    }
    if (!isSuccessfulDay(day)) break;
    streak += 1;
    index -= 1;
  }
  return streak;
}

function isSuccessfulDay(day: InsightsDay) {
  return !day.limitsApplicable || day.limitsMet;
}

function formatMinutes(value: number) {
  const minutes = Math.round(value);
  return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;
}
