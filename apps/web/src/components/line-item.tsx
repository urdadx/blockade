import { DitherBarFill } from "@/components/dither-bar-fill";
import type { AreaVariant } from "@/components/dither-kit/chart-context";
import type { DitherColor } from "@/components/dither-kit/palette";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { type ReactNode, useMemo, useState } from "react";

interface LineItemProps {
	icon: ReactNode;
	title: string;
	href: string;
	value: number;
	maxValue: number;
	tab: string;
	unit: string;
	ditherColor?: DitherColor;
	ditherVariant?: AreaVariant;
	hoverBackground?: string;
	linkData?: any;
	minBarWidth?: number;
}

export function LineItem({
	icon,
	title,
	value,
	maxValue,
	unit,
	ditherColor = "blue",
	ditherVariant = "gradient",
	hoverBackground = "hover:bg-gray-50",
	minBarWidth = 10,
}: LineItemProps) {
	const [isHovered, setIsHovered] = useState(false);

	const percentWidth = useMemo(() => {
		const calculated = (value / (maxValue || 1)) * 100;
		return Math.max(calculated, minBarWidth);
	}, [value, maxValue, minBarWidth]);

	const formattedValue = useMemo(() => {
		return value.toLocaleString();
	}, [value]);

	const lineItem = useMemo(() => {
		return (
			<div className="z-10 text-black flex items-center space-x-2 px-2 w-full">
				<div className="shrink-0">{icon}</div>
				<div
					className={cn(
						"truncate text-[14px]  text-black transition-all",
						isHovered ? "font-medium" : "",
					)}
					title={title}>
					{title}
				</div>
			</div>
		);
	}, [icon, title, isHovered]);

	return (
		<div
			className={cn(
				"border-transparent min-w-0 transition-all rounded",
				isHovered ? hoverBackground : "",
			)}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}>
			<div
				className="block cursor-pointer"
				title={`${title}: ${formattedValue} ${unit}`}>
				<div className="group flex items-center py-1 justify-between px-1">
					<div className="relative z-10 flex h-9 w-full min-w-0 max-w-[calc(100%-4rem)] items-center">
						{lineItem}
						<motion.div
							style={{
								width: `${percentWidth}%`,
							}}
							className={cn(
								"absolute h-full origin-left overflow-hidden rounded-sm  transition-opacity",
								isHovered ? "opacity-60" : "opacity-45",
							)}
							transition={{ ease: "easeOut", duration: 0.3 }}
							initial={{ transform: "scaleX(0)" }}
							animate={{ transform: "scaleX(1)" }}>
							<DitherBarFill
								color={ditherColor}
								variant={ditherVariant}
								intensity={isHovered ? 1 : 0}
							/>
						</motion.div>
					</div>
					<div className="z-10 text-sm tabular-nums text-black-500 ml-2 shrink-0">
						{formattedValue}
					</div>
				</div>
			</div>
		</div>
	);
}
