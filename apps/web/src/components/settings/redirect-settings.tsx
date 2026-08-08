import { Switch } from "../switch";
import { cn } from "@/lib/utils";
import { CustomRedirectDialog } from "../custom-redirect-dialog";

const backgroundImages = import.meta.glob<string>("/src/assets/backgrounds/*.avif", {
	eager: true,
	import: "default",
});

const backgrounds = Object.entries(backgroundImages).sort(([a], [b]) => a.localeCompare(b));

export function RedirectSettings() {
	return (
		<div className="flex flex-col gap-2 p-6 lg:items-start">
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
			<div className="flex w-full items-center justify-between gap-3 pt-4 pb-2">
				<span className="min-w-0 flex-1 text-sm text-foreground">
					Enable background dither effect
				</span>
				<Switch checked={true} className="shrink-0" />
			</div>
			<div className="space-y-2 w-full pt-3">
				<h3 className="text-lg font-semibold tracking-tight text-foreground">
					Background images
				</h3>
			</div>
			<div className="grid w-full grid-cols-3 gap-3 sm:max-w-4xl sm:grid-cols-6 sm:gap-6">
				{backgrounds.map(([fileName, src]) => {
					const name = fileName.split("/").pop()?.replace(".avif", "");
					return (
						<button
							key={fileName}
							type="button"
							aria-label={`Use ${name} background`}
							className={cn(
								"group relative aspect-square w-full overflow-hidden rounded-md border bg-muted transition-colors hover:border-primary sm:size-34",
							)}>
							<img
								src={src}
								alt={name}
								loading="lazy"
								decoding="async"
								className="size-full object-cover"
							/>
						</button>
					);
				})}
			</div>
		</div>
	);
}
