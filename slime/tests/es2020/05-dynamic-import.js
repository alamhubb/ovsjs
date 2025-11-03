// ES2020 Test 05: Dynamic Import (import())
// 规范：ES2020 §2.9

// ============================================
// 基础动态导入
// ============================================

// 动态导入返回 Promise
const module1 = import('./module.js')

// 使用 await
const module2 = await import('./utils.js')

// 使用 .then()
import('./helper.js').then(module => {
  module.doSomething()
})

// ============================================
// 变量路径
// ============================================

// 路径可以是变量
const modulePath = './dynamic.js'
const module3 = import(modulePath)

// 路径可以是表达式
const env = 'production'
const module4 = import(`./config-${env}.js`)

// 条件路径
const path = condition ? './module-a.js' : './module-b.js'
const module5 = import(path)

// ============================================
// 条件导入
// ============================================

// 按需加载
if (needFeature) {
  const feature = await import('./feature.js')
  feature.initialize()
}

// 用户交互触发
button.addEventListener('click', async () => {
  const module = await import('./heavy-module.js')
  module.render()
})

// ============================================
// 解构导入
// ============================================

// 导入特定成员
const { helper, util } = await import('./utils.js')

// 导入默认导出
const { default: Component } = await import('./Component.js')

// 混合导入
const { default: React, useState, useEffect } = await import('react')

// ============================================
// 错误处理
// ============================================

// try-catch
try {
  const module = await import('./maybe-not-exist.js')
} catch (error) {
  console.error('Failed to load module:', error)
}

// .catch()
import('./module.js')
  .then(module => module.run())
  .catch(error => console.error(error))

// ============================================
// 与 import.meta 结合
// ============================================

// 相对于当前模块的路径
const relative = import(new URL('./relative.js', import.meta.url))

// ============================================
// 实际应用场景
// ============================================

// 1. 代码分割（路由懒加载）
const routes = {
  '/home': () => import('./pages/Home.js'),
  '/about': () => import('./pages/About.js'),
  '/contact': () => import('./pages/Contact.js')
}

async function navigate(path) {
  const loader = routes[path]
  if (loader) {
    const page = await loader()
    page.render()
  }
}

// 2. 国际化（i18n）
async function loadLanguage(lang) {
  const messages = await import(`./i18n/${lang}.js`)
  return messages.default
}

// 3. 主题切换
async function loadTheme(themeName) {
  const theme = await import(`./themes/${themeName}.js`)
  document.body.className = theme.default.className
}

// 4. 功能降级
async function loadPolyfill() {
  if (!window.Promise) {
    await import('./polyfills/promise.js')
  }
  if (!window.fetch) {
    await import('./polyfills/fetch.js')
  }
}

// 5. 微前端
async function loadMicroApp(appName) {
  const app = await import(`https://cdn.example.com/${appName}/main.js`)
  return app.bootstrap()
}

console.log('✅ Dynamic Import tests passed')














