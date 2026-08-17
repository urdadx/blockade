import type { BlockingSchedule } from "@blockade/core";
import { ArrowRightIcon, SearchIcon } from "lucide-react";

import { Button } from "@/components/button";
import {
	Combobox,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	ComboboxPopup,
	ComboboxTrigger,
	ComboboxValue,
} from "@/components/combobox";
import { Group, GroupSeparator, GroupText } from "@/components/group";
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

const timeOptions = Array.from({ length: 96 }, (_, index) => {
	const hours = Math.floor(index / 4);
	const minutes = (index % 4) * 15;
	const period = hours < 12 ? "AM" : "PM";
	const displayHours = hours % 12 === 0 ? 12 : hours % 12;
	return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
});

function TimeCombobox({
	ariaLabel,
	items,
	onChange,
	value,
}: {
	ariaLabel: string;
	items: string[];
	onChange: (time: string) => void;
	value: string;
}) {
	return (
		<Combobox
			autoHighlight
			items={items}
			value={value}
			onValueChange={(time) => {
				if (typeof time === "string") onChange(time);
			}}>
			<ComboboxTrigger
				aria-label={ariaLabel}
				render={
					<Button
						className="w-24 font-normal tabular-nums"
						size="sm"
						variant="outline"
					/>
				}>
				<ComboboxValue />
			</ComboboxTrigger>
			<ComboboxPopup aria-label={ariaLabel} className="min-w-44">
				<div className="border-b p-2">
					<ComboboxInput
						className="rounded-md before:rounded-[calc(var(--radius-md)-1px)]"
						placeholder="Search time"
						showTrigger={false}
						size="sm"
						startAddon={<SearchIcon />}
					/>
				</div>
				<ComboboxEmpty>No times found.</ComboboxEmpty>
				<ComboboxList>
					{(time: string) => (
						<ComboboxItem key={time} value={time}>
							<span className="tabular-nums">{time}</span>
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxPopup>
		</Combobox>
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
				const startIndex = daySchedule
					? Math.min(
							Math.floor(daySchedule.startMinute / 15),
							timeOptions.length - 1,
						)
					: 0;
				const endIndex = daySchedule
					? Math.min(
							Math.floor(daySchedule.endMinute / 15),
							timeOptions.length - 1,
						)
					: 0;

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
							<Group
								aria-label={`${day.label} schedule`}
								className="w-fit">
								<TimeCombobox
									ariaLabel={`${day.label} start time`}
									items={timeOptions.slice(0, -1)}
									value={timeOptions[startIndex]!}
									onChange={(start) => {
										const startMinute =
											timeOptions.indexOf(start) * 15;
										const endMinute =
											startMinute >=
											daySchedule.endMinute
												? Math.min(
														startMinute +
															60,
														23 * 60 + 45,
													)
												: daySchedule.endMinute;
										updateDay(day.index, {
											startMinute,
											endMinute,
										});
									}}
								/>
								<GroupSeparator />
								<GroupText aria-hidden="true" className="px-2">
									<ArrowRightIcon className="size-3.5" />
								</GroupText>
								<GroupSeparator />
								<TimeCombobox
									ariaLabel={`${day.label} end time`}
									items={timeOptions.slice(startIndex + 1)}
									value={timeOptions[endIndex]!}
									onChange={(end) =>
										updateDay(day.index, {
											...daySchedule,
											endMinute:
												timeOptions.indexOf(end) *
												15,
										})
									}
								/>
							</Group>
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
