export default {
  name: "ovsjs",
  version: "0.2.2",
  description: "Qin-managed OVS runtime package",
  type: "library",
  entry: "src/index.ts",
  scripts: {
    build: "npm run build",
    test: "npm run build"
  },
  dependencies: {
    "vue": "^3.5.13"
  },
  devDependencies: {
    "@vue/tsconfig": "^0.8.0",
    "tsdown": "0.17.0-beta.6"
  },
  language: {
    id: "ovs",
    runtime: "src/index.ts"
  }
}
