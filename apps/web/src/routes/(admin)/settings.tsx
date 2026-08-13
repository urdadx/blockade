import { SettingsPage } from "@/components/settings-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(admin)/settings")({
  component: SettingsPage,
});
