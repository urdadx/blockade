import {
	Card,
	CardDescription,
	CardFrame,
	CardFrameHeader,
	CardFrameTitle,
	CardHeader,
	CardTitle,
} from "@/components/card";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(admin)/redirect-page")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="mx-auto w-full max-w-7xl p-3 sm:p-4 md:p-5">
			<header className="flex flex-col gap-1 pb-6">
				<h1 className="font-display text-2xl font-semibold text-foreground">
					Redirect Page
				</h1>
				<p className="text-sm text-pretty text-muted-foreground">
					Customize the page where you are redirected when you try to access a
					blocked website.
				</p>
			</header>
			<div className="grid grid-cols-[1fr_35%] gap-6">
				<div className=""></div>
				<div className="flex flex-col gap-2">
					<CardFrame className="gap-0 shadow-xs">
						<CardFrameHeader>
							<CardFrameTitle>Preview</CardFrameTitle>
						</CardFrameHeader>
						<Card>
							<CardHeader>
								<CardTitle>Website blocked</CardTitle>
								<CardDescription>
									You tried to access a blocked website.
								</CardDescription>
							</CardHeader>
						</Card>
					</CardFrame>
				</div>
			</div>
		</main>
	);
}
