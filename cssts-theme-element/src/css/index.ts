/**
 * CssTs Element Plus Theme - CSS 实现
 * 
 * 使用纯 CSS 字符串生成主题样式
 */

// CSS 变量定义（Element Plus 默认颜色）
export const themeVariables = {
  // Primary 主色
  '--el-color-primary': '#409eff',
  '--el-color-primary-light-3': '#79bbff',
  '--el-color-primary-light-5': '#a0cfff',
  '--el-color-primary-light-7': '#c6e2ff',
  '--el-color-primary-light-8': '#d9ecff',
  '--el-color-primary-light-9': '#ecf5ff',
  '--el-color-primary-dark-2': '#337ecc',
  
  // Success 成功色
  '--el-color-success': '#67c23a',
  '--el-color-success-light-3': '#95d475',
  '--el-color-success-light-5': '#b3e19d',
  '--el-color-success-light-9': '#f0f9eb',
  '--el-color-success-dark-2': '#529b2e',
  
  // Warning 警告色
  '--el-color-warning': '#e6a23c',
  '--el-color-warning-light-3': '#eebe77',
  '--el-color-warning-light-5': '#f3d19e',
  '--el-color-warning-light-9': '#fdf6ec',
  '--el-color-warning-dark-2': '#b88230',
  
  // Danger 危险色
  '--el-color-danger': '#f56c6c',
  '--el-color-danger-light-3': '#f89898',
  '--el-color-danger-light-5': '#fab6b6',
  '--el-color-danger-light-9': '#fef0f0',
  '--el-color-danger-dark-2': '#c45656',
  
  // Info 信息色
  '--el-color-info': '#909399',
  '--el-color-info-light-3': '#b1b3b8',
  '--el-color-info-light-5': '#c8c9cc',
  '--el-color-info-light-9': '#f4f4f5',
  '--el-color-info-dark-2': '#73767a',
  
  // 文字颜色
  '--el-text-color-primary': '#303133',
  '--el-text-color-regular': '#606266',
  '--el-text-color-secondary': '#909399',
  '--el-text-color-placeholder': '#a8abb2',
  '--el-text-color-disabled': '#c0c4cc',
  
  // 边框颜色
  '--el-border-color': '#dcdfe6',
  '--el-border-color-light': '#e4e7ed',
  '--el-border-color-lighter': '#ebeef5',
  '--el-border-color-extra-light': '#f2f6fc',
  '--el-border-color-dark': '#d4d7de',
  
  // 填充颜色
  '--el-fill-color': '#f0f2f5',
  '--el-fill-color-light': '#f5f7fa',
  '--el-fill-color-lighter': '#fafafa',
  '--el-fill-color-extra-light': '#fafcff',
  '--el-fill-color-dark': '#ebedf0',
  '--el-fill-color-blank': '#ffffff',
  
  // 背景颜色
  '--el-bg-color': '#ffffff',
  '--el-bg-color-page': '#f2f3f5',
  '--el-bg-color-overlay': '#ffffff',
}

/**
 * 生成 CSS 变量声明字符串
 */
export function generateCssVariables(variables: Record<string, string> = themeVariables): string {
  return Object.entries(variables)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n  ')
}

/**
 * 生成完整的主题 CSS
 */
