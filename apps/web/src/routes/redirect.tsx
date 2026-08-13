import { RedirectPage } from "@/components/redirect-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/redirect")({
  component: RedirectPage,
});
