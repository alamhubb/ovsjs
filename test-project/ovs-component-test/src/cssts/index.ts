/**
 * CssTs Runtime
 * 
 * 提供原子类名生成功能，支持可配置前缀
 */

// 配置：类名前缀（可通过 vite.config.ts 注入）
export const config = {
  prefix: ''  // 默认无前缀，可改为 'el-' 等
}

/**
 * 驼峰转 kebab-case
 * bgPrimary → bg-primary
 */
function camelToKebab(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * 生成带前缀的类名
 * cls('bgPrimary', 'colorWhite') → 'bg-primary color-white'
 * cls('bgPrimary', 'colorWhite') with prefix 'el-' → 'el-bg-primary el-color-white'
 */
export function cls(...atoms: string[]): string {
  return atoms
    .map(atom => config.prefix + camelToKebab(atom))
    .join(' ')
}

/**
 * 设置类名前缀
 */
export function setPrefix(prefix: string) {
  config.prefix = prefix
}

/**
 * 预定义的原子类对象
 * 用于 :class 绑定
 */
export const atoms = {
  // Layout
  get inlineFlex() { return { [config.prefix + 'inline-flex']: true } },
  get flex() { return { [config.prefix + 'flex']: true } },
  get itemsCenter() { return { [config.prefix + 'items-center']: true } },
  get justifyCenter() { return { [config.prefix + 'justify-center']: true } },
  
  // Spacing
  get paddingSm() { return { [config.prefix + 'padding-sm']: true } },
  get paddingMd() { return { [config.prefix + 'padding-md']: true } },
  
  // Typography
  get fontMedium() { return { [config.prefix + 'font-medium']: true } },
  
  // Colors
  get colorWhite() { return { [config.prefix + 'color-white']: true } },
  get colorBlack() { return { [config.prefix + 'color-black']: true } },
  get bgPrimary() { return { [config.prefix + 'bg-primary']: true } },
  get bgSuccess() { return { [config.prefix + 'bg-success']: true } },
  get bgWarning() { return { [config.prefix + 'bg-warning']: true } },
  get bgDanger() { return { [config.prefix + 'bg-danger']: true } },
  get bgWhite() { return { [config.prefix + 'bg-white']: true } },
  
  // Border
  get border() { return { [config.prefix + 'border']: true } },
  get borderBase() { return { [config.prefix + 'border-base']: true } },
  get rounded() { return { [config.prefix + 'rounded']: true } },
  
  // Effects
  get cursorPointer() { return { [config.prefix + 'cursor-pointer']: true } },
  get transition() { return { [config.prefix + 'transition']: true } },
}

export default { cls, setPrefix, atoms, config }
