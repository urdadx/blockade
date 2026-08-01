import { Button } from "@/components/button";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<div className="container mx-auto max-w-3xl px-4 py-2">
			<Link to="/block-sites">
				<Button>Go to block sites</Button>
			</Link>
		</div>
	);
}
