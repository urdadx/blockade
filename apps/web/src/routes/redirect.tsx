import { DitherImage } from "@/components/dither-kit/dither-image";
import { PomodoroClock } from "@/components/pomodoro-clock";
import { createFileRoute } from "@tanstack/react-router";

const backgrounds = Object.values(
	import.meta.glob<string>("/src/assets/backgrounds/*.avif", {
		eager: true,
		import: "default",
	}),
);
const background = backgrounds[Math.floor(Math.random() * backgrounds.length)];

export const Route = createFileRoute("/redirect")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="relative grid h-svh w-full place-items-center overflow-hidden bg-black p-4">
			{background && (
				<DitherImage
					src={background}
					className="absolute inset-0 size-full"
				/>
			)}
			<PomodoroClock className="relative z-10" />
		</main>
	);
}
