import ChromeIcon from "@/assets/chrome.avif";
import EdgeIcon from "@/assets/edge.png";
import FirefoxIcon from "@/assets/firefox.png";
import SafariIcon from "@/assets/safari_ios.png";
import { detectDevice } from "@/lib/utils";

const guideBaseUrl = "https://github.com/urdadx/blockade/blob/main/docs/install";

const downloads = {
	chrome: {
		browser: "Chrome",
		icon: ChromeIcon,
		url: `${guideBaseUrl}/chrome.md`,
	},
	edge: {
		browser: "Edge",
		icon: EdgeIcon,
		url: `${guideBaseUrl}/edge.md`,
	},
	firefox: {
		browser: "Firefox",
		icon: FirefoxIcon,
		url: `${guideBaseUrl}/firefox.md`,
	},
	safari: {
		browser: "Safari",
		icon: SafariIcon,
		url: `${guideBaseUrl}/safari.md`,
	},
} as const;

export type ExtensionDownload = (typeof downloads)[keyof typeof downloads];

export function getExtensionDownload(): ExtensionDownload {
	const device = detectDevice();

	if (device.isEdge) return downloads.edge;
	if (device.isFirefox) return downloads.firefox;
	if (device.isSafari) return downloads.safari;
	return downloads.chrome;
}

export function openExtensionGuide() {
	window.open(getExtensionDownload().url, "_blank", "noopener,noreferrer");
}
