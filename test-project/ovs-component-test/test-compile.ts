import { vitePluginOvsTransform } from '../../ovs/ovs-compiler/src/index.ts'
import fs from 'fs'

const code = fs.readFileSync('test-project/ovs-component-test/src/components/OvsButton.ovs', 'utf-8')

console.log('Input:')
console.log(code)
console.log('\nOutput:')
console.log(vitePluginOvsTransform(code).code)
