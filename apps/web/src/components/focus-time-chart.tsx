import { Area } from "@/components/dither-kit/area";
import { AreaChart } from "@/components/dither-kit/area-chart";
import type { ChartConfig } from "@/components/dither-kit/chart-context";
import { Grid } from "@/components/dither-kit/grid";
import { Tooltip } from "@/components/dither-kit/tooltip";
import { XAxis } from "@/components/dither-kit/x-axis";
import { YAxis } from "@/components/dither-kit/y-axis";

export type FocusTimeDatum = {
	date: string;
	dateLabel: string;
	focusTime: number;
};

type FocusTimeChartProps = {
	data: FocusTimeDatum[];
	dateRange: string;
};

const config = {
	focusTime: {
		label: "Focus time",
		color: "orange",
	},
} satisfies ChartConfig;

export function FocusTimeChart({ data, dateRange }: FocusTimeChartProps) {
	const totalMinutes = data.reduce((total, item) => total + item.focusTime, 0);

	return (
		<section className="flex h-96 min-w-0 flex-col rounded-xl border bg-white px-1 py-5">
			<header className="flex shrink-0 items-start justify-between gap-4 px-5">
				<div className="flex min-w-0 flex-col gap-1 text-left">
					<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
						<span className="size-2 shrink-0 rounded bg-orange-500" />
						<span>Weekly focus time</span>
					</div>
					<p className="font-display text-2xl font-semibold text-black">
						{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
					</p>
				</div>
				<div className="shrink-0 text-right">
					<p className="text-xs text-muted-foreground">{dateRange}</p>
					<h3 className="mt-1 font-display text-base font-medium">
						Last 7 days
					</h3>
				</div>
			</header>

			<div className="min-h-0 flex-1 px-3 pt-5 sm:px-5">
				<AreaChart
					data={data}
					config={config}
					bloom="aura"
					margins={{ top: 8, right: 10, bottom: 24, left: 38 }}
					className="h-full w-full">
					<Grid />
					<XAxis dataKey="dateLabel" maxTicks={7} />
					<YAxis tickCount={4} tickFormatter={(value) => `${value}m`} />
					<Tooltip
						labelKey="dateLabel"
						variant="frosted-glass"
						valueFormatter={(value) => `${value} min`}
					/>
					<Area dataKey="focusTime" variant="gradient" />
				</AreaChart>
			</div>
		</section>
	);
}
