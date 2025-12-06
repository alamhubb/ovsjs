import {CodeMapping, forEachEmbeddedCode, LanguagePlugin, VirtualCode} from '@volar/language-core';
import type {TypeScriptExtraServiceScript} from '@volar/typescript';
import type {IScriptSnapshot} from 'typescript';
import {URI} from 'vscode-uri';
import {LogUtil} from "./logutil.js";
import SlimeCodeMapping from "slime-generator/src/SlimeCodeMapping";
import {vitePluginOvsTransform} from "ovs-compiler";

// TypeScript ScriptKind 枚举值（避免运行时依赖 typescript）
const ScriptKind = {
    Deferred: 0,
    JS: 1,
    TS: 3,
} as const;

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
        extraFileExtensions: [{extension: 'ovs', isMixedContent: true, scriptKind: ScriptKind.Deferred}],
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
                if (code.languageId === 'typescript') {
                    scripts.push({
                        fileName: fileName + '.' + code.id + '.ts',
                        code,
                        extension: '.ts',
                        scriptKind: ScriptKind.TS
                    });
                } else if (code.languageId === 'js') {
                    scripts.push({
                        fileName: fileName + '.' + code.id + '.js',
                        code,
                        extension: '.js',
                        scriptKind: ScriptKind.JS
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
        // 注意：无效映射已经在编译器（vitePluginOvsTransform）中过滤
        // 这里只做基本的 null 检查，防御性编程
        return mappings
            .filter(mapping => {
                // 基本的 null/undefined 检查
                return mapping.source && mapping.generate;
            })
            .map((mapping, index) => {
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

    constructor(public snapshot: IScriptSnapshot) {
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
        LogUtil.log('=== OVS Transform Start ===')
        let mapping: any[] = []
        try {
            LogUtil.log('Input code length: ' + styleText.length)
            // 使用带格式化的同步方法（保持 source map 准确）
            const res = vitePluginOvsTransform(styleText)
            newCode = res.code
            mapping = res.mapping
            LogUtil.log('=== OVS Transform Success ===')
            LogUtil.log('Output code length: ' + newCode.length)
        } catch (e: unknown) {
            LogUtil.log('=== OVS Transform Error ===')
            if (e instanceof Error) {
                LogUtil.log('Error type: ' + e.constructor.name)
                LogUtil.log('Error message: ' + e.message)
                LogUtil.log('Error stack: ' + e.stack)
            } else {
                LogUtil.log('Unknown error: ' + String(e))
            }
            // 解析失败时，使用原始代码作为 fallback
            newCode = styleText
            mapping = []
        }
        const offsets = MappingConverter.convertMappings(mapping)

        LogUtil.log('=== Mapping Debug ===')
        LogUtil.log('Raw mapping count: ' + mapping.length)
        LogUtil.log('Converted offsets count: ' + offsets.length)
        if (offsets.length > 0) {
            LogUtil.log('First 5 offsets:', offsets.slice(0, 5))
        }

        LogUtil.log('Source code:')
        LogUtil.log(styleText)
        LogUtil.log('Generated code:')
        LogUtil.log(newCode)

        const mappings = [{
            sourceOffsets: offsets.map(item => item.original.offset),
            generatedOffsets: offsets.map(item => item.generated.offset),
            lengths: offsets.map(item => item.original.length),
            generatedLengths: offsets.map(item => item.generated.length),
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
            id: 'ovsts',
            languageId: 'typescript',
            snapshot: {
                getText: (start, end) => newCode.substring(start, end),
                getLength: () => newCode.length,
                getChangeRange: () => undefined,
            },
            mappings: mappings,
            embeddedCodes: [],
        }];
    }
}

