import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import spawn from 'cross-spawn'
import { intro, outro, text, confirm, spinner, isCancel, cancel } from '@clack/prompts'
import pc from 'picocolors'

const { red, green, cyan, bold, dim } = pc

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function main() {
  console.log()
  intro(bold(cyan('🚀 Create OVS Project')))

  // 获取命令行参数中的项目名
  let projectName = process.argv[2]

  if (!projectName) {
    const result = await text({
      message: 'Project name:',
      placeholder: 'my-ovs-app',
      defaultValue: 'my-ovs-app',
      validate: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Project name is required'
        }
      }
    })

    if (isCancel(result)) {
      cancel(red('✖') + ' Operation cancelled')
      process.exit(0)
    }
    projectName = result as string
  }

  const targetDir = path.resolve(process.cwd(), projectName)

  // 检查目录是否存在
  if (fs.existsSync(targetDir)) {
    const files = fs.readdirSync(targetDir)
    if (files.length > 0) {
      const shouldOverwrite = await confirm({
        message: `Directory "${projectName}" is not empty. Overwrite?`,
        initialValue: false
      })

      if (isCancel(shouldOverwrite) || !shouldOverwrite) {
        cancel(red('✖') + ' Operation cancelled')
        process.exit(0)
      }
    }
  }

  // Step 1: 调用 create-vue
  const s = spinner()
  s.start('Creating Vue project with create-vue...')

  try {
    await runCreateVue(projectName)
    s.stop('Vue project created successfully!')
  } catch (error) {
    s.stop(red('Failed to create Vue project'))
    console.error(error)
    process.exit(1)
  }

  // Step 2: 注入 OVS 配置
  s.start('Injecting OVS configuration...')

  try {
    await injectOvsConfig(targetDir)
    s.stop('OVS configuration injected!')
  } catch (error) {
    s.stop(red('Failed to inject OVS configuration'))
    console.error(error)
    process.exit(1)
  }

  // 完成
  console.log()
  outro(green('✔ OVS project created successfully!'))

  console.log()
  console.log('Next steps:')
  console.log()
  console.log(`  ${bold(green(`cd ${projectName}`))}`)
  console.log(`  ${bold(green('npm install'))}`)
  console.log(`  ${bold(green('npm run dev'))}`)
  console.log()
  console.log(`${dim('Happy coding with OVS! 🎉')}`)
  console.log()
}

function runCreateVue(projectName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // 使用 npx --yes 自动确认安装，并传递 --default 使用默认配置
    const child = spawn('npx', ['--yes', 'create-vue@latest', projectName, '--default'], {
      stdio: 'inherit'
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`create-vue exited with code ${code}`))
      }
    })

    child.on('error', (err) => {
      reject(err)
    })
  })
}

async function injectOvsConfig(targetDir: string): Promise<void> {
  // 1. 修改 package.json，添加 ovsjs 依赖
  const pkgPath = path.join(targetDir, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  
  pkg.dependencies = pkg.dependencies || {}
  pkg.dependencies['ovsjs'] = '^0.1.8'
  
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

  // 2. 修改 vite.config.ts/js，添加 vitePluginOvs
  const viteConfigTs = path.join(targetDir, 'vite.config.ts')
  const viteConfigJs = path.join(targetDir, 'vite.config.js')
  const viteConfigPath = fs.existsSync(viteConfigTs) ? viteConfigTs : viteConfigJs

  if (fs.existsSync(viteConfigPath)) {
    let content = fs.readFileSync(viteConfigPath, 'utf-8')
    
    // 添加 import
    content = `import vitePluginOvs from 'ovsjs'\n` + content
    
    // 在 plugins 数组中添加 vitePluginOvs()
    content = content.replace(
      /plugins:\s*\[/,
      'plugins: [\n    vitePluginOvs(),'
    )
    
    fs.writeFileSync(viteConfigPath, content)
  }

  // 3. 创建示例 .ovs 文件
  const viewsDir = path.join(targetDir, 'src', 'views')
  if (!fs.existsSync(viewsDir)) {
    fs.mkdirSync(viewsDir, { recursive: true })
  }

  // 复制模板文件
  const templateDir = path.resolve(__dirname, '..', 'template')
  const exampleOvsPath = path.join(templateDir, 'HelloOvs.ovs')
  
  if (fs.existsSync(exampleOvsPath)) {
    fs.copyFileSync(exampleOvsPath, path.join(viewsDir, 'HelloOvs.ovs'))
  } else {
    // 如果模板不存在，直接写入
    const ovsContent = `// HelloOvs.ovs - Your first OVS component
export default class HelloOvs {
  count = 0

  increment() {
    this.count++
  }

  render() {
    return div({ class: 'hello-ovs' }) {
      h1 { 'Hello OVS! 🚀' }
      p { 'Count: ' + this.count }
      button({ onClick: () => this.increment() }) {
        'Click me'
      }
    }
  }
}
`
    fs.writeFileSync(path.join(viewsDir, 'HelloOvs.ovs'), ovsContent)
  }

  // 4. 创建使用示例的说明文件
  const readmePath = path.join(viewsDir, 'README.md')
  const readmeContent = `# OVS Views

This folder contains OVS component files (.ovs).

## Usage

Import and use OVS components in your Vue app:

\`\`\`typescript
import HelloOvs from './views/HelloOvs.ovs'

// In your component
export default {
  setup() {
    return () => HelloOvs.toVnode()
  }
}
\`\`\`

## Learn More

Visit [OVS Documentation](https://github.com/alamhubb/ovsjs) to learn more.
`
  fs.writeFileSync(readmePath, readmeContent)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

