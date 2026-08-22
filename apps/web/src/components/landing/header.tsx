import { Button } from "@/components/button";
import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import ChromeIcon from "@/assets/chrome.png";

const menuItems = [
	{ name: "Features", href: "#features" },
	{ name: "Github", href: "https://github.com/urdadx/blockade" },
	{ name: "FAQs", href: "#faqs" },
];

export const Header = () => {
	return (
		<header className="h-16 border-b bg-white">
			<nav className="fixed inset-x-0 top-0 z-20 h-18 border-b bg-white/90 px-4 backdrop-blur-lg">
				<div
					className={cn(
						"mx-auto flex h-full max-w-6xl items-center justify-between gap-4 min-[1600px]:max-w-[90rem]",
					)}>
					<div className="contents">
						<Link
							to="/"
							aria-label="home"
							className="flex min-w-0 shrink items-center gap-1">
							<BrandLogo className="size-7" />
							<span className="truncate font-display text-xl font-semibold text-foreground sm:text-2xl">
								Blockade
							</span>
						</Link>

						<div className="hidden items-center md:flex">
							<ul className="flex gap-8 text-base">
								{menuItems.map((item) => (
									<li key={item.href}>
										<Link
											to={item.href}
											className="text-muted-foreground  font-landing hover:text-accent-foreground block duration-150">
											<span>{item.name}</span>
										</Link>
									</li>
								))}
							</ul>
						</div>

						<div className="shrink-0 flex items-center gap-2 md:gap-4">
							<Button
								variant="outline"
								className="rounded-full px-4 py-2 text-sm font-medium sm:px-2 sm:py-4">
								<img src={ChromeIcon} alt="" className="size-5" />
								<span className="hidden sm:inline">
									Download extension
								</span>
							</Button>
						</div>
					</div>
				</div>
			</nav>
		</header>
	);
};
