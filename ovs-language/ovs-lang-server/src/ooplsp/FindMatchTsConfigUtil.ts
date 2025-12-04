import type {LanguageServer} from "@volar/language-server";
import {URI} from "vscode-uri";
import {createUriMap, FileType} from "@volar/language-service";
import * as path from "path-browserify";
import TypeScriptProject from "./TypeScriptProject.ts";
import {isFileInDir, sortTSConfigs} from "@volar/language-server/lib/project/typescriptProject.js";
import * as ts from "typescript";

export default class FindMatchTsConfigUtil {
  static async findMatchTSConfig(server: LanguageServer, uri: URI) {
    const fileName = TypeScriptProject.uriConverter.asFileName(uri);

    let dir = path.dirname(fileName);

    while (true) {
      if (TypeScriptProject.searchedDirs.has(dir)) {
        break;
      }
      TypeScriptProject.searchedDirs.add(dir);
      for (const tsConfigName of TypeScriptProject.rootTsConfigNames) {
        const tsconfigPath = path.join(dir, tsConfigName);
        if ((await server.fileSystem.stat?.(TypeScriptProject.uriConverter.asUri(tsconfigPath)))?.type === FileType.File) {
          TypeScriptProject.rootTsConfigs.add(tsconfigPath);
        }
      }
      dir = path.dirname(dir);
    }
    await FindMatchTsConfigUtil.prepareClosestootCommandLine(fileName);

    return await FindMatchTsConfigUtil.findDirectIncludeTsconfig(fileName, uri) ?? await FindMatchTsConfigUtil.findIndirectReferenceTsconfig(fileName);
  }

  static async prepareClosestootCommandLine(fileName) {

    let matches: string[] = [];

    for (const rootTsConfig of TypeScriptProject.rootTsConfigs) {
      if (isFileInDir(fileName, path.dirname(rootTsConfig))) {
        matches.push(rootTsConfig);
      }
    }

    matches = matches.sort((a, b) => sortTSConfigs(fileName, a, b));

    if (matches.length) {
      await FindMatchTsConfigUtil.getCommandLine(matches[0]);
    }
  }


  static findDirectIncludeTsconfig(fileName, uri) {
    return FindMatchTsConfigUtil.findTSConfig(fileName, async tsconfig => {
      const map = createUriMap<boolean>();
      const commandLine = await FindMatchTsConfigUtil.getCommandLine(tsconfig);
      for (const fileName of commandLine?.fileNames ?? []) {
        const uri = TypeScriptProject.uriConverter.asUri(fileName);
        map.set(uri, true);
      }
      return map.has(uri);
    });
  }


  static findIndirectReferenceTsconfig(fileName) {
    return FindMatchTsConfigUtil.findTSConfig(fileName, async tsconfig => {
      const tsconfigUri = TypeScriptProject.uriConverter.asUri(tsconfig);
      const project = await TypeScriptProject.configProjects.get(tsconfigUri);
      const languageService: ts.LanguageService | undefined = project?.languageService.context.inject('typescript/languageService');
      return !!languageService?.getProgram()?.getSourceFile(fileName);
    });
  }

  static async findTSConfig(fileName, match: (tsconfig: string) => Promise<boolean> | boolean) {

    const checked = new Set<string>();

    for (const rootTsConfig of [...TypeScriptProject.rootTsConfigs].sort((a, b) => sortTSConfigs(fileName, a, b))) {
      const tsconfigUri = TypeScriptProject.uriConverter.asUri(rootTsConfig);
      const project = await TypeScriptProject.configProjects.get(tsconfigUri);
      if (project) {

        let chains = await FindMatchTsConfigUtil.getReferencesChains(project.getCommandLine(), rootTsConfig, []);

        // This is to be consistent with tsserver behavior
        chains = chains.reverse();

        for (const chain of chains) {
          for (let i = chain.length - 1; i >= 0; i--) {
            const tsconfig = chain[i];

            if (checked.has(tsconfig)) {
              continue;
            }
            checked.add(tsconfig);

            if (await match(tsconfig)) {
              return tsconfig;
            }
          }
        }
      }
    }
  }


  static async getReferencesChains(commandLine: ts.ParsedCommandLine, tsConfig: string, before: string[]) {

    if (commandLine.projectReferences?.length) {

      const newChains: string[][] = [];

      for (const projectReference of commandLine.projectReferences) {

        let tsConfigPath = projectReference.path.replace(/\\/g, '/');

        // fix https://github.com/johnsoncodehk/volar/issues/712
        if ((await TypeScriptProject.server.fileSystem.stat?.(TypeScriptProject.uriConverter.asUri(tsConfigPath)))?.type === FileType.File) {
          const newTsConfigPath = path.join(tsConfigPath, 'tsconfig.json');
          const newJsConfigPath = path.join(tsConfigPath, 'jsconfig.json');
          if ((await TypeScriptProject.server.fileSystem.stat?.(TypeScriptProject.uriConverter.asUri(newTsConfigPath)))?.type === FileType.File) {
            tsConfigPath = newTsConfigPath;
          } else if ((await TypeScriptProject.server.fileSystem.stat?.(TypeScriptProject.uriConverter.asUri(newJsConfigPath)))?.type === FileType.File) {
            tsConfigPath = newJsConfigPath;
          }
        }

        const beforeIndex = before.indexOf(tsConfigPath); // cycle
        if (beforeIndex >= 0) {
          newChains.push(before.slice(0, Math.max(beforeIndex, 1)));
        } else {
          const referenceCommandLine = await FindMatchTsConfigUtil.getCommandLine(tsConfigPath);
          if (referenceCommandLine) {
            for (const chain of await FindMatchTsConfigUtil.getReferencesChains(referenceCommandLine, tsConfigPath, [...before, tsConfig])) {
              newChains.push(chain);
            }
          }
        }
      }

      return newChains;
    } else {
      return [[...before, tsConfig]];
    }
  }


  static async getCommandLine(tsConfig: string) {
    const project = await TypeScriptProject.getOrCreateConfiguredProject(TypeScriptProject.server, tsConfig);
    return project?.getCommandLine();
  }
}