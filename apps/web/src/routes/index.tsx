import { Button } from "@/components/button";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<div className="container mx-auto max-w-3xl px-4 py-2">
			<Link to="/overview">
				<Button>Go to overview</Button>
			</Link>
		</div>
	);
}
