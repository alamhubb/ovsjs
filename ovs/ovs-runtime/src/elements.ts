/**
 * HTML 元素命名空间
 * 
 * 使用 $OvsHtmlTag.div() 避免与用户变量冲突
 */

import { createElementVNode } from './core'
import type { DefineComponent } from 'vue'

type HtmlElementFactory = (props?: Record<string, any>, children?: any) => DefineComponent<any, any, any>

function createElement(tag: string): HtmlElementFactory {
    return (props?, children?) => createElementVNode(tag, props, children)
}

/**
 * HTML 标签命名空间
 * 使用方式: $OvsHtmlTag.div({ class: 'x' }, [...])
 */
export const $OvsHtmlTag = {
    // 文档结构
    html: createElement('html'),
    head: createElement('head'),
    body: createElement('body'),
    title: createElement('title'),
    meta: createElement('meta'),
    link: createElement('link'),
    style: createElement('style'),
    script: createElement('script'),
    
    // 内容分区
    div: createElement('div'),
    span: createElement('span'),
    p: createElement('p'),
    section: createElement('section'),
    article: createElement('article'),
    aside: createElement('aside'),
    header: createElement('header'),
    footer: createElement('footer'),
    nav: createElement('nav'),
    main: createElement('main'),
    
    // 标题
    h1: createElement('h1'),
    h2: createElement('h2'),
    h3: createElement('h3'),
    h4: createElement('h4'),
    h5: createElement('h5'),
    h6: createElement('h6'),
    
    // 文本
    strong: createElement('strong'),
    em: createElement('em'),
    b: createElement('b'),
    i: createElement('i'),
    u: createElement('u'),
    small: createElement('small'),
    code: createElement('code'),
    pre: createElement('pre'),
    blockquote: createElement('blockquote'),
    br: createElement('br'),
    hr: createElement('hr'),
    
    // 列表
    ul: createElement('ul'),
    ol: createElement('ol'),
    li: createElement('li'),
    dl: createElement('dl'),
    dt: createElement('dt'),
    dd: createElement('dd'),
    
    // 表格
    table: createElement('table'),
    thead: createElement('thead'),
    tbody: createElement('tbody'),
    tfoot: createElement('tfoot'),
    tr: createElement('tr'),
    th: createElement('th'),
    td: createElement('td'),
    caption: createElement('caption'),
    colgroup: createElement('colgroup'),
    col: createElement('col'),
    
    // 表单
    form: createElement('form'),
    input: createElement('input'),
    textarea: createElement('textarea'),
    button: createElement('button'),
    select: createElement('select'),
    option: createElement('option'),
    optgroup: createElement('optgroup'),
    label: createElement('label'),
    fieldset: createElement('fieldset'),
    legend: createElement('legend'),
    
    // 媒体
    img: createElement('img'),
    video: createElement('video'),
    audio: createElement('audio'),
    source: createElement('source'),
    track: createElement('track'),
    canvas: createElement('canvas'),
    svg: createElement('svg'),
    
    // 链接
    a: createElement('a'),
    
    // 其他
    iframe: createElement('iframe'),
    object: createElement('object'),
    embed: createElement('embed'),
    details: createElement('details'),
    summary: createElement('summary'),
    dialog: createElement('dialog'),
    progress: createElement('progress'),
    meter: createElement('meter'),
    output: createElement('output'),
    
    // 语义化
    mark: createElement('mark'),
    time: createElement('time'),
    address: createElement('address'),
    figure: createElement('figure'),
    figcaption: createElement('figcaption'),
    cite: createElement('cite'),
    q: createElement('q'),
    abbr: createElement('abbr'),
    dfn: createElement('dfn'),
    kbd: createElement('kbd'),
    samp: createElement('samp'),
    var: createElement('var'),
    sup: createElement('sup'),
    sub: createElement('sub'),
} as const

// ==================== 全局类型声明 ====================
// 当用户导入 ovsjs 时，这些全局类型自动生效
// 用户可以在自己代码中声明同名变量来覆盖这些声明
type OvsHtmlTagFn = typeof $OvsHtmlTag.div

