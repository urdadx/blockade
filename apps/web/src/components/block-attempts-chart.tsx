import { Bar } from "@/components/dither-kit/bar";
import { BarChart } from "@/components/dither-kit/bar-chart";
import type { ChartConfig } from "@/components/dither-kit/chart-context";
import { Grid } from "@/components/dither-kit/grid";
import { Tooltip } from "@/components/dither-kit/tooltip";
import { XAxis } from "@/components/dither-kit/x-axis";
import { YAxis } from "@/components/dither-kit/y-axis";

export type BlockAttemptsDatum = {
  date: string;
  dateLabel: string;
  blockAttempts: number;
};

type BlockAttemptsChartProps = {
  data: BlockAttemptsDatum[];
  dateRange: string;
};

const config = {
  blockAttempts: {
    label: "Block attempts",
    color: "blue",
  },
} satisfies ChartConfig;

export function BlockAttemptsChart({ data, dateRange }: BlockAttemptsChartProps) {
  const totalAttempts = data.reduce((total, item) => total + item.blockAttempts, 0);

  return (
    <section className="flex h-96 min-w-0 flex-col rounded-xl border bg-card px-1 py-5">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4 px-5">
        <div className="flex min-w-0 flex-col gap-1 text-left">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2 shrink-0 rounded bg-blue-500" />
            <span>Weekly block attempts</span>
          </div>
          <p className="font-display text-2xl font-semibold text-foreground tabular-nums">
            {totalAttempts}
          </p>
        </div>
        <div className="min-w-0 text-right">
          <p className="text-xs text-muted-foreground">{dateRange}</p>
          <h3 className="mt-1 font-display text-base font-medium">Last 7 days</h3>
        </div>
      </header>

      <div className="min-h-0 flex-1 px-3 pt-5 sm:px-5">
        <BarChart
          data={data}
          config={config}
          bloom="low"
          margins={{ top: 8, right: 10, bottom: 24, left: 34 }}
          className="h-full w-full"
        >
          <Grid />
          <XAxis dataKey="dateLabel" maxTicks={7} />
          <YAxis tickCount={4} />
          <Tooltip labelKey="dateLabel" variant="frosted-glass" />
          <Bar dataKey="blockAttempts" variant="gradient" />
        </BarChart>
      </div>
    </section>
  );
}
