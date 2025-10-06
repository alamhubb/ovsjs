import {vitePluginOvsTransform} from "ovsjs/src"

const code = `
export const test = {
  render() {
    return div { 
      const abc = true
      if (abc) {
        123
      }
    }
  }
}
`

const res = vitePluginOvsTransform(code)
console.log('code:', res.code)

