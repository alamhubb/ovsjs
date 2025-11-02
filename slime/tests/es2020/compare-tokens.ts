// 对比 ES6 和 ES2020 tokens
import { es6Tokens } from '../../packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import { es2020Tokens } from '../../packages/slime-parser/src/language/es2020/Es2020Tokens.ts'

console.log('📊 Tokens 结构对比')
console.log('='.repeat(60))

console.log('\nES6 Tokens:')
console.log(`  总数: ${es6Tokens.length}`)
console.log(`  第一个: ${JSON.stringify(es6Tokens[0], null, 2).substring(0, 200)}`)

console.log('\nES2020 Tokens:')
console.log(`  总数: ${es2020Tokens.length}`)
console.log(`  第一个: ${JSON.stringify(es2020Tokens[0], null, 2).substring(0, 200)}`)
console.log(`  OptionalChaining (索引 3): ${JSON.stringify(es2020Tokens[3], null, 2).substring(0, 200)}`)

// 检查是否有 name 属性
const hasNameES6 = es6Tokens.every(t => t.name !== undefined)
const hasNameES2020 = es2020Tokens.every(t => t.name !== undefined)

console.log('\nname 属性检查:')
console.log(`  ES6 全部有 name: ${hasNameES6}`)
console.log(`  ES2020 全部有 name: ${hasNameES2020}`)

// 找出没有 name 的
const noNameES2020 = es2020Tokens.filter(t => t.name === undefined)
if (noNameES2020.length > 0) {
    console.log(`\n⚠️  ES2020 中有 ${noNameES2020.length} 个 token 没有 name`)
}

