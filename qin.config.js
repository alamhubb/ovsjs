export default {
  name: "ovsjs-workspace",
  version: "0.2.3",
  description: "Qin-managed OVS workspace",
  type: "workspace",
  scripts: {
    build: "..\\qin\\qin.bat language build --root ovs/ovs-runtime && ..\\qin\\qin.bat language build --root ovs/ovs-compiler && ..\\qin\\qin.bat language build --root create-ovs && ..\\qin\\qin.bat language build --root vite-plugin-ovs && ..\\qin\\qin.bat language build --root ovs-language && ..\\qin\\qin.bat language build --root guidebot",
    test: "..\\qin\\qin.bat language test --root ovs/ovs-runtime && ..\\qin\\qin.bat language test --root ovs/ovs-compiler && ..\\qin\\qin.bat language test --root create-ovs && ..\\qin\\qin.bat language test --root vite-plugin-ovs && ..\\qin\\qin.bat language test --root ovs-language && ..\\qin\\qin.bat language test --root guidebot",
    lint: "..\\qin\\qin.bat language test --root ovs/ovs-compiler && ..\\qin\\qin.bat language test --root ovs-language"
  },
  workspaces: [
    "ovs/ovs-runtime",
    "ovs/ovs-compiler",
    "create-ovs",
    "vite-plugin-ovs",
    "ovs-language",
    "guidebot"
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
