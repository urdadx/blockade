import {
  getDomainCategoryIds,
  getMatchingBlockedDomain,
  getRegistrableDomain,
  normalizeHostname,
} from "@blockade/core";
import { ArrowUpRight, Check, Shield, ShieldOff } from "lucide-react";
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import { useBlockingSettings } from "../../hooks/use-blocking-settings";
import { blockDomain, unblockDomain } from "../../lib/blocking-storage";
import "./style.css";

type CurrentSite = {
  domain: string;
  hostname: string;
  title: string;
  faviconUrl?: string;
};

function Popup() {
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
        setSite({ domain, hostname, title: tab.title || domain, faviconUrl: tab.favIconUrl });
      } finally {
        setIsSiteLoading(false);
      }
    });
  }, []);

  const isLoading = isSettingsLoading || isSiteLoading;
  const matchingBlockedDomain = site ? getMatchingBlockedDomain(site.hostname, settings) : null;
  const isBlocked = matchingBlockedDomain !== null;
  const categoryNames = site
    ? getDomainCategoryIds(site.hostname)
        .filter((id) => settings.enabledCategoryIds.includes(id))
        .join(", ")
    : "";

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
    <main>
      <header>
        <div className="brand">
          <span>B</span> Blockade
        </div>
        <button
          className="dashboard-link"
          type="button"
          onClick={() => void browser.runtime.openOptionsPage()}
        >
          Dashboard <ArrowUpRight size={14} />
        </button>
      </header>

      {isLoading ? (
        <div className="loading-card">
          <span className="loader" /> Checking this page...
        </div>
      ) : site ? (
        <>
          <section className="site-card">
            <div className="favicon-wrap">
              {site.faviconUrl ? <img src={site.faviconUrl} alt="" /> : <Shield size={22} />}
            </div>
            <div className="site-copy">
              <p>{site.title}</p>
              <span>{site.domain}</span>
            </div>
            <span className={`status ${isBlocked ? "blocked" : "allowed"}`}>
              {isBlocked ? <ShieldOff size={12} /> : <Check size={12} />}
              {isBlocked ? "Blocked" : "Allowed"}
            </span>
          </section>

          <section className={`decision-card ${isBlocked ? "is-blocked" : ""}`}>
            <p className="eyebrow">{isBlocked ? "Protection active" : "Current website"}</p>
            <h1>
              {isBlocked
                ? "This site is on your block list."
                : "Keep this site from stealing your focus?"}
            </h1>
            <p className="supporting-copy">
              {isBlocked && categoryNames
                ? `Included through: ${categoryNames}. You can allow it as an exception.`
                : isBlocked
                  ? "You added this site to your custom block list."
                  : "Blockade will stop future visits before the page loads."}
            </p>
            <button
              className={isBlocked ? "unblock-button" : "block-button"}
              type="button"
              disabled={isSaving}
              onClick={() => void toggleSite()}
            >
              {isSaving ? "Saving..." : isBlocked ? "Allow this site" : "Block this site"}
            </button>
          </section>
        </>
      ) : (
        <section className="unsupported-card">
          <Shield size={28} />
          <h1>This page cannot be blocked.</h1>
          <p>Open a regular website to add it to Blockade.</p>
        </section>
      )}

      <footer>
        <span className="status-dot" /> Rules are stored locally on this browser
      </footer>
    </main>
  );
}

const root = document.querySelector("#root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <Popup />
  </StrictMode>,
);
