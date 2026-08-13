import { AppSidebar } from "@/components/app-sidebar";
import { GlobalLoader } from "@/components/global-loader";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { NavUser } from "@/components/nav-user";

export const Route = createFileRoute("/(admin)")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Suspense fallback={<GlobalLoader />}>
        <AppSidebar footer={<NavUser />} />
      </Suspense>
    </>
  );
}
