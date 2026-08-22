import BackgroundImage from "@/assets/background.avif";
import ChromeMono from "@/assets/chrome_mono.png";
import { BrandLogo } from "@/components/brand-logo";

export const ImageCTA = () => {
	return (
		<div
			className="aspect-[4/3] overflow-hidden rounded-3xl bg-cover bg-center p-[5%]"
			style={{ backgroundImage: `url(${BackgroundImage})` }}>
			<div className="grid h-full grid-cols-[auto_minmax(3rem,1fr)_auto] items-center rounded-2xl bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[23px_23px] px-[12%]">
				<div className="size-20 overflow-hidden rounded-2xl sm:size-24 lg:size-24">
					<BrandLogo className="size-full" />
				</div>

				<div className="h-16 bg-[radial-gradient(#4f9dca_2px,transparent_2px)] bg-size-[22px_22px] bg-center" />

				<div className="size-20 overflow-hidden rounded-2xl border border-white/20 bg-black shadow-md sm:size-24 lg:size-24">
					<img
						src={ChromeMono}
						alt="Google Chrome"
						className="size-full object-cover"
					/>
				</div>
			</div>
		</div>
	);
};
