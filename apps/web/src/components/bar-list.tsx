import { type Dispatch, type ReactNode, type SetStateAction, useMemo } from "react";
import type { AreaVariant } from "./dither-kit/chart-context";
import type { DitherColor } from "./dither-kit/palette";
import { ScrollArea } from "./scroll-area";
import { LineItem } from "./line-item";

const EMPTY_DATA: BarListProps["data"] = [];

interface BarListProps {
	tab: string;
	unit: string;
	data: {
		icon: ReactNode;
		title: string;
		href: string;
		value: number;
		linkId?: string;
		ditherColor?: DitherColor;
		ditherVariant?: AreaVariant;
		hoverBackground?: string;
	}[];
	maxValue: number;
	ditherColor?: DitherColor;
	ditherVariant?: AreaVariant;
	hoverBackground?: string;
	setShowModal: Dispatch<SetStateAction<boolean>>;
	limit?: number;
	minBarWidth?: number;
}

export default function BarList({
	tab = "Websites",
	unit = "visits",
	data = EMPTY_DATA,
	ditherColor = "blue",
	ditherVariant = "gradient",
	hoverBackground = "hover:bg-gray-100",
	maxValue,
	limit,
	minBarWidth = 10,
}: Partial<BarListProps>) {
	const calculatedMaxValue = useMemo(() => {
		if (maxValue) return maxValue;
		return data.length > 0 ? Math.max(...data.map((item) => item.value)) : 1000;
	}, [data, maxValue]);

	const filteredData = useMemo(() => {
		if (limit) {
			return data.slice(0, limit);
		}
		return data;
	}, [data, limit]);

	const sortedData = useMemo(() => {
		return filteredData.toSorted((a, b) => b.value - a.value);
	}, [filteredData]);

	const bars = (
		<div className="grid gap-2">
			{sortedData.map((item) => (
				<LineItem
					key={item.linkId ?? item.href ?? item.title}
					{...item}
					maxValue={calculatedMaxValue}
					tab={tab}
					unit={unit}
					ditherColor={item.ditherColor || ditherColor}
					ditherVariant={item.ditherVariant || ditherVariant}
					hoverBackground={item.hoverBackground || hoverBackground}
					minBarWidth={minBarWidth}
				/>
			))}
		</div>
	);

	if (limit) {
		return bars;
	}

	return (
		<>
			<ScrollArea className="h-[45vh]  overflow-y-auto z-0 pr-4">
				{bars}
				<div className="h-8" />
			</ScrollArea>
		</>
	);
}
