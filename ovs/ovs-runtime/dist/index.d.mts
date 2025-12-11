import * as vue0 from "vue";
import { Component, DefineComponent } from "vue";

//#region src/core.d.ts
interface ReactiveVNodeState {
  type: string | OvsComponent | Component;
  props: Record<string, any>;
  children: any;
}
/**
 * OVS 组件类型
 * 接收 state，返回 Vue 组件
 */
type OvsComponent = (state: ReactiveVNodeState) => DefineComponent<any, any, any>;
declare function mapChildrenToVNodes(children: unknown): any;
/**
 * 定义 OVS 组件
 */
declare function defineOvsComponent(factory: (props: Record<string, any>) => any): vue0.Raw<vue0.DefineSetupFnComponent<Record<string, any>, {}, {}, Record<string, any> & {}, vue0.PublicProps>>;
/**
 * 创建组件 VNode
 */
declare function createComponentVNode(componentFn: OvsComponent | Component, props?: Record<string, any>, children?: any): vue0.Raw<vue0.DefineSetupFnComponent<Record<string, any>, {}, {}, Record<string, any> & {}, vue0.PublicProps>>;
/**
 * 创建元素 VNode
 */
declare function createElementVNode(type: string, props?: Record<string, any>, children?: any): vue0.Raw<vue0.DefineSetupFnComponent<Record<string, any>, {}, {}, Record<string, any> & {}, vue0.PublicProps>>;
//#endregion
//#region src/elements.d.ts
type HtmlElementFactory = (props?: Record<string, any>, children?: any) => DefineComponent<any, any, any>;
/**
 * HTML 标签命名空间
 * 使用方式: $OvsHtmlTag.div({ class: 'x' }, [...])
 */
