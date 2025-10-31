/**
 * HTML 元素辅助函数
 * 
 * 为常用的 HTML 标签提供类型提示和自动补全
 * 所有函数都是 createReactiveVNode 的包装，提供更好的开发体验
 */

import { createReactiveVNode, type ReactiveVNodeApi } from './ReactiveVNode'

/**
 * 创建 HTML 元素的辅助函数类型
 */
type HtmlElementFactory = (
  props?: Record<string, any>,
  children?: any
) => ReactiveVNodeApi

// ==================== 文档结构标签 ====================
export const html: HtmlElementFactory = (props?, children?) => createReactiveVNode('html', props, children)
export const head: HtmlElementFactory = (props?, children?) => createReactiveVNode('head', props, children)
export const body: HtmlElementFactory = (props?, children?) => createReactiveVNode('body', props, children)
export const title: HtmlElementFactory = (props?, children?) => createReactiveVNode('title', props, children)
export const meta: HtmlElementFactory = (props?, children?) => createReactiveVNode('meta', props, children)
export const link: HtmlElementFactory = (props?, children?) => createReactiveVNode('link', props, children)
export const style: HtmlElementFactory = (props?, children?) => createReactiveVNode('style', props, children)
export const script: HtmlElementFactory = (props?, children?) => createReactiveVNode('script', props, children)

// ==================== 内容分区标签 ====================
export const div: HtmlElementFactory = (props?, children?) => createReactiveVNode('div', props, children)
export const span: HtmlElementFactory = (props?, children?) => createReactiveVNode('span', props, children)
export const p: HtmlElementFactory = (props?, children?) => createReactiveVNode('p', props, children)
export const section: HtmlElementFactory = (props?, children?) => createReactiveVNode('section', props, children)
export const article: HtmlElementFactory = (props?, children?) => createReactiveVNode('article', props, children)
export const aside: HtmlElementFactory = (props?, children?) => createReactiveVNode('aside', props, children)
export const header: HtmlElementFactory = (props?, children?) => createReactiveVNode('header', props, children)
export const footer: HtmlElementFactory = (props?, children?) => createReactiveVNode('footer', props, children)
export const nav: HtmlElementFactory = (props?, children?) => createReactiveVNode('nav', props, children)
export const main: HtmlElementFactory = (props?, children?) => createReactiveVNode('main', props, children)

// ==================== 文本内容标签 ====================
export const h1: HtmlElementFactory = (props?, children?) => createReactiveVNode('h1', props, children)
export const h2: HtmlElementFactory = (props?, children?) => createReactiveVNode('h2', props, children)
export const h3: HtmlElementFactory = (props?, children?) => createReactiveVNode('h3', props, children)
export const h4: HtmlElementFactory = (props?, children?) => createReactiveVNode('h4', props, children)
export const h5: HtmlElementFactory = (props?, children?) => createReactiveVNode('h5', props, children)
export const h6: HtmlElementFactory = (props?, children?) => createReactiveVNode('h6', props, children)
export const strong: HtmlElementFactory = (props?, children?) => createReactiveVNode('strong', props, children)
export const em: HtmlElementFactory = (props?, children?) => createReactiveVNode('em', props, children)
export const b: HtmlElementFactory = (props?, children?) => createReactiveVNode('b', props, children)
export const i: HtmlElementFactory = (props?, children?) => createReactiveVNode('i', props, children)
export const u: HtmlElementFactory = (props?, children?) => createReactiveVNode('u', props, children)
export const small: HtmlElementFactory = (props?, children?) => createReactiveVNode('small', props, children)
export const code: HtmlElementFactory = (props?, children?) => createReactiveVNode('code', props, children)
export const pre: HtmlElementFactory = (props?, children?) => createReactiveVNode('pre', props, children)
export const blockquote: HtmlElementFactory = (props?, children?) => createReactiveVNode('blockquote', props, children)
export const br: HtmlElementFactory = (props?, children?) => createReactiveVNode('br', props, children)
export const hr: HtmlElementFactory = (props?, children?) => createReactiveVNode('hr', props, children)

