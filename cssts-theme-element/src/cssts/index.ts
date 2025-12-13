/**
 * CssTs Element Plus Theme - CssTs 语法实现
 * 
 * 使用 cssts 原子类语法定义主题样式
 * 这些原子类会被 vite-plugin-cssts 编译转换
 */

// ==================== CSS 变量定义 ====================

/**
 * Element Plus 主题 CSS 变量
 */
export const themeVariables = {
  // Primary 主色
  colorPrimary: '#409eff',
  colorPrimaryLight3: '#79bbff',
  colorPrimaryLight5: '#a0cfff',
  colorPrimaryLight7: '#c6e2ff',
  colorPrimaryLight8: '#d9ecff',
  colorPrimaryLight9: '#ecf5ff',
  colorPrimaryDark2: '#337ecc',
  
  // Success 成功色
  colorSuccess: '#67c23a',
  colorSuccessLight3: '#95d475',
  colorSuccessLight5: '#b3e19d',
  colorSuccessLight9: '#f0f9eb',
  colorSuccessDark2: '#529b2e',
  
  // Warning 警告色
  colorWarning: '#e6a23c',
  colorWarningLight3: '#eebe77',
  colorWarningLight5: '#f3d19e',
  colorWarningLight9: '#fdf6ec',
  colorWarningDark2: '#b88230',
  
  // Danger 危险色
  colorDanger: '#f56c6c',
  colorDangerLight3: '#f89898',
  colorDangerLight5: '#fab6b6',
  colorDangerLight9: '#fef0f0',
  colorDangerDark2: '#c45656',
  
  // Info 信息色
  colorInfo: '#909399',
  colorInfoLight3: '#b1b3b8',
  colorInfoLight5: '#c8c9cc',
  colorInfoLight9: '#f4f4f5',
  colorInfoDark2: '#73767a',
  
  // 文字颜色
  textColorPrimary: '#303133',
  textColorRegular: '#606266',
  textColorSecondary: '#909399',
  textColorPlaceholder: '#a8abb2',
  textColorDisabled: '#c0c4cc',
  
  // 边框颜色
  borderColor: '#dcdfe6',
  borderColorLight: '#e4e7ed',
  borderColorLighter: '#ebeef5',
  borderColorExtraLight: '#f2f6fc',
  borderColorDark: '#d4d7de',
  
  // 填充颜色
  fillColor: '#f0f2f5',
  fillColorLight: '#f5f7fa',
  fillColorLighter: '#fafafa',
  fillColorExtraLight: '#fafcff',
  fillColorDark: '#ebedf0',
  fillColorBlank: '#ffffff',
  
  // 背景颜色
  bgColor: '#ffffff',
  bgColorPage: '#f2f3f5',
  bgColorOverlay: '#ffffff',
}

// ==================== 原子类定义 ====================

/**
 * 文字颜色原子类
 * 
 * 使用方式: css { colorPrimary, colorSuccess }
 */
export const colorAtoms = {
  // Primary 主色
  colorPrimary: { 'color-primary': true },
  colorPrimaryLight3: { 'color-primary-light-3': true },
  colorPrimaryLight5: { 'color-primary-light-5': true },
  colorPrimaryDark2: { 'color-primary-dark-2': true },
  
  // Success 成功色
  colorSuccess: { 'color-success': true },
  colorSuccessLight3: { 'color-success-light-3': true },
  colorSuccessDark2: { 'color-success-dark-2': true },
  
  // Warning 警告色
  colorWarning: { 'color-warning': true },
  colorWarningLight3: { 'color-warning-light-3': true },
  colorWarningDark2: { 'color-warning-dark-2': true },
  
  // Danger 危险色
  colorDanger: { 'color-danger': true },
  colorDangerLight3: { 'color-danger-light-3': true },
  colorDangerDark2: { 'color-danger-dark-2': true },
  
  // Info 信息色
  colorInfo: { 'color-info': true },
  colorInfoLight3: { 'color-info-light-3': true },
  colorInfoDark2: { 'color-info-dark-2': true },
  
  // 文字颜色层级
  colorTextPrimary: { 'color-text-primary': true },
  colorTextRegular: { 'color-text-regular': true },
  colorTextSecondary: { 'color-text-secondary': true },
  colorTextPlaceholder: { 'color-text-placeholder': true },
  colorTextDisabled: { 'color-text-disabled': true },
  
  // 基础颜色
  colorWhite: { 'color-white': true },
  colorBlack: { 'color-black': true },
}

