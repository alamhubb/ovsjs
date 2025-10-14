/**
 * 运算符支持测试
 * 测试各种JavaScript运算符的支持
 */

import {vitePluginOvsTransform} from '../../src/index.ts'

describe('Operators Support', () => {
    
    describe('Unary Operators', () => {
        test('should support logical NOT (!)', async () => {
            const code = `export class C {
    constructor() {}
    toggle() {
        this.value = !this.value
    }
}`
            
            const result = await vitePluginOvsTransform(code, 'test.ovs', false)
            
            expect(result.code).toContain('!')
            expect(result.code).toContain('this.value')
        })
        
        test('should support typeof', async () => {
            const code = `const x = 10
const typeStr = typeof x

div {
    p { typeStr }
}`
            
            const result = await vitePluginOvsTransform(code, 'test.ovs', false)
            
            expect(result.code).toContain('typeof')
        })
        
        test('should support unary plus/minus', async () => {
            const code = `const a = 10
const positive = +a
const negative = -a

div {
    p { positive }
    p { negative }
}`
            
            const result = await vitePluginOvsTransform(code, 'test.ovs', false)
            
            expect(result.code).not.toThrow()
        })
    })
    
    describe('Comparison Operators', () => {
        test('should support === comparison', async () => {
            const code = `export class C {
    constructor() {}
    check() {
        if (this.value === undefined) {
            this.value = 0
        }
    }
}`
            
            const result = await vitePluginOvsTransform(code, 'test.ovs', false)
            
            expect(result.code).toContain('===')
            expect(result.code).toContain('undefined')
        })
        
        test('should support !== comparison', async () => {
            const code = `const x = 10

if (x !== 0) {
    div { 'Not zero' }
}`
            
            const result = await vitePluginOvsTransform(code, 'test.ovs', false)
            
            expect(result.code).toContain('!==')
        })
    })
    
    describe('Arithmetic Operators', () => {
        test('should support addition', async () => {
            const code = `const a = 10
const b = 20
const sum = a + b

div {
    p { sum }
}`
            
            const result = await vitePluginOvsTransform(code, 'test.ovs', false)
            
            expect(result.code).toContain('a + b')
        })
        
        test('should support Date.now()', async () => {
            const code = `export class C {
    constructor() {}
    addItem() {
        const id = Date.now()
        this.items.push({ id: id })
    }
}`
            
            const result = await vitePluginOvsTransform(code, 'test.ovs', false)
            
            expect(result.code).toContain('Date.now()')
        })
    })
})

