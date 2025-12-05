import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as readline from 'node:readline'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 颜色输出
const green = (text: string) => `\x1b[32m${text}\x1b[0m`
const cyan = (text: string) => `\x1b[36m${text}\x1b[0m`
const bold = (text: string) => `\x1b[1m${text}\x1b[0m`
const dim = (text: string) => `\x1b[2m${text}\x1b[0m`

async function main() {
  console.log()
  console.log(cyan('┌  ') + bold('OVS - A declarative UI syntax without JSX'))
  console.log(cyan('│'))

  // 获取项目名
  let projectName = process.argv[2]

  if (!projectName) {
    projectName = await prompt('│  Project name: ', 'my-ovs-app')
  }

  const targetDir = path.resolve(process.cwd(), projectName)

  // 检查目录是否存在
  if (fs.existsSync(targetDir)) {
    const files = fs.readdirSync(targetDir)
    if (files.length > 0) {
      const overwrite = await promptConfirm(`│  Directory "${projectName}" is not empty. Overwrite?`)
      if (!overwrite) {
        console.log(cyan('│'))
        console.log(cyan('└  ') + 'Operation cancelled')
        process.exit(0)
      }
      // 清空目录
      fs.rmSync(targetDir, { recursive: true, force: true })
    }
  }

  console.log(cyan('│'))
  console.log(cyan('│  ') + `Scaffolding project in ${targetDir}...`)

  // 复制模板
  const templateDir = path.resolve(__dirname, '..', 'template')
  copyDir(templateDir, targetDir)

  // 修改 package.json 中的项目名
  const pkgPath = path.join(targetDir, 'package.json')
  let pkgContent = fs.readFileSync(pkgPath, 'utf-8')
  pkgContent = pkgContent.replace('{{projectName}}', projectName)
  fs.writeFileSync(pkgPath, pkgContent)

  console.log(cyan('│'))
  console.log(cyan('└  ') + green('Done!') + ' Now run:')
  console.log()
  console.log(`   ${bold(green(`cd ${projectName}`))}`)
  console.log(`   ${bold(green('npm install'))}`)
  console.log(`   ${bold(green('npm run dev'))}`)
  console.log()
}

function prompt(message: string, defaultValue: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question(message + dim(`(${defaultValue}) `), (answer) => {
      rl.close()
      resolve(answer.trim() || defaultValue)
    })
  })
}

function promptConfirm(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question(message + dim(' (y/N) '), (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'y')
    })
  })
}

function copyDir(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true })

  for (const file of fs.readdirSync(src)) {
    const srcPath = path.join(src, file)
    const destPath = path.join(dest, file)

    const stat = fs.statSync(srcPath)
    if (stat.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

