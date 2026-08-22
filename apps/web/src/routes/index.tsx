import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/landing/header";
import { CTASection } from "@/components/landing/cta-section";
import { FeaturesSection } from "@/components/landing/features";
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
			<section className="w-full px-6 py-14 lg:px-4 lg:py-20">
				<div className="mx-auto w-full max-w-6xl min-[1600px]:max-w-[90rem]">
					<Testimonials />
				</div>
			</section>
			<div id="features" className="w-full scroll-mt-16">
				<FeaturesSection />
			</div>
		</main>
	);
}
