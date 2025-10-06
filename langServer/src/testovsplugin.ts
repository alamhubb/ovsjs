import {vitePluginOvsTransform} from "ovsjs/src"

const code = `div{ 
if(true) {
  123
}
}`

const res = vitePluginOvsTransform(code)
console.log('code:', res.code)

