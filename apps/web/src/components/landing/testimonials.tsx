import UserImage from "@/assets/jack_maaye.jpg";
import Star from "@/assets/star.webp";

const testimonials = [
	{
		quote: (
			<>
				I didn't realize how often I was checking tiktok until I saw the numbers.{" "}
				Blocking them made it{" "}
				<mark className="rounded-sm bg-primary/30 px-0.5">
					so much easier to actually stay focused.
				</mark>
			</>
		),
		name: "Jack Maaye",
		description: "University Student",
	},
	{
		quote: (
			<>
				I used to tell myself I would only check YouTube for a minute.{" "}
				<mark className="rounded-sm bg-primary/30 px-0.5">
					Now I just block it when I need to work{" "}
				</mark>
				and don't have to rely on willpower.
			</>
		),
		name: "Sarah Williams",
		description: "Content Creator",
	},
];

export const Testimonials = () => {
	return (
		<div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12 min-[1600px]:gap-36">
			{testimonials.map((testimonial) => (
				<figure key={testimonial.name} className="flex flex-col">
					<div
						className="flex items-center gap-0.5"
						aria-label="5 out of 5 stars">
						{Array.from({ length: 5 }, (_, index) => (
							<img
								key={index}
								src={Star}
								alt=""
								className="size-[17px] object-contain"
							/>
						))}
					</div>

					<blockquote className="mt-2 text-left text-base leading-relaxed">
						&ldquo;{testimonial.quote}&rdquo;
					</blockquote>

					<figcaption className="mt-4 flex items-center gap-2">
						<img
							src={UserImage}
							alt={testimonial.name}
							className="size-10 shrink-0 rounded-full object-cover shadow-sm"
						/>
						<div>
							<div className="font-medium text-foreground">
								{testimonial.name}
							</div>
							<div className="text-sm text-stone-400">
								{testimonial.description}
							</div>
						</div>
					</figcaption>
				</figure>
			))}
		</div>
	);
};
