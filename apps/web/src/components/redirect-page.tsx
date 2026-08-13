import { Button } from "@/components/button";
import { DitherImage } from "@/components/dither-kit/dither-image";
import { FocusTodoList, type FocusTodo } from "@/components/focus-todo-list";
import { PomodoroClock } from "@/components/pomodoro-clock";
import { SettingsLinear } from "@/assets/icons/settings-duotone";
import { GithubStar } from "@/assets/icons/github-icon";

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
}: {
	onManageBlockList?: () => void;
	todos?: FocusTodo[];
	onAddTodo?: (title: string) => void;
	onToggleTodo?: (id: string) => void;
	onDeleteTodo?: (id: string) => void;
}) {
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
							This distraction can wait.
						</h1>
						<p className="mt-4 font-sans text-center text-sm text-white/60 sm:text-base">
							This website is blocked. Focus on what matters
						</p>
					</div>

					<PomodoroClock className="relative z-10 mx-auto w-full" />
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
						Star us on GitHub
					</Button>
				</div>
			</section>
		</main>
	);
}
