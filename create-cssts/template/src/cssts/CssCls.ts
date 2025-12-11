// CssTs 样式对象
// 这个文件手动维护，展示 CssTs 的使用方式
// 在实际项目中，这个文件会由 vite-plugin-cssts 自动生成
//
// 使用方式：
// <div :class="CssCls.primaryButton">  单个样式
// <div :class="{ ...CssCls.card, ...CssCls.textCenter }">  合并多个样式

export const CssCls = {
  // 原子样式 - 每个都是 { 'class-name': true } 格式
  colorRed: { 'color-red': true },
  colorBlue: { 'color-blue': true },
  colorGreen: { 'color-green': true },
  colorWhite: { 'color-white': true },
  
  bgBlue: { 'bg-blue': true },
  bgGreen: { 'bg-green': true },
  bgRed: { 'bg-red': true },
  bgGray: { 'bg-gray': true },
  bgDark: { 'bg-dark': true },
  
  fontBold: { 'font-bold': true },
  fontMedium: { 'font-medium': true },
  fontLarge: { 'font-large': true },
  fontSmall: { 'font-small': true },
  
  marginTop: { 'margin-top': true },
  marginBottom: { 'margin-bottom': true },
  padding: { 'padding': true },
  paddingLarge: { 'padding-large': true },
  
  rounded: { 'rounded': true },
  roundedFull: { 'rounded-full': true },
  border: { 'border': true },
  
  flex: { 'flex': true },
  flexCenter: { 'flex-center': true },
  gap: { 'gap': true },
  
  shadow: { 'shadow': true },
  hoverScale: { 'hover-scale': true },
  transition: { 'transition': true },
  
  textCenter: { 'text-center': true },
  uppercase: { 'uppercase': true },
  
  // 组合样式 - 合并多个原子样式的对象
  buttonBase: { 
    'padding': true, 
    'rounded': true, 
    'font-medium': true, 
    'transition': true, 
    'hover-scale': true 
  },
  primaryButton: { 
    'padding': true, 
    'rounded': true, 
    'font-medium': true, 
    'transition': true, 
    'hover-scale': true, 
    'bg-blue': true, 
    'color-white': true 
  },
  successButton: { 
    'padding': true, 
    'rounded': true, 
    'font-medium': true, 
    'transition': true, 
    'hover-scale': true, 
    'bg-green': true, 
    'color-white': true 
  },
  dangerButton: { 
    'padding': true, 
    'rounded': true, 
    'font-medium': true, 
    'transition': true, 
    'hover-scale': true, 
    'bg-red': true, 
    'color-white': true 
  },
  card: { 
    'bg-gray': true, 
    'rounded': true, 
    'padding': true, 
    'shadow': true 
  },
  title: { 
    'font-bold': true, 
    'font-large': true, 
    'text-center': true, 
    'margin-bottom': true 
  },
  badge: { 
    'padding-large': true, 
    'rounded-full': true, 
    'font-small': true, 
    'uppercase': true 
  },
} as const

export default CssCls

// 类型定义
export type CssClsKey = keyof typeof CssCls
export type CssClsValue = typeof CssCls[CssClsKey]
