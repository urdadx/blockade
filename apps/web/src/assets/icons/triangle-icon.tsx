import { SVGProps } from "react";

export function TriangleUp(props: SVGProps<SVGSVGElement>) {
	const { color = "#16a34a" } = props;
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="1em"
			height="1em"
			viewBox="0 0 24 24"
			{...props}>
			{/* Icon from Tabler Icons by Paweł Kuna - https://github.com/tabler/tabler-icons/blob/master/LICENSE */}
			<path
				fill={color}
				d="M12 1.67a2.91 2.91 0 0 0-2.492 1.403L1.398 16.61a2.914 2.914 0 0 0 2.484 4.385h16.225a2.914 2.914 0 0 0 2.503-4.371L14.494 3.078A2.92 2.92 0 0 0 12 1.67"
			/>
		</svg>
	);
}

export function TriangleDown(props: SVGProps<SVGSVGElement>) {
	const { color = "#ef4444" } = props;
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="1em"
			height="1em"
			viewBox="0 0 24 24"
			{...props}>
			{/* Icon from Tabler Icons by Paweł Kuna - https://github.com/tabler/tabler-icons/blob/master/LICENSE */}
			<path
				fill={color}
				d="M20.118 3H3.893A2.914 2.914 0 0 0 1.39 7.371L9.506 20.92a2.917 2.917 0 0 0 4.987.005l8.11-13.539A2.914 2.914 0 0 0 20.117 3z"
			/>
		</svg>
	);
}
