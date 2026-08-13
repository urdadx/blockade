import { AddBlockListDialog } from "@/components/add-block-list-dialog";
import { BlockListTable, type BlockedSite } from "@/components/block-list-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs";
import { ScheduleTimerDialog } from "./schedule-timer-dialog";

export function BlockListPage({
	sites,
	onDeleteSite,
	onDailyLimitChange,
	onAddItems,
}: {
	sites?: BlockedSite[];
	onDeleteSite?: (siteId: string) => void;
	onDailyLimitChange?: (siteId: string, dailyLimit: string) => void;
	onAddItems?: (items: string[]) => void | Promise<void>;
} = {}) {
	return (
		<main className="mx-auto w-full min-w-0 max-w-7xl p-3 sm:p-4 md:p-5">
			<div className="flex flex-col gap-1 pb-4 sm:pb-6">
				<h2 className="text-2xl font-semibold font-display text-foreground">
					Block List
				</h2>
				<p className="text-sm text-muted-foreground">
					Block sites permanently or schedule and set usage limits for specific
					websites.
				</p>
			</div>
			<Tabs className="w-full items-start" defaultValue="all">
				<div className="flex w-full min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
					<div className="hide-scrollbar w-full min-w-0 overflow-x-auto lg:w-auto">
						<TabsList className="w-max min-w-full justify-start bg-transparent lg:min-w-0">
							<TabsTrigger
								className="data-[state=active]:bg-muted data-[state=active]:shadow-none"
								value="all">
								All
							</TabsTrigger>
							<TabsTrigger
								className="data-[state=active]:bg-muted data-[state=active]:shadow-none"
								value="websites">
								Websites
							</TabsTrigger>
							<TabsTrigger
								className="data-[state=active]:bg-muted data-[state=active]:shadow-none"
								value="categories">
								Categories
							</TabsTrigger>
							<TabsTrigger
								className="data-[state=active]:bg-muted data-[state=active]:shadow-none"
								value="keywords">
								Keywords
							</TabsTrigger>
						</TabsList>
					</div>
					<div className="grid w-full shrink-0 grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:flex sm:w-auto">
						<AddBlockListDialog
							className="w-full sm:w-auto"
							onAdd={onAddItems}
						/>
						<ScheduleTimerDialog />
					</div>
				</div>
				<TabsContent value="all" className="w-full min-w-0 pt-3">
					<BlockListTable
						sites={sites}
						onDeleteSite={onDeleteSite}
						onDailyLimitChange={onDailyLimitChange}
					/>
				</TabsContent>
				<TabsContent value="websites" className="w-full min-w-0 pt-3">
					<BlockListTable
						sites={sites}
						onDeleteSite={onDeleteSite}
						onDailyLimitChange={onDailyLimitChange}
						typeFilter="website"
					/>
				</TabsContent>
				<TabsContent value="categories" className="w-full min-w-0 pt-3">
					<BlockListTable
						sites={sites}
						onDeleteSite={onDeleteSite}
						onDailyLimitChange={onDailyLimitChange}
						typeFilter="category"
					/>
				</TabsContent>
				<TabsContent value="keywords" className="w-full min-w-0 pt-3">
					<BlockListTable
						sites={sites}
						onDeleteSite={onDeleteSite}
						onDailyLimitChange={onDailyLimitChange}
						typeFilter="keyword"
					/>
				</TabsContent>
			</Tabs>
		</main>
	);
}
