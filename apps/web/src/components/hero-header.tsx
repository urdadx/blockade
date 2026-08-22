import { BrandLogo } from "./brand-logo";
import { Button } from "./button";
import ChromeIcon from "@/assets/chrome.png";

export const HeroHeader = () => {
	return (
		<header className="w-full max-w-3xl px-6 py-8 sm:px-0 sm:py-14 flex items-center justify-between">
			<a href="/" className="flex items-center gap-2">
				<BrandLogo />
				<span className="font-bold text-lg">Blockade</span>
			</a>
			<div className="hidden sm:flex items-center gap-4">
				<a href="#what-is-this">What is this?</a>
				<a href="#features">Features</a>
				<a href="/docs">Docs</a>
			</div>
			<Button variant="outline" size="lg" className="rounded-full">
				<img src={ChromeIcon} className="size-5" />
				Add to chrome
			</Button>
		</header>
	);
};
