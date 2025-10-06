import {vitePluginOvsTransform} from "ovsjs/src"


Error.stackTraceLimit = 50

const code = `
class a extends b {}
`

const res = vitePluginOvsTransform(code)
console.log('code:', res.code)

