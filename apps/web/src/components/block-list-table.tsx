import { TrashBinLinear } from "@/assets/icons/trash-icon";
import { DailyLimitSelect } from "@/components/block-list/daily-limit-select";
import { UsageLimit } from "@/components/block-list/usage-limit";
import { Button } from "@/components/button";
import { CardFrame } from "@/components/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { getWebsiteFaviconUrl } from "@/lib/utils";
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { TagBoldIcon } from "./tag-icon";

export type BlockedSite = {
	id: string;
	name: string;
	url: string;
	dailyLimit: string;
	usedMinutes: number;
	type: "website" | "category" | "keyword";
	imageUrl?: string;
	dailyLimitApplicable?: boolean;
};

function getColumns({
	onLimitChange,
	onDelete,
}: {
	onLimitChange: (siteId: string, value: string) => void;
	onDelete: (siteId: string) => void;
}): ColumnDef<BlockedSite>[] {
	return [
		{
			accessorKey: "name",
			header: "Name",
			size: 220,
			cell: ({ row }) => (
				<div className="flex items-center gap-2.5 font-medium">
					{row.original.type === "website" ? (
						<img
							src={getWebsiteFaviconUrl(row.original.url)}
							alt=""
							loading="lazy"
							decoding="async"
							className="size-6 rounded outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10"
						/>
					) : row.original.type === "category" && row.original.imageUrl ? (
						<img
							src={row.original.imageUrl}
							alt=""
							className="size-6 rounded object-cover outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10"
						/>
					) : (
						<TagBoldIcon className="size-7 rounded bg-muted p-1 text-muted-foreground" />
					)}
					<span className="block max-w-40 truncate sm:max-w-48">
						{row.original.name}
					</span>
				</div>
			),
		},
		{
			accessorKey: "dailyLimit",
			header: "Daily Limit",
			size: 200,
			cell: ({ row }) =>
				row.original.dailyLimitApplicable !== false ? (
					<DailyLimitSelect
						value={row.original.dailyLimit}
						onValueChange={(value) => onLimitChange(row.original.id, value)}
					/>
				) : (
					<span className="text-sm text-muted-foreground">Not applicable</span>
				),
		},
		{
			id: "usage",
			header: "Usage status",
			size: 280,
			cell: ({ row }) => (
				<UsageLimit
					dailyLimit={row.original.dailyLimit}
					usedMinutes={row.original.usedMinutes}
					applicable={row.original.dailyLimitApplicable}
				/>
			),
		},
		{
			id: "actions",
			header: "Action",
			size: 72,
			cell: ({ row }) =>
				row.original.type !== "category" ? (
					<Button
						variant="outline"
						size="icon-sm"
						className="text-muted-foreground hover:text-destructive"
						aria-label={`Delete ${row.original.name}`}
						onClick={() => onDelete(row.original.id)}>
						<TrashBinLinear color="currentColor" className="size-4" />
					</Button>
				) : null,
			enableSorting: false,
		},
	];
}

export function BlockListTable({
	sites = [],
	onDeleteSite,
	onDailyLimitChange,
	typeFilter,
}: {
	sites?: BlockedSite[];
	onDeleteSite?: (siteId: string) => void;
	onDailyLimitChange?: (siteId: string, dailyLimit: string) => void;
	typeFilter?: BlockedSite["type"];
} = {}) {
	const filteredSites = typeFilter ? sites.filter((site) => site.type === typeFilter) : sites;
	const columns = getColumns({
		onLimitChange: (siteId, dailyLimit) => onDailyLimitChange?.(siteId, dailyLimit),
		onDelete: (siteId) => onDeleteSite?.(siteId),
	});
	const table = useReactTable({
		data: filteredSites,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<CardFrame className="w-full max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border bg-card shadow-none md:max-w-full">
			<Table
				variant="card"
				className="min-w-full"
				style={{ width: `${table.getTotalSize()}px` }}>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow
							key={headerGroup.id}
							className="h-10 bg-muted/50 text-foreground hover:bg-sidebar-accent">
							{headerGroup.headers.map((header) => (
								<TableHead
									key={header.id}
									className={
										header.column.id === "name"
											? "h-10 px-4"
											: "h-10"
									}
									style={{ width: `${header.getSize()}px` }}>
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef
													.header,
												header.getContext(),
											)}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows.length === 0 ? (
						<TableRow>
							<TableCell
								colSpan={columns.length}
								className="h-24 text-center text-muted-foreground">
								No blocked items.
							</TableCell>
						</TableRow>
					) : (
						table.getRowModel().rows.map((row) => (
							<TableRow key={row.id} className="h-16">
								{row.getVisibleCells().map((cell) => (
									<TableCell
										key={cell.id}
										className={
											cell.column.id === "name"
												? "h-16 px-4 py-1"
												: cell.column.id ===
													  "actions"
													? "h-16 py-1 pr-4 text-right"
													: "h-16 py-1"
										}
										style={{
											width: `${cell.column.getSize()}px`,
										}}>
										{flexRender(
											cell.column.columnDef.cell,
											cell.getContext(),
										)}
									</TableCell>
								))}
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</CardFrame>
	);
}
