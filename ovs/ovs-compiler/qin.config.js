export default {
  name: "ovs-compiler",
  version: "0.2.2",
  description: "Qin-managed OVS parser and compiler package",
  type: "library",
  entry: "src/index.ts",
  scripts: {
    build: "tsdown",
    test: "tsx tests/test-generated-parser-chain.ts && tsdown"
  },
  dependencies: {
    "@qin/generated-qin-parser-ts": "file:../../../qin/packages/qin-language/generated/qin-parser-ts",
    "cssts-compiler": "file:../../../cssts/cssts/cssts-compiler",
    "ovsjs": "file:../ovs-runtime",
    "slime-ast": "file:../../../slime/slime-ast",
    "subhuti": "file:../../../subhuti"
  },
  devDependencies: {
    "tsdown": "0.17.0-beta.6",
    "tsx": "^4.19.2"
  },
  language: {
    id: "ovs",
    extension: ".ovs",
    parser: "@qin/generated-qin-parser-ts",
    compiler: "src/index.ts"
  }
}
