/**
 * HTML 元素辅助函数
 * 
 * 为常用的 HTML 标签提供类型提示和自动补全
 * 所有函数都是 createElementVNode 的包装，提供更好的开发体验
 */

import { createElementVNode, type ReactiveVNodeApi } from './ReactiveVNode'

/**
 * 创建 HTML 元素的辅助函数类型
 */
type HtmlElementFactory = (
  props?: Record<string, any>,
  children?: any
) => ReactiveVNodeApi

// ==================== 文档结构标签 ====================
export const html: HtmlElementFactory = (props?, children?) => createElementVNode('html', props, children)
export const head: HtmlElementFactory = (props?, children?) => createElementVNode('head', props, children)
export const body: HtmlElementFactory = (props?, children?) => createElementVNode('body', props, children)
export const title: HtmlElementFactory = (props?, children?) => createElementVNode('title', props, children)
export const meta: HtmlElementFactory = (props?, children?) => createElementVNode('meta', props, children)
export const link: HtmlElementFactory = (props?, children?) => createElementVNode('link', props, children)
export const style: HtmlElementFactory = (props?, children?) => createElementVNode('style', props, children)
export const script: HtmlElementFactory = (props?, children?) => createElementVNode('script', props, children)

// ==================== 内容分区标签 ====================
export const div: HtmlElementFactory = (props?, children?) => createElementVNode('div', props, children)
export const span: HtmlElementFactory = (props?, children?) => createElementVNode('span', props, children)
export const p: HtmlElementFactory = (props?, children?) => createElementVNode('p', props, children)
export const section: HtmlElementFactory = (props?, children?) => createElementVNode('section', props, children)
export const article: HtmlElementFactory = (props?, children?) => createElementVNode('article', props, children)
export const aside: HtmlElementFactory = (props?, children?) => createElementVNode('aside', props, children)
export const header: HtmlElementFactory = (props?, children?) => createElementVNode('header', props, children)
export const footer: HtmlElementFactory = (props?, children?) => createElementVNode('footer', props, children)
export const nav: HtmlElementFactory = (props?, children?) => createElementVNode('nav', props, children)
export const main: HtmlElementFactory = (props?, children?) => createElementVNode('main', props, children)

// ==================== 文本内容标签 ====================
export const h1: HtmlElementFactory = (props?, children?) => createElementVNode('h1', props, children)
export const h2: HtmlElementFactory = (props?, children?) => createElementVNode('h2', props, children)
export const h3: HtmlElementFactory = (props?, children?) => createElementVNode('h3', props, children)
export const h4: HtmlElementFactory = (props?, children?) => createElementVNode('h4', props, children)
export const h5: HtmlElementFactory = (props?, children?) => createElementVNode('h5', props, children)
export const h6: HtmlElementFactory = (props?, children?) => createElementVNode('h6', props, children)
export const strong: HtmlElementFactory = (props?, children?) => createElementVNode('strong', props, children)
export const em: HtmlElementFactory = (props?, children?) => createElementVNode('em', props, children)
export const b: HtmlElementFactory = (props?, children?) => createElementVNode('b', props, children)
export const i: HtmlElementFactory = (props?, children?) => createElementVNode('i', props, children)
export const u: HtmlElementFactory = (props?, children?) => createElementVNode('u', props, children)
export const small: HtmlElementFactory = (props?, children?) => createElementVNode('small', props, children)
export const code: HtmlElementFactory = (props?, children?) => createElementVNode('code', props, children)
export const pre: HtmlElementFactory = (props?, children?) => createElementVNode('pre', props, children)
export const blockquote: HtmlElementFactory = (props?, children?) => createElementVNode('blockquote', props, children)
export const br: HtmlElementFactory = (props?, children?) => createElementVNode('br', props, children)
export const hr: HtmlElementFactory = (props?, children?) => createElementVNode('hr', props, children)

// ==================== 列表标签 ====================
export const ul: HtmlElementFactory = (props?, children?) => createElementVNode('ul', props, children)
export const ol: HtmlElementFactory = (props?, children?) => createElementVNode('ol', props, children)
export const li: HtmlElementFactory = (props?, children?) => createElementVNode('li', props, children)
export const dl: HtmlElementFactory = (props?, children?) => createElementVNode('dl', props, children)
export const dt: HtmlElementFactory = (props?, children?) => createElementVNode('dt', props, children)
export const dd: HtmlElementFactory = (props?, children?) => createElementVNode('dd', props, children)

