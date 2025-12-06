import {ovsLanguagePlugin} from "./OvsLanguagePlugin.ts";
import {createTypeScriptServices} from "./typescript";
import * as fs from "node:fs";
import * as path from "node:path";
import {loadTsdkByPath} from "@volar/language-server/node";
import * as ts from "typescript";
import {createLanguageServiceHost, resolveFileLanguageId, TypeScriptProjectHost} from "@volar/typescript";
import {GetCompletionsAtPositionOptions} from "typescript";
import {createUriMap} from "@volar/language-service";
import {createLanguage} from "@volar/language-core";


const documentRegistries: [boolean, string, ts.DocumentRegistry][] = [];

function getDocumentRegistry(ts: typeof import('typescript'), useCaseSensitiveFileNames: boolean, currentDirectory: string) {
  let documentRegistry = documentRegistries.find(item => item[0] === useCaseSensitiveFileNames && item[1] === currentDirectory)?.[2];
  if (!documentRegistry) {
    documentRegistry = ts.createDocumentRegistry(useCaseSensitiveFileNames, currentDirectory);
    documentRegistries.push([useCaseSensitiveFileNames, currentDirectory, documentRegistry]);
  }
  return documentRegistry;
}


const languagePlugins = [
  ovsLanguagePlugin
];

function getLocalTsdkPath() {
  // let tsdkPath = "C:\\Users\\qinkaiyuan\\AppData\\Roaming\\npm\\node_modules\\typescript\\lib";
  let tsdkPath = "C:\\Users\\qinky\\AppData\\Roaming\\npm\\node_modules\\typescript\\lib";
  return tsdkPath.replace(/\\/g, '/');
}

const tsdkPath = getLocalTsdkPath();

const tsdk = loadTsdkByPath(tsdkPath, 'en');

const services = [...createTypeScriptServices(tsdk.typescript)];

function getTsconfig() {

  let tsconfig = path.resolve(process.cwd(), '../tsconfig.json');

  const tsconfigIndex = process.argv.indexOf('--tsconfig');
  if (tsconfigIndex >= 0) {
    tsconfig = path.resolve(process.cwd(), process.argv[tsconfigIndex + 1]);
  }

  if (!fs.existsSync(tsconfig)) {
    throw `tsconfig.json not found: ${tsconfig}`;
  }

  return tsconfig;
}

const tsconfig = getTsconfig()
let includeProjectReference = false
const linter = kit.createTypeScriptChecker(languagePlugins, services, tsconfig, includeProjectReference)


const tsconfigPath = asPosix(tsconfig);
const configFileName = tsconfigPath;

const fsFileSnapshots = createUriMap<[number | undefined, ts.IScriptSnapshot | undefined]>();

const language = createLanguage(
  [
    ...languagePlugins,
    {getLanguageId: uri => resolveFileLanguageId(uri.path)},
  ],
  createUriMap(ts.sys.useCaseSensitiveFileNames),
  (uri, includeFsFiles) => {
    if (!includeFsFiles) {
      return;
    }
    const cache = fsFileSnapshots.get(uri);
    const fileName = asFileName(uri);
    const modifiedTime = ts.sys.getModifiedTime?.(fileName)?.valueOf();
    if (!cache || cache[0] !== modifiedTime) {
      if (ts.sys.fileExists(fileName)) {
        const text = ts.sys.readFile(fileName);
        const snapshot = text !== undefined ? ts.ScriptSnapshot.fromString(text) : undefined;
        fsFileSnapshots.set(uri, [modifiedTime, snapshot]);
      } else {
        fsFileSnapshots.set(uri, [modifiedTime, undefined]);
      }
    }
    const snapshot = fsFileSnapshots.get(uri)?.[1];
    if (snapshot) {
      language.scripts.set(uri, snapshot);
    } else {
      language.scripts.delete(uri);
    }
  }
);
let settings = {};
const env = createServiceEnvironment(() => settings);
const getCommandLine = () => {
  return ts.parseJsonSourceFileConfigFileContent(
    ts.readJsonConfigFile(tsconfigPath, ts.sys.readFile),
    ts.sys,
    path.dirname(tsconfigPath),
    undefined,
    tsconfigPath,
    undefined,
    languagePlugins.map(plugin => plugin.typescript?.extraFileExtensions ?? []).flat()
  );
}

