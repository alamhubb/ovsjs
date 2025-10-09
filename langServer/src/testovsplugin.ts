import {vitePluginOvsTransform} from "ovsjs/src"


Error.stackTraceLimit = 50

const code = `  div { 
      const abc = true
      if (abc) {
        123
      }
}
`

const res = vitePluginOvsTransform(code)
console.log('code:', res.code)


