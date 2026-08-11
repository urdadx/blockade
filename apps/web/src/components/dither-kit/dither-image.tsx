import { useCallback } from "react";
import { BAYER } from "./dither-paint";

type DitherImageProps = {
	src: string;
	alt?: string;
	className?: string;
};

const MAX_WIDTH = 720;
const PIXEL_SIZE = 2;
const COLOR_LEVELS = 5;

export function DitherImage({ src, alt = "", className }: DitherImageProps) {
	const setCanvas = useCallback(
		(canvas: HTMLCanvasElement | null) => {
			if (!canvas) return;

			const image = new Image();
			let disposed = false;

			const paint = () => {
				if (disposed || !image.naturalWidth || !image.naturalHeight) return;

				const width = Math.max(1, canvas.clientWidth);
				const height = Math.max(1, canvas.clientHeight);
				const columns = Math.min(MAX_WIDTH, Math.ceil(width / PIXEL_SIZE));
				const rows = Math.max(1, Math.round(columns * (height / width)));
				const context = canvas.getContext("2d", { willReadFrequently: true });
				if (!context) return;

				canvas.width = columns;
				canvas.height = rows;
				context.imageSmoothingEnabled = false;

				const sourceRatio = image.naturalWidth / image.naturalHeight;
				const canvasRatio = columns / rows;
				let sourceWidth = image.naturalWidth;
				let sourceHeight = image.naturalHeight;
				if (sourceRatio > canvasRatio) sourceWidth = sourceHeight * canvasRatio;
				else sourceHeight = sourceWidth / canvasRatio;

				context.drawImage(
					image,
					(image.naturalWidth - sourceWidth) / 2,
					(image.naturalHeight - sourceHeight) / 2,
					sourceWidth,
					sourceHeight,
					0,
					0,
					columns,
					rows,
				);

				const frame = context.getImageData(0, 0, columns, rows);
				const levelScale = COLOR_LEVELS - 1;
				for (let y = 0; y < rows; y += 1) {
					for (let x = 0; x < columns; x += 1) {
						const offset = (y * columns + x) * 4;
						const threshold = BAYER[y & 3][x & 3] - 0.5;
						for (let channel = 0; channel < 3; channel += 1) {
							const value = frame.data[offset + channel] / 255;
							const quantized = Math.max(
								0,
								Math.min(levelScale, Math.round(value * levelScale + threshold)),
							);
							frame.data[offset + channel] = (quantized / levelScale) * 255;
						}
					}
				}
				context.putImageData(frame, 0, 0);
			};

			image.addEventListener("load", paint);
			image.src = src;
			const observer = new ResizeObserver(paint);
			observer.observe(canvas);

			return () => {
				disposed = true;
				image.removeEventListener("load", paint);
				observer.disconnect();
			};
		},
		[src],
	);

	return (
		<canvas
			ref={setCanvas}
			role={alt ? "img" : undefined}
			aria-label={alt || undefined}
			aria-hidden={alt ? undefined : true}
			className={className}
			style={{ imageRendering: "pixelated" }}
		/>
	);
}
