import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/landing/header";
import { CTASection } from "@/components/landing/cta-section";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<main className="flex flex-col min-h-screen items-center justify-start text-black bg-white">
			<div className="w-full">
				<Header />
			</div>
			<section className="flex w-full justify-center pt-20">
				<CTASection />
			</section>
		</main>
	);
}
