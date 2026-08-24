import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/landing/header";
import { CTASection } from "@/components/landing/cta-section";
import { FeaturesSection } from "@/components/landing/features";
import { FooterCTA } from "@/components/landing/footer-cta";
import { StatsSection } from "@/components/landing/stats-section";
import { Testimonials } from "@/components/landing/testimonials";
import { openExtensionGuide } from "@/lib/extension-download";
import { useHotkeys } from "@tanstack/react-hotkeys";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	useHotkeys(
		[
			{
				hotkey: "G",
				callback: openExtensionGuide,
				options: {
					meta: {
						name: "Get Blockade",
						description: "Open the extension installation guide",
					},
				},
			},
		],
		{
			ignoreInputs: true,
			requireReset: true,
		},
	);

	return (
		<main className="flex min-h-screen w-full min-w-0 flex-col items-center justify-start overflow-x-clip bg-white text-black">
			<div className="w-full">
				<Header />
			</div>
			<section className="flex w-full justify-center pt-14 sm:pt-20">
				<CTASection />
			</section>
			<section
				id="testimonials"
				className="w-full scroll-mt-16 px-6 py-14 lg:px-4 lg:py-20">
				<div className="mx-auto w-full max-w-6xl min-[1600px]:max-w-[90rem]">
					<Testimonials />
				</div>
			</section>
			<div id="features" className="w-full scroll-mt-16">
				<FeaturesSection />
			</div>
			<StatsSection />
			<FooterCTA />
			<footer className="w-full border-t px-6 py-6 text-center text-base text-muted-foreground lg:px-4">
				<p>&copy; 2026 Blockade. All rights reserved.</p>
			</footer>
		</main>
	);
}
