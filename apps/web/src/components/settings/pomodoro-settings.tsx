import { SleepIcon } from "@/assets/icons/sleep-icon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select";
import { TimerIcon } from "@/assets/icons/timer";

export function PomodoroSettings() {
	const durationLengths = [
		{
			label: "15 min",
			value: "15",
		},
		{
			label: "20 min",
			value: "20",
		},
		{
			label: "25 min",
			value: "25",
		},
		{
			label: "30 min",
			value: "30",
		},
		{
			label: "35 min",
			value: "35",
		},
		{
			label: "40 min",
			value: "40",
		},
		{
			label: "45 min",
			value: "45",
		},
		{
			label: "50 min",
			value: "50",
		},
		{
			label: "55 min",
			value: "55",
		},
		{
			label: "60 min",
			value: "60",
		},
	];

	return (
		<div className="grid gap-8 p-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
			<div className="space-y-5">
				<div className="space-y-2">
					<h3 className="text-lg font-semibold tracking-tight text-foreground">
						Pomodoro Settings
					</h3>
					<p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
						Customize your pomodoro settings to control your focus and break
						intervals
					</p>
				</div>
			</div>

			<div className="space-y-3">
				<div>
					<div className="flex flex-col gap-2 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
						<span className="flex min-w-0 items-center gap-3 text-sm text-foreground sm:shrink sm:truncate">
							<TimerIcon className="shrink-0" />
							Default session duration
						</span>
						<Select items={durationLengths} defaultValue="25">
							<SelectTrigger className="w-full sm:w-45">
								<SelectValue placeholder="Select a duration" />
							</SelectTrigger>
							<SelectContent>
								{durationLengths.map((option) => (
									<SelectItem
										key={option.value}
										value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex flex-col gap-2 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
						<span className="flex min-w-0 items-center gap-3 text-sm text-foreground sm:shrink sm:truncate">
							<SleepIcon className="shrink-0" />
							Default break duration
						</span>
						<Select items={durationLengths} defaultValue="25">
							<SelectTrigger className="w-full sm:w-45">
								<SelectValue placeholder="Select a duration" />
							</SelectTrigger>
							<SelectContent>
								{durationLengths.map((option) => (
									<SelectItem
										key={option.value}
										value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>
		</div>
	);
}
