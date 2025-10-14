/**
 * 测试数据和示例组件
 * 供测试用例使用的可复用代码片段
 */

export const samples = {
    // 最简单的export class
    simpleExportClass: `export class Simple {
    constructor() {}
    render() {
        return div { h1 { 'Hello' } }
    }
}`,

    // 带props的OVS元素
    divWithProps: `div({ class: 'container', id: 'main' }) {
    p { 'Content' }
}`,

    // 完整的组件模板
    fullComponent: `export class Component {
    constructor() {}
    
    initData() {
        if (this.initialized === undefined) {
            this.data = []
            this.initialized = true
        }
    }
    
    handleClick() {
        this.data.push({ id: Date.now() })
    }
    
    render() {
        this.initData()
        return div({ class: 'app' }) {
            button({ onClick: () => this.handleClick() }) { 'Click' }
            div {
                this.data.map(item => div({ key: item.id }) { item.id })
            }
        }
    }
}`,

    // 条件渲染
    conditionalRendering: `const isActive = true

div {
    h1 { 'Title' }
    if (isActive) {
        p { 'Active' }
    }
}`,

    // 循环渲染
    loopRendering: `const items = [1, 2, 3]

div {
    for (let i = 0; i < items.length; i++) {
        div { items[i] }
    }
}`,

    // 箭头函数
    arrowFunctions: `const double = (x) => x * 2
const format = (n) => 'Value: ' + n

div {
    p { double(5) }
    p { format(10) }
}`,

    // 多种运算符
    operators: `const x = 10
const y = 20
const sum = x + y
const isPositive = sum > 0
const negated = !isPositive

div {
    p { sum }
    p { isPositive }
    p { negated }
}`,
}

/**
 * 预期输出片段
 * 用于验证编译结果
 */
export const expected = {
    ovsAPIImport: "import OvsAPI from 'ovsjs/src/OvsAPI'",
    createVNode: 'OvsAPI.createVNode',
    exportClass: 'export class',
    exportDefault: 'export default',
    exportConst: 'export const',
}

/**
 * 错误场景
 * 应该抛出错误或警告的代码
 */
export const errorCases = {
    // Constructor with body (known limitation)
    constructorWithBody: `export class C {
    constructor() {
        this.name = 'test'
    }
    render() {
        return div { 'Hi' }
    }
}`,

    // Division operator (lexer conflict)
    divisionOperator: `const half = value / 2

div { half }`,
}

