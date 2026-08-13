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
    permissions: ["storage", "declarativeNetRequestWithHostAccess", "activeTab"],
    host_permissions: ["http://*/*", "https://*/*"],
    web_accessible_resources: [
      {
        resources: ["redirect.html"],
        matches: ["http://*/*", "https://*/*"],
      },
    ],
  },
});
