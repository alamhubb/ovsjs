export default {
  name: "guidebot-web",
  version: "1.0.0",
  description: "Qin-managed OVS GuideBot Vue demo application",
  type: "fullstack",
  frontend: {
    srcDir: "src",
    entry: "src/main.ts"
  },
  scripts: {
    dev: "vite --open",
    build: "vue-tsc --build && vite build",
    preview: "vite preview",
    test: "vue-tsc --build && vite build"
  },
  dependencies: {
    "vue": "^3.5.12",
    "ovsjs": "file:../ovs/ovs-runtime",
    "vite-plugin-ovs": "file:../vite-plugin-ovs"
  },
  devDependencies: {
    "@vitejs/plugin-vue": "^6.0.1",
    "typescript": "~5.8.3",
    "vite": "^7.1.7",
    "vue-tsc": "^3.0.7"
  },
  language: {
    id: "ovs",
    extension: ".ovs",
    sourceDir: "src"
  }
}