// ==================== 列表标签 ====================
export const ul: HtmlElementFactory = (props?, children?) => createReactiveVNode('ul', props, children)
export const ol: HtmlElementFactory = (props?, children?) => createReactiveVNode('ol', props, children)
export const li: HtmlElementFactory = (props?, children?) => createReactiveVNode('li', props, children)
export const dl: HtmlElementFactory = (props?, children?) => createReactiveVNode('dl', props, children)
export const dt: HtmlElementFactory = (props?, children?) => createReactiveVNode('dt', props, children)
export const dd: HtmlElementFactory = (props?, children?) => createReactiveVNode('dd', props, children)

// ==================== 表格标签 ====================
export const table: HtmlElementFactory = (props?, children?) => createReactiveVNode('table', props, children)
export const thead: HtmlElementFactory = (props?, children?) => createReactiveVNode('thead', props, children)
export const tbody: HtmlElementFactory = (props?, children?) => createReactiveVNode('tbody', props, children)
export const tfoot: HtmlElementFactory = (props?, children?) => createReactiveVNode('tfoot', props, children)
export const tr: HtmlElementFactory = (props?, children?) => createReactiveVNode('tr', props, children)
export const th: HtmlElementFactory = (props?, children?) => createReactiveVNode('th', props, children)
export const td: HtmlElementFactory = (props?, children?) => createReactiveVNode('td', props, children)
export const caption: HtmlElementFactory = (props?, children?) => createReactiveVNode('caption', props, children)
export const colgroup: HtmlElementFactory = (props?, children?) => createReactiveVNode('colgroup', props, children)
export const col: HtmlElementFactory = (props?, children?) => createReactiveVNode('col', props, children)

// ==================== 表单标签 ====================
export const form: HtmlElementFactory = (props?, children?) => createReactiveVNode('form', props, children)
export const input: HtmlElementFactory = (props?, children?) => createReactiveVNode('input', props, children)
export const textarea: HtmlElementFactory = (props?, children?) => createReactiveVNode('textarea', props, children)
export const button: HtmlElementFactory = (props?, children?) => createReactiveVNode('button', props, children)
export const select: HtmlElementFactory = (props?, children?) => createReactiveVNode('select', props, children)
export const option: HtmlElementFactory = (props?, children?) => createReactiveVNode('option', props, children)
export const optgroup: HtmlElementFactory = (props?, children?) => createReactiveVNode('optgroup', props, children)
export const label: HtmlElementFactory = (props?, children?) => createReactiveVNode('label', props, children)
export const fieldset: HtmlElementFactory = (props?, children?) => createReactiveVNode('fieldset', props, children)
export const legend: HtmlElementFactory = (props?, children?) => createReactiveVNode('legend', props, children)

// ==================== 媒体标签 ====================
export const img: HtmlElementFactory = (props?, children?) => createReactiveVNode('img', props, children)
export const video: HtmlElementFactory = (props?, children?) => createReactiveVNode('video', props, children)
export const audio: HtmlElementFactory = (props?, children?) => createReactiveVNode('audio', props, children)
export const source: HtmlElementFactory = (props?, children?) => createReactiveVNode('source', props, children)
export const track: HtmlElementFactory = (props?, children?) => createReactiveVNode('track', props, children)
export const canvas: HtmlElementFactory = (props?, children?) => createReactiveVNode('canvas', props, children)
export const svg: HtmlElementFactory = (props?, children?) => createReactiveVNode('svg', props, children)

// ==================== 链接标签 ====================
export const a: HtmlElementFactory = (props?, children?) => createReactiveVNode('a', props, children)