declare const $OvsHtmlTag: {
  readonly html: HtmlElementFactory;
  readonly head: HtmlElementFactory;
  readonly body: HtmlElementFactory;
  readonly title: HtmlElementFactory;
  readonly meta: HtmlElementFactory;
  readonly link: HtmlElementFactory;
  readonly style: HtmlElementFactory;
  readonly script: HtmlElementFactory;
  readonly div: HtmlElementFactory;
  readonly span: HtmlElementFactory;
  readonly p: HtmlElementFactory;
  readonly section: HtmlElementFactory;
  readonly article: HtmlElementFactory;
  readonly aside: HtmlElementFactory;
  readonly header: HtmlElementFactory;
  readonly footer: HtmlElementFactory;
  readonly nav: HtmlElementFactory;
  readonly main: HtmlElementFactory;
  readonly h1: HtmlElementFactory;
  readonly h2: HtmlElementFactory;
  readonly h3: HtmlElementFactory;
  readonly h4: HtmlElementFactory;
  readonly h5: HtmlElementFactory;
  readonly h6: HtmlElementFactory;
  readonly strong: HtmlElementFactory;
  readonly em: HtmlElementFactory;
  readonly b: HtmlElementFactory;
  readonly i: HtmlElementFactory;
  readonly u: HtmlElementFactory;
  readonly small: HtmlElementFactory;
  readonly code: HtmlElementFactory;
  readonly pre: HtmlElementFactory;
  readonly blockquote: HtmlElementFactory;
  readonly br: HtmlElementFactory;
  readonly hr: HtmlElementFactory;
  readonly ul: HtmlElementFactory;
  readonly ol: HtmlElementFactory;
  readonly li: HtmlElementFactory;
  readonly dl: HtmlElementFactory;
  readonly dt: HtmlElementFactory;
  readonly dd: HtmlElementFactory;
  readonly table: HtmlElementFactory;
  readonly thead: HtmlElementFactory;
  readonly tbody: HtmlElementFactory;
  readonly tfoot: HtmlElementFactory;
  readonly tr: HtmlElementFactory;
  readonly th: HtmlElementFactory;
  readonly td: HtmlElementFactory;
  readonly caption: HtmlElementFactory;
  readonly colgroup: HtmlElementFactory;
  readonly col: HtmlElementFactory;
  readonly form: HtmlElementFactory;
  readonly input: HtmlElementFactory;
  readonly textarea: HtmlElementFactory;
  readonly button: HtmlElementFactory;
  readonly select: HtmlElementFactory;
  readonly option: HtmlElementFactory;
  readonly optgroup: HtmlElementFactory;
  readonly label: HtmlElementFactory;
  readonly fieldset: HtmlElementFactory;
  readonly legend: HtmlElementFactory;
  readonly img: HtmlElementFactory;
  readonly video: HtmlElementFactory;
  readonly audio: HtmlElementFactory;
  readonly source: HtmlElementFactory;
  readonly track: HtmlElementFactory;
  readonly canvas: HtmlElementFactory;
  readonly svg: HtmlElementFactory;
  readonly a: HtmlElementFactory;
  readonly iframe: HtmlElementFactory;
  readonly object: HtmlElementFactory;
  readonly embed: HtmlElementFactory;
  readonly details: HtmlElementFactory;
  readonly summary: HtmlElementFactory;
  readonly dialog: HtmlElementFactory;
  readonly progress: HtmlElementFactory;
  readonly meter: HtmlElementFactory;
  readonly output: HtmlElementFactory;
  readonly mark: HtmlElementFactory;
  readonly time: HtmlElementFactory;
  readonly address: HtmlElementFactory;
  readonly figure: HtmlElementFactory;
  readonly figcaption: HtmlElementFactory;
  readonly cite: HtmlElementFactory;
  readonly q: HtmlElementFactory;
  readonly abbr: HtmlElementFactory;
  readonly dfn: HtmlElementFactory;
  readonly kbd: HtmlElementFactory;
  readonly samp: HtmlElementFactory;
  readonly var: HtmlElementFactory;
  readonly sup: HtmlElementFactory;
  readonly sub: HtmlElementFactory;
};
type OvsHtmlTagFn = typeof $OvsHtmlTag.div;
declare global {
  const html: OvsHtmlTagFn;
  const head: OvsHtmlTagFn;
  const body: OvsHtmlTagFn;
  const title: OvsHtmlTagFn;
  const meta: OvsHtmlTagFn;
  const link: OvsHtmlTagFn;
  const style: OvsHtmlTagFn;
  const script: OvsHtmlTagFn;
  const div: OvsHtmlTagFn;
  const span: OvsHtmlTagFn;
  const p: OvsHtmlTagFn;
  const section: OvsHtmlTagFn;
  const article: OvsHtmlTagFn;
  const aside: OvsHtmlTagFn;
  const header: OvsHtmlTagFn;
  const footer: OvsHtmlTagFn;
  const nav: OvsHtmlTagFn;
  const main: OvsHtmlTagFn;
  const h1: OvsHtmlTagFn;
  const h2: OvsHtmlTagFn;
  const h3: OvsHtmlTagFn;
  const h4: OvsHtmlTagFn;
  const h5: OvsHtmlTagFn;
  const h6: OvsHtmlTagFn;
  const strong: OvsHtmlTagFn;
  const em: OvsHtmlTagFn;
  const b: OvsHtmlTagFn;
  const i: OvsHtmlTagFn;
  const u: OvsHtmlTagFn;
  const small: OvsHtmlTagFn;
  const code: OvsHtmlTagFn;
  const pre: OvsHtmlTagFn;
  const blockquote: OvsHtmlTagFn;
  const br: OvsHtmlTagFn;
  const hr: OvsHtmlTagFn;
  const ul: OvsHtmlTagFn;
  const ol: OvsHtmlTagFn;
  const li: OvsHtmlTagFn;
  const dl: OvsHtmlTagFn;
  const dt: OvsHtmlTagFn;
  const dd: OvsHtmlTagFn;
  const table: OvsHtmlTagFn;
  const thead: OvsHtmlTagFn;
  const tbody: OvsHtmlTagFn;
  const tfoot: OvsHtmlTagFn;
  const tr: OvsHtmlTagFn;
  const th: OvsHtmlTagFn;
  const td: OvsHtmlTagFn;
  const caption: OvsHtmlTagFn;
  const colgroup: OvsHtmlTagFn;
  const col: OvsHtmlTagFn;
  const form: OvsHtmlTagFn;
  const input: OvsHtmlTagFn;
  const textarea: OvsHtmlTagFn;
  const button: OvsHtmlTagFn;
  const select: OvsHtmlTagFn;
  const option: OvsHtmlTagFn;
  const optgroup: OvsHtmlTagFn;
  const label: OvsHtmlTagFn;
  const fieldset: OvsHtmlTagFn;
  const legend: OvsHtmlTagFn;
  const img: OvsHtmlTagFn;
  const video: OvsHtmlTagFn;
  const audio: OvsHtmlTagFn;
  const source: OvsHtmlTagFn;
  const track: OvsHtmlTagFn;
  const canvas: OvsHtmlTagFn;
  const svg: OvsHtmlTagFn;
  const a: OvsHtmlTagFn;
  const iframe: OvsHtmlTagFn;
  const object: OvsHtmlTagFn;
  const embed: OvsHtmlTagFn;
  const details: OvsHtmlTagFn;
  const summary: OvsHtmlTagFn;
  const dialog: OvsHtmlTagFn;
  const progress: OvsHtmlTagFn;
  const meter: OvsHtmlTagFn;
  const output: OvsHtmlTagFn;
  const mark: OvsHtmlTagFn;
  const time: OvsHtmlTagFn;
  const address: OvsHtmlTagFn;
  const figure: OvsHtmlTagFn;
  const figcaption: OvsHtmlTagFn;
  const cite: OvsHtmlTagFn;
  const q: OvsHtmlTagFn;
  const abbr: OvsHtmlTagFn;
  const dfn: OvsHtmlTagFn;
  const kbd: OvsHtmlTagFn;
  const samp: OvsHtmlTagFn;
  const sup: OvsHtmlTagFn;
  const sub: OvsHtmlTagFn;
}
//#endregion
export { $OvsHtmlTag, type OvsComponent, type ReactiveVNodeState, createComponentVNode, createElementVNode, defineOvsComponent, mapChildrenToVNodes };