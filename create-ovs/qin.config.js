export default {
  name: "create-ovs",
  version: "0.2.3",
  description: "Qin-managed OVS project scaffold CLI",
  type: "library",
  entry: "src/index.ts",
  scripts: {
    build: "tsdown",
    test: "tsdown && node tests/test-scaffold-output.mjs"
  },
  devDependencies: {
    "@types/node": "^22.8.6",
    "tsdown": "0.17.0-beta.6",
    "typescript": "^5.6.3"
  },
  language: {
    id: "ovs",
    scaffold: "template",
    cli: "src/index.ts"
  }
}
