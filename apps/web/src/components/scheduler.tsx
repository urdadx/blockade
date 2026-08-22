import type { BlockingSchedule } from "@blockade/core";
import { ArrowRightIcon, ClockIcon } from "lucide-react";

import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { Switch } from "@/components/switch";

const days = [
	{ label: "Monday", index: 1 },
	{ label: "Tuesday", index: 2 },
	{ label: "Wednesday", index: 3 },
	{ label: "Thursday", index: 4 },
	{ label: "Friday", index: 5 },
	{ label: "Saturday", index: 6 },
	{ label: "Sunday", index: 0 },
] as const;

function formatTime(totalMinutes: number) {
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

function parseTime(value: string) {
	const [hours, minutes] = value.split(":").map(Number);
	if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
	if (hours! < 0 || hours! > 23 || minutes! < 0 || minutes! > 59) return null;
	return hours * 60 + minutes;
}

function TimeInput({
	ariaLabel,
	max,
	min,
	onChange,
	valueMinutes,
}: {
	ariaLabel: string;
	max?: string;
	min?: string;
	onChange: (minutes: number) => void;
	valueMinutes: number;
}) {
	return (
		<div className="relative">
			<Input
				aria-label={ariaLabel}
				className="w-28 appearance-none ps-8 pe-2 tabular-nums [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
				max={max}
				min={min}
				onChange={(event) => {
					const minutes = parseTime(event.target.value);
					if (minutes !== null) onChange(minutes);
				}}
				step={60}
				type="time"
				value={formatTime(valueMinutes)}
			/>
			<div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground/80">
				<ClockIcon aria-hidden="true" className="size-4" />
			</div>
		</div>
	);
}

export default function Scheduler({
	value,
	onChange,
}: {
	value: BlockingSchedule;
	onChange: (schedule: BlockingSchedule) => void;
}) {
	const updateDay = (dayIndex: number, window: BlockingSchedule["days"][number]) => {
		const nextDays = [...value.days];
		nextDays[dayIndex] = window;
		onChange({ enabled: true, days: nextDays });
	};

	return (
		<div className="divide-y">
			{days.map((day) => {
				const daySchedule = value.days[day.index];

				return (
					<div
						key={day.label}
						className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
						<Label className="flex h-8 w-30 shrink-0 items-center gap-2.5">
							<Switch
								checked={daySchedule !== null}
								onCheckedChange={(checked) =>
									updateDay(
										day.index,
										checked
											? {
													startMinute: 9 * 60,
													endMinute: 17 * 60,
												}
											: null,
									)
								}
							/>
							{day.label}
						</Label>

						{daySchedule ? (
							<div
								aria-label={`${day.label} schedule`}
								className="flex w-fit items-center gap-2">
								<TimeInput
									ariaLabel={`${day.label} start time`}
									max="23:58"
									valueMinutes={daySchedule.startMinute}
									onChange={(startMinute) => {
										const endMinute =
											startMinute >=
											daySchedule.endMinute
												? Math.min(
														startMinute +
															60,
														24 * 60 - 1,
													)
											: daySchedule.endMinute;
										updateDay(day.index, {
											startMinute,
											endMinute,
										});
									}}
								/>
								<ArrowRightIcon
									aria-hidden="true"
									className="size-3.5 shrink-0 text-muted-foreground"
								/>
								<TimeInput
									ariaLabel={`${day.label} end time`}
									min={formatTime(daySchedule.startMinute + 1)}
									valueMinutes={daySchedule.endMinute}
									onChange={(endMinute) => {
										if (endMinute <= daySchedule.startMinute) return;
										updateDay(day.index, {
											...daySchedule,
											endMinute,
										});
									}}
								/>
							</div>
						) : (
							<p className="flex h-8 items-center text-sm text-muted-foreground">
								Not scheduled
							</p>
						)}
					</div>
				);
			})}
		</div>
	);
}
