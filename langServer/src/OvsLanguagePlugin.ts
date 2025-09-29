import {CodeMapping, forEachEmbeddedCode, LanguagePlugin, VirtualCode} from '@volar/language-core';
import type {TypeScriptExtraServiceScript} from '@volar/typescript';
import ts from 'typescript';
import {URI} from 'vscode-uri';
import {LogUtil} from "./logutil.js";
import SlimeCodeMapping from "slime-generator/src/SlimeCodeMapping";
import {vitePluginOvsTransform} from "ovsjs/src";

export const ovsLanguagePlugin: LanguagePlugin<URI> = {
  getLanguageId(uri) {
    if (uri.path.endsWith('.ovs')) {
      return 'ovs';
    }
  },
  createVirtualCode(_uri, languageId, snapshot) {
    if (languageId === 'ovs') {
      return new OvsVirtualCode(snapshot);
    }
  },
  typescript: {
    extraFileExtensions: [{extension: 'ovs', isMixedContent: true, scriptKind: ts.ScriptKind.Deferred}],
    getServiceScript() {
      return undefined;
    },
    getExtraServiceScripts(fileName, root) {
      const scripts: TypeScriptExtraServiceScript[] = [];
      //得到所有的虚拟代码片段
      const ary = [...forEachEmbeddedCode(root)]
      // console.log(ary.length)
      // LogUtil.log(ary.length)
      // LogUtil.log(root.embeddedCodes)
      for (const code of ary) {
        // LogUtil.log('code')
        // LogUtil.log(code)
        // LogUtil.log(code.languageId)
        if (code.languageId === 'qqqts') {
          scripts.push({
            fileName: fileName + '.' + code.id + '.ts',
            code,
            extension: '.ts',
            scriptKind: ts.ScriptKind.TS,
          });
        }
      }
      return scripts;
    },
  },
};


interface BabelMapping {
  generated: { line: number; column: number };
  original: { line: number; column: number };
  source: string;
  name?: string;
}

interface SegmentInfo {
  offset: number;
  length: number;
}

interface EnhancedMapping {
  generated: SegmentInfo;
  original: SegmentInfo;
}

export class MappingConverter {
  static convertMappings(mappings: SlimeCodeMapping[]): EnhancedMapping[] {
    return mappings.map((mapping, index) => {
      const res = {
        original: {
          offset: mapping.source.index,
          length: mapping.source.length,
        },
        generated: {
          offset: mapping.generate.index,
          length: mapping.generate.length,
        },
      };
      return res
    });
  }
}


export class OvsVirtualCode implements VirtualCode {
  id = 'root';
  languageId = 'qqovs';
  mappings: CodeMapping[];
  embeddedCodes: VirtualCode[] = [];

  constructor(public snapshot: ts.IScriptSnapshot) {
    this.mappings = [{
      sourceOffsets: [0],
      generatedOffsets: [0],
      lengths: [snapshot.getLength()],
      data: {
        completion: true,
        format: true,
        navigation: true,
        semantic: true,
        structure: true,
        verification: true,
      },
    }];
    const styleText = snapshot.getText(0, snapshot.getLength());
    let newCode = styleText
    LogUtil.log('styleTextstyleTextstyleTextstyleText')
    let mapping = []
    try {
      LogUtil.log('3333')
      const res = vitePluginOvsTransform(styleText)
      newCode = res.code
      mapping = res.mapping
    } catch (e: any) {
      LogUtil.log('styleErrrrrrrr')
      LogUtil.log(styleText)
      LogUtil.log(e.message)
    }
    const offsets = MappingConverter.convertMappings(mapping)

    LogUtil.log('mappings ascopy mapping')

    LogUtil.log(styleText)
    LogUtil.log(newCode)
    const mappings = [{
      sourceOffsets: offsets.map(item => item.original.offset),
      generatedOffsets: offsets.map(item => item.generated.offset),
      lengths: offsets.map(item => item.original.length),
      generatedLengths: offsets.map(item => item.generated.length),
      // sourceOffsets: [0],
      // generatedOffsets: [0],
      // lengths: [styleText.length],
      data: {
        completion: true,
        format: true,
        navigation: true,
        semantic: true,
        structure: true,
        verification: true
      },
    }]
    this.embeddedCodes = [{
      id: 'ts1',
      languageId: 'qqqts',
      snapshot: {
        getText: (start, end) => newCode.substring(start, end),
        getLength: () => newCode.length,
        getChangeRange: () => undefined,
      },
      // sourceOffsets: number[];
      // generatedOffsets: number[];
      // lengths: number[];
      // generatedLengths?: number[];
      // data: Data;
      mappings: mappings,
      embeddedCodes: [],
    }];
  }
}

