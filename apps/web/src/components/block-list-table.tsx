import { TrashBinLinear } from "@/assets/icons/trash-icon";
import { Button } from "@/components/button";
import { DitherBarFill } from "@/components/dither-bar-fill";
import type { DitherColor } from "@/components/dither-kit/palette";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { getWebsiteFaviconUrl } from "@/lib/utils";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

const formatLimit = (minutes: number) => {
	if (minutes < 60) return `${minutes} mins`;

	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	const hourLabel = `${hours} ${hours === 1 ? "hour" : "hours"}`;
	return remainingMinutes ? `${hourLabel} ${remainingMinutes} mins` : hourLabel;
};

const dailyLimitOptions = [
	{ label: "No limit", value: "none" },
	...Array.from({ length: 24 * 12 }, (_, index) => {
		const minutes = (index + 1) * 5;
		return { label: formatLimit(minutes), value: String(minutes) };
	}),
];

const blockedSites = [
	{
		id: "youtube",
		name: "youtube.com",
		url: "https://youtube.com",
		dailyLimit: "60",
		usedMinutes: 45,
	},
	{
		id: "instagram",
		name: "instagram.com",
		url: "https://instagram.com",
		dailyLimit: "30",
		usedMinutes: 30,
	},
	{
		id: "reddit",
		name: "reddit.com",
		url: "https://reddit.com",
		dailyLimit: "none",
		usedMinutes: 42,
	},
	{
		id: "x",
		name: "x.com",
		url: "https://x.com",
		dailyLimit: "120",
		usedMinutes: 102,
	},
	{
		id: "tiktok",
		name: "tiktok.com",
		url: "https://tiktok.com",
		dailyLimit: "45",
		usedMinutes: 5,
	},
];

function UsageLimit({ dailyLimit, usedMinutes }: { dailyLimit: string; usedMinutes: number }) {
	if (dailyLimit === "none") {
		return (
			<div className="flex flex-col items-start gap-1.5">
				{/* <div className="h-3 w-24 overflow-hidden rounded-none bg-muted/60 opacity-50 sm:w-32">
					<DitherBarFill color="grey" variant="dotted" />
				</div> */}
				<span className="text-sm text-foreground">No limit set</span>
			</div>
		);
	}

	const limitMinutes = Number(dailyLimit);
	if (!Number.isFinite(limitMinutes) || limitMinutes <= 0) {
		return <span className="text-sm text-muted-foreground">No limit</span>;
	}

	const usedPercent = Math.min(100, (usedMinutes / limitMinutes) * 100);
	const remainingMinutes = Math.max(0, limitMinutes - usedMinutes);
	const color: DitherColor = usedPercent >= 90 ? "red" : usedPercent >= 70 ? "orange" : "green";

	return (
		<div className="flex flex-col items-start gap-1.5">
			<div className="h-3 w-24 overflow-hidden rounded-none bg-muted/60 sm:w-32">
				<div
					className="h-full overflow-hidden rounded-none opacity-60 transition-[width] duration-300"
					style={{ width: `${usedPercent}%` }}>
					<DitherBarFill color={color} />
				</div>
			</div>
			<span className="text-foreground">
				{remainingMinutes === 0 ? "Limit reached" : `${remainingMinutes} min left`}
			</span>
		</div>
	);
}

type BlockedSite = (typeof blockedSites)[number];

function getColumns({
	onLimitChange,
	onDelete,
}: {
	onLimitChange: (siteId: string, value: unknown) => void;
	onDelete: (siteId: string) => void;
}): ColumnDef<BlockedSite>[] {
	return [
		{
			accessorKey: "name",
			header: "Name",
			size: 220,
			cell: ({ row }) => (
				<div className="flex items-center gap-2.5 font-medium">
					<img
						src={getWebsiteFaviconUrl(row.original.url)}
						alt=""
						className="size-6 rounded"
					/>
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
			cell: ({ row }) => (
				<Select
					items={dailyLimitOptions}
					value={row.original.dailyLimit}
					onValueChange={(value) => onLimitChange(row.original.id, value)}>
					<SelectTrigger size="sm" className="w-36 bg-white sm:w-44">
						<SelectValue />
					</SelectTrigger>
					<SelectContent className="max-h-72" align="start">
						{dailyLimitOptions.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
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
				/>
			),
		},
		{
			id: "actions",
			header: "",
			size: 72,
			cell: ({ row }) => (
				<Button
					variant="outline"
					size="icon-sm"
					className="text-muted-foreground hover:text-red-500"
					aria-label={`Delete ${row.original.name}`}
					onClick={() => onDelete(row.original.id)}>
					<TrashBinLinear color="red" className="size-4" />
				</Button>
			),
			enableSorting: false,
		},
	];
}

export function BlockListTable() {
	const [sites, setSites] = useState(blockedSites);

	const updateDailyLimit = (siteId: string, selectedValue: unknown) => {
		const dailyLimit =
			typeof selectedValue === "string"
				? selectedValue
				: selectedValue &&
					  typeof selectedValue === "object" &&
					  "value" in selectedValue
					? String(selectedValue.value)
					: null;

		if (!dailyLimit) return;
		setSites((currentSites) =>
			currentSites.map((site) => (site.id === siteId ? { ...site, dailyLimit } : site)),
		);
	};
	const columns = getColumns({
		onLimitChange: updateDailyLimit,
		onDelete: (siteId) =>
			setSites((currentSites) => currentSites.filter((site) => site.id !== siteId)),
	});
	const table = useReactTable({
		data: sites,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div className="w-full max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border bg-white md:max-w-full">
			<Table
				className="min-w-full"
				style={{ width: `${table.getTotalSize()}px` }}>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow
							key={headerGroup.id}
							className="h-11 bg-[#FAFAFA] text-sidebar-accent-foreground hover:bg-sidebar-accent">
							{headerGroup.headers.map((header) => (
								<TableHead
									key={header.id}
									className={header.column.id === "name" ? "h-11 px-4" : "h-11"}
									style={{ width: `${header.getSize()}px` }}>
									{header.isPlaceholder
										? null
										: flexRender(header.column.columnDef.header, header.getContext())}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows.length === 0 ? (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
								No blocked sites.
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
												: cell.column.id === "actions"
													? "h-16 py-1 pr-4 text-right"
													: "h-16 py-1"
										}
										style={{ width: `${cell.column.getSize()}px` }}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	);
}