export function generateThemeCss(variables: Record<string, string> = themeVariables): string {
  return `:root {
  ${generateCssVariables(variables)}
}

/* ==================== 文字颜色原子类 ==================== */
.color-primary { color: var(--el-color-primary); }
.color-primary-light-3 { color: var(--el-color-primary-light-3); }
.color-primary-light-5 { color: var(--el-color-primary-light-5); }
.color-primary-dark-2 { color: var(--el-color-primary-dark-2); }

.color-success { color: var(--el-color-success); }
.color-success-light-3 { color: var(--el-color-success-light-3); }
.color-success-dark-2 { color: var(--el-color-success-dark-2); }

.color-warning { color: var(--el-color-warning); }
.color-warning-light-3 { color: var(--el-color-warning-light-3); }
.color-warning-dark-2 { color: var(--el-color-warning-dark-2); }

.color-danger { color: var(--el-color-danger); }
.color-danger-light-3 { color: var(--el-color-danger-light-3); }
.color-danger-dark-2 { color: var(--el-color-danger-dark-2); }

.color-info { color: var(--el-color-info); }
.color-info-light-3 { color: var(--el-color-info-light-3); }
.color-info-dark-2 { color: var(--el-color-info-dark-2); }

.color-text-primary { color: var(--el-text-color-primary); }
.color-text-regular { color: var(--el-text-color-regular); }
.color-text-secondary { color: var(--el-text-color-secondary); }
.color-text-placeholder { color: var(--el-text-color-placeholder); }
.color-text-disabled { color: var(--el-text-color-disabled); }
.color-white { color: #ffffff; }

/* ==================== 背景颜色原子类 ==================== */
.bg-primary { background-color: var(--el-color-primary); }
.bg-primary-light-3 { background-color: var(--el-color-primary-light-3); }
.bg-primary-light-5 { background-color: var(--el-color-primary-light-5); }
.bg-primary-light-9 { background-color: var(--el-color-primary-light-9); }
.bg-primary-dark-2 { background-color: var(--el-color-primary-dark-2); }

.bg-success { background-color: var(--el-color-success); }
.bg-success-light-9 { background-color: var(--el-color-success-light-9); }
.bg-success-dark-2 { background-color: var(--el-color-success-dark-2); }

.bg-warning { background-color: var(--el-color-warning); }
.bg-warning-light-9 { background-color: var(--el-color-warning-light-9); }
.bg-warning-dark-2 { background-color: var(--el-color-warning-dark-2); }

.bg-danger { background-color: var(--el-color-danger); }
.bg-danger-light-9 { background-color: var(--el-color-danger-light-9); }
.bg-danger-dark-2 { background-color: var(--el-color-danger-dark-2); }

.bg-info { background-color: var(--el-color-info); }
.bg-info-light-9 { background-color: var(--el-color-info-light-9); }
.bg-info-dark-2 { background-color: var(--el-color-info-dark-2); }

.bg-white { background-color: #ffffff; }
.bg-page { background-color: var(--el-bg-color-page); }
.bg-overlay { background-color: var(--el-bg-color-overlay); }

/* 填充颜色 */
.fill-base { background-color: var(--el-fill-color); }
.fill-light { background-color: var(--el-fill-color-light); }
.fill-lighter { background-color: var(--el-fill-color-lighter); }
.fill-extra-light { background-color: var(--el-fill-color-extra-light); }
.fill-dark { background-color: var(--el-fill-color-dark); }
.fill-blank { background-color: var(--el-fill-color-blank); }

/* ==================== 边框颜色原子类 ==================== */
.border-primary { border-color: var(--el-color-primary); }
.border-primary-light { border-color: var(--el-color-primary-light-5); }
.border-success { border-color: var(--el-color-success); }
.border-warning { border-color: var(--el-color-warning); }
.border-danger { border-color: var(--el-color-danger); }
.border-info { border-color: var(--el-color-info); }

.border-base { border-color: var(--el-border-color); }
.border-light { border-color: var(--el-border-color-light); }
.border-lighter { border-color: var(--el-border-color-lighter); }
.border-extra-light { border-color: var(--el-border-color-extra-light); }
.border-dark { border-color: var(--el-border-color-dark); }
`
}

/**
 * 注入主题 CSS 到页面
 */
export function injectTheme(variables?: Record<string, string>): void {
  if (typeof document === 'undefined') return
  
  const styleId = 'cssts-theme-element'
  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null
  
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = styleId
    document.head.appendChild(styleEl)
  }
  
  styleEl.textContent = generateThemeCss(variables)
}

/**
 * 更新主题变量
 */
export function updateTheme(updates: Partial<typeof themeVariables>): void {
  if (typeof document === 'undefined') return
  
  const root = document.documentElement
  for (const [key, value] of Object.entries(updates)) {
    root.style.setProperty(key, value)
  }
}

export default {
  themeVariables,
  generateCssVariables,
  generateThemeCss,
  injectTheme,
  updateTheme,
}
