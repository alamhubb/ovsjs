import { vitePluginOvsTransform } from '../src/index.ts'
import fs from 'fs'

const code = fs.readFileSync('create-ovs/template/src/components/HelloWorld.ovs', 'utf-8')

console.log('编译结果:')
console.log(vitePluginOvsTransform(code).code)
