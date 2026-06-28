export default {
  name: "ovs-language",
  version: "0.2.3",
  description: "Qin-managed OVS language support and Volar language server",
  type: "library",
  entry: "ovs-language-server/src/index.ts",
  scripts: {
    build: "tsdown",
    dev: "tsx ovs-language-server/src/index.ts --stdio",
    test: "tsx tests/test-generated-parser-chain.ts && tsx tests/test-language-server-metadata.ts && tsx tests/test-language-server.ts --source && tsdown && tsx tests/test-language-server.ts --dist"
  },
  dependencies: {
    "@volar/language-core": "~2.4.0",
    "@volar/language-server": "~2.4.0",
    "@volar/language-service": "~2.4.0",
    "@volar/typescript": "~2.4.0",
    "@qin/generated-qin-parser-ts": "file:../../qin/packages/qin-language/generated/qin-parser-ts",
    "ovs-compiler": "file:../ovs/ovs-compiler",
    "ovsjs": "file:../ovs/ovs-runtime",
    "slime-generator": "file:../../slime/slime-generator",
    "volar-service-typescript": "^0.0.65",
    "vscode-languageserver": "^9.0.1",
    "vscode-languageserver-textdocument": "^1.0.12",
    "vscode-uri": "^3.0.8"
  },
  devDependencies: {
    "typescript": "^5.6.2",
    "tsdown": "^0.9.3",
    "tsx": "^4.19.2"
  },
  language: {
    id: "ovs",
    extension: ".ovs",
    server: "ovs-language-server/src/index.ts",
    serverBundle: "dist/language-server.js",
    parser: "@qin/generated-qin-parser-ts",
    compiler: "../ovs/ovs-compiler",
    ideaLspClient: "../../qin/packages/qin-idea-plugin-debug"
  },
  languageServer: {
    sourceExtension: ".ovs",
    serviceExtension: ".ts",
    generatedParserTarget: "@qin/generated-qin-parser-ts",
    compilerPackage: "ovs-compiler"
  }
}