let commandLine = getCommandLine();
let shouldCheckRootFiles = false;
let projectVersion = 0;

function checkRootFilesUpdate() {
  if (!shouldCheckRootFiles) {
    return;
  }
  shouldCheckRootFiles = false;

  const newCommandLine = getCommandLine();
  if (!arrayItemsEqual(newCommandLine.fileNames, commandLine.fileNames)) {
    commandLine.fileNames = newCommandLine.fileNames;
    projectVersion++;
  }
}

const resolvedFileNameByCommandLine = new WeakMap<ts.ParsedCommandLine, string[]>();

const projectHost: TypeScriptProjectHost = {
  getCurrentDirectory: () => env.workspaceFolders.length
    ? asFileName(env.workspaceFolders[0])
    : process.cwd(),
  getCompilationSettings: () => {
    return commandLine.options;
  },
  getProjectReferences: () => {
    return commandLine.projectReferences;
  },
  getProjectVersion: () => {
    checkRootFilesUpdate();
    return projectVersion.toString();
  },
  getScriptFileNames: () => {
    checkRootFilesUpdate();
    let fileNames = resolvedFileNameByCommandLine.get(commandLine);
    if (!fileNames) {
      fileNames = commandLine.fileNames.map(asPosix);
      resolvedFileNameByCommandLine.set(commandLine, fileNames);
    }
    return fileNames;
  },
};

const uriConverter = {
  asFileName,
  asUri,
}
const tsSys = ts.sys

const languageServiceHostAll = createLanguageServiceHost(
  ts,
  tsSys,
  language,
  s => uriConverter.asUri(s),
  projectHost
)


const languageServiceHost = languageServiceHostAll.languageServiceHost


const languageService = ts.createLanguageService(
  languageServiceHost,
  getDocumentRegistry(ts, tsSys.useCaseSensitiveFileNames, languageServiceHost.getCurrentDirectory())
);

// c:/Users/qinkaiyuan/IdeaProjects/testovsplg1/src/fasdf.ovs.ts1.ts
// E:/qkyproject/openproject/volar.js/langServer/src/fasdf.ovs.ts1.ts
// 133
const opts: GetCompletionsAtPositionOptions = {
  "quotePreference": "auto",
  "importModuleSpecifierEnding": "minimal",
  "jsxAttributeCompletionStyle": "auto",
  "allowTextChangesInNewFiles": true,
  "providePrefixAndSuffixTextForRename": true,
  "allowRenameOfImportPath": true,
  "includeAutomaticOptionalChainCompletions": true,
  "provideRefactorNotApplicableReason": true,
  "generateReturnInDocTemplate": true,
  "includeCompletionsForImportStatements": true,
  "includeCompletionsWithSnippetText": true,
  "includeCompletionsWithClassMemberSnippets": true,
  "includeCompletionsWithObjectLiteralMethodSnippets": true,
  "useLabelDetailsInCompletionEntries": true,
  "allowIncompleteCompletions": true,
  "displayPartsForJSDoc": true,
  "includeInlayParameterNameHintsWhenArgumentMatchesName": false,
  "includeInlayFunctionParameterTypeHints": false,
  "includeInlayVariableTypeHints": false,
  "includeInlayVariableTypeHintsWhenTypeMatchesName": false,
  "includeInlayPropertyDeclarationTypeHints": false,
  "includeInlayFunctionLikeReturnTypeHints": false,
  "includeInlayEnumMemberValueHints": false,
  "includeCompletionsForModuleExports": true,
  "includeCompletionsWithInsertText": true,
  "includePackageJsonAutoImports": "auto",
  "triggerKind": 1
}


const res = languageService.getCompletionsAtPosition
('D:/project/qkyproject/test-volar/langServer/src/testkifadsf.ts', 19, opts)

console.log(res.entries.length)