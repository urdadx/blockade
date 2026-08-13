import {
  RouterProvider,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import {
  blockCategories,
  domainMatches,
  getCategoryDomains,
  getLocalDateKey,
  type CategoryId,
} from "@blockade/core";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { BlockListPage } from "../../../web/src/components/block-list-page";
import { AppSidebar } from "../../../web/src/components/app-sidebar";
import { InsightsPage } from "../../../web/src/components/insights-page";
import { SettingsPage } from "../../../web/src/components/settings-page";
import { categoryImages } from "../../../web/src/data/category-images";
import { useBlockingSettings } from "../../hooks/use-blocking-settings";
import { useAnalyticsState } from "../../hooks/use-analytics-state";
import {
  blockDomain,
  blockKeyword,
  setDailyLimit,
  setCategoryEnabled,
  unblockDomain,
  unblockKeyword,
} from "../../lib/blocking-storage";
import "./style.css";

function DashboardLayout() {
  return <AppSidebar />;
}

function ExtensionBlockListPage() {
  const { settings } = useBlockingSettings();
  const analytics = useAnalyticsState();
  const usage = analytics.days[getLocalDateKey()]?.usageMsByItem ?? {};
  const categoryDomains = getCategoryDomains(settings);
  const categoryRows = blockCategories
    .filter((category) => settings.enabledCategoryIds.includes(category.id))
    .map((category) => ({
      id: `category:${category.id}`,
      name: category.label,
      url: "",
      dailyLimit: settings.dailyLimits[`category:${category.id}`] ?? "none",
      usedMinutes: (usage[`category:${category.id}`] ?? 0) / 60_000,
      type: "category" as const,
      imageUrl: categoryImages[category.id],
      dailyLimitApplicable: category.id !== "adult",
    }));
  const websiteRows = settings.customBlockedDomains
    .filter(
      (domain) =>
        !categoryDomains.some((categoryDomain) => domainMatches(domain, categoryDomain)) &&
        !settings.excludedDomains.some((excludedDomain) => domainMatches(domain, excludedDomain)),
    )
    .map((domain) => ({
      id: domain,
      name: domain,
      url: `https://${domain}`,
      dailyLimit: settings.dailyLimits[`website:${domain}`] ?? "none",
      usedMinutes: (usage[`website:${domain}`] ?? 0) / 60_000,
      type: "website" as const,
    }));
  const keywordRows = settings.blockedKeywords.map((keyword) => ({
    id: `keyword:${keyword}`,
    name: keyword,
    url: "",
    dailyLimit: settings.dailyLimits[`keyword:${keyword}`] ?? "none",
    usedMinutes: 0,
    type: "keyword" as const,
    dailyLimitApplicable: false,
  }));
  const sites = [...categoryRows, ...websiteRows, ...keywordRows];

  const addItems = async (items: string[]) => {
    for (const item of items) {
      const separatorIndex = item.indexOf(":");
      const type = item.slice(0, separatorIndex);
      const value = item.slice(separatorIndex + 1);
      if (!value) continue;
      if (type === "category") await setCategoryEnabled(value as CategoryId, true);
      else if (type === "keyword") await blockKeyword(value);
      else if (type === "website") await blockDomain(value);
    }
  };

  const removeSite = async (itemId: string) => {
    const row = sites.find((site) => site.id === itemId);
    if (!row) return;

    if (row.type === "keyword") await unblockKeyword(row.name);
    else if (row.type === "website") await unblockDomain(row.id);
  };

  const updateDailyLimit = (itemId: string, dailyLimit: string) => {
    const row = sites.find((site) => site.id === itemId);
    if (!row) return;
    const storageId = row.type === "website" ? `website:${row.id}` : row.id;
    void setDailyLimit(storageId, dailyLimit);
  };

  return (
    <BlockListPage
      sites={sites}
      onDeleteSite={removeSite}
      onDailyLimitChange={updateDailyLimit}
      onAddItems={addItems}
    />
  );
}

function ExtensionInsightsPage() {
  const { settings } = useBlockingSettings();
  const analytics = useAnalyticsState();
  const finiteLimits = Object.entries(settings.dailyLimits).filter(
    ([itemId, limit]) => !itemId.startsWith("keyword:") && limit !== "none",
  );
  const days = Array.from({ length: 90 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (89 - index));
    const dateKey = getLocalDateKey(date.getTime());
    const day = analytics.days[dateKey];
    return {
      date: dateKey,
      tracked: day !== undefined,
      usageMinutes: Math.round(
        Object.values(day?.usageMsByWebsite ?? {}).reduce((total, value) => total + value, 0) /
          60_000,
      ),
      blockAttempts: day?.blockedAttempts ?? 0,
      blockedAttemptsByWebsite: day?.blockedAttemptsByWebsite ?? {},
      blockedAttemptsByCategory: day?.blockedAttemptsByCategory ?? {},
      limitsApplicable: finiteLimits.length > 0,
      limitsMet: finiteLimits.every(
        ([itemId, limit]) => (day?.usageMsByItem[itemId] ?? 0) <= Number(limit) * 60_000,
      ),
    };
  });
  return <InsightsPage days={days} />;
}

const rootRoute = createRootRoute({ component: DashboardLayout });
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/block-list" });
  },
});
const blockListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/block-list",
  component: ExtensionBlockListPage,
});
const insightsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/insights",
  component: ExtensionInsightsPage,
});
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});
const routeTree = rootRoute.addChildren([indexRoute, blockListRoute, insightsRoute, settingsRoute]);
const router = createRouter({ routeTree, history: createHashHistory() });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const root = document.querySelector("#root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
