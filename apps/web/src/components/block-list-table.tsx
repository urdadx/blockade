import { alwaysBlockedCategoryIds, defaultAdultKeywords } from "@blockade/core";

import { TrashBinLinear } from "@/assets/icons/trash-icon";
import { DailyLimitSelect } from "@/components/block-list/daily-limit-select";
import { UsageLimit } from "@/components/block-list/usage-limit";
import { Button } from "@/components/button";
import { CardFrame } from "@/components/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";
import { getWebsiteFaviconUrl } from "@/lib/utils";
import {
	type ColumnDef,
	type Row,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { TagBoldIcon } from "./tag-icon";
import { memo, useCallback, useLayoutEffect, useMemo, useRef } from "react";

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

const hiddenDefaultKeywords = new Set<string>(
	defaultAdultKeywords.map((keyword) => keyword.toLowerCase()),
);
const alwaysBlockedSiteIds = new Set(alwaysBlockedCategoryIds.map((id) => `category:${id}`));

function areBlockedSitesEqual(previous: BlockedSite, next: BlockedSite) {
	return (
		previous.id === next.id &&
		previous.name === next.name &&
		previous.url === next.url &&
		previous.dailyLimit === next.dailyLimit &&
		previous.usedMinutes === next.usedMinutes &&
		previous.type === next.type &&
		previous.imageUrl === next.imageUrl &&
		previous.dailyLimitApplicable === next.dailyLimitApplicable
	);
}

function DeleteAction({
	site,
	onDelete,
}: {
	site: BlockedSite;
	onDelete: (siteId: string) => void;
}) {
	if (site.type === "category") {
		const isAlwaysBlocked = alwaysBlockedSiteIds.has(site.id);
		if (!isAlwaysBlocked) return null;

		return (
			<Tooltip>
				<TooltipTrigger render={<span className="inline-flex" />}>
					<Button
						variant="outline"
						size="icon-sm"
						className="text-muted-foreground"
						aria-label={`${site.name} cannot be deleted`}
						disabled
					>
						<TrashBinLinear color="currentColor" className="size-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>You can't delete this category</TooltipContent>
			</Tooltip>
		);
	}

	return (
		<Button
			variant="outline"
			size="icon-sm"
			className="text-muted-foreground hover:text-destructive"
			aria-label={`Delete ${site.name}`}
			onClick={() => onDelete(site.id)}
		>
			<TrashBinLinear color="currentColor" className="size-4" />
		</Button>
	);
}

function isAlwaysBlockedSite(site: BlockedSite) {
	return site.type === "category" && alwaysBlockedSiteIds.has(site.id);
}

const BlockListRow = memo(
	function BlockListRow({ row }: { row: Row<BlockedSite> }) {
		return (
			<TableRow className="h-16">
				{row.getVisibleCells().map((cell) => (
					<TableCell
						key={cell.id}
						className={
							cell.column.id === "name"
								? "h-16 px-4 py-1"
								: cell.column.id === "actions"
									? "h-16 py-1 pr-4 text-right"
									: "h-16 py-1"
						}
						style={{ width: `${cell.column.getSize()}px` }}
					>
						{flexRender(cell.column.columnDef.cell, cell.getContext())}
					</TableCell>
				))}
			</TableRow>
		);
	},
	(previous, next) => areBlockedSitesEqual(previous.row.original, next.row.original),
);

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
					<span className="block max-w-40 truncate sm:max-w-48">{row.original.name}</span>
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
				) : isAlwaysBlockedSite(row.original) ? (
					<DailyLimitSelect value="none" onValueChange={() => undefined} disabled />
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
					dailyLimit={isAlwaysBlockedSite(row.original) ? "none" : row.original.dailyLimit}
					usedMinutes={row.original.usedMinutes}
					applicable={isAlwaysBlockedSite(row.original) || row.original.dailyLimitApplicable}
				/>
			),
		},
		{
			id: "actions",
			header: "Action",
			size: 72,
			cell: ({ row }) => <DeleteAction site={row.original} onDelete={onDelete} />,
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
	const filteredSites = useMemo(() => {
		return sites.filter(
			(site) =>
				(!typeFilter || site.type === typeFilter) &&
				(site.type !== "keyword" || !hiddenDefaultKeywords.has(site.name.toLowerCase())),
		);
	}, [sites, typeFilter]);

	const onDailyLimitChangeRef = useRef(onDailyLimitChange);
	const onDeleteSiteRef = useRef(onDeleteSite);
	useLayoutEffect(() => {
		onDailyLimitChangeRef.current = onDailyLimitChange;
		onDeleteSiteRef.current = onDeleteSite;
	}, [onDailyLimitChange, onDeleteSite]);

	const handleLimitChange = useCallback(
		(siteId: string, value: string) => onDailyLimitChangeRef.current?.(siteId, value),
		[],
	);
	const handleDelete = useCallback((siteId: string) => onDeleteSiteRef.current?.(siteId), []);

	const columns = useMemo(
		() => getColumns({ onLimitChange: handleLimitChange, onDelete: handleDelete }),
		[handleLimitChange, handleDelete],
	);

	const table = useReactTable({
		data: filteredSites,
		columns,
		getRowId: (site) => site.id,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: {
			pagination: {
				pageIndex: 0,
				pageSize: 20,
			},
		},
	});
	const rows = table.getRowModel().rows;
	return (
		<div className="space-y-3">
			<CardFrame className="w-full max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border bg-card shadow-none md:max-w-full">
				<Table variant="card" className="min-w-full" style={{ width: `${table.getTotalSize()}px` }}>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow
								key={headerGroup.id}
								className="h-10 bg-muted/50 text-foreground hover:bg-sidebar-accent"
							>
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.id}
										className={header.column.id === "name" ? "h-10 px-4" : "h-10"}
										style={{
											width: `${header.getSize()}px`,
										}}
									>
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{rows.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center text-muted-foreground"
								>
									No blocked items.
								</TableCell>
							</TableRow>
						) : (
							rows.map((row) => <BlockListRow key={row.id} row={row} />)
						)}
					</TableBody>
				</Table>
			</CardFrame>
			{filteredSites.length > 20 && (
				<div className="flex items-center justify-between gap-3">
					<p className="text-sm text-muted-foreground">
						Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
					</p>
					<div className="flex gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={!table.getCanPreviousPage()}
							onClick={() => table.previousPage()}
						>
							Previous
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={!table.getCanNextPage()}
							onClick={() => table.nextPage()}
						>
							Next
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
