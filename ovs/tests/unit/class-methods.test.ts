/**
 * Class Methods 测试
 * 测试 class 中各种方法定义
 */

import {vitePluginOvsTransform} from '../../src/index.ts'

describe('Class Methods', () => {
    
    test('should support method with no parameters', async () => {
        const code = `export class C {
    constructor() {}
    getData() {
        return { name: 'test' }
    }
}`
        
        const result = await vitePluginOvsTransform(code, 'test.ovs', false)
        
        expect(result.code).toContain('getData()')
    })
    
    test('should support method with one parameter', async () => {
        const code = `export class C {
    constructor() {}
    setName(name) {
        this.name = name
    }
}`
        
        const result = await vitePluginOvsTransform(code, 'test.ovs', false)
        
        expect(result.code).toContain('setName(name)')
    })
    
    test('should support method with multiple parameters', async () => {
        const code = `export class C {
    constructor() {}
    calculate(a, b, c) {
        return a + b + c
    }
}`
        
        const result = await vitePluginOvsTransform(code, 'test.ovs', false)
        
        expect(result.code).toContain('calculate(a, b, c)')
    })
    
    test('should support multiple methods in one class', async () => {
        const code = `export class C {
    constructor() {}
    method1() { return 1 }
    method2() { return 2 }
    method3() { return 3 }
}`
        
        const result = await vitePluginOvsTransform(code, 'test.ovs', false)
        
        expect(result.code).toContain('method1()')
        expect(result.code).toContain('method2()')
        expect(result.code).toContain('method3()')
    })
    
    test('should support method returning OVS view', async () => {
        const code = `export class C {
    constructor() {}
    render() {
        return div {
            h1 { 'Hello' }
            p { 'World' }
        }
    }
}`
        
        const result = await vitePluginOvsTransform(code, 'test.ovs', false)
        
        expect(result.code).toContain('render()')
        expect(result.code).toContain("OvsAPI.createVNode('div'")
        expect(result.code).toContain("OvsAPI.createVNode('h1'")
        expect(result.code).toContain("OvsAPI.createVNode('p'")
    })
    
    test('should support method with this references', async () => {
        const code = `export class C {
    constructor() {}
    initData() {
        this.name = 'test'
        this.age = 25
        this.active = true
    }
}`
        
        const result = await vitePluginOvsTransform(code, 'test.ovs', false)
        
        expect(result.code).toContain('this.name')
        expect(result.code).toContain('this.age')
        expect(result.code).toContain('this.active')
    })
    
    test('should support arrow functions in methods', async () => {
        const code = `export class C {
    constructor() {}
    render() {
        return div {
            this.items.map(item => div { item.title })
        }
    }
}`
        
        const result = await vitePluginOvsTransform(code, 'test.ovs', false)
        
        expect(result.code).toContain('map')
        expect(result.code).toContain('=>')
    })
})

