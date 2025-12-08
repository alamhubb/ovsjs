import {CodeMapping, forEachEmbeddedCode, LanguagePlugin, VirtualCode} from '@volar/language-core';
import type {TypeScriptExtraServiceScript} from '@volar/typescript';
import type {IScriptSnapshot} from 'typescript';
import {URI} from 'vscode-uri';
import {LogUtil} from "./logutil.js";
import SlimeCodeMapping from "slime-generator/src/SlimeCodeMapping";
import {vitePluginOsTransform} from "os-compiler";

// TypeScript ScriptKind 枚举值（避免运行时依赖 typescript）
const ScriptKind = {
    Deferred: 0,
    JS: 1,
    TS: 3,
} as const;

export const osLanguagePlugin: LanguagePlugin<URI> = {
    getLanguageId(uri) {
        if (uri.path.endsWith('.os')) {
            return 'objectscript';
        }
    },
    createVirtualCode(_uri, languageId, snapshot) {
        if (languageId === 'objectscript') {
            return new OsVirtualCode(snapshot);
        }
    },
    typescript: {
        extraFileExtensions: [{extension: 'os', isMixedContent: true, scriptKind: ScriptKind.Deferred}],
        getServiceScript() {
            return undefined;
        },
        getExtraServiceScripts(fileName, root) {
            const scripts: TypeScriptExtraServiceScript[] = [];
            //得到所有的虚拟代码片段
            const ary = [...forEachEmbeddedCode(root)]
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
        return mappings
            .filter(mapping => {
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

    /**
     * 创建完整的填充映射
     * 确保源码的每个位置都能映射到生成代码
     * 这对于 LSP 功能（补全、hover 等）正常工作非常重要
     */
    static createFullMappings(
        sourceLength: number,
        generatedLength: number,
        existingMappings: EnhancedMapping[]
    ): EnhancedMapping[] {
        // 如果没有现有映射，创建一个简单的 1:1 映射
        if (existingMappings.length === 0) {
            return [{
                original: { offset: 0, length: sourceLength },
                generated: { offset: 0, length: generatedLength }
            }];
        }

        // 按 original.offset 排序
        const sorted = [...existingMappings].sort((a, b) => a.original.offset - b.original.offset);
        const result: EnhancedMapping[] = [];

        let lastSourceEnd = 0;
        let lastGenEnd = 0;

        for (const mapping of sorted) {
            // 如果当前映射和上一个之间有间隙，填充它
            if (mapping.original.offset > lastSourceEnd) {
                const gapSourceLength = mapping.original.offset - lastSourceEnd;
                const gapGenLength = mapping.generated.offset - lastGenEnd;

                if (gapGenLength > 0) {
                    result.push({
                        original: { offset: lastSourceEnd, length: gapSourceLength },
                        generated: { offset: lastGenEnd, length: gapGenLength }
                    });
                }
            }

            // 添加当前映射
            result.push(mapping);

            lastSourceEnd = mapping.original.offset + mapping.original.length;
            lastGenEnd = mapping.generated.offset + mapping.generated.length;
        }

        // 填充末尾的间隙
        if (lastSourceEnd < sourceLength && lastGenEnd < generatedLength) {
            result.push({
                original: { offset: lastSourceEnd, length: sourceLength - lastSourceEnd },
                generated: { offset: lastGenEnd, length: generatedLength - lastGenEnd }
            });
        }

        return result;
    }
}


export class OsVirtualCode implements VirtualCode {
    id = 'root';
    languageId = 'objectscript';
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
        LogUtil.log('=== ObjectScript Transform Start ===')
        let mapping: any[] = []
        try {
            LogUtil.log('Input code length: ' + styleText.length)
            const res = vitePluginOsTransform(styleText)
            newCode = res.code
            mapping = res.mapping
            LogUtil.log('=== ObjectScript Transform Success ===')
            LogUtil.log('Output code length: ' + newCode.length)
        } catch (e: unknown) {
            LogUtil.log('=== ObjectScript Transform Error ===')
            if (e instanceof Error) {
                LogUtil.log('Error type: ' + e.constructor.name)
                LogUtil.log('Error message: ' + e.message)
                LogUtil.log('Error stack: ' + e.stack)
            } else {
                LogUtil.log('Unknown error: ' + String(e))
            }
            newCode = styleText
            mapping = []
        }
        const rawOffsets = MappingConverter.convertMappings(mapping)
        // 使用填充映射确保完整覆盖
        const offsets = MappingConverter.createFullMappings(
            styleText.length,
            newCode.length,
            rawOffsets
        )

        LogUtil.log('=== Mapping Debug ===')
        LogUtil.log('Raw mapping count: ' + mapping.length)
        LogUtil.log('Converted offsets count: ' + rawOffsets.length)
        LogUtil.log('Full mappings count: ' + offsets.length)
        if (offsets.length > 0) {
            LogUtil.log('First 5 full offsets:', offsets.slice(0, 5))
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
            id: 'osts',
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

