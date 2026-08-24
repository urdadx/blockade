import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/button";
import { Feature1 } from "@/components/landing/feature-1";
import { Feature2 } from "@/components/landing/feature-2";
import { Feature3 } from "@/components/landing/feature-3";
import { Feature4 } from "@/components/landing/feature-4";

const features = [
	{ id: "blocklist", label: "Blocklist" },
	{ id: "scheduler", label: "Scheduler" },
	{ id: "insights", label: "Insights" },
	{ id: "pomodoro", label: "Pomodoro" },
] as const;

type FeatureId = (typeof features)[number]["id"];

export function FeaturesSection() {
	const [activeId, setActiveId] = useState<FeatureId>("blocklist");
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

				const activeSection = visible[0]?.target;
				const nextId = features.find(
					(feature) => sectionRefs.current[feature.id] === activeSection,
				)?.id;
				if (nextId) setActiveId(nextId);
			},
			{ rootMargin: "-25% 0px -55% 0px", threshold: [0.15, 0.35, 0.55, 0.75] },
		);

		sections.forEach((section) => observer.observe(section));

		return () => observer.disconnect();
	}, []);

	return (
		<section className="w-full min-w-0 py-0 sm:py-10">
			<div className="mx-auto w-full min-w-0 max-w-6xl min-[1600px]:max-w-[90rem]">
				<h2 className="text-muted-foreground hidden sm:block px-6 sm:px-0 max-w-4xl font-display leading-[1.3] font-medium tracking-[-0.02em] text-foreground text-2xl sm:text-[38px] font-medium ">
					<span className="text-foreground">Built for the full workflow.</span>{" "}
					<br /> Stay focused on what matters
				</h2>
				<div className="grid min-w-0 gap-6 px-6 sm:mt-10 sm:px-0 lg:grid-cols-[auto_minmax(0,1fr)]">
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
									className="data-[state=active]:font-medium data-[state=active]:text-primary not-data-[state=active]:text-muted-foreground hover:bg-transparent">
									{feature.label}
								</Button>
							))}
						</div>
					</div>
					<div className="flex min-w-0 flex-col gap-16 md:gap-32">
						<Feature1
							ref={(element) => {
								sectionRefs.current.blocklist = element;
							}}
						/>
						<Feature2
							ref={(element) => {
								sectionRefs.current.scheduler = element;
							}}
						/>
						<Feature3
							ref={(element) => {
								sectionRefs.current.insights = element;
							}}
						/>
						<Feature4
							ref={(element) => {
								sectionRefs.current.pomodoro = element;
							}}
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
