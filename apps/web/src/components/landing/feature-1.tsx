import BackgroundImage from "@/assets/background.avif";
import { SettingsLinear } from "@/assets/icons/settings-duotone";
import { BrandLogo } from "@/components/brand-logo";
import { forwardRef } from "react";
import { Button } from "../button";

function PopupPreview() {
	return (
		<div className="h-[350px] w-[320px] max-w-full overflow-hidden rounded-xl border border-black/10 bg-white font-sans shadow-2xl shadow-black/15 md:h-[340px] md:w-[320px] xl:h-[400px] xl:w-[380px] min-[1600px]:h-[440px] min-[1600px]:w-[400px]">
			<div className="flex items-center justify-between px-5 py-4">
				<div className="flex items-center gap-1.5 font-display text-lg font-semibold">
					<BrandLogo className="size-7" />
					<span>Blockade</span>
				</div>
				<Button variant="ghost" size="icon-sm">
					<SettingsLinear className="size-5" color="#000000" />
				</Button>
			</div>

			<div className="p-4">
				<div className="rounded-sm  p-4 text-center">
					<img
						src="https://www.tiktok.com/favicon.ico"
						alt=""
						className="mx-auto size-10 rounded-sm object-cover"
					/>
					<h4 className="mt-4 font-display text-xl font-semibold">
						Block this website?
					</h4>
					<div className="mt-2 text-sm text-black/55">tiktok.com</div>

					<div className="flex flex-col gap-3 mt-8">
						<Button className="w-full ">Block this website</Button>
						<Button variant="outline">Manage block list</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

export const Feature1 = forwardRef<HTMLDivElement>(function Feature1(_, ref) {
	return (
		<div
			ref={ref}
			id="workflow-agents"
			className="grid scroll-mt-32 gap-6 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
			<div className="flex flex-col justify-start pt-5">
				<h3 className="max-w-xl text-3xl font-medium">
					Easily add new websites and keywords to your blocklist
				</h3>
				<p className="mt-6 max-w-xl text-base font-medium text-muted-foreground">
					Blockade helps you add websites or keywords that are stealing your
					focus to your blocklist.
				</p>
			</div>
			<div
				aria-hidden="true"
				className="flex aspect-[6/7] items-center justify-center rounded-3xl bg-cover bg-center p-6 sm:p-10"
				style={{ backgroundImage: `url(${BackgroundImage})` }}>
				<PopupPreview />
			</div>
		</div>
	);
});
