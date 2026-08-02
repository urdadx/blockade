import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs";
import { BlockListTable } from "@/components/block-list-table";
import { AddBlockListDialog } from "@/components/add-block-list-dialog";
import { ScheduleTimerDialog } from "@/components/schedule-timer-dialog";

export const Route = createFileRoute("/(admin)/block-list")({
	component: RouteComponent,
});

function RouteComponent() {
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
			<Tabs className="w-full items-start" defaultValue="tab-1">
				<div className="flex w-full min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
					<div className="hide-scrollbar w-full min-w-0 overflow-x-auto lg:w-auto">
						<TabsList className="w-max min-w-full justify-start bg-transparent lg:min-w-0">
							<TabsTrigger
								className="data-[state=active]:bg-muted data-[state=active]:shadow-none"
								value="tab-1">
								All
							</TabsTrigger>
							<TabsTrigger
								className="data-[state=active]:bg-muted data-[state=active]:shadow-none"
								value="tab-2">
								Websites
							</TabsTrigger>
							<TabsTrigger
								className="data-[state=active]:bg-muted data-[state=active]:shadow-none"
								value="tab-3">
								Keywords
							</TabsTrigger>
							<TabsTrigger
								className="data-[state=active]:bg-muted data-[state=active]:shadow-none"
								value="tab-4">
								Categories
							</TabsTrigger>
						</TabsList>
					</div>
					<div className="grid w-full shrink-0 grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:flex sm:w-auto">
						<AddBlockListDialog className="w-full sm:w-auto" />
						<ScheduleTimerDialog className="w-full sm:w-auto" />
					</div>
				</div>
				<TabsContent value="tab-1" className="w-full min-w-0 pt-3">
					<BlockListTable />
				</TabsContent>
				<TabsContent value="tab-2" className="w-full min-w-0 pt-3">
					<BlockListTable />
				</TabsContent>
				<TabsContent value="tab-3">
					<p className="p-4 text-center text-muted-foreground text-xs">
						Content for Tab 3
					</p>
				</TabsContent>
				<TabsContent value="tab-4">
					<p className="p-4 text-center text-muted-foreground text-xs">
						Content for Tab 4
					</p>
				</TabsContent>
			</Tabs>
		</main>
	);
}
