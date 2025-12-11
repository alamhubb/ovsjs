#!/usr/bin/env node
/**
 * 仅打包 VSIX，跳过 vscode:prepublish 编译步骤
 */
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const pkgPath = path.join(__dirname, '../package.json')
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))

// 备份并移除 vscode:prepublish
const prepublish = pkg.scripts['vscode:prepublish']
delete pkg.scripts['vscode:prepublish']

// 临时写入修改后的 package.json
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

try {
  console.log('打包中（跳过编译）...')
  execSync('npx vsce package', { stdio: 'inherit', cwd: path.join(__dirname, '..') })
} finally {
  // 恢复 vscode:prepublish
  pkg.scripts['vscode:prepublish'] = prepublish
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  console.log('已恢复 package.json')
}

