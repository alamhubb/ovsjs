import {ovsTransform} from "ovsjs/src";

const code = `createComponentVNode(div,{},[createComponentVNode(...)])
`

const res = ovsTransform(code)

console.log(res.code)