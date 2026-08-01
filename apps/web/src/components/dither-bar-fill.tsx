import type { AreaVariant } from "@/components/dither-kit/chart-context";
import { backingSize, paintColumn } from "@/components/dither-kit/dither-paint";
import { seedOfColor, type DitherColor } from "@/components/dither-kit/palette";
import { useEffect, useRef } from "react";

type DitherBarFillProps = {
	color: DitherColor;
	variant?: AreaVariant;
	intensity?: number;
};

export function DitherBarFill({
	color,
	variant = "gradient",
	intensity = 0,
}: DitherBarFillProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const paint = () => {
			const context = canvas.getContext("2d");
			if (!context) return;

			const { cols, rows } = backingSize(canvas.clientWidth, canvas.clientHeight);
			canvas.width = cols;
			canvas.height = rows;
			context.clearRect(0, 0, cols, rows);

			// Paint vertically with Dither Kit, then transpose so its bright value
			// edge and dense baseline become the horizontal bar's end caps.
			const source = document.createElement("canvas");
			source.width = rows;
			source.height = cols;
			const sourceContext = source.getContext("2d");
			if (!sourceContext) return;

			const seed = seedOfColor(color);
			for (let x = 0; x < rows; x += 1) {
				paintColumn(sourceContext, x, 0, cols, seed, {
					variant,
					intensity,
					dim: 1,
					stacked: false,
				});
			}

			context.imageSmoothingEnabled = false;
			context.setTransform(0, 1, 1, 0, 0, 0);
			context.drawImage(source, 0, 0);
			context.resetTransform();
		};

		paint();
		const observer = new ResizeObserver(paint);
		observer.observe(canvas);
		return () => observer.disconnect();
	}, [color, intensity, variant]);

	return (
		<canvas
			ref={canvasRef}
			aria-hidden="true"
			className="size-full"
			style={{ imageRendering: "pixelated" }}
		/>
	);
}
