"use client";

import { ArrowRightIcon, SearchIcon } from "lucide-react";
import { useState } from "react";
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
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
] as const;

type Day = (typeof days)[number];

type DaySchedule = {
	start: string;
	end: string;
} | null;

const timeOptions = Array.from({ length: 96 }, (_, index) => {
	const hours = Math.floor(index / 4);
	const minutes = (index % 4) * 15;
	const period = hours < 12 ? "AM" : "PM";
	const displayHours = hours % 12 === 0 ? 12 : hours % 12;
	return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
});

const timeIndex = (time: string) => timeOptions.indexOf(time);

const defaultSchedule: Record<Day, DaySchedule> = {
	Monday: { start: "9:00 AM", end: "5:00 PM" },
	Tuesday: { start: "9:00 AM", end: "5:00 PM" },
	Wednesday: { start: "9:00 AM", end: "5:00 PM" },
	Thursday: { start: "9:00 AM", end: "5:00 PM" },
	Friday: { start: "9:00 AM", end: "5:00 PM" },
	Saturday: null,
	Sunday: null,
};

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

export default function Scheduler() {
	const [schedule, setSchedule] =
		useState<Record<Day, DaySchedule>>(defaultSchedule);

	const toggleDay = (day: Day, enabled: boolean) => {
		setSchedule((current) => ({
			...current,
			[day]: enabled ? { start: "9:00 AM", end: "5:00 PM" } : null,
		}));
	};

	const updateStart = (day: Day, start: string) => {
		setSchedule((current) => {
			const currentDay = current[day];
			if (!currentDay) return current;
			const end =
				timeIndex(start) >= timeIndex(currentDay.end)
					? (timeOptions[
							Math.min(timeIndex(start) + 4, timeOptions.length - 1)
						] ?? currentDay.end)
					: currentDay.end;
			return { ...current, [day]: { start, end } };
		});
	};

	const updateEnd = (day: Day, end: string) => {
		setSchedule((current) => {
			const currentDay = current[day];
			if (!currentDay) return current;
			return { ...current, [day]: { ...currentDay, end } };
		});
	};

	return (
		<div className="divide-y">
			{days.map((day) => {
				const daySchedule = schedule[day];

				return (
					<div
						key={day}
						className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
						<Label className="flex h-8 w-30 shrink-0 items-center gap-2.5">
							<Switch
								checked={daySchedule !== null}
								onCheckedChange={(checked) => toggleDay(day, checked)}
							/>
							{day}
						</Label>

						{daySchedule ? (
							<Group aria-label={`${day} schedule`} className="w-fit">
								<TimeCombobox
									ariaLabel={`${day} start time`}
									items={timeOptions}
									value={daySchedule.start}
									onChange={(start) => updateStart(day, start)}
								/>
								<GroupSeparator />
								<GroupText aria-hidden="true" className="px-2">
									<ArrowRightIcon className="size-3.5" />
								</GroupText>
								<GroupSeparator />
								<TimeCombobox
									ariaLabel={`${day} end time`}
									items={timeOptions.slice(timeIndex(daySchedule.start) + 1)}
									value={daySchedule.end}
									onChange={(end) => updateEnd(day, end)}
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