// ==================== 其他常用标签 ====================
export const iframe: HtmlElementFactory = (props?, children?) => createReactiveVNode('iframe', props, children)
export const object: HtmlElementFactory = (props?, children?) => createReactiveVNode('object', props, children)
export const embed: HtmlElementFactory = (props?, children?) => createReactiveVNode('embed', props, children)
export const details: HtmlElementFactory = (props?, children?) => createReactiveVNode('details', props, children)
export const summary: HtmlElementFactory = (props?, children?) => createReactiveVNode('summary', props, children)
export const dialog: HtmlElementFactory = (props?, children?) => createReactiveVNode('dialog', props, children)
export const progress: HtmlElementFactory = (props?, children?) => createReactiveVNode('progress', props, children)
export const meter: HtmlElementFactory = (props?, children?) => createReactiveVNode('meter', props, children)
export const output: HtmlElementFactory = (props?, children?) => createReactiveVNode('output', props, children)

// ==================== 语义化标签 ====================
export const mark: HtmlElementFactory = (props?, children?) => createReactiveVNode('mark', props, children)
export const time: HtmlElementFactory = (props?, children?) => createReactiveVNode('time', props, children)
export const address: HtmlElementFactory = (props?, children?) => createReactiveVNode('address', props, children)
export const figure: HtmlElementFactory = (props?, children?) => createReactiveVNode('figure', props, children)
export const figcaption: HtmlElementFactory = (props?, children?) => createReactiveVNode('figcaption', props, children)
export const cite: HtmlElementFactory = (props?, children?) => createReactiveVNode('cite', props, children)
export const q: HtmlElementFactory = (props?, children?) => createReactiveVNode('q', props, children)
export const abbr: HtmlElementFactory = (props?, children?) => createReactiveVNode('abbr', props, children)
export const dfn: HtmlElementFactory = (props?, children?) => createReactiveVNode('dfn', props, children)
export const kbd: HtmlElementFactory = (props?, children?) => createReactiveVNode('kbd', props, children)
export const samp: HtmlElementFactory = (props?, children?) => createReactiveVNode('samp', props, children)
export const var_: HtmlElementFactory = (props?, children?) => createReactiveVNode('var', props, children)
export const sup: HtmlElementFactory = (props?, children?) => createReactiveVNode('sup', props, children)
export const sub: HtmlElementFactory = (props?, children?) => createReactiveVNode('sub', props, children)

// ==================== 导出所有标签 ====================
/**
 * 所有 HTML 标签的辅助函数
 * 
 * 使用示例：
 * ```typescript
 * import { div, p, span } from './utils/htmlElements'
 * 
 * const view = div({ class: 'container' }, [
 *   p({}, 'Hello'),
 *   span({}, 'World')
 * ])
 * ```
 */
export const htmlElements = {
  // 文档结构
  html,
  head,
  body,
  title,
  meta,
  link,
  style,
  script,
  
  // 内容分区
  div,
  span,
  p,
  section,
  article,
  aside,
  header,
  footer,
  nav,
  main,
  
  // 文本内容
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  strong,
  em,
  b,
  i,
  u,
  small,
  code,
  pre,
  blockquote,
  br,
  hr,
  
  // 列表
  ul,
  ol,
  li,
  dl,
  dt,
  dd,
  
  // 表格
  table,
  thead,
  tbody,
  tfoot,
  tr,
  th,
  td,
  caption,
  colgroup,
  col,
  
  // 表单
  form,
  input,
  textarea,
  button,
  select,
  option,
  optgroup,
  label,
  fieldset,
  legend,
  
  // 媒体
  img,
  video,
  audio,
  source,
  track,
  canvas,
  svg,
  
  // 链接
  a,
  
  // 其他
  iframe,
  object,
  embed,
  details,
  summary,
  dialog,
  progress,
  meter,
  output,
  
  // 语义化
  mark,
  time,
  address,
  figure,
  figcaption,
  cite,
  q,
  abbr,
  dfn,
  kbd,
  samp,
  var: var_,
  sup,
  sub,
} as const


