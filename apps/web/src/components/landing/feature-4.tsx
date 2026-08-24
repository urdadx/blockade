import BackgroundImage from "@/assets/background_green.avif";
import { Play, RotateCcw } from "lucide-react";
import { forwardRef } from "react";
import { Button } from "../button";

function StaticDigit({ digit }: { digit: string }) {
	return (
		<div className="relative flex h-16 w-10 items-center justify-center overflow-hidden rounded-md border border-black/10 bg-white font-mono text-4xl font-medium text-black shadow-sm sm:h-20 sm:w-14 sm:text-5xl xl:h-24 xl:w-17 xl:text-6xl">
			<span>{digit}</span>
			<div className="absolute inset-x-0 top-1/2 h-px bg-black/20" />
		</div>
	);
}

function StaticFlipClock() {
	return (
		<div className="h-[260px] w-full max-w-[320px] overflow-hidden rounded-xl border border-black/10 bg-white p-4 font-sans shadow-2xl shadow-black/15 sm:p-5 md:h-[340px] xl:h-[280px] xl:max-w-[380px] min-[1600px]:h-[440px] min-[1600px]:max-w-[400px]">
			<div className="text-center flex items-center justify-center gap-1 text-sm font-medium  sm:text-base">
				<h4 className="font-display text-2xl font-semibold">Time to focus</h4>
			</div>

			<div className="mt-4 flex items-center justify-center gap-1.5 sm:mt-6 xl:gap-2">
				<StaticDigit digit="2" />
				<StaticDigit digit="5" />
				<span className="-translate-y-1 font-mono text-4xl font-medium">:</span>
				<StaticDigit digit="0" />
				<StaticDigit digit="0" />
			</div>

			<div className="mt-8 flex justify-center gap-2 xl:mt-10">
				<Button size="sm" className="gap-1.5 px-4">
					<Play className="size-3.5 fill-current" />
					Start timer
				</Button>
				<Button size="sm" variant="outline">
					<RotateCcw className="size-3.5" />
					Reset
				</Button>
			</div>
		</div>
	);
}

export const Feature4 = forwardRef<HTMLDivElement>(function Feature4(_, ref) {
	return (
		<div
			ref={ref}
			id="integrations"
			className="grid min-w-0 scroll-mt-32 gap-6 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
			<div className="flex flex-col justify-start pt-5">
				<h3 className="max-w-xl text-2xl sm:text-3xl font-medium">Pomodoro timer to track your focus sessions</h3>
				<p className="mt-4 sm:mt-6 max-w-xl text-[15px] sm:text-base font-medium text-muted-foreground">
					Built in Pomodoro timer to help you stay focused and productive. Set
					your focus sessions and take breaks to recharge.
				</p>
			</div>
			<div
				aria-hidden="true"
				className="flex min-w-0 aspect-[6/7] items-center justify-center rounded-3xl bg-cover bg-center p-3 sm:p-10"
				style={{ backgroundImage: `url(${BackgroundImage})` }}>
				<StaticFlipClock />
			</div>
		</div>
	);
});
