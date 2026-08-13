import { CheckMarkIcon } from "@/assets/icons/checkmark-icon";
import { SearchIcon, SearchLinear } from "@/assets/icons/search-icon";
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
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/empty";
import { Input } from "@/components/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs";
import { getWebsiteFaviconUrl } from "@/lib/utils";
import { categoryImages } from "@/data/category-images";
import { blockCategories, normalizeKeyword, normalizeWebsiteDomain } from "@blockade/core";
import { PlusIcon, TagIcon } from "lucide-react";
import { useMemo, useState } from "react";

type CategoryDataset = {
	id: "adult" | "social" | "news" | "sports" | "shopping" | "gambling";
	label: string;
	description: string;
	domains: string[];
};

const categoryOrder: CategoryDataset["id"][] = [
	"adult",
	"social",
	"news",
	"sports",
	"shopping",
	"gambling",
];

const categories: CategoryDataset[] = blockCategories
	.map((category) => ({ ...category, domains: [...category.domains] }))
	.sort((a, b) => categoryOrder.indexOf(a.id) - categoryOrder.indexOf(b.id));

const websites = Array.from(new Set(categories.flatMap((category) => category.domains))).sort(
	(a, b) => a.localeCompare(b),
);

const adultDomains = new Set(categories.find((category) => category.id === "adult")?.domains ?? []);

function AddOption({
	id,
	label,
	image,
	icon,
	selected,
	onToggle,
}: {
	id: string;
	label: string;
	image?: string;
	icon?: React.ReactNode;
	selected: boolean;
	onToggle: (id: string) => void;
}) {
	return (
		<div className="flex min-w-0 items-center gap-2 rounded-lg border bg-card p-2.5 transition-colors duration-150 hover:bg-muted/40">
			{image ? (
				<img
					src={image}
					alt=""
					loading="lazy"
					decoding="async"
					className="size-9 shrink-0 rounded-md object-cover outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10"
				/>
			) : (
				<div className="grid size-9 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
					{icon}
				</div>
			)}
			<span className="min-w-0 flex-1 truncate text-sm font-medium">{label}</span>
			<Button
				type="button"
				variant={selected ? "ghost" : "outline"}
				className="text-foreground/80 hover:bg-transparent hover:text-foreground"
				aria-label={selected ? `Remove ${label} from selection` : `Select ${label}`}
				onClick={() => onToggle(id)}>
				{selected ? <CheckMarkIcon color="green" /> : <PlusIcon />}
			</Button>
		</div>
	);
}

function NoResults({
	query,
	website,
	keyword,
	onSelect,
}: {
	query: string;
	website?: string | null;
	keyword?: string | null;
	onSelect: (id: string) => void;
}) {
	return (
		<Empty className="min-h-48 rounded-xl border">
			<EmptyHeader>
				<SearchIcon className="size-8 text-muted-foreground" />
				<EmptyTitle className="font-display text-lg font-semibold text-foreground">
					No item found
				</EmptyTitle>
				<EmptyDescription>No existing item matches “{query}”</EmptyDescription>
				<div className="mt-2 flex flex-wrap justify-center gap-2">
					{website && (
						<Button
							type="button"
							onClick={() => onSelect(`website:${website}`)}>
							<PlusIcon /> Add {website} as website
						</Button>
					)}
					{keyword && (
						<Button
							type="button"
							variant={website ? "outline" : "default"}
							onClick={() => onSelect(`keyword:${keyword}`)}>
							<TagIcon /> Add “{keyword}” as keyword
						</Button>
					)}
				</div>
			</EmptyHeader>
		</Empty>
	);
}

export function AddBlockListDialog({
	className,
	onAdd,
}: {
	className?: string;
	onAdd?: (items: string[]) => void | Promise<void>;
}) {
	const [query, setQuery] = useState("");
	const [selectedItems, setSelectedItems] = useState<Set<string>>(() => new Set());
	const normalizedQuery = query.trim().toLowerCase();
	const customWebsite = normalizeWebsiteDomain(query);
	const customKeyword = customWebsite ? null : normalizeKeyword(query);

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

	const addSelectedItems = () => {
		void onAdd?.([...selectedItems]);
		setSelectedItems(new Set());
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

	const keywordGrid = customKeyword ? (
		<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
			<AddOption
				id={`keyword:${customKeyword}`}
				label={customKeyword}
				icon={<TagIcon className="size-4" />}
				selected={selectedItems.has(`keyword:${customKeyword}`)}
				onToggle={toggleItem}
			/>
		</div>
	) : (
		<Empty className="min-h-36 rounded-xl border">
			<EmptyHeader>
				<EmptyTitle className="font-display text-lg font-semibold text-foreground">
					Search for a keyword
				</EmptyTitle>
				<EmptyDescription>
					Enter at least two characters to create a keyword block rule.
				</EmptyDescription>
			</EmptyHeader>
		</Empty>
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
	const hasAnySearchResults = filteredCategories.length > 0 || filteredWebsites.length > 0;
	const noResults = normalizedQuery ? (
		<NoResults
			query={query.trim()}
			website={customWebsite}
			keyword={customKeyword}
			onSelect={toggleItem}
		/>
	) : null;

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
						{normalizedQuery && !hasAnySearchResults ? (
							<div className="pt-3">{noResults}</div>
						) : (
							<div className="space-y-5 pt-3">
								{filteredCategories.length > 0 && (
									<section>
										<h3 className="mb-2 text-lg font-semibold">
											Categories
										</h3>
										{categoryGrid}
									</section>
								)}
								{filteredWebsites.length > 0 && (
									<section>
										<h3 className="mb-2 text-lg font-semibold">
											Websites
										</h3>
										{allTabWebsiteGrid}
									</section>
								)}
							</div>
						)}
					</TabsContent>
					<TabsContent
						value="websites"
						className="mt-0 min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-3">
						{filteredWebsites.length > 0 ? websiteGrid : noResults}
					</TabsContent>
					<TabsContent
						value="keywords"
						className="mt-0 min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-3">
						{keywordGrid}
					</TabsContent>
					<TabsContent
						value="categories"
						className="mt-0 min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-3">
						{filteredCategories.length > 0 ? categoryGrid : noResults}
					</TabsContent>
				</Tabs>
				<DialogFooter className="px-5 py-4">
					<DialogClose render={<Button variant="outline" />}>
						Cancel
					</DialogClose>
					<DialogClose
						render={
							<Button
								type="button"
								disabled={selectedItems.size === 0}
								onClick={addSelectedItems}
							/>
						}>
						Add to block list ({selectedItems.size})
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
