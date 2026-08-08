import adultImage from "@/assets/categories/18plus.png";
import gamblingImage from "@/assets/categories/gambling.png";
import newsImage from "@/assets/categories/news.png";
import shoppingImage from "@/assets/categories/shopping.png";
import socialImage from "@/assets/categories/socials.png";
import sportsImage from "@/assets/categories/sports.png";
import { CheckMarkIcon } from "@/assets/icons/checkmark-icon";
import { SearchLinear } from "@/assets/icons/search-icon";
import { Button } from "@/components/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/dialog";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/empty";
import { Input } from "@/components/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs";
import { getWebsiteFaviconUrl } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
import { useMemo, useState } from "react";

type CategoryDataset = {
	id: "adult" | "social" | "news" | "sports" | "shopping" | "gambling";
	label: string;
	description: string;
	domains: string[];
};

const categoryModules = import.meta.glob<CategoryDataset>("/src/data/block-categories/*.json", {
	eager: true,
	import: "default",
});

const categoryOrder: CategoryDataset["id"][] = [
	"adult",
	"social",
	"news",
	"sports",
	"shopping",
	"gambling",
];

const categoryImages: Record<CategoryDataset["id"], string> = {
	adult: adultImage,
	social: socialImage,
	news: newsImage,
	sports: sportsImage,
	shopping: shoppingImage,
	gambling: gamblingImage,
};

const categories = Object.values(categoryModules).sort(
	(a, b) => categoryOrder.indexOf(a.id) - categoryOrder.indexOf(b.id),
);

const websites = Array.from(new Set(categories.flatMap((category) => category.domains))).sort(
	(a, b) => a.localeCompare(b),
);

const adultDomains = new Set(categories.find((category) => category.id === "adult")?.domains ?? []);

function AddOption({
	id,
	label,
	image,
	selected,
	onToggle,
}: {
	id: string;
	label: string;
	image: string;
	selected: boolean;
	onToggle: (id: string) => void;
}) {
	return (
		<div className="flex min-w-0 items-center gap-2 rounded-lg border bg-card p-2.5 transition-colors duration-150 hover:bg-muted/40">
			<img
				src={image}
				alt=""
				loading="lazy"
				decoding="async"
				className="size-9 shrink-0 rounded-md object-cover outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10"
			/>
			<span className="min-w-0 flex-1 truncate text-sm font-medium">{label}</span>
			{selected ? (
				<div className="flex h-9 w-9 items-center justify-center">
					<CheckMarkIcon color="green" />
				</div>
			) : (
				<Button
					type="button"
					variant="outline"
					className="text-foreground/80 hover:bg-transparent hover:text-foreground"
					aria-label="Add"
					onClick={() => onToggle(id)}>
					<PlusIcon />
				</Button>
			)}
		</div>
	);
}

function EmptyKeywords() {
	return (
		<Empty className="min-h-36 border rounded-xl">
			<EmptyHeader>
				<EmptyTitle className="font-display text-lg text-foreground">
					No keywords added yet
				</EmptyTitle>
				<Button variant="default">
					<PlusIcon />
					Add new keywords
				</Button>
			</EmptyHeader>
		</Empty>
	);
}

export function AddBlockListDialog({ className }: { className?: string }) {
	const [query, setQuery] = useState("");
	const [selectedItems, setSelectedItems] = useState<Set<string>>(() => new Set());
	const normalizedQuery = query.trim().toLowerCase();

	const filteredCategories = useMemo(
		() =>
			categories.filter(
				(category) =>
					!normalizedQuery ||
					category.label.toLowerCase().includes(normalizedQuery) ||
					category.description.toLowerCase().includes(normalizedQuery),
			),
		[normalizedQuery],
	);
	const filteredWebsites = useMemo(
		() => websites.filter((domain) => !normalizedQuery || domain.includes(normalizedQuery)),
		[normalizedQuery],
	);

	const toggleItem = (id: string) => {
		setSelectedItems((current) => {
			const next = new Set(current);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const categoryGrid = (
		<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
			{filteredCategories.map((category) => (
				<AddOption
					key={category.id}
					id={`category:${category.id}`}
					label={category.label}
					image={categoryImages[category.id]}
					selected={selectedItems.has(`category:${category.id}`)}
					onToggle={toggleItem}
				/>
			))}
		</div>
	);

	const websiteGrid = (
		<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
			{filteredWebsites.map((domain) => (
				<AddOption
					key={domain}
					id={`website:${domain}`}
					label={domain}
					image={getWebsiteFaviconUrl(domain)}
					selected={selectedItems.has(`website:${domain}`)}
					onToggle={toggleItem}
				/>
			))}
		</div>
	);

	const allTabWebsiteGrid = (
		<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
			{filteredWebsites
				.filter((domain) => !adultDomains.has(domain))
				.map((domain) => (
					<AddOption
						key={domain}
						id={`website:${domain}`}
						label={domain}
						image={getWebsiteFaviconUrl(domain)}
						selected={selectedItems.has(`website:${domain}`)}
						onToggle={toggleItem}
					/>
				))}
		</div>
	);

	return (
		<Dialog>
			<DialogTrigger render={<Button className={className} />}>
				<PlusIcon />
				Add to block list
			</DialogTrigger>
			<DialogContent className="flex onboarding-height max-w-xl flex-col gap-4 overflow-hidden p-0 sm:max-w-4xl">
				<DialogHeader className="px-6 pt-6 pr-14">
					<DialogTitle className="font-display font-semibold text-2xl">
						Add to block list
					</DialogTitle>
					<DialogDescription>
						Choose categories or individual websites to block.
					</DialogDescription>
				</DialogHeader>

				<div className="relative px-6">
					<SearchLinear className="absolute top-1/2 left-9 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Search categories, websites, or keywords..."
						className="w-full bg-background pl-10"
					/>
				</div>

				<Tabs
					defaultValue="all"
					className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
					<div className="hide-scrollbar shrink-0 overflow-x-auto   px-6 py-1">
						<TabsList className="w-max min-w-full justify-start bg-transparent">
							{["All", "Websites", "Keywords", "Categories"].map(
								(tab) => (
									<TabsTrigger
										key={tab}
										value={tab.toLowerCase()}
										className="data-[state=active]:bg-muted data-[state=active]:shadow-none">
										{tab}
									</TabsTrigger>
								),
							)}
						</TabsList>
					</div>

					<TabsContent
						value="all"
						className="mt-0 min-h-0 flex-1 overflow-y-auto px-6 pb-6">
						<div className="space-y-5 pt-3">
							<section>
								<h3 className="mb-2 text-lg font-semibold">
									Categories
								</h3>
								{categoryGrid}
							</section>
							<section>
								<h3 className="mb-2 text-lg font-semibold">
									Websites
								</h3>
								{allTabWebsiteGrid}
							</section>
							<section>
								<h3 className="mb-2 text-lg font-semibold">
									Keywords
								</h3>
								<EmptyKeywords />
							</section>
						</div>
					</TabsContent>
					<TabsContent
						value="websites"
						className="mt-0 min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-3">
						{websiteGrid}
					</TabsContent>
					<TabsContent
						value="keywords"
						className="mt-0 min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-3">
						<EmptyKeywords />
					</TabsContent>
					<TabsContent
						value="categories"
						className="mt-0 min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-3">
						{categoryGrid}
					</TabsContent>
				</Tabs>
				<DialogFooter className="px-5 py-4">
					<DialogClose render={<Button variant="outline" />}>
						Cancel
					</DialogClose>
					<Button type="submit">Add to block list</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
