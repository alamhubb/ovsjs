/**
 * 完整组件测试
 * 测试包含多种特性的完整组件
 */

import {vitePluginOvsTransform} from '../../src/index.ts'

describe('Full Component Integration', () => {
    
    test('should compile component with state and methods', async () => {
        const code = `export class TodoList {
    constructor() {}
    
    initData() {
        if (this.initialized === undefined) {
            this.todos = [
                { id: 1, title: 'Task 1', completed: false },
                { id: 2, title: 'Task 2', completed: true }
            ]
            this.newTodo = ''
            this.initialized = true
        }
    }
    
    addTodo() {
        if (this.newTodo.trim()) {
            this.todos.push({
                id: Date.now(),
                title: this.newTodo,
                completed: false
            })
            this.newTodo = ''
        }
    }
    
    toggleTodo(todo) {
        todo.completed = !todo.completed
    }
    
    render() {
        this.initData()
        return div({ class: 'todo-app' }) {
            input({
                value: this.newTodo,
                placeholder: 'Add todo...'
            })
            button({ onClick: () => this.addTodo() }) { 'Add' }
            
            div({ class: 'todo-list' }) {
                this.todos.map(todo =>
                    div({ class: 'todo-item', key: todo.id }) {
                        input({
                            type: 'checkbox',
                            checked: todo.completed,
                            onChange: () => this.toggleTodo(todo)
                        })
                        span { todo.title }
                    }
                )
            }
        }
    }
}`
        
        const result = await vitePluginOvsTransform(code, 'test.ovs', false)
        
        // 验证class导出正确
        expect(result.code).toContain('export class TodoList')
        
        // 验证方法存在
        expect(result.code).toContain('initData()')
        expect(result.code).toContain('addTodo()')
        expect(result.code).toContain('toggleTodo(todo)')
        expect(result.code).toContain('render()')
        
        // 验证OVS转换正确
        expect(result.code).toContain("OvsAPI.createVNode('div'")
        expect(result.code).toContain('class')
        expect(result.code).toContain('todo-app')
        
        // 验证运算符
        expect(result.code).toContain('!')
        expect(result.code).toContain('Date.now()')
        expect(result.code).toContain('map')
    })
    
    test('should compile component with conditional rendering', async () => {
        const code = `export class UserCard {
    constructor() {}
    
    render() {
        return div({ class: 'card' }) {
            h1 { this.name }
            
            if (this.isActive) {
                div({ class: 'status active' }) { 'Active' }
            }
            
            if (this.age !== undefined) {
                p { this.age }
            }
        }
    }
}`
        
        const result = await vitePluginOvsTransform(code, 'test.ovs', false)
        
        expect(result.code).toContain('export class UserCard')
        expect(result.code).toContain('if')
        expect(result.code).toContain('this.isActive')
        expect(result.code).toContain('!==')
    })
})

