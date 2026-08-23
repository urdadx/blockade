import BackgroundImage from "@/assets/background_purple.avif";
import { ArrowRight } from "lucide-react";
import { forwardRef } from "react";
import { Button } from "../button";
import { Switch } from "../switch";

const scheduleDays = [
	{ day: "Monday", enabled: true },
	{ day: "Tuesday", enabled: true },
	{ day: "Wednesday", enabled: true },
	{ day: "Thursday", enabled: true },
	{ day: "Friday", enabled: true },
];

function SchedulePreview() {
	return (
		<div className="h-[350px] w-[320px] max-w-full overflow-hidden rounded-xl border border-black/10 bg-white p-4 font-sans shadow-2xl shadow-black/15 md:h-[340px] md:w-[320px] xl:h-[360px] xl:w-[380px] min-[1600px]:h-[440px] min-[1600px]:w-[400px]">
			<div>
				<h4 className="font-display text-xl font-semibold">Schedule blocking</h4>
				<p className="mt-1 text-xs leading-relaxed text-black/50">
					Choose when your block list should be active.
				</p>
			</div>

			<div className="mt-4 divide-y divide-black/8">
				{scheduleDays.map(({ day, enabled }) => (
					<div key={day} className="flex h-10 items-center gap-2">
						<Switch size="sm" checked={enabled} tabIndex={-1} />
						<span className="w-16 shrink-0 text-xs font-medium sm:w-20">
							{day}
						</span>
						{enabled ? (
							<div className="ml-auto flex items-center gap-1.5 text-[10px] tabular-nums text-black/65 sm:text-xs">
								<span className="rounded border border-black/10 px-1.5 py-1">
									9:00 AM
								</span>
								<ArrowRight className="size-3" />
								<span className="rounded border border-black/10 px-1.5 py-1">
									5:00 PM
								</span>
							</div>
						) : (
							<span className="ml-auto text-[10px] text-black/35 sm:text-xs">
								Not scheduled
							</span>
						)}
					</div>
				))}
			</div>

			<div className="mt-4 flex justify-end gap-2">
				<Button variant="outline" size="sm">
					Cancel
				</Button>
				<Button variant="default" size="sm">
					Save changes
				</Button>
			</div>
		</div>
	);
}

export const Feature2 = forwardRef<HTMLDivElement>(function Feature2(_, ref) {
	return (
		<div
			ref={ref}
			id="alerts"
			className="grid scroll-mt-32 gap-6 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
			<div className="flex flex-col justify-start pt-5">
				<h3 className="max-w-xl text-3xl font-medium">
					Schedule your focus sessions and get locked out when it’s time
				</h3>
				<p className="mt-6 max-w-xl text-base font-medium text-muted-foreground">
					Take control your day by letting Blockade lock you out of distracting
					websites and apps during your designated focus time
				</p>
			</div>
			<div
				aria-hidden="true"
				className="flex aspect-[6/7] items-center justify-center rounded-3xl bg-cover bg-center p-6 sm:p-10"
				style={{ backgroundImage: `url(${BackgroundImage})` }}>
				<SchedulePreview />
			</div>
		</div>
	);
});
