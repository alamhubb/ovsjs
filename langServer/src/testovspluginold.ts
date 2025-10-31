import {ovsTransform, vitePluginOvsTransform} from "ovsjs/src";

const code = `
export default (function(){
  const children = [];
  children.push(createComponentVNode(div,{},[createComponentVNode(h1,{},[appName,]),createComponentVNode(p,{},[version,]),]))
  return children})()
`

const res = ovsTransform(code)

console.log(res.code)