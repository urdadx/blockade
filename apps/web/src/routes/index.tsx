import { Button } from "@/components/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ScheduleTimerDialog } from "@/components/schedule-timer-dialog";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<div className="container mx-auto max-w-3xl px-4 py-2">
			<Link to="/block-list">
				<Button>Go to block lists</Button>
			</Link>
			<ScheduleTimerDialog
				schedule={{
					enabled: true,
					days: [{ startMinute: 9 * 60, endMinute: 24 * 60 }, null, null, null, null, null, null],
				}}
			/>
		</div>
	);
}
