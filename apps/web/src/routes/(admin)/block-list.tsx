import { BlockListPage } from "@/components/block-list-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(admin)/block-list")({
	component: RouteComponent,
});

function RouteComponent() {
	return <BlockListPage />;
}
