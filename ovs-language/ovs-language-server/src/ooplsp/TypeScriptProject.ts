import * as ts from "typescript";
import * as path from "path-browserify";
import {
  createUriConverter,
  getWorkspaceFolder,
  isFileInDir,
  sortTSConfigs
} from "@volar/language-server/lib/project/typescriptProject.js";
import {
  type ExperimentalFeatures,
  Language,
  LanguagePlugin,
  LanguageServer,
  type LanguageServerProject, LanguageServerState, type LanguageServicePlugin,
  ProjectContext,
  ProviderResult
} from "@volar/language-server";
import {URI} from "vscode-uri";
import {createUriMap, FileType, type InitializeParams} from "@volar/language-service";
import {
  createTypeScriptLS,
  ProjectExposeContext,
  TypeScriptProjectLS
} from "@volar/language-server/lib/project/typescriptProjectLs.js";
import FindMatchTsConfigUtil from "./FindMatchTsConfigUtil.ts";
import {createLanguageServiceEnvironment} from "@volar/language-server/lib/project/simpleProject.js";
import {getInferredCompilerOptions} from "@volar/language-server/lib/project/inferredCompilerOptions.js";
import {createServer} from "@volar/language-server/node.js";
import * as vscode from "vscode-languageserver";
import {register as registerConfigurationSupport} from "@volar/language-server/lib/features/configurations.js";
import {register as registerEditorFeaturesSupport} from "@volar/language-server/lib/features/editorFeatures.js";
import {register as registerTextDocumentRegistry} from "@volar/language-server/lib/features/textDocuments.js";
import {register as registerWorkspaceFolderRegistry} from "@volar/language-server/lib/features/workspaceFolders.js";
import {register as registerFileWatcher} from "@volar/language-server/lib/features/fileWatcher.js";
import {register as registerLanguageFeatures} from "@volar/language-server/lib/features/languageFeatures.js";
import {register as registerFileSystemSupport} from "@volar/language-server/lib/features/fileSystem.js";

export default class TypeScriptProject {
  static tsLocalized: ts.MapLike<string>
  static server: ReturnType<typeof createServer>
  static initializeParams: InitializeParams;
  static languageServicePlugins: LanguageServicePlugin[]
  static rootTsConfigNames = ['tsconfig.json', 'jsconfig.json'];
  static uriConverter: ReturnType<typeof createUriConverter>
  static configProjects = createUriMap<Promise<TypeScriptProjectLS>>();
  static inferredProjects = createUriMap<Promise<TypeScriptProjectLS>>();
  static rootTsConfigs = new Set<string>();
  static searchedDirs = new Set<string>();

  static onInitializeCallbacks: ((serverCapabilities: vscode.ServerCapabilities<ExperimentalFeatures>) => void)[] = [];

  static create: (projectContext: ProjectExposeContext) => ProviderResult<{
    languagePlugins: LanguagePlugin<URI>[];
    setup?(options: {
      language: Language;
      project: ProjectContext;
    }): void;
  }>;

  static initTypeScriptProject(
    server: ReturnType<typeof createServer>,
    tsLocalized: ts.MapLike<string> | undefined,
    initializeParams: InitializeParams,
    languageServicePlugins: LanguageServicePlugin[],
    create?: (projectContext: ProjectExposeContext) => ProviderResult<{
      languagePlugins: LanguagePlugin<URI>[];
      setup?(options: {
        language: Language;
        project: ProjectContext;
      }): void;
    }>
  ): vscode.InitializeResult<ExperimentalFeatures> {
    this.tsLocalized = tsLocalized
    this.server = server
    this.initializeParams = initializeParams
    this.languageServicePlugins = languageServicePlugins
    this.create = create
    this.uriConverter = createUriConverter(server.workspaceFolders.all);

    const configurations = registerConfigurationSupport(TypeScriptProject as any);
    const editorFeatures = registerEditorFeaturesSupport(TypeScriptProject as any);
    const documents = registerTextDocumentRegistry(TypeScriptProject as any);
    const workspaceFolders = registerWorkspaceFolderRegistry(TypeScriptProject as any);
    const fileWatcher = registerFileWatcher(TypeScriptProject as any);
    const languageFeatures = registerLanguageFeatures(TypeScriptProject as any, documents, configurations);
    const fileSystem = registerFileSystemSupport(documents, fileWatcher);

    const serverCapabilities: vscode.ServerCapabilities<ExperimentalFeatures> = {};
    TypeScriptProject.onInitializeCallbacks.forEach(cb => cb(serverCapabilities));
    return {capabilities: serverCapabilities};
  }

  static async getLanguageService(uri) {
    const tsconfig = await FindMatchTsConfigUtil.findMatchTSConfig(this.server, uri);
    if (tsconfig) {
      const project = await TypeScriptProject.getOrCreateConfiguredProject(this.server, tsconfig);
      return project.languageService;
    }
    const workspaceFolder = getWorkspaceFolder(uri, this.server.workspaceFolders);
    const project = await TypeScriptProject.getOrCreateInferredProject(this.server, uri, workspaceFolder);
    return project.languageService;
  }

  static getOrCreateConfiguredProject(server: LanguageServer, tsconfig: string) {
    tsconfig = tsconfig.replace(/\\/g, '/');
    const tsconfigUri = TypeScriptProject.uriConverter.asUri(tsconfig);
    let projectPromise = TypeScriptProject.configProjects.get(tsconfigUri);
    if (!projectPromise) {
      const workspaceFolder = getWorkspaceFolder(tsconfigUri, server.workspaceFolders);
      const serviceEnv = createLanguageServiceEnvironment(server, [workspaceFolder]);
      projectPromise = createTypeScriptLS(
        ts,
        TypeScriptProject.tsLocalized,
        tsconfig,
        server,
        serviceEnv,
        workspaceFolder,
        TypeScriptProject.uriConverter,
        TypeScriptProject.create
      );
      TypeScriptProject.configProjects.set(tsconfigUri, projectPromise);
    }
    return projectPromise;
  }

  private static async getOrCreateInferredProject(server: LanguageServer, uri: URI, workspaceFolder: URI) {

    if (!TypeScriptProject.inferredProjects.has(workspaceFolder)) {
      TypeScriptProject.inferredProjects.set(workspaceFolder, (async () => {
        const inferOptions = await getInferredCompilerOptions(server);
        const serviceEnv = createLanguageServiceEnvironment(server, [workspaceFolder]);
        return createTypeScriptLS(
          ts,
          TypeScriptProject.tsLocalized,
          inferOptions,
          server,
          serviceEnv,
          workspaceFolder,
          TypeScriptProject.uriConverter,
          TypeScriptProject.create
        );
      })());
    }

    const project = await TypeScriptProject.inferredProjects.get(workspaceFolder)!;

    project.tryAddFile(TypeScriptProject.uriConverter.asFileName(uri));

    return project;
  }


}