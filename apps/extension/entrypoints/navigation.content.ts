type NavigationCheckResponse = {
  baseUrl: string | null;
  redirectUrl: string | null;
};

type ReplaceNavigationMessage = {
  type: "blockade:replace-navigation";
  baseUrl: string | null;
  sourceUrl: string;
  redirectUrl: string;
};

export default defineContentScript({
  matches: ["http://*/*", "https://*/*"],
  main() {
    const checkCurrentNavigation = async () => {
      const sourceUrl = window.location.href;
      try {
        const response = (await browser.runtime.sendMessage({
          type: "blockade:check-navigation",
          url: sourceUrl,
        })) as NavigationCheckResponse | undefined;
        if (window.location.href !== sourceUrl) return;
        if (response?.baseUrl && sourceUrl !== response.baseUrl) {
          window.location.replace(response.baseUrl);
        } else if (response?.redirectUrl && sourceUrl !== response.redirectUrl) {
          window.location.replace(response.redirectUrl);
        }
      } catch {
        // The extension may be reloading while an existing page restores from history.
      }
    };

    browser.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
      const value = message as Partial<ReplaceNavigationMessage>;
      if (
        value.type !== "blockade:replace-navigation" ||
        (value.baseUrl !== null && typeof value.baseUrl !== "string") ||
        typeof value.sourceUrl !== "string" ||
        typeof value.redirectUrl !== "string" ||
        window.location.href !== value.sourceUrl
      ) {
        return;
      }

      sendResponse({ replacing: true });
      if (value.baseUrl) {
        window.history.replaceState(null, "", value.baseUrl);
        window.location.assign(value.redirectUrl);
      } else {
        window.location.replace(value.redirectUrl);
      }
      return true;
    });

    window.addEventListener("popstate", () => void checkCurrentNavigation());
    window.addEventListener("pageshow", (event) => {
      if (event.persisted) void checkCurrentNavigation();
    });
  },
});