/**
 * 背景颜色原子类
 * 
 * 使用方式: css { bgPrimary, bgSuccess }
 */
export const bgAtoms = {
  // Primary 主色背景
  bgPrimary: { 'bg-primary': true },
  bgPrimaryLight3: { 'bg-primary-light-3': true },
  bgPrimaryLight5: { 'bg-primary-light-5': true },
  bgPrimaryLight9: { 'bg-primary-light-9': true },
  bgPrimaryDark2: { 'bg-primary-dark-2': true },
  
  // Success 成功色背景
  bgSuccess: { 'bg-success': true },
  bgSuccessLight9: { 'bg-success-light-9': true },
  bgSuccessDark2: { 'bg-success-dark-2': true },
  
  // Warning 警告色背景
  bgWarning: { 'bg-warning': true },
  bgWarningLight9: { 'bg-warning-light-9': true },
  bgWarningDark2: { 'bg-warning-dark-2': true },
  
  // Danger 危险色背景
  bgDanger: { 'bg-danger': true },
  bgDangerLight9: { 'bg-danger-light-9': true },
  bgDangerDark2: { 'bg-danger-dark-2': true },
  
  // Info 信息色背景
  bgInfo: { 'bg-info': true },
  bgInfoLight9: { 'bg-info-light-9': true },
  bgInfoDark2: { 'bg-info-dark-2': true },
  
  // 基础背景
  bgWhite: { 'bg-white': true },
  bgBlack: { 'bg-black': true },
  bgPage: { 'bg-page': true },
  bgOverlay: { 'bg-overlay': true },
  
  // 填充颜色
  fillBase: { 'fill-base': true },
  fillLight: { 'fill-light': true },
  fillLighter: { 'fill-lighter': true },
  fillExtraLight: { 'fill-extra-light': true },
  fillDark: { 'fill-dark': true },
  fillBlank: { 'fill-blank': true },
}

/**
 * 边框颜色原子类
 * 
 * 使用方式: css { borderPrimary, borderSuccess }
 */
export const borderAtoms = {
  // 主题边框色
  borderPrimary: { 'border-primary': true },
  borderPrimaryLight: { 'border-primary-light': true },
  borderSuccess: { 'border-success': true },
  borderWarning: { 'border-warning': true },
  borderDanger: { 'border-danger': true },
  borderInfo: { 'border-info': true },
  
  // 层级边框色
  borderBase: { 'border-base': true },
  borderLight: { 'border-light': true },
  borderLighter: { 'border-lighter': true },
  borderExtraLight: { 'border-extra-light': true },
  borderDark: { 'border-dark': true },
}

// ==================== 合并导出 ====================

/**
 * 所有主题原子类
 */
export const themeAtoms = {
  ...colorAtoms,
  ...bgAtoms,
  ...borderAtoms,
}

// ==================== CSS 生成函数 ====================

/**
 * 生成 CSS 变量声明
 */
