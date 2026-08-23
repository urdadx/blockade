import BackgroundImage from "@/assets/background.avif";
import ChromeMono from "@/assets/chrome_mono.avif";
import { BrandLogo } from "@/components/brand-logo";

export const ImageCTA = () => {
	return (
		<div
			className="aspect-[4/3] min-w-0 overflow-hidden rounded-3xl bg-cover bg-center p-[5%]"
			style={{ backgroundImage: `url(${BackgroundImage})` }}>
			<div className="grid h-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center rounded-2xl bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[23px_23px] px-[8%] sm:px-[12%]">
				<div className="size-14 overflow-hidden rounded-xl sm:size-24 sm:rounded-2xl">
					<BrandLogo className="size-full" />
				</div>

				<div className="h-14 bg-[radial-gradient(#4f9dca_2px,transparent_2px)] bg-size-[23px_23px] bg-center" />

				<div className="size-14 overflow-hidden rounded-xl border border-white/20 bg-black sm:size-22 sm:rounded-2xl">
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
