import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(admin)/block-sites")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="p-4 md:p-6">
			<h2 className="text-2xl font-semibold font-display text-foreground pb-3">
				Block sites
			</h2>
		</main>
	);
}
