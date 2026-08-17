import { useState } from "react";
import { defaultBlockingSchedule, type BlockingSchedule } from "@blockade/core";

import { AddBlockListDialog } from "@/components/add-block-list-dialog";
import { BlockListTable, type BlockedSite } from "@/components/block-list-table";
import { Button } from "@/components/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/dialog";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs";
import { ScheduleTimerDialog } from "./schedule-timer-dialog";

export function BlockListPage({
	sites,
	onDeleteSite,
	onDailyLimitChange,
	onAddItems,
	passwordProtectionEnabled = false,
	onVerifyPassword,
	schedule = defaultBlockingSchedule,
	onScheduleChange,
}: {
	sites?: BlockedSite[];
	onDeleteSite?: (siteId: string) => void | Promise<void>;
	onDailyLimitChange?: (siteId: string, dailyLimit: string) => void;
	onAddItems?: (items: string[]) => void | Promise<void>;
	passwordProtectionEnabled?: boolean;
	onVerifyPassword?: (password: string) => boolean | Promise<boolean>;
	schedule?: BlockingSchedule;
	onScheduleChange?: (schedule: BlockingSchedule) => void | Promise<void>;
} = {}) {
	const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
	const [password, setPassword] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [isVerifying, setIsVerifying] = useState(false);

	const deleteSite = (siteId: string) => {
		setPendingDeleteId(siteId);
		setPassword("");
		setPasswordError("");
	};

	const verifyAndDelete = async () => {
		if (!pendingDeleteId) return;
		setIsVerifying(true);
		setPasswordError("");
		try {
			if (passwordProtectionEnabled && !(await onVerifyPassword?.(password))) {
				setPasswordError("Incorrect password.");
				return;
			}
			await onDeleteSite?.(pendingDeleteId);
			setPendingDeleteId(null);
			setPassword("");
		} finally {
			setIsVerifying(false);
		}
	};

	return (
		<div className="mx-auto w-full min-w-0 max-w-7xl p-3 sm:p-4 md:p-5">
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
				<div className="flex w-full flex-wrap items-center justify-between gap-2 pb-3">
					<div className="hide-scrollbar min-w-0 flex-1 overflow-x-auto">
						<TabsList className="w-max min-w-full justify-start bg-transparent">
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
					<div className="flex shrink-0 items-center gap-2">
						<AddBlockListDialog
							className="w-full sm:w-auto"
							onAdd={onAddItems}
						/>
						<ScheduleTimerDialog
							schedule={schedule}
							onSave={onScheduleChange}
						/>
					</div>
				</div>
				<TabsContent value="all" className="w-full min-w-0 pt-3">
					<BlockListTable
						sites={sites}
						onDeleteSite={deleteSite}
						onDailyLimitChange={onDailyLimitChange}
					/>
				</TabsContent>
				<TabsContent value="websites" className="w-full min-w-0 pt-3">
					<BlockListTable
						sites={sites}
						onDeleteSite={deleteSite}
						onDailyLimitChange={onDailyLimitChange}
						typeFilter="website"
					/>
				</TabsContent>
				<TabsContent value="categories" className="w-full min-w-0 pt-3">
					<BlockListTable
						sites={sites}
						onDeleteSite={deleteSite}
						onDailyLimitChange={onDailyLimitChange}
						typeFilter="category"
					/>
				</TabsContent>
				<TabsContent value="keywords" className="w-full min-w-0 pt-3">
					<BlockListTable
						sites={sites}
						onDeleteSite={deleteSite}
						onDailyLimitChange={onDailyLimitChange}
						typeFilter="keyword"
					/>
				</TabsContent>
			</Tabs>
			<Dialog
				open={pendingDeleteId !== null}
				onOpenChange={(open) => {
					if (!open && !isVerifying) {
						setPendingDeleteId(null);
						setPassword("");
						setPasswordError("");
					}
				}}>
				<DialogContent showCloseButton={!isVerifying}>
					<form
						className="space-y-4"
						onSubmit={(event) => {
							event.preventDefault();
							void verifyAndDelete();
						}}>
						<DialogHeader className="pr-8">
							<DialogTitle className="text-xl font-semibold">
								Remove blocked item?
							</DialogTitle>
							<DialogDescription>
								{passwordProtectionEnabled
									? "Enter your password to remove this item from the block list."
									: "Are you sure you want to remove this item from the block list?"}
							</DialogDescription>
						</DialogHeader>
						{passwordProtectionEnabled && (
							<div className="space-y-2">
								<Label htmlFor="remove-blocked-item-password">
									Password
								</Label>
								<Input
									id="remove-blocked-item-password"
									type="password"
									autoComplete="current-password"
									value={password}
									disabled={isVerifying}
									onChange={(event) =>
										setPassword(event.target.value)
									}
								/>
								{passwordError && (
									<p className="text-sm text-destructive">
										{passwordError}
									</p>
								)}
							</div>
						)}
						<DialogFooter>
							<DialogClose
								disabled={isVerifying}
								render={<Button type="button" variant="outline" />}>
								Cancel
							</DialogClose>
							<Button
								type="submit"
								className="bg-destructive hover:bg-destructive/90"
								disabled={
									isVerifying ||
									(passwordProtectionEnabled && !password)
								}>
								{isVerifying ? "Removing..." : "Remove"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
