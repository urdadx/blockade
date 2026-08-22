import { Button } from "@/components/button";
import { ImageCTA } from "@/components/landing/image-cta";

export const CTASection = () => {
	return (
		<section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 md:grid-cols-2 md:items-center md:gap-10 lg:px-4 min-[1600px]:max-w-[90rem] min-[1600px]:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] min-[1600px]:gap-36">
			<div className="w-full">
				{/* <div className="mb-2">
					<Rating />
				</div> */}
				<h2 className="font-display text-[36px] leading-[1.3] font-medium tracking-[-0.02em] text-foreground min-[1600px]:max-w-[34rem]">
					<span>Block distractions.</span>
					<span className="text-[#84888D]">
						{" "}
						Regain your focus. Take control of your time with tools that
						help you stay focused, and build better habits.
					</span>
				</h2>
				<div className="pt-6">
					<Button
						variant="outline"
						className="bg-black text-white hover:bg-black/80 rounded-full px-4 py-2 text-sm font-medium sm:px-6 sm:py-5">
						<span className="hidden sm:inline">Get Blockade extension</span>
					</Button>
				</div>
			</div>

			<ImageCTA />
		</section>
	);
};