declare global {
    // 文档结构
    const html: OvsHtmlTagFn
    const head: OvsHtmlTagFn
    const body: OvsHtmlTagFn
    const title: OvsHtmlTagFn
    const meta: OvsHtmlTagFn
    const link: OvsHtmlTagFn
    const style: OvsHtmlTagFn
    const script: OvsHtmlTagFn

    // 内容分区
    const div: OvsHtmlTagFn
    const span: OvsHtmlTagFn
    const p: OvsHtmlTagFn
    const section: OvsHtmlTagFn
    const article: OvsHtmlTagFn
    const aside: OvsHtmlTagFn
    const header: OvsHtmlTagFn
    const footer: OvsHtmlTagFn
    const nav: OvsHtmlTagFn
    const main: OvsHtmlTagFn

    // 标题
    const h1: OvsHtmlTagFn
    const h2: OvsHtmlTagFn
    const h3: OvsHtmlTagFn
    const h4: OvsHtmlTagFn
    const h5: OvsHtmlTagFn
    const h6: OvsHtmlTagFn

    // 文本
    const strong: OvsHtmlTagFn
    const em: OvsHtmlTagFn
    const b: OvsHtmlTagFn
    const i: OvsHtmlTagFn
    const u: OvsHtmlTagFn
    const small: OvsHtmlTagFn
    const code: OvsHtmlTagFn
    const pre: OvsHtmlTagFn
    const blockquote: OvsHtmlTagFn
    const br: OvsHtmlTagFn
    const hr: OvsHtmlTagFn

    // 列表
    const ul: OvsHtmlTagFn
    const ol: OvsHtmlTagFn
    const li: OvsHtmlTagFn
    const dl: OvsHtmlTagFn
    const dt: OvsHtmlTagFn
    const dd: OvsHtmlTagFn

    // 表格
    const table: OvsHtmlTagFn
    const thead: OvsHtmlTagFn
    const tbody: OvsHtmlTagFn
    const tfoot: OvsHtmlTagFn
    const tr: OvsHtmlTagFn
    const th: OvsHtmlTagFn
    const td: OvsHtmlTagFn
    const caption: OvsHtmlTagFn
    const colgroup: OvsHtmlTagFn
    const col: OvsHtmlTagFn

    // 表单
    const form: OvsHtmlTagFn
    const input: OvsHtmlTagFn
    const textarea: OvsHtmlTagFn
    const button: OvsHtmlTagFn
    const select: OvsHtmlTagFn
    const option: OvsHtmlTagFn
    const optgroup: OvsHtmlTagFn
    const label: OvsHtmlTagFn
    const fieldset: OvsHtmlTagFn
    const legend: OvsHtmlTagFn

    // 媒体
    const img: OvsHtmlTagFn
    const video: OvsHtmlTagFn
    const audio: OvsHtmlTagFn
    const source: OvsHtmlTagFn
    const track: OvsHtmlTagFn
    const canvas: OvsHtmlTagFn
    const svg: OvsHtmlTagFn

    // 链接
    const a: OvsHtmlTagFn

    // 其他
    const iframe: OvsHtmlTagFn
    const object: OvsHtmlTagFn
    const embed: OvsHtmlTagFn
    const details: OvsHtmlTagFn
    const summary: OvsHtmlTagFn
    const dialog: OvsHtmlTagFn
    const progress: OvsHtmlTagFn
    const meter: OvsHtmlTagFn
    const output: OvsHtmlTagFn

    // 语义化
    const mark: OvsHtmlTagFn
    const time: OvsHtmlTagFn
    const address: OvsHtmlTagFn
    const figure: OvsHtmlTagFn
    const figcaption: OvsHtmlTagFn
    const cite: OvsHtmlTagFn
    const q: OvsHtmlTagFn
    const abbr: OvsHtmlTagFn
    const dfn: OvsHtmlTagFn
    const kbd: OvsHtmlTagFn
    const samp: OvsHtmlTagFn
    // var 是保留字，跳过
    const sup: OvsHtmlTagFn
    const sub: OvsHtmlTagFn
}

