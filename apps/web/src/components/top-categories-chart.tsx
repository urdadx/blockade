import { BlockLegend } from "@/components/dither-kit/block-legend";
import type { ChartConfig } from "@/components/dither-kit/chart-context";
import { Pie } from "@/components/dither-kit/pie";
import { PieChart } from "@/components/dither-kit/pie-chart";
import { Tooltip } from "@/components/dither-kit/tooltip";

const categoryData = [
	{ category: "social", attempts: 186 },
	{ category: "entertainment", attempts: 142 },
	{ category: "news", attempts: 91 },
	{ category: "shopping", attempts: 67 },
];

const config = {
	social: { label: "Social media", color: "green" },
	entertainment: { label: "Entertainment", color: "blue" },
	news: { label: "News", color: "purple" },
	shopping: { label: "Shopping", color: "orange" },
} satisfies ChartConfig;

const categoryValues = Object.fromEntries(
	categoryData.map(({ category, attempts }) => [category, attempts]),
);

export function TopCategoriesChart() {
	return (
		<section className="h-full rounded-xl border bg-white p-5">
			<div className="mb-4 flex items-start justify-between gap-4">
				<div>
					<h3 className="font-display text-lg font-semibold text-foreground">
						Top categories
					</h3>
					<p className="mt-1 text-sm text-muted-foreground">
						Most-blocked categories this week
					</p>
				</div>
			</div>

			<div className="flex flex-col items-center gap-4 sm:flex-row">
				<div className="h-52 w-full min-w-0 sm:w-1/2">
					<PieChart
						data={categoryData}
						config={config}
						dataKey="attempts"
						nameKey="category"
						innerRadius={0.55}
						bloom="low"
						className="h-full w-full">
						<Tooltip
							variant="frosted-glass"
							valueFormatter={(value) => `${value} attempts`}
						/>
						<Pie variant="gradient" />
					</PieChart>
				</div>
				<BlockLegend
					config={config}
					values={categoryValues}
					valueFormatter={(value) => value.toLocaleString()}
					className="w-full sm:w-1/2 sm:flex-col sm:items-start [&_li]:font-sans [&_li]:text-xs"
				/>
			</div>
		</section>
	);
}
