/**
 * Export Class 支持测试
 * 测试 ovs 对 export class 语法的支持
 */

import {vitePluginOvsTransform} from '../../src/index.ts'

describe('Export Class Support', () => {
    
    test('should support export class with empty constructor', async () => {
        const code = `export class MyComponent {
    constructor() {}
    render() {
        return div {
            h1 { 'Hello World' }
        }
    }
}`
        
        const result = await vitePluginOvsTransform(code, 'test.ovs', false)
        
        expect(result.code).toContain('export class MyComponent')
        expect(result.code).toContain("OvsAPI.createVNode('div'")
        expect(result.code).toContain("OvsAPI.createVNode('h1'")
    })
    
    test('should support export class with multiple methods', async () => {
        const code = `export class MyComponent {
    constructor() {}
    
    initData() {
        this.name = 'test'
    }
    
    render() {
        return div { h1 { this.name } }
    }
}`
        
        const result = await vitePluginOvsTransform(code, 'test.ovs', false)
        
        expect(result.code).toContain('export class MyComponent')
        expect(result.code).toContain('initData()')
        expect(result.code).toContain('render()')
    })
    
    test('should support export class without export default', async () => {
        const code = `export class MyComponent {
    constructor() {}
    render() {
        return div { p { 'Content' } }
    }
}`
        
        const result = await vitePluginOvsTransform(code, 'test.ovs', false)
        
        expect(result.code).toContain('export class')
        expect(result.code).not.toContain('export default')
    })
    
    test('should support regular class (not exported)', async () => {
        const code = `class MyComponent {
    render() {
        return div { h1 { 'Hello' } }
    }
}`
        
        const result = await vitePluginOvsTransform(code, 'test.ovs', false)
        
        expect(result.code).toContain('class MyComponent')
        expect(result.code).toContain("OvsAPI.createVNode('div'")
    })
})

