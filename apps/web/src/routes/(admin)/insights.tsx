import { InsightsPage } from "@/components/insights-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(admin)/insights")({
  component: InsightsPage,
});
