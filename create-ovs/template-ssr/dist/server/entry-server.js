import { defineComponent, h, markRaw, reactive, isReactive, isRef, unref, ref, createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
function ensureReactiveProps(obj) {
  return isReactive(obj) ? obj : reactive(obj);
}
function isDefineComponent(value) {
  if (!value || typeof value !== "object") return false;
  const v = value;
  return "render" in v || "setup" in v || v.__isOvsComponent === true;
}
function mapChildrenToVNodes(children) {
  if (children == null) return void 0;
  if (isRef(children)) return mapChildrenToVNodes(unref(children));
  if (Array.isArray(children)) return children.map(mapChildrenToVNodes);
  if (isDefineComponent(children)) return h(children);
  return children;
}
function defineOvsComponent(factory) {
  const component = defineComponent((props) => {
    const result = factory(props);
    if (isDefineComponent(result)) {
      return () => h(result);
    }
    if (typeof result === "function") {
      return result;
    }
    return () => result;
  });
  component.__isOvsComponent = true;
  return markRaw(component);
}
function createElementVNode(type, props = {}, children = null) {
  const component = defineComponent((componentProps) => {
    const state = reactive({
      type,
      props: { ...ensureReactiveProps(props), ...componentProps },
      children
    });
    return () => h(state.type, state.props, mapChildrenToVNodes(state.children));
  });
  component.__isOvsComponent = true;
  return markRaw(component);
}
function createElement(tag) {
  return (props, children) => createElementVNode(tag, props, children);
}
const $OvsHtmlTag = {
  // 文档结构
  html: createElement("html"),
  head: createElement("head"),
  body: createElement("body"),
  title: createElement("title"),
  meta: createElement("meta"),
  link: createElement("link"),
  style: createElement("style"),
  script: createElement("script"),
  // 内容分区
  div: createElement("div"),
  span: createElement("span"),
  p: createElement("p"),
  section: createElement("section"),
  article: createElement("article"),
  aside: createElement("aside"),
  header: createElement("header"),
  footer: createElement("footer"),
  nav: createElement("nav"),
  main: createElement("main"),
  // 标题
  h1: createElement("h1"),
  h2: createElement("h2"),
  h3: createElement("h3"),
  h4: createElement("h4"),
  h5: createElement("h5"),
  h6: createElement("h6"),
  // 文本
  strong: createElement("strong"),
  em: createElement("em"),
  b: createElement("b"),
  i: createElement("i"),
  u: createElement("u"),
  small: createElement("small"),
  code: createElement("code"),
  pre: createElement("pre"),
  blockquote: createElement("blockquote"),
  br: createElement("br"),
  hr: createElement("hr"),
  // 列表
  ul: createElement("ul"),
  ol: createElement("ol"),
  li: createElement("li"),
  dl: createElement("dl"),
  dt: createElement("dt"),
  dd: createElement("dd"),
  // 表格
  table: createElement("table"),
  thead: createElement("thead"),
  tbody: createElement("tbody"),
  tfoot: createElement("tfoot"),
  tr: createElement("tr"),
  th: createElement("th"),
  td: createElement("td"),
  caption: createElement("caption"),
  colgroup: createElement("colgroup"),
  col: createElement("col"),
  // 表单
  form: createElement("form"),
  input: createElement("input"),
  textarea: createElement("textarea"),
  button: createElement("button"),
  select: createElement("select"),
  option: createElement("option"),
  optgroup: createElement("optgroup"),
  label: createElement("label"),
  fieldset: createElement("fieldset"),
  legend: createElement("legend"),
  // 媒体
  img: createElement("img"),
  video: createElement("video"),
  audio: createElement("audio"),
  source: createElement("source"),
  track: createElement("track"),
  canvas: createElement("canvas"),
  svg: createElement("svg"),
  // 链接
  a: createElement("a"),
  // 其他
  iframe: createElement("iframe"),
  object: createElement("object"),
  embed: createElement("embed"),
  details: createElement("details"),
  summary: createElement("summary"),
  dialog: createElement("dialog"),
  progress: createElement("progress"),
  meter: createElement("meter"),
  output: createElement("output"),
  // 语义化
  mark: createElement("mark"),
  time: createElement("time"),
  address: createElement("address"),
  figure: createElement("figure"),
  figcaption: createElement("figcaption"),
  cite: createElement("cite"),
  q: createElement("q"),
  abbr: createElement("abbr"),
  dfn: createElement("dfn"),
  kbd: createElement("kbd"),
  samp: createElement("samp"),
  var: createElement("var"),
  sup: createElement("sup"),
  sub: createElement("sub")
};
const HelloWorld = defineOvsComponent((props) => {
  function CountDisplay(props2) {
    return $OvsHtmlTag.div({ class: "count-display" }, [
      $OvsHtmlTag.span({}, ["Current count: "]),
      $OvsHtmlTag.strong({ style: "color: #42b883; font-size: 24px;" }, [props2.count])
    ]);
  }
  return (function() {
    const children = [];
    children.push($OvsHtmlTag.h3({}, [
      "You've successfully created a project with ",
      $OvsHtmlTag.a({ href: "https://vite.dev/", target: "_blank", rel: "noopener" }, ["Vite"]),
      " + ",
      $OvsHtmlTag.a({ href: "https://vuejs.org/", target: "_blank", rel: "noopener" }, ["Vue 3"]),
      " + ",
      $OvsHtmlTag.a({ href: "https://github.com/alamhubb/ovsjs", target: "_blank", rel: "noopener" }, ["OVS"]),
      "."
    ]));
    const msg = "You did it!";
    let count = ref(0);
    setInterval(() => {
      count.value = count.value + 1;
    }, 1e3);
    children.push($OvsHtmlTag.h1({ class: "green" }, [msg]));
    const countView = $OvsHtmlTag.span({}, [count]);
    children.push(CountDisplay({ count: countView }));
    children.push($OvsHtmlTag.p({ style: "color: #888; font-size: 12px;" }, ["(Click anywhere to reset)"]));
    return $OvsHtmlTag.div({ class: "greetings", onClick() {
      count.value = 0;
    } }, children);
  })();
});
const App = defineOvsComponent(() => {
  return $OvsHtmlTag.div({ class: "app" }, [
    $OvsHtmlTag.header({}, [
      $OvsHtmlTag.img({
        alt: "Vue logo",
        class: "logo",
        src: "/assets/logo.png",
        width: 125,
        height: 125
      }),
      $OvsHtmlTag.div({ class: "wrapper" }, [
        HelloWorld
      ])
    ])
  ]);
});
async function render() {
  const app = createSSRApp(App);
  const html = await renderToString(app);
  return { html };
}
export {
  render
};
//# sourceMappingURL=entry-server.js.map
