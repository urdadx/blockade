import { useState } from "react";
import { LockIcon } from "@/assets/icons/lock";
import { Switch } from "../switch";
import { BoltIcon } from "@/assets/icons/bolt-icon";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../dialog";
import { Input } from "../input";
import { Button } from "../button";
import { Label } from "../label";

export function BlockSettings() {
	const [isPasswordEnabled, setIsPasswordEnabled] = useState(false);

	const handlePasswordToggle = (checked: boolean) => {
		setIsPasswordEnabled(checked);
	};

	return (
		<div className="grid gap-8 p-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
			<div className="space-y-5">
				<div className="space-y-2">
					<h3 className="text-lg font-semibold tracking-tight text-foreground">
						Block Settings
					</h3>
					<p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
						Customize your block settings to control how websites are
						blocked and password protection
					</p>
				</div>
			</div>

			<div className="space-y-3">
				<div>
					<div className="flex items-center justify-between gap-2 py-2">
						<span className="truncate flex items-center gap-3 text-sm text-foreground">
							<LockIcon />
							Enable Password Protection
						</span>
						<Switch
							checked={isPasswordEnabled}
							onCheckedChange={handlePasswordToggle}
						/>
					</div>
					<div className="flex items-center justify-between gap-4 py-5">
						<span className="truncate flex items-center gap-3 text-sm text-foreground">
							<BoltIcon />
							Show Blockade shortcut on a website
						</span>
						<Switch checked={true} />
					</div>
				</div>
			</div>

			<Dialog open={isPasswordEnabled} onOpenChange={setIsPasswordEnabled}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="text-xl font-semibold">
							Set password
						</DialogTitle>
						<DialogDescription>
							Create a password to protect your block settings.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								placeholder="Enter password"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirm-password">Confirm password</Label>
							<Input
								id="confirm-password"
								type="password"
								placeholder="Confirm password"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit">Save password</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
