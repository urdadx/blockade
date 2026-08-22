import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/button";
import { Feature1 } from "@/components/landing/feature-1";
import { Feature2 } from "@/components/landing/feature-2";
import { Feature3 } from "@/components/landing/feature-3";
import { Feature4 } from "@/components/landing/feature-4";

const features = [
	{ id: "workflow-agents", label: "Workflow agents" },
	{ id: "alerts", label: "Alerts" },
	{ id: "timeline", label: "Timeline" },
	{ id: "integrations", label: "Integrations" },
] as const;

type FeatureId = (typeof features)[number]["id"];

export function FeaturesSection() {
	const [activeId, setActiveId] = useState<FeatureId>("workflow-agents");
	const sectionRefs = useRef<Partial<Record<FeatureId, HTMLDivElement | null>>>({});

	const scrollToFeature = (id: FeatureId) => {
		sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
		setActiveId(id);
	};

	useEffect(() => {
		const sections = features
			.map((feature) => sectionRefs.current[feature.id])
			.filter((section): section is HTMLDivElement => section != null);

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => b.intersectionRatio - a.intersectionRatio);

				const nextId = visible[0]?.target.id as FeatureId | undefined;
				if (nextId) setActiveId(nextId);
			},
			{ rootMargin: "-25% 0px -55% 0px", threshold: [0.15, 0.35, 0.55, 0.75] },
		);

		sections.forEach((section) => observer.observe(section));

		return () => observer.disconnect();
	}, []);

	return (
		<section className="py-8">
			<div className="mx-auto max-w-6xl min-[1600px]:max-w-[90rem]">
				<h2 className="text-muted-foreground px-6 sm:px-0 max-w-4xl font-display leading-[1.3] font-medium tracking-[-0.02em] text-foreground text-2xl sm:text-[38px] font-medium ">
					<span className="text-foreground">Built for the full workflow.</span>{" "}
					<br /> One connected revenue product.
				</h2>
				<div className="mt-10 grid gap-6 px-6 sm:px-0  lg:grid-cols-[auto_1fr]">
					<div className="sticky top-24 h-fit w-56 max-lg:hidden">
						<div className="-ml-4 mt-4 flex flex-col *:justify-start">
							{features.map((feature) => (
								<Button
									key={feature.id}
									type="button"
									variant="ghost"
									data-state={
										activeId === feature.id
											? "active"
											: undefined
									}
									onClick={() => scrollToFeature(feature.id)}
									className="not-data-[state=active]:text-muted-foreground hover:bg-transparent">
									{feature.label}
								</Button>
							))}
						</div>
					</div>
					<div className="flex flex-col gap-16 md:gap-32">
						<Feature1
							ref={(element) => {
								sectionRefs.current["workflow-agents"] = element;
							}}
						/>
						<Feature2
							ref={(element) => {
								sectionRefs.current.alerts = element;
							}}
						/>
						<Feature3
							ref={(element) => {
								sectionRefs.current.timeline = element;
							}}
						/>
						<Feature4
							ref={(element) => {
								sectionRefs.current.integrations = element;
							}}
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
