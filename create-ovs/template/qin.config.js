export default {
  name: "{{projectName}}",
  version: "0.0.0",
  description: "Qin-managed OVS Vue application",
  type: "fullstack",
  frontend: {
    entry: "src/main.ts"
  },
  scripts: {
    dev: "npm run dev",
    build: "npm run build",
    preview: "npm run preview",
    test: "npm run build"
  },
  dependencies: {
    "vue": "^3.5.25",
    "ovsjs": "^0.2.1",
    "ovs-compiler": "^0.2.1"
  },
  devDependencies: {
    "@vitejs/plugin-vue": "^6.0.2",
    "typescript": "~5.9.0",
    "vite": "^6.3.5",
    "vite-plugin-ovs": "^0.2.1",
    "vue-tsc": "^3.1.5"
  },
  language: {
    id: "ovs",
    extension: ".ovs",
    sourceDir: "src"
  }
}
