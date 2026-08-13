import { Button } from "@/components/button";
import FlipClock from "@/components/8starlabs-ui/flip-clock";
import { DitherImage } from "@/components/dither-kit/dither-image";
import { FocusTodoList, type FocusTodo } from "@/components/focus-todo-list";
import { SettingsLinear } from "@/assets/icons/settings-duotone";
import { GithubStar } from "@/assets/icons/github-icon";
import { PauseIcon, PlayIcon, RotateCcwIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const backgrounds = Object.values(
	import.meta.glob<string>("../assets/backgrounds/*.avif", {
		eager: true,
		import: "default",
	}),
);
const background = backgrounds[Math.floor(Math.random() * backgrounds.length)];

export function RedirectPage({
	onManageBlockList,
	todos = [],
	onAddTodo,
	onToggleTodo,
	onDeleteTodo,
	sessionDuration = 25,
	breakDuration = 5,
}: {
	onManageBlockList?: () => void;
	todos?: FocusTodo[];
	onAddTodo?: (title: string) => void;
	onToggleTodo?: (id: string) => void;
	onDeleteTodo?: (id: string) => void;
	sessionDuration?: number;
	breakDuration?: number;
}) {
	const [mode, setMode] = useState<"focus" | "break">("focus");
	const [remainingSeconds, setRemainingSeconds] = useState(sessionDuration * 60);
	const [isRunning, setIsRunning] = useState(false);
	const endTimeRef = useRef(0);
	const hasCompletedRef = useRef(false);
	const modeDuration = mode === "focus" ? sessionDuration : breakDuration;

	useEffect(() => {
		setIsRunning(false);
		setRemainingSeconds(modeDuration * 60);
	}, [modeDuration]);

	useEffect(() => {
		if (!isRunning) return;
		const update = () => {
			const nextSeconds = Math.max(0, (endTimeRef.current - Date.now()) / 1000);
			setRemainingSeconds(nextSeconds);
			if (nextSeconds === 0 && !hasCompletedRef.current) {
				hasCompletedRef.current = true;
				setIsRunning(false);
				setMode((currentMode) => (currentMode === "focus" ? "break" : "focus"));
			}
		};
		update();
		const interval = window.setInterval(update, 250);
		return () => window.clearInterval(interval);
	}, [isRunning]);

	const toggleTimer = () => {
		if (isRunning) {
			setRemainingSeconds(Math.max(0, (endTimeRef.current - Date.now()) / 1000));
			setIsRunning(false);
			return;
		}
		endTimeRef.current = Date.now() + remainingSeconds * 1000;
		hasCompletedRef.current = false;
		setIsRunning(true);
	};

	const resetTimer = () => {
		setIsRunning(false);
		hasCompletedRef.current = false;
		setRemainingSeconds(modeDuration * 60);
	};

	return (
		<main className="relative grid min-h-svh w-full place-items-center overflow-hidden bg-black p-4 sm:p-6">
			{background && (
				<DitherImage
					src={background}
					className="absolute inset-0 size-full opacity-70"
				/>
			)}
			<div className="absolute inset-0 bg-black/45" />

			<section className="relative z-10 w-full max-w-5xl mx-auto justify-center rounded-lg border border-white/15 bg-black/55 p-5 text-white shadow-2xl backdrop-blur-md sm:p-8 lg:p-10">
				<div className="grid items-center gap-8 flex-col">
					<div className="flex flex-col items-center">
						<h1 className="w-full text-center font-display text-4xl font-semibold leading-none tracking-tight text-white sm:text-5xl lg:text-6xl">
							This distraction can wait!
						</h1>
					</div>

					<div className="relative z-10 mx-auto max-w-full overflow-x-auto py-2">
						<p className="mb-3 text-center text-xs font-medium uppercase tracking-[0.2em] text-white/50">
							{mode === "focus" ? "Focus session" : "Break"}
						</p>
						<FlipClock
							timeSeconds={remainingSeconds}
							showDays="never"
							size="md"
							variant="outline"
							className="text-white"
						/>
						<div className="mt-5 flex justify-center gap-2">
							<Button
								type="button"
								onClick={toggleTimer}
								className="min-w-28 bg-white font-sans text-black hover:bg-white/90">
								{isRunning ? <PauseIcon /> : <PlayIcon />}
								{isRunning ? "Pause" : "Start"}
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={resetTimer}
								className="border-white/20 font-sans bg-white/10 text-white hover:bg-white/20 hover:text-white">
								<RotateCcwIcon />
								Reset
							</Button>
						</div>
					</div>
				</div>

				<div className="mt-6 w-full flex justify-center ">
					<FocusTodoList
						todos={todos}
						onAddTodo={onAddTodo}
						onToggleTodo={onToggleTodo}
						onDeleteTodo={onDeleteTodo}
					/>
				</div>

				<div className="mt-6 flex justify-between  pt-4">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="-ml-2 font-sans text-white/55 hover:bg-white/10 hover:text-white"
						onClick={onManageBlockList}>
						<SettingsLinear color="currentColor" />
						Manage block list
					</Button>
					<Button
						type="button"
						variant="ghost"
						className="flex items-center gap-2 font-sans text-white/55 hover:bg-white/10 hover:text-white">
						<GithubStar />
						<a
							href="https://github.com/urdadx/blockade"
							target="_blank"
							rel="noopener noreferrer">
							Star us on GitHub
						</a>
					</Button>
				</div>
			</section>
		</main>
	);
}
