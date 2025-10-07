import {vitePluginOvsTransform} from "ovsjs/src"


Error.stackTraceLimit = 50

const code = `
object a {}
`

const res = vitePluginOvsTransform(code)
console.log('code:', res.code)

