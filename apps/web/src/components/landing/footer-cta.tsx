import { Button } from "@/components/button";
import { Card } from "@/components/card";
import ChromeMono from "@/assets/chrome_mono.avif";

export function FooterCTA() {
	return (
		<section className=" w-full bg-[#FAFAFA] px-6 py-24 lg:px-4">
			<div className="mx-auto w-full max-w-6xl">
				<Card className=" border-0 rounded-3xl border shadow-none overflow-hidden w-full p-8 flex justify-center  md:p-16">
					<div className="flex flex-col items-center justify-center text-center">
						<h2 className="text-balance max-w-lg font-display text-3xl font-medium tracking-[-0.02em] md:text-5xl">
							Transform how you work
						</h2>
						<p className="mt-4 max-w-xl text-balance leading-relaxed text-muted-foreground">
							Join thousands of users using Blockade to reclaim their
							time and focus.
						</p>
						<Button
							variant="outline"
							className="bg-black mt-8 w-fit text-white hover:bg-black/80 rounded-full  text-sm font-medium px-6 py-5">
							<img src={ChromeMono} alt="" className="size-5" />

							<span className="text-white hover:text-white/90">
								Download extension
							</span>
						</Button>
					</div>
				</Card>
			</div>
		</section>
	);
}
