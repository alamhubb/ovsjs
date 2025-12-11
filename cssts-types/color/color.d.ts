/**
 * CSS color 属性原子类 - CSS 原生颜色
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface ColorAtoms {
  // CSS 基础颜色
  colorRed: StyleObject<'color-red'>
  colorOrange: StyleObject<'color-orange'>
  colorYellow: StyleObject<'color-yellow'>
  colorGreen: StyleObject<'color-green'>
  colorBlue: StyleObject<'color-blue'>
  colorPurple: StyleObject<'color-purple'>
  colorPink: StyleObject<'color-pink'>
  colorCyan: StyleObject<'color-cyan'>
  colorTeal: StyleObject<'color-teal'>
  colorIndigo: StyleObject<'color-indigo'>
  colorViolet: StyleObject<'color-violet'>
  colorFuchsia: StyleObject<'color-fuchsia'>
  colorRose: StyleObject<'color-rose'>
  colorLime: StyleObject<'color-lime'>
  colorEmerald: StyleObject<'color-emerald'>
  colorSky: StyleObject<'color-sky'>
  colorAmber: StyleObject<'color-amber'>
  
  // 中性色
  colorWhite: StyleObject<'color-white'>
  colorBlack: StyleObject<'color-black'>
  colorGray: StyleObject<'color-gray'>
  colorSlate: StyleObject<'color-slate'>
  colorZinc: StyleObject<'color-zinc'>
  colorNeutral: StyleObject<'color-neutral'>
  colorStone: StyleObject<'color-stone'>
  
  // 特殊值
  colorTransparent: StyleObject<'color-transparent'>
  colorInherit: StyleObject<'color-inherit'>
  colorCurrent: StyleObject<'color-current'>
}
