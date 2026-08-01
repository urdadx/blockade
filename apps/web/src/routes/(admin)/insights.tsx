import { MetricCard } from "@/components/metric-card";
import { TopBlockedSites } from "@/components/top-blocked-sites";
import { TopCategoriesChart } from "@/components/top-categories-chart";

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/select";
import { createFileRoute } from "@tanstack/react-router";
import { BlockAttemptsChart } from "@/components/block-attempts-chart";
import { FocusTimeChart } from "@/components/focus-time-chart";

export const Route = createFileRoute("/(admin)/insights")({
	component: RouteComponent,
});

function RouteComponent() {
	const items = [
		{ label: "Last 24 hours", value: "24" },
		{ label: "Last 7 days", value: "7" },
		{ label: "Last 30 days", value: "30" },
		{ label: "Last 90 days", value: "90" },
		{ label: "Last year", value: "365" },
	];

	const chartData = [
		{ date: "2026-07-27", dateLabel: "Jul 27", focusTime: 84, blockAttempts: 62 },
		{ date: "2026-07-28", dateLabel: "Jul 28", focusTime: 112, blockAttempts: 96 },
		{ date: "2026-07-29", dateLabel: "Jul 29", focusTime: 73, blockAttempts: 71 },
		{ date: "2026-07-30", dateLabel: "Jul 30", focusTime: 60, blockAttempts: 108 },
		{ date: "2026-07-31", dateLabel: "Jul 31", focusTime: 40, blockAttempts: 82 },
		{ date: "2026-08-01", dateLabel: "Aug 1", focusTime: 100, blockAttempts: 48 },
		{ date: "2026-08-02", dateLabel: "Aug 2", focusTime: 30, blockAttempts: 89 },
	];

	return (
		<main className="p-4 md:p-5 w-full max-w-7xl mx-auto">
			<div className="flex justify-between items-center  pb-6">
				<h2 className="text-2xl font-semibold font-display text-foreground">
					Insights
				</h2>
				<Select items={items} defaultValue="7">
					<SelectTrigger className="w-full bg-white max-w-48">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Fruits</SelectLabel>
							{items.map((item) => (
								<SelectItem key={item.value} value={item.value}>
									{item.label}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
			<MetricCard
				focusTime={{ value: "3h 24m", trend: "18%" }}
				blocksTriggered={{ value: "47", trend: "-12%" }}
				currentStreak={{ value: "8 days" }}
				focusScore={{ value: "86", trend: "7%" }}
				topBlocked={{ value: "instagram.com" }}
			/>
			<div className="mt-5 grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
				<FocusTimeChart data={chartData} dateRange="Jul 27 - Aug 2" />
				<BlockAttemptsChart data={chartData} dateRange="Jul 27 - Aug 2" />
			</div>{" "}
			<div className="mt-5 grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
				<TopBlockedSites dateRange="Jul 27 - Aug 2" />

				<TopCategoriesChart dateRange="Jul 27 - Aug 2" />
			</div>
		</main>
	);
}
