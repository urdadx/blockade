"use client";

import { PauseIcon, PlayIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import { Button } from "@/components/button";
import { ClassicPomodoroClock } from "@/components/classic-pomodoro-clock";
import { cn } from "@/lib/utils";

const VIEWBOX_SIZE = 240;
const CENTER = VIEWBOX_SIZE / 2;
const DIAL_RADIUS = 78;
const SECTOR_PATH_RADIUS = DIAL_RADIUS / 2;
const TICK_INNER_RADIUS = 88;
const TICK_OUTER_RADIUS = 94;
const LABEL_RADIUS = 106;
const SECONDS_PER_MINUTE = 60;

type Point = { x: number; y: number };

const SECTOR_PATH = [
	`M ${CENTER} ${CENTER - SECTOR_PATH_RADIUS}`,
	`A ${SECTOR_PATH_RADIUS} ${SECTOR_PATH_RADIUS} 0 1 0 ${CENTER} ${CENTER + SECTOR_PATH_RADIUS}`,
	`A ${SECTOR_PATH_RADIUS} ${SECTOR_PATH_RADIUS} 0 1 0 ${CENTER} ${CENTER - SECTOR_PATH_RADIUS}`,
].join(" ");

export type PomodoroClockProps = {
	className?: string;
	defaultMinutes?: number;
	stepMinutes?: number;
	showReadout?: boolean;
	variant?: "dial" | "classic";
	classicCaption?: string;
	onComplete?: () => void;
	onDurationChange?: (minutes: number) => void;
};

function pointOnCircle(radius: number, angle: number): Point {
	const radians = ((angle - 90) * Math.PI) / 180;
	return {
		x: CENTER + radius * Math.cos(radians),
		y: CENTER + radius * Math.sin(radians),
	};
}

function formatTime(seconds: number) {
	const roundedSeconds = Math.ceil(seconds);
	const minutes = Math.floor(roundedSeconds / SECONDS_PER_MINUTE);
	const remainder = roundedSeconds % SECONDS_PER_MINUTE;
	return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

export function PomodoroClock({
	className,
	defaultMinutes = 10,
	stepMinutes = 5,
	variant = "dial",
	classicCaption,
	onComplete,
	onDurationChange,
}: PomodoroClockProps) {
	const safeMaxMinutes = 60;
	const safeStepMinutes = Math.max(1, Math.min(safeMaxMinutes, stepMinutes));
	const initialMinutes = Math.max(safeStepMinutes, Math.min(safeMaxMinutes, defaultMinutes));
	const initialSeconds = initialMinutes * SECONDS_PER_MINUTE;
	const [durationSeconds, setDurationSeconds] = useState(initialSeconds);
	const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
	const [isRunning, setIsRunning] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const endTimeRef = useRef(0);
	const hasCompletedRef = useRef(false);
	const onCompleteRef = useRef(onComplete);
	const shouldReduceMotion = useReducedMotion();

	onCompleteRef.current = onComplete;

	useEffect(() => {
		if (!isRunning) return;

		const updateRemainingTime = () => {
			const nextSeconds = Math.max(0, (endTimeRef.current - Date.now()) / 1000);
			setRemainingSeconds(nextSeconds);

			if (nextSeconds === 0 && !hasCompletedRef.current) {
				hasCompletedRef.current = true;
				setIsRunning(false);
				onCompleteRef.current?.();
			}
		};

		updateRemainingTime();
		const interval = window.setInterval(updateRemainingTime, 100);
		return () => window.clearInterval(interval);
	}, [isRunning]);

	const displayedMinutes = remainingSeconds / SECONDS_PER_MINUTE;
	const fraction = Math.min(1, remainingSeconds / (safeMaxMinutes * SECONDS_PER_MINUTE));
	const handRotation = -fraction * 360;
	const transition = shouldReduceMotion
		? { duration: 0 }
		: { type: "spring" as const, duration: 0.3, bounce: 0 };

	const setMinutes = (minutes: number) => {
		if (isRunning) return;

		const snappedMinutes = Math.max(
			safeStepMinutes,
			Math.min(safeMaxMinutes, Math.round(minutes / safeStepMinutes) * safeStepMinutes),
		);
		const seconds = snappedMinutes * SECONDS_PER_MINUTE;
		setDurationSeconds(seconds);
		setRemainingSeconds(seconds);
		hasCompletedRef.current = false;
		onDurationChange?.(snappedMinutes);
	};

	const setMinutesFromPointer = (event: PointerEvent<SVGSVGElement>) => {
		const bounds = event.currentTarget.getBoundingClientRect();
		const x = event.clientX - bounds.left - bounds.width / 2;
		const y = event.clientY - bounds.top - bounds.height / 2;
		const clockwiseAngle = (Math.atan2(y, x) * 180) / Math.PI + 90;
		const normalizedAngle = (clockwiseAngle + 360) % 360;
		const minutes = ((360 - normalizedAngle) / 360) * safeMaxMinutes;
		setMinutes(minutes < safeStepMinutes / 2 ? safeMaxMinutes : minutes);
	};

	const handlePointerDown = (event: PointerEvent<SVGSVGElement>) => {
		if (isRunning || event.button !== 0) return;
		event.currentTarget.setPointerCapture(event.pointerId);
		setIsDragging(true);
		setMinutesFromPointer(event);
	};

	const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
		if (isDragging) setMinutesFromPointer(event);
	};

	const handlePointerUp = (event: PointerEvent<SVGSVGElement>) => {
		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}
		setIsDragging(false);
	};

	const handleKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
		if (isRunning) return;

		const currentMinutes = remainingSeconds / SECONDS_PER_MINUTE;
		if (["ArrowUp", "ArrowLeft"].includes(event.key)) {
			event.preventDefault();
			setMinutes(currentMinutes + safeStepMinutes);
		} else if (["ArrowDown", "ArrowRight"].includes(event.key)) {
			event.preventDefault();
			setMinutes(currentMinutes - safeStepMinutes);
		} else if (event.key === "Home") {
			event.preventDefault();
			setMinutes(safeStepMinutes);
		} else if (event.key === "End") {
			event.preventDefault();
			setMinutes(safeMaxMinutes);
		}
	};

	const toggleTimer = () => {
		if (isRunning) {
			setIsRunning(false);
			return;
		}

		const nextSeconds = remainingSeconds > 0 ? remainingSeconds : durationSeconds;
		setRemainingSeconds(nextSeconds);
		hasCompletedRef.current = false;
		endTimeRef.current = Date.now() + nextSeconds * 1000;
		setIsRunning(true);
	};

	if (variant === "classic") {
		return (
			<ClassicPomodoroClock
				className={className}
				formattedTime={formatTime(remainingSeconds)}
				isRunning={isRunning}
				stepMinutes={safeStepMinutes}
				canAdjust={!isRunning}
				caption={classicCaption}
				onToggle={toggleTimer}
				onDecrease={() => setMinutes(displayedMinutes - safeStepMinutes)}
				onIncrease={() => setMinutes(displayedMinutes + safeStepMinutes)}
			/>
		);
	}

	return (
		<section
			className={cn(
				"w-full max-w-[300px] rounded-2xl border bg-card p-4 text-foreground",
				className,
			)}
			aria-label="Pomodoro timer">
			<div className="relative mx-auto aspect-square w-full select-none">
				<svg
					viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
					className={cn(
						"size-full touch-none outline-none",
						isRunning
							? "cursor-default"
							: isDragging
								? "cursor-grabbing"
								: "cursor-grab",
					)}
					role="slider"
					tabIndex={0}
					aria-label="Focus duration"
					aria-valuemin={safeStepMinutes}
					aria-valuemax={safeMaxMinutes}
					aria-valuenow={Math.ceil(displayedMinutes)}
					aria-valuetext={`${Math.ceil(displayedMinutes)} minutes remaining`}
					aria-disabled={isRunning}
					onKeyDown={handleKeyDown}
					onPointerDown={handlePointerDown}
					onPointerMove={handlePointerMove}
					onPointerUp={handlePointerUp}
					onPointerCancel={handlePointerUp}>
					<circle
						cx={CENTER}
						cy={CENTER}
						r={DIAL_RADIUS}
						className="fill-background/65"
					/>
					<motion.path
						d={SECTOR_PATH}
						animate={{ pathLength: fraction }}
						initial={false}
						transition={transition}
						fill="none"
						strokeWidth={DIAL_RADIUS}
						strokeLinecap="butt"
						className="stroke-red-400 dark:stroke-red-500"
					/>

					{Array.from({ length: 12 }, (_, index) => {
						const angle = index * 30;
						const inner = pointOnCircle(TICK_INNER_RADIUS, angle);
						const outer = pointOnCircle(TICK_OUTER_RADIUS, angle);
						const label = (60 - index * 5) % 60;
						const labelPoint = pointOnCircle(LABEL_RADIUS, angle);

						return (
							<g key={angle} aria-hidden="true">
								<line
									x1={inner.x}
									y1={inner.y}
									x2={outer.x}
									y2={outer.y}
									className="stroke-foreground"
									strokeWidth="1.5"
								/>
								<text
									x={labelPoint.x}
									y={labelPoint.y}
									dy="0.35em"
									textAnchor="middle"
									className="fill-foreground font-sans text-[12px] tabular-nums">
									{label}
								</text>
							</g>
						);
					})}

					<motion.g
						animate={{ rotate: handRotation }}
						initial={false}
						transition={transition}
						style={{
							transformBox: "view-box",
							transformOrigin: `${CENTER}px ${CENTER}px`,
						}}>
						<line
							x1={CENTER}
							y1={CENTER}
							x2={CENTER}
							y2={CENTER - DIAL_RADIUS}
							className="stroke-foreground"
							strokeWidth="2"
							strokeLinecap="round"
						/>
					</motion.g>
				</svg>

				<Button
					type="button"
					size="icon"
					onClick={toggleTimer}
					aria-label={isRunning ? "Pause timer" : "Start timer"}
					className="absolute top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80">
					<span className="relative size-5" aria-hidden="true">
						<PlayIcon
							className={cn(
								"absolute inset-0 size-5 translate-x-px fill-current transition-[opacity,scale,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none",
								isRunning
									? "scale-25 opacity-0 blur-xs"
									: "scale-100 opacity-100 blur-0",
							)}
						/>
						<PauseIcon
							className={cn(
								"absolute inset-0 size-5 fill-current transition-[opacity,scale,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none",
								isRunning
									? "scale-100 opacity-100 blur-0"
									: "scale-25 opacity-0 blur-xs",
							)}
						/>
					</span>
				</Button>
			</div>
		</section>
	);
}
