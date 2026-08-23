import BackgroundImage from "@/assets/background_red.png";
import { TopBlockedSites } from "@/components/top-blocked-sites";
import { forwardRef } from "react";

const blockedSites = [
	{ domain: "tiktok.com", attempts: 128 },
	{ domain: "youtube.com", attempts: 96 },
	{ domain: "instagram.com", attempts: 74 },
	{ domain: "x.com", attempts: 51 },
	{ domain: "reddit.com", attempts: 38 },
];

function AnalyticsPreview() {
	return (
		<div className="h-[370px] w-[320px] max-w-full overflow-hidden rounded-xl bg-white font-sans shadow-2xl shadow-black/15 md:h-[340px] md:w-[320px] xl:h-[400px] xl:w-[380px] min-[1600px]:h-[440px] min-[1600px]:w-[400px]">
			<TopBlockedSites className="h-full border-black/10" sites={blockedSites} />
		</div>
	);
}

export const Feature3 = forwardRef<HTMLDivElement>(function Feature3(_, ref) {
	return (
		<div
			ref={ref}
			id="timeline"
			className="grid scroll-mt-32 gap-6 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
			<div className="flex flex-col justify-start pt-5">
				<h3 className="max-w-xl text-3xl font-medium">
					Insights and detailed analytics to help you be better
				</h3>
				<p className="mt-6 max-w-xl text-base font-medium text-muted-foreground">
					Know how you spend your time and get insights into your focus
					sessions. Blockade provides analytics to help you understand your
					habits and improve your productivity.
				</p>
			</div>
			<div
				aria-hidden="true"
				className="flex aspect-[6/7] items-center justify-center rounded-3xl bg-cover bg-center p-6 sm:p-10"
				style={{ backgroundImage: `url(${BackgroundImage})` }}>
				<AnalyticsPreview />
			</div>
		</div>
	);
});
