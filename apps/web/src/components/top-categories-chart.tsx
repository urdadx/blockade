import { BlockLegend } from "@/components/dither-kit/block-legend";
import type { ChartConfig } from "@/components/dither-kit/chart-context";
import { Pie } from "@/components/dither-kit/pie";
import { PieChart } from "@/components/dither-kit/pie-chart";
import { Tooltip } from "@/components/dither-kit/tooltip";

const config = {
	social: { label: "Social media", color: "green" },
	adult: { label: "Adult", color: "blue" },
	news: { label: "News", color: "purple" },
	shopping: { label: "Shopping", color: "orange" },
	sports: { label: "Sports", color: "red" },
	gambling: { label: "Gambling", color: "grey" },
	other: { label: "Other", color: "pink" },
} satisfies ChartConfig;

type ConfiguredCategory = keyof typeof config;

function isConfiguredCategory(category: string): category is ConfiguredCategory {
	return category in config && category !== "other";
}

export function TopCategoriesChart({ data }: { data: { category: string; attempts: number }[] }) {
	const groupedData = Object.entries(
		data.reduce<Record<string, number>>((totals, { category, attempts }) => {
			if (attempts <= 0) return totals;
			const key = isConfiguredCategory(category) ? category : "other";
			totals[key] = (totals[key] ?? 0) + attempts;
			return totals;
		}, {}),
	).map(([category, attempts]) => ({ category, attempts }));
	const categoryValues = Object.fromEntries(
		groupedData.map(({ category, attempts }) => [category, attempts]),
	);
	return (
		<section className="h-full rounded-xl border bg-card p-5">
			<div className="mb-4 flex items-start justify-between gap-4">
				<div>
					<h3 className="font-display text-lg font-semibold text-foreground">
						Top categories
					</h3>
					<p className="mt-1 text-sm text-pretty text-muted-foreground">
						Most-blocked categories in this period
					</p>
				</div>
			</div>

			{groupedData.length > 0 ? (
				<div className="flex flex-col items-center gap-4 sm:flex-row">
					<div className="h-52 w-full min-w-0 sm:w-1/2">
						<PieChart
							data={groupedData}
							config={config}
							dataKey="attempts"
							nameKey="category"
							innerRadius={0.55}
							bloom="low"
							className="h-full w-full">
							<Tooltip
								variant="frosted-glass"
								valueFormatter={(value) => `${value} times`}
							/>
							<Pie variant="gradient" />
						</PieChart>
					</div>
					<BlockLegend
						config={config}
						values={categoryValues}
						valueFormatter={(value) => value.toLocaleString()}
						className="w-full sm:w-1/2 sm:flex-col sm:items-start [&_li]:font-sans [&_li]:text-xs [&_li]:tabular-nums"
					/>
				</div>
			) : (
				<div className="flex h-52 items-center justify-center text-sm text-muted-foreground">
					No data available yet
				</div>
			)}
		</section>
	);
}
