import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { defineConfig } from "wxt";

const webSource = fileURLToPath(new URL("../web/src", import.meta.url));

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  alias: {
    "@web": webSource,
  },
  vite: () => ({
    plugins: [
      {
        name: "blockade-web-imports",
        enforce: "pre",
        transform(code, id) {
          if (!id.includes(webSource)) return null;
          return code.replaceAll('"@/', '"@web/').replaceAll("'@/", "'@web/");
        },
      },
      tailwindcss(),
    ],
  }),
  manifest: {
    name: "Blockade",
    description: "Block distracting websites and regain your focus.",
    icons: {
      16: "icon-16.png",
      32: "icon-32.png",
      48: "icon-48.png",
      128: "icon-128.png",
    },
    action: {
      default_icon: {
        16: "icon-16.png",
        32: "icon-32.png",
        48: "icon-48.png",
        128: "icon-128.png",
      },
    },
    permissions: [
      "storage",
      "declarativeNetRequestWithHostAccess",
      "activeTab",
      "tabs",
      "idle",
      "alarms",
      "webNavigation",
    ],
    host_permissions: ["http://*/*", "https://*/*"],
    web_accessible_resources: [
      {
        resources: ["redirect.html"],
        matches: ["http://*/*", "https://*/*"],
      },
    ],
  },
});
