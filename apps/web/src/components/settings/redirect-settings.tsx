import { Switch } from "../switch";
import { CustomRedirectDialog } from "../custom-redirect-dialog";

export function RedirectSettings() {
	return (
		<div className="flex flex-col gap-2 p-5 lg:items-start">
			<div className="flex w-full pb-0 sm:pb-3 flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="space-y-2">
					<h3 className="text-lg font-semibold tracking-tight text-foreground">
						Redirect Page Settings
					</h3>
					<p className=" text-sm leading-relaxed text-muted-foreground">
						Customize your redirect settings to control how websites are
						redirected
					</p>
				</div>
				<CustomRedirectDialog className="w-full sm:w-fit" />
			</div>

			<div className="flex w-full pt-3 sm:pt-0 items-center justify-between">
				<span className="min-w-0 flex-1 text-sm text-foreground">
					Show pomodoro timer on redirect page
				</span>
				<Switch checked={true} className="shrink-0" />
			</div>
		</div>
	);
}
