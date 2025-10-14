/**
 * Parser Bug 回归测试
 * 确保已修复的bug不再复现
 */

import {vitePluginOvsTransform} from '../../src/index.ts'

describe('Parser Bug Regressions', () => {
    
    test('should support reserved keywords as object property names', async () => {
        // Bug: LiteralPropertyName 不支持保留字，导致 { class: 'x' } 解析失败
        // Fix: 扩展 LiteralPropertyName 支持所有保留字
        
        const code = `div({
    class: 'container',
    for: 'input1',
    default: 'value',
    return: false,
    if: true
}) {
    'Content'
}`
        
        const result = await vitePluginOvsTransform(code, 'test.ovs', false)
        
        expect(result.code).toContain('class')
        expect(result.code).toContain('for')
        expect(result.code).toContain('default')
        expect(result.code).not.toThrow()
    })
    
    test('should support unary NOT operator', async () => {
        // Bug: createUnaryExpressionAst 未实现，导致 !value 抛出异常
        // Fix: 完整实现 createUnaryExpressionAst
        
        const code = `export class C {
    constructor() {}
    toggle() {
        this.active = !this.active
    }
}`
        
        const result = await vitePluginOvsTransform(code, 'test.ovs', false)
        
        expect(result.code).toContain('!')
        expect(result.code).toContain('this.active')
    })
    
    test('should support export class declaration', async () => {
        // Bug: createDeclarationAst 不支持 ClassDeclaration
        // Fix: 添加 ClassDeclaration 和 FunctionDeclaration 支持
        
        const code = `export class MyComponent {
    constructor() {}
    render() {
        return div { h1 { 'Test' } }
    }
}`
        
        const result = await vitePluginOvsTransform(code, 'test.ovs', false)
        
        expect(result.code).toContain('export class MyComponent')
        expect(result.code).not.toContain('export default')
    })
    
    test('should handle OVS elements with Arguments correctly', async () => {
        // Bug: 硬编码 cst.children[2] 获取 StatementList，当有 Arguments 时索引错误
        // Fix: 使用 find() 查找 StatementList 节点
        
        const code = `div({ id: 'test' }) {
    h1 { 'Title' }
    p { 'Content' }
}`
        
        const result = await vitePluginOvsTransform(code, 'test.ovs', false)
        
        expect(result.code).toContain("OvsAPI.createVNode('div'")
        expect(result.code).toContain("OvsAPI.createVNode('h1'")
        expect(result.code).toContain("OvsAPI.createVNode('p'")
    })
    
    test('should preserve export class in class methods', async () => {
        // Bug: Parser 错误地将 render() 方法识别为 OvsRenderDomViewDeclaration
        // Fix: 确保在 class 内部正确解析方法定义
        
        const code = `export class C {
    constructor() {}
    method1() { return 1 }
    method2() { return 2 }
}`
        
        const result = await vitePluginOvsTransform(code, 'test.ovs', false)
        
        expect(result.code).toContain('export class C')
        expect(result.code).toContain('method1()')
        expect(result.code).toContain('method2()')
    })
})