export function generateCssVariables(): string {
  const vars = themeVariables
  return `:root {
  /* Primary 主色 */
  --el-color-primary: ${vars.colorPrimary};
  --el-color-primary-light-3: ${vars.colorPrimaryLight3};
  --el-color-primary-light-5: ${vars.colorPrimaryLight5};
  --el-color-primary-light-7: ${vars.colorPrimaryLight7};
  --el-color-primary-light-8: ${vars.colorPrimaryLight8};
  --el-color-primary-light-9: ${vars.colorPrimaryLight9};
  --el-color-primary-dark-2: ${vars.colorPrimaryDark2};
  
  /* Success 成功色 */
  --el-color-success: ${vars.colorSuccess};
  --el-color-success-light-3: ${vars.colorSuccessLight3};
  --el-color-success-light-5: ${vars.colorSuccessLight5};
  --el-color-success-light-9: ${vars.colorSuccessLight9};
  --el-color-success-dark-2: ${vars.colorSuccessDark2};
  
  /* Warning 警告色 */
  --el-color-warning: ${vars.colorWarning};
  --el-color-warning-light-3: ${vars.colorWarningLight3};
  --el-color-warning-light-5: ${vars.colorWarningLight5};
  --el-color-warning-light-9: ${vars.colorWarningLight9};
  --el-color-warning-dark-2: ${vars.colorWarningDark2};
  
  /* Danger 危险色 */
  --el-color-danger: ${vars.colorDanger};
  --el-color-danger-light-3: ${vars.colorDangerLight3};
  --el-color-danger-light-5: ${vars.colorDangerLight5};
  --el-color-danger-light-9: ${vars.colorDangerLight9};
  --el-color-danger-dark-2: ${vars.colorDangerDark2};
  
  /* Info 信息色 */
  --el-color-info: ${vars.colorInfo};
  --el-color-info-light-3: ${vars.colorInfoLight3};
  --el-color-info-light-5: ${vars.colorInfoLight5};
  --el-color-info-light-9: ${vars.colorInfoLight9};
  --el-color-info-dark-2: ${vars.colorInfoDark2};
  
  /* 文字颜色 */
  --el-text-color-primary: ${vars.textColorPrimary};
  --el-text-color-regular: ${vars.textColorRegular};
  --el-text-color-secondary: ${vars.textColorSecondary};
  --el-text-color-placeholder: ${vars.textColorPlaceholder};
  --el-text-color-disabled: ${vars.textColorDisabled};
  
  /* 边框颜色 */
  --el-border-color: ${vars.borderColor};
  --el-border-color-light: ${vars.borderColorLight};
  --el-border-color-lighter: ${vars.borderColorLighter};
  --el-border-color-extra-light: ${vars.borderColorExtraLight};
  --el-border-color-dark: ${vars.borderColorDark};
  
  /* 填充颜色 */
  --el-fill-color: ${vars.fillColor};
  --el-fill-color-light: ${vars.fillColorLight};
  --el-fill-color-lighter: ${vars.fillColorLighter};
  --el-fill-color-extra-light: ${vars.fillColorExtraLight};
  --el-fill-color-dark: ${vars.fillColorDark};
  --el-fill-color-blank: ${vars.fillColorBlank};
  
  /* 背景颜色 */
  --el-bg-color: ${vars.bgColor};
  --el-bg-color-page: ${vars.bgColorPage};
  --el-bg-color-overlay: ${vars.bgColorOverlay};
}`
}

/**
 * 生成原子类 CSS
 * 
 * 根据 themeAtoms 中定义的原子类生成对应的 CSS 规则
 */
export function generateAtomsCss(): string {
  const rules: string[] = []
  
  // 文字颜色
  rules.push(`
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
.color-black { color: #000000; }`)

  // 背景颜色
  rules.push(`
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
.bg-black { background-color: #000000; }
.bg-page { background-color: var(--el-bg-color-page); }
.bg-overlay { background-color: var(--el-bg-color-overlay); }

.fill-base { background-color: var(--el-fill-color); }
.fill-light { background-color: var(--el-fill-color-light); }
.fill-lighter { background-color: var(--el-fill-color-lighter); }
.fill-extra-light { background-color: var(--el-fill-color-extra-light); }
.fill-dark { background-color: var(--el-fill-color-dark); }
.fill-blank { background-color: var(--el-fill-color-blank); }`)

  // 边框颜色
  rules.push(`
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
.border-dark { border-color: var(--el-border-color-dark); }`)

  return rules.join('\n')
}

/**
 * 生成完整的主题 CSS（变量 + 原子类）
 */
export function generateThemeCss(): string {
  return generateCssVariables() + '\n' + generateAtomsCss()
}

/**
 * 注入主题到页面
 */
export function injectTheme(): void {
  if (typeof document === 'undefined') return
  
  const styleId = 'cssts-theme-element'
  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null
  
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = styleId
    document.head.appendChild(styleEl)
  }
  
  styleEl.textContent = generateThemeCss()
}

export default {
  themeVariables,
  themeAtoms,
  colorAtoms,
  bgAtoms,
  borderAtoms,
  generateCssVariables,
  generateAtomsCss,
  generateThemeCss,
  injectTheme,
}
