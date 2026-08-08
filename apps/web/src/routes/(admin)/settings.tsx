import { BlockSettings } from "@/components/settings/block-settings";
import { PomodoroSettings } from "@/components/settings/pomodoro-settings";
import { RedirectSettings } from "@/components/settings/redirect-settings";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(admin)/settings")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="mx-auto w-full max-w-7xl p-3 sm:p-4 md:p-5">
			<header className="flex flex-col gap-1 pb-6">
				<h1 className="font-display text-2xl font-semibold text-foreground">
					Settings
				</h1>
				<p className="text-sm text-pretty text-muted-foreground">
					Manage your account settings, preferences, and other configurations
				</p>
			</header>
			<div className=" bg-card divide-y px-5 py-2 rounded-lg  border text-card-foreground">
				<BlockSettings />
				<PomodoroSettings />
				<RedirectSettings />
			</div>
		</main>
	);
}
