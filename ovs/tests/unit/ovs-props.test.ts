/**
 * OVS Props 支持测试
 * 测试 OVS 元素的属性（props）支持
 */

import {vitePluginOvsTransform} from '../../src/index.ts'

describe('OVS Props Support', () => {
    
    test('should support div without props', async () => {
        const code = `export const hello = div {
    h1 { 'Hello' }
}`
        
        const result = await vitePluginOvsTransform(code, 'test.ovs', false)
        
        expect(result.code).toContain("OvsAPI.createVNode('div'")
        expect(result.code).toContain("OvsAPI.createVNode('h1'")
    })
    
    test('should support div with props', async () => {
        const code = `export const hello = div({ class: 'container' }) {
    h1 { 'Title' }
}`
        
        const result = await vitePluginOvsTransform(code, 'test.ovs', false)
        
        expect(result.code).toContain("OvsAPI.createVNode('div'")
        expect(result.code).toContain('class')
        expect(result.code).toContain('container')
    })
    
    test('should support reserved word "class" as property name', async () => {
        const code = `export const hello = div({ class: 'test', id: 'main' }) {
    p { 'Content' }
}`
        
        const result = await vitePluginOvsTransform(code, 'test.ovs', false)
        
        expect(result.code).toContain('class')
        expect(result.code).toContain('id')
        expect(result.code).not.toThrow()
    })
    
    test('should support nested divs with props', async () => {
        const code = `export class C {
    constructor() {}
    render() {
        return div({ class: 'container' }) {
            div({ class: 'panel' }) {
                h1 { 'Title' }
            }
        }
    }
}`
        
        const result = await vitePluginOvsTransform(code, 'test.ovs', false)
        
        expect(result.code).toContain('export class C')
        expect(result.code).toContain('container')
        expect(result.code).toContain('panel')
    })
    
    test('should support multiple props', async () => {
        const code = `div({
    class: 'btn',
    id: 'submit',
    type: 'button',
    disabled: false
}) {
    'Click me'
}`
        
        const result = await vitePluginOvsTransform(code, 'test.ovs', false)
        
        expect(result.code).toContain('class')
        expect(result.code).toContain('id')
        expect(result.code).toContain('type')
        expect(result.code).toContain('disabled')
    })
})

