import { SVGProps } from "react";

export function TimerIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="1em"
			height="1em"
			viewBox="0 0 24 24"
			{...props}>
			{/* Icon from Solar by 480 Design - https://creativecommons.org/licenses/by/4.0/ */}
			<path
				fill="currentColor"
				d="M12 22c4.836 0 8.756-3.884 8.756-8.675c0-4.79-3.92-8.675-8.756-8.675s-8.757 3.884-8.757 8.675C3.243 18.115 7.163 22 12 22"
				opacity=".4"
			/>
			<path
				fill="currentColor"
				d="M12 8.747c.402 0 .729.324.729.723v3.556l2.219 2.198a.72.72 0 0 1 0 1.022a.734.734 0 0 1-1.032 0l-2.433-2.41a.72.72 0 0 1-.213-.51V9.47c0-.4.326-.723.73-.723"
			/>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M8.24 2.34a.72.72 0 0 1-.232.996l-3.891 2.41a.734.734 0 0 1-1.006-.23a.72.72 0 0 1 .232-.996l3.892-2.41a.734.734 0 0 1 1.006.23m7.519 0a.734.734 0 0 1 1.005-.23l3.892 2.41a.72.72 0 0 1 .232.996a.734.734 0 0 1-1.006.23l-3.891-2.41a.72.72 0 0 1-.233-.996"
				clipRule="evenodd"
			/>
		</svg>
	);
}

export function TimerOutline(props: SVGProps<SVGSVGElement>) {
	const { color = "#888888" } = props;
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="1em"
			height="1em"
			viewBox="0 0 24 24"
			{...props}>
			{/* Icon from Solar by 480 Design - https://creativecommons.org/licenses/by/4.0/ */}
			<path
				fill={color}
				fillRule="evenodd"
				d="M8.136 1.603a.75.75 0 0 1-.238 1.033l-4 2.5a.75.75 0 0 1-.796-1.272l4-2.5a.75.75 0 0 1 1.034.239m7.728 0a.75.75 0 0 1 1.034-.239l4 2.5a.75.75 0 1 1-.796 1.272l-4-2.5a.75.75 0 0 1-.238-1.033M12 4.75a8.25 8.25 0 1 0 0 16.5a8.25 8.25 0 0 0 0-16.5M2.25 13c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 18.385 2.25 13M12 8.25a.75.75 0 0 1 .75.75v3.69l2.28 2.28a.75.75 0 1 1-1.06 1.06l-2.5-2.5a.75.75 0 0 1-.22-.53V9a.75.75 0 0 1 .75-.75"
				clipRule="evenodd"
			/>
		</svg>
	);
}
