import { Button } from "@/components/button";
import { ImageCTA } from "@/components/landing/image-cta";
import { Kbd } from "../kbd";

export const CTASection = () => {
	return (
		<section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-4 sm:py-10 md:grid-cols-2 md:items-center md:gap-10 lg:px-4 min-[1600px]:max-w-[90rem] min-[1600px]:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] min-[1600px]:gap-36">
			<div className="w-full">
				<h2 className="font-display text-[30px] sm:text-[36px] leading-[1.3] font-medium tracking-[-0.02em] text-foreground min-[1600px]:max-w-[34rem]">
					<span>Block distractions.</span>
					<span className="text-[#84888D]">
						{" "}
						Regain your focus. Take control of your time with tools that
						help you stay focused, and build better habits.
					</span>
				</h2>
				<div className="pt-6 w-full flex items-center gap-4 min-[1600px]:gap-6">
					<Button
						variant="outline"
						className="bg-black text-white hover:bg-black/80 rounded-full  text-sm font-medium px-6 py-5">
						<Kbd className=" bg-white/30 rounded-sm text-white ">D</Kbd>
						<span className="text-white hover:text-white/90">
							Get Blockade extension
						</span>
					</Button>
				</div>
			</div>

			<ImageCTA />
		</section>
	);
};
