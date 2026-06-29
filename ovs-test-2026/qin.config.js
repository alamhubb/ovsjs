export default {
  name: "ovs-test-2026",
  version: "0.0.0",
  description: "Qin-managed OVS Vue test application",
  type: "fullstack",
  frontend: {
    srcDir: "src",
    entry: "src/main.ts",
    staticDir: "public"
  },
  scripts: {
    dev: "vite",
    build: "vue-tsc --build && vite build",
    preview: "vite preview",
    test: "tsx test-compile-helloworld.ts && vue-tsc --build && vite build"
  },
  dependencies: {
    "vue": "^3.5.25",
    "ovsjs": "file:../ovs/ovs-runtime",
    "ovs-compiler": "file:../ovs/ovs-compiler",
    "vite-plugin-ovs": "file:../vite-plugin-ovs"
  },
  devDependencies: {
    "@tsconfig/node24": "^24.0.3",
    "@types/node": "^24.10.1",
    "@vitejs/plugin-vue": "^6.0.2",
    "@vue/tsconfig": "^0.8.1",
    "tsx": "^4.19.1",
    "typescript": "~5.9.0",
    "vite": "^6.3.5",
    "vue-tsc": "^3.1.5"
  },
  language: {
    id: "ovs",
    extension: ".ovs",
    sourceDir: "src"
  }
}
