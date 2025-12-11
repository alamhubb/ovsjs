import { defineComponent, h, isReactive, isRef, markRaw, reactive, unref } from "vue";

//#region src/core.ts
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
/**
* 定义 OVS 组件
*/
function defineOvsComponent(factory) {
	const component = defineComponent((props) => {
		const result = factory(props);
		if (isDefineComponent(result)) return () => h(result);
		if (typeof result === "function") return result;
		return () => result;
	});
	component.__isOvsComponent = true;
	return markRaw(component);
}
/**
* 创建组件 VNode
*/
function createComponentVNode(componentFn, props = {}, children = null) {
	const component = defineComponent((componentProps) => {
		const state = reactive({
			type: componentFn,
			props: {
				...ensureReactiveProps(props),
				...componentProps
			},
			children
		});
		return () => {
			if (typeof state.type === "function") return h(state.type(state));
			return h(state.type, state.props, mapChildrenToVNodes(state.children));
		};
	});
	component.__isOvsComponent = true;
	return markRaw(component);
}
/**
* 创建元素 VNode
*/
function createElementVNode(type, props = {}, children = null) {
	const component = defineComponent((componentProps) => {
		const state = reactive({
			type,
			props: {
				...ensureReactiveProps(props),
				...componentProps
			},
			children
		});
		return () => h(state.type, state.props, mapChildrenToVNodes(state.children));
	});
	component.__isOvsComponent = true;
	return markRaw(component);
}

//#endregion
//#region src/elements.ts
/**
* HTML 元素命名空间
* 
* 使用 $OvsHtmlTag.div() 避免与用户变量冲突
*/
function createElement(tag) {
	return (props, children) => createElementVNode(tag, props, children);
}
/**
* HTML 标签命名空间
* 使用方式: $OvsHtmlTag.div({ class: 'x' }, [...])
*/
const $OvsHtmlTag = {
	html: createElement("html"),
	head: createElement("head"),
	body: createElement("body"),
	title: createElement("title"),
	meta: createElement("meta"),
	link: createElement("link"),
	style: createElement("style"),
	script: createElement("script"),
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
	h1: createElement("h1"),
	h2: createElement("h2"),
	h3: createElement("h3"),
	h4: createElement("h4"),
	h5: createElement("h5"),
	h6: createElement("h6"),
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
	ul: createElement("ul"),
	ol: createElement("ol"),
	li: createElement("li"),
	dl: createElement("dl"),
	dt: createElement("dt"),
	dd: createElement("dd"),
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
	img: createElement("img"),
	video: createElement("video"),
	audio: createElement("audio"),
	source: createElement("source"),
	track: createElement("track"),
	canvas: createElement("canvas"),
	svg: createElement("svg"),
	a: createElement("a"),
	iframe: createElement("iframe"),
	object: createElement("object"),
	embed: createElement("embed"),
	details: createElement("details"),
	summary: createElement("summary"),
	dialog: createElement("dialog"),
	progress: createElement("progress"),
	meter: createElement("meter"),
	output: createElement("output"),
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

//#endregion
export { $OvsHtmlTag, createComponentVNode, createElementVNode, defineOvsComponent, mapChildrenToVNodes };