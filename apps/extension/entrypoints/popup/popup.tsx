import { getMatchingBlockedDomain, getRegistrableDomain, normalizeHostname } from "@blockade/core";
import { useEffect, useState } from "react";

import { GlobeLinear } from "@web/assets/icons/globe-icon";
import { SettingsLinear } from "@web/assets/icons/settings-duotone";
import { ShieldIcon } from "@web/assets/icons/shield";
import { Button } from "@web/components/button";
import { useBlockingSettings } from "../../hooks/use-blocking-settings";
import { blockDomain, unblockDomain } from "../../lib/blocking-storage";

type CurrentSite = {
	domain: string;
	hostname: string;
	title: string;
	faviconUrl?: string;
};

export function Popup() {
	const { settings, isLoading: isSettingsLoading } = useBlockingSettings();
	const [site, setSite] = useState<CurrentSite | null>(null);
	const [isSiteLoading, setIsSiteLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		void browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
			if (!tab?.url) {
				setIsSiteLoading(false);
				return;
			}

			try {
				const url = new URL(tab.url);
				if (url.protocol !== "http:" && url.protocol !== "https:") return;

				const hostname = normalizeHostname(url.hostname);
				const domain = getRegistrableDomain(url.hostname);
				if (!hostname || !domain) return;

				setSite({
					domain,
					hostname,
					title: tab.title || domain,
					faviconUrl: tab.favIconUrl,
				});
			} finally {
				setIsSiteLoading(false);
			}
		});
	}, []);

	const isLoading = isSettingsLoading || isSiteLoading;
	const matchingBlockedDomain = site ? getMatchingBlockedDomain(site.hostname, settings) : null;
	const isBlocked = matchingBlockedDomain !== null;

	const toggleSite = async () => {
		if (!site) return;
		setIsSaving(true);
		try {
			if (matchingBlockedDomain) await unblockDomain(matchingBlockedDomain);
			else await blockDomain(site.domain);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<main className="popup-shell font-sans">
			<header className="popup-header">
				<div className="brand font-display">
					<img src="/logo.svg" alt="" />
					<span>Blockade</span>
				</div>
				<button
					className="dashboard-link"
					type="button"
					onClick={() => void browser.runtime.openOptionsPage()}>
					<SettingsLinear color="#000000" />
				</button>
			</header>

			{isLoading ? (
				<div className="loading-card">
					<span className="loader" />
					Checking this page...
				</div>
			) : site ? (
				<>
					<section className={`decision-card ${isBlocked ? "is-blocked" : ""}`}>
						<div className="decision-favicon">
							{site.faviconUrl ? (
								<img src={site.faviconUrl} alt="" />
							) : (
								<GlobeLinear
									color="currentColor"
									aria-hidden="true"
								/>
							)}
						</div>
						<h1 className="font-display">
							{isBlocked
								? "This site is on your block list."
								: "Block this website?"}
						</h1>

						<div className="action-buttons">
							<Button
								className="block-button"
								type="button"
								disabled={isSaving}
								onClick={() => void toggleSite()}>
								{isSaving
									? "Saving..."
									: isBlocked
										? "Unblock this site"
										: "Block this site"}
							</Button>
							<Button
								variant="outline"
								className="manage-block-list-button"
								onClick={() =>
									void browser.runtime.openOptionsPage()
								}>
								Manage block list
							</Button>
						</div>
					</section>
				</>
			) : (
				<section className="unsupported-card">
					<ShieldIcon color="#16a34a" aria-hidden="true" />
					<h1 className="font-display">This page cannot be blocked.</h1>
					<p>Open a regular website to add it to Blockade.</p>
				</section>
			)}
		</main>
	);
}
