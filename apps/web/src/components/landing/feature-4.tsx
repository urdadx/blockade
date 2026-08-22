import BackgroundImage from "@/assets/background.avif";
import { forwardRef } from "react";

export const Feature4 = forwardRef<HTMLDivElement>(function Feature4(_, ref) {
	return (
		<div
			ref={ref}
			id="integrations"
			className="grid scroll-mt-32 gap-6 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
			<div className="flex flex-col justify-start pt-5">
				<h3 className="max-w-xl text-3xl font-medium">Connected stack</h3>
				<p className="mt-6 max-w-xl text-base font-medium text-muted-foreground">
					Sync email, calendar, and billing tools so customer data stays current
					across your workflow.
				</p>
			</div>
			<div
				aria-hidden="true"
				className="aspect-[6/7] rounded-3xl bg-cover bg-center"
				style={{ backgroundImage: `url(${BackgroundImage})` }}
			/>
		</div>
	);
});
