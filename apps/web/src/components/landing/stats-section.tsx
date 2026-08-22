const stats = [
	{ value: "71%", label: "better focus during work sessions" },
	{ value: "60 hrs", label: "saved per user per month" },
	{ value: "45%", label: "productivity boost" },
];

export const StatsSection = () => {
	return (
		<section className="mt-12 h-[800px] w-full border border-white/10 bg-[#202223] px-6 py-20 text-white md:mt-0  md:py-24 lg:px-4">
			<div className="mx-auto w-full max-w-6xl min-[1600px]:max-w-[90rem]">
				<h2 className="text-center font-display text-4xl leading-tight font-medium tracking-[-0.02em] sm:text-5xl">
					Take back your time
				</h2>

				<div className="mt-16 grid md:grid-cols-3">
					{stats.map((stat, index) => (
						<div
							key={stat.label}
							className={
								index === 0
									? "py-8 md:px-8 md:py-6"
									: "border-t border-white/20 py-8 md:border-t-0 md:border-l md:px-8 md:py-6"
							}>
							<div className="font-display text-6xl leading-none font-medium tracking-[-0.04em] sm:text-6xl lg:text-8xl">
								{stat.value}
							</div>
							<p className="mt-5 text-base text-white/75">
								{stat.label}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};
