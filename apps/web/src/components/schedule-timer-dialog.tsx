import { TimerOutline } from "@/assets/icons/timer";
import { Button } from "@/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/dialog";
import Scheduler from "@/components/scheduler";

export function ScheduleTimerDialog({ className }: { className?: string }) {
	return (
		<Dialog>
			<DialogTrigger render={<Button variant="outline" className={className} />}>
				<TimerOutline />
				Schedule Timer
			</DialogTrigger>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="font-display text-xl">
						Schedule blocking
					</DialogTitle>
					<DialogDescription>
						Choose the days and times when your block list should be active.
					</DialogDescription>
				</DialogHeader>
				<Scheduler />
			</DialogContent>
		</Dialog>
	);
}
