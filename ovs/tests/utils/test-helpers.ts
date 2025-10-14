/**
 * 测试辅助工具
 * 提供通用的测试工具函数
 */

import {vitePluginOvsTransform} from '../../src/index.ts'

/**
 * 编译OVS代码并返回结果
 * @param code OVS源代码
 * @param prettify 是否格式化
 * @returns 编译结果
 */
export async function compile(code: string, prettify: boolean = false) {
    return await vitePluginOvsTransform(code, 'test.ovs', prettify)
}

/**
 * 验证编译成功且包含指定内容
 * @param code OVS源代码
 * @param expectedContent 期望包含的内容数组
 */
export async function expectToCompile(code: string, ...expectedContent: string[]) {
    const result = await compile(code, false)
    
    for (const content of expectedContent) {
        if (!result.code?.includes(content)) {
            throw new Error(`Expected output to contain: ${content}`)
        }
    }
    
    return result
}

/**
 * 验证编译成功且不包含指定内容
 * @param code OVS源代码
 * @param unexpectedContent 不应包含的内容数组
 */
export async function expectNotToContain(code: string, ...unexpectedContent: string[]) {
    const result = await compile(code, false)
    
    for (const content of unexpectedContent) {
        if (result.code?.includes(content)) {
            throw new Error(`Expected output NOT to contain: ${content}`)
        }
    }
    
    return result
}

/**
 * 验证编译失败
 * @param code OVS源代码
 * @param errorMessage 期望的错误信息（可选）
 */
export async function expectToFail(code: string, errorMessage?: string) {
    try {
        await compile(code, false)
        throw new Error('Expected compilation to fail, but it succeeded')
    } catch (error) {
        if (errorMessage && !error.message.includes(errorMessage)) {
            throw new Error(`Expected error message to contain "${errorMessage}", got: ${error.message}`)
        }
    }
}

/**
 * 快照测试助手
 * 对比编译输出与预期快照
 */
export class SnapshotMatcher {
    private snapshots: Map<string, string> = new Map()
    
    async match(name: string, code: string) {
        const result = await compile(code, true)  // 格式化以便对比
        
        if (!this.snapshots.has(name)) {
            this.snapshots.set(name, result.code)
            return true
        }
        
        const expected = this.snapshots.get(name)
        return result.code === expected
    }
}