// ==================== 表格标签 ====================
export const table: HtmlElementFactory = (props?, children?) => createElementVNode('table', props, children)
export const thead: HtmlElementFactory = (props?, children?) => createElementVNode('thead', props, children)
export const tbody: HtmlElementFactory = (props?, children?) => createElementVNode('tbody', props, children)
export const tfoot: HtmlElementFactory = (props?, children?) => createElementVNode('tfoot', props, children)
export const tr: HtmlElementFactory = (props?, children?) => createElementVNode('tr', props, children)
export const th: HtmlElementFactory = (props?, children?) => createElementVNode('th', props, children)
export const td: HtmlElementFactory = (props?, children?) => createElementVNode('td', props, children)
export const caption: HtmlElementFactory = (props?, children?) => createElementVNode('caption', props, children)
export const colgroup: HtmlElementFactory = (props?, children?) => createElementVNode('colgroup', props, children)
export const col: HtmlElementFactory = (props?, children?) => createElementVNode('col', props, children)

// ==================== 表单标签 ====================
export const form: HtmlElementFactory = (props?, children?) => createElementVNode('form', props, children)
export const input: HtmlElementFactory = (props?, children?) => createElementVNode('input', props, children)
export const textarea: HtmlElementFactory = (props?, children?) => createElementVNode('textarea', props, children)
export const button: HtmlElementFactory = (props?, children?) => createElementVNode('button', props, children)
export const select: HtmlElementFactory = (props?, children?) => createElementVNode('select', props, children)
export const option: HtmlElementFactory = (props?, children?) => createElementVNode('option', props, children)
export const optgroup: HtmlElementFactory = (props?, children?) => createElementVNode('optgroup', props, children)
export const label: HtmlElementFactory = (props?, children?) => createElementVNode('label', props, children)
export const fieldset: HtmlElementFactory = (props?, children?) => createElementVNode('fieldset', props, children)
export const legend: HtmlElementFactory = (props?, children?) => createElementVNode('legend', props, children)

// ==================== 媒体标签 ====================
export const img: HtmlElementFactory = (props?, children?) => createElementVNode('img', props, children)
export const video: HtmlElementFactory = (props?, children?) => createElementVNode('video', props, children)
export const audio: HtmlElementFactory = (props?, children?) => createElementVNode('audio', props, children)
export const source: HtmlElementFactory = (props?, children?) => createElementVNode('source', props, children)
export const track: HtmlElementFactory = (props?, children?) => createElementVNode('track', props, children)
export const canvas: HtmlElementFactory = (props?, children?) => createElementVNode('canvas', props, children)
export const svg: HtmlElementFactory = (props?, children?) => createElementVNode('svg', props, children)

// ==================== 链接标签 ====================
export const a: HtmlElementFactory = (props?, children?) => createElementVNode('a', props, children)

// ==================== 其他常用标签 ====================
export const iframe: HtmlElementFactory = (props?, children?) => createElementVNode('iframe', props, children)
export const object: HtmlElementFactory = (props?, children?) => createElementVNode('object', props, children)
export const embed: HtmlElementFactory = (props?, children?) => createElementVNode('embed', props, children)
export const details: HtmlElementFactory = (props?, children?) => createElementVNode('details', props, children)
export const summary: HtmlElementFactory = (props?, children?) => createElementVNode('summary', props, children)
export const dialog: HtmlElementFactory = (props?, children?) => createElementVNode('dialog', props, children)
export const progress: HtmlElementFactory = (props?, children?) => createElementVNode('progress', props, children)
export const meter: HtmlElementFactory = (props?, children?) => createElementVNode('meter', props, children)
export const output: HtmlElementFactory = (props?, children?) => createElementVNode('output', props, children)

// ==================== 语义化标签 ====================
export const mark: HtmlElementFactory = (props?, children?) => createElementVNode('mark', props, children)
export const time: HtmlElementFactory = (props?, children?) => createElementVNode('time', props, children)
export const address: HtmlElementFactory = (props?, children?) => createElementVNode('address', props, children)
export const figure: HtmlElementFactory = (props?, children?) => createElementVNode('figure', props, children)
export const figcaption: HtmlElementFactory = (props?, children?) => createElementVNode('figcaption', props, children)
export const cite: HtmlElementFactory = (props?, children?) => createElementVNode('cite', props, children)
export const q: HtmlElementFactory = (props?, children?) => createElementVNode('q', props, children)
export const abbr: HtmlElementFactory = (props?, children?) => createElementVNode('abbr', props, children)
export const dfn: HtmlElementFactory = (props?, children?) => createElementVNode('dfn', props, children)
export const kbd: HtmlElementFactory = (props?, children?) => createElementVNode('kbd', props, children)
export const samp: HtmlElementFactory = (props?, children?) => createElementVNode('samp', props, children)
export const var_: HtmlElementFactory = (props?, children?) => createElementVNode('var', props, children)
export const sup: HtmlElementFactory = (props?, children?) => createElementVNode('sup', props, children)
export const sub: HtmlElementFactory = (props?, children?) => createElementVNode('sub', props, children)

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


