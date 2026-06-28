export default {
  name: "vite-plugin-ovs",
  version: "0.2.2",
  description: "Qin-managed Vite plugin for OVS",
  type: "library",
  entry: "src/index.ts",
  scripts: {
    build: "tsdown",
    test: "tsdown"
  },
  dependencies: {
    "ovs-compiler": "file:../ovs/ovs-compiler",
    "vite-plugin-cssts": "file:../../cssts/vite-plugin-cssts"
  },
  devDependencies: {
    "tsdown": "0.17.0-beta.6",
    "vite": "^6.3.5"
  },
  peerDependencies: {
    "vite": "^5.0.0 || ^6.0.0"
  },
  language: {
    id: "ovs",
    extension: ".ovs",
    compiler: "ovs-compiler",
    plugin: "src/index.ts"
  }
}
