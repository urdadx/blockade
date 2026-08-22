import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/landing/header";
import { CTASection } from "@/components/landing/cta-section";
import { FeaturesSection } from "@/components/landing/features";
import { FooterCTA } from "@/components/landing/footer-cta";
import { StatsSection } from "@/components/landing/stats-section";
import { Testimonials } from "@/components/landing/testimonials";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<main className="flex flex-col min-h-screen items-center justify-start text-black bg-white">
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
