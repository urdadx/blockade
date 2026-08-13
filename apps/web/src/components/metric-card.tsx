import { AlertLinear } from "@/assets/icons/alert-icon";
import { FireOutline } from "@/assets/icons/fire";
import { GlobeLinear } from "@/assets/icons/globe-icon";
import { MedalOutline } from "@/assets/icons/medal";
import { TimerOutline } from "@/assets/icons/timer";
import { TriangleDown, TriangleUp } from "@/assets/icons/triangle-icon";
import { cn } from "@/lib/utils";
import type { ComponentType, ReactNode, SVGProps } from "react";

type Metric = {
  value: ReactNode;
  trend?: ReactNode;
};

type MetricCardProps = {
  distractionTime: Metric;
  blocksTriggered: Metric;
  currentStreak: Metric;
  focusScore: Metric;
  topBlocked: Metric;
  className?: string;
};

type MetricItem = Metric & {
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  iconClassName: string;
};

function TrendIndicator({ trend }: { trend?: ReactNode }) {
  if (trend == null) {
    return <span className="text-sm text-muted-foreground">-</span>;
  }

  const numericTrend =
    typeof trend === "number"
      ? trend
      : typeof trend === "string"
        ? Number.parseFloat(trend)
        : Number.NaN;

  if (numericTrend === 0) {
    return <span className="text-sm text-muted-foreground">-</span>;
  }

  const isDown = numericTrend < 0;
  const TrendIcon = isDown ? TriangleDown : TriangleUp;

  return (
    <span
      className={cn(
        "flex shrink-0 items-center gap-0.5 text-[11px] font-medium",
        isDown ? "text-red-500" : "text-emerald-500",
      )}
    >
      <TrendIcon aria-hidden="true" color="currentColor" className="size-3" />
      {trend}
    </span>
  );
}

export function MetricCard({
  distractionTime,
  blocksTriggered,
  currentStreak,
  focusScore,
  topBlocked,
  className,
}: MetricCardProps) {
  const metrics: MetricItem[] = [
    {
      label: "Avg distraction time",
      icon: TimerOutline,
      iconClassName: "text-blue-500",
      ...distractionTime,
    },
    {
      label: "Blocks triggered",
      icon: AlertLinear,
      iconClassName: "text-emerald-500",
      ...blocksTriggered,
    },
    {
      label: "Current streak",
      icon: FireOutline,
      iconClassName: "text-orange-500",
      ...currentStreak,
    },
    {
      label: "Focus score",
      icon: MedalOutline,
      iconClassName: "text-amber-500",
      ...focusScore,
    },
    {
      label: "Top blocked",
      icon: GlobeLinear,
      iconClassName: "text-violet-500",
      ...topBlocked,
    },
  ];

  return (
    <section
      aria-label="Focus metrics"
      className={cn(
        "grid grid-cols-2 gap-y-5 rounded-lg border border-border bg-card px-4 py-5 sm:grid-cols-3 lg:grid-cols-5",
        className,
      )}
    >
      {metrics.map(({ label, icon: Icon, value, trend }) => (
        <div key={label} className="min-w-0 lg:px-1 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Icon aria-hidden="true" color="currentColor" className={cn("size-5 shrink-0")} />
            <span className="truncate text-sm">{label}</span>
          </div>
          <div className="mt-1 flex min-w-0 items-baseline gap-1.5">
            <strong className="truncate text-xl font-display font-semibold leading-tight tracking-tight text-foreground tabular-nums">
              {value}
            </strong>
            <TrendIndicator trend={trend} />
          </div>
        </div>
      ))}
    </section>
  );
}
