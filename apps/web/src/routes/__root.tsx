import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/sonner";
import type { trpc } from "@/utils/trpc";
import type { QueryClient } from "@tanstack/react-query";
import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import "../index.css";

export interface RouterAppContext {
	trpc: typeof trpc;
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootComponent,
	head: () => ({
		meta: [
			{
				title: "Blockade",
			},
			{
				name: "description",
				content: "Blockade - take back control of your time",
			},
		],
		links: [
			{
				rel: "icon",
				href: "/favicon.ico",
			},
		],
	}),
});

function RootComponent() {
	return (
		<>
			<HeadContent />
			<ThemeProvider
				attribute="class"
				defaultTheme="light"
				disableTransitionOnChange
				storageKey="vite-ui-theme">
				<div className="grid grid-rows-[auto_1fr] h-svh">
					<Outlet />
				</div>
				<Toaster richColors />
			</ThemeProvider>
		</>
	);
}
