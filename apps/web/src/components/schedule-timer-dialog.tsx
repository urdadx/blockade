import { defaultBlockingSchedule, type BlockingSchedule } from "@blockade/core";
import { useRef, useState } from "react";

import { TimerOutline } from "@/assets/icons/timer";
import { Button } from "@/components/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/dialog";
import Scheduler from "@/components/scheduler";

export function ScheduleTimerDialog({
	className,
	schedule = defaultBlockingSchedule,
	onSave,
}: {
	className?: string;
	schedule?: BlockingSchedule;
	onSave?: (schedule: BlockingSchedule) => void | Promise<void>;
}) {
	const [draft, setDraft] = useState(schedule);
	const [isSaving, setIsSaving] = useState(false);
	const dialogActionsRef = useRef<{ close: () => void; unmount: () => void }>(null);

	const save = async (nextSchedule: BlockingSchedule) => {
		setIsSaving(true);
		try {
			await onSave?.(nextSchedule);
			dialogActionsRef.current?.close();
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Dialog actionsRef={dialogActionsRef}>
			<DialogTrigger render={<Button variant="outline" className={className} />}>
				<TimerOutline color="black" />
				{schedule.enabled ? "Edit schedule" : "Schedule blocking"}
			</DialogTrigger>
			<DialogContent
				className="max-h-[85vh] overflow-y-auto sm:max-w-lg"
				showCloseButton={!isSaving}>
				<DialogHeader className="pr-8">
					<DialogTitle className="font-display text-xl font-medium">
						Schedule blocking
					</DialogTitle>
					<DialogDescription>
						Choose the days and times when your block list and daily limits
						should be active.
					</DialogDescription>
				</DialogHeader>
				<Scheduler value={draft} onChange={setDraft} />
				<DialogFooter className="flex-wrap">
					{schedule.enabled && (
						<Button
							type="button"
							variant="destructive"
							disabled={isSaving}
							onClick={() => void save(defaultBlockingSchedule)}>
							Disable schedule
						</Button>
					)}
					<DialogClose
						disabled={isSaving}
						render={<Button type="button" variant="outline" />}>
						Cancel
					</DialogClose>
					<Button
						type="button"
						disabled={isSaving || !draft.days.some(Boolean)}
						onClick={() => void save({ ...draft, enabled: true })}>
						{isSaving ? "Saving..." : "Save changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
