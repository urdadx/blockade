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
			<div className="w-full flex items-center justify-between space-y-5">
				<div className="space-y-2">
					<h3 className="text-lg font-semibold tracking-tight text-foreground">
						Redirect Page Settings
					</h3>
					<p className=" text-sm leading-relaxed text-muted-foreground">
						Customize your redirect settings to control how websites are
						redirected
					</p>
				</div>
				<CustomRedirectDialog />
			</div>

			<div className="w-full flex items-center justify-between">
				<span className="truncate flex items-center gap-3 text-sm text-foreground">
					Show pomodoro timer on redirect page
				</span>
				<Switch checked={true} />
			</div>
			<div className="w-full flex items-center justify-between  py-2">
				<span className="truncate flex items-center gap-3 text-sm text-foreground">
					Enable background dither effect
				</span>
				<Switch checked={true} />
			</div>
			<div className="space-y-2 w-full pt-3">
				<h3 className="text-lg font-semibold tracking-tight text-foreground">
					Background image
				</h3>
				<div className="w-full flex items-center justify-between  py-2">
					<span className="truncate flex items-center gap-3 text-sm text-foreground">
						Randomize background image on each redirect
					</span>
					<Switch checked={true} />
				</div>
			</div>
			<div className="grid w-full sm:max-w-4xl grid-cols-6 gap-6">
				{backgrounds.map(([fileName, src]) => {
					const name = fileName.split("/").pop()?.replace(".avif", "");
					return (
						<button
							key={fileName}
							type="button"
							aria-label={`Use ${name} background`}
							className={cn(
								"group relative size-34 overflow-hidden rounded-md border bg-muted transition-colors hover:border-primary",
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
