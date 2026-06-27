export default {
  name: "ovsjs-workspace",
  version: "0.2.3",
  description: "Qin-managed OVS workspace",
  type: "workspace",
  scripts: {
    build: "npm run buildall",
    test: "npm run buildall",
    lint: "npm run lint"
  },
  workspaces: [
    "ovs/ovs-runtime",
    "ovs/ovs-compiler",
    "create-ovs",
    "vite-plugin-ovs",
    "ovs-language"
  ],
  language: {
    id: "ovs",
    extension: ".ovs",
    compiler: "ovs/ovs-compiler",
    runtime: "ovs/ovs-runtime",
    vitePlugin: "vite-plugin-ovs",
    languageServer: "ovs-language"
  }
}
