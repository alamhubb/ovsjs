/**
 * CSS background-color 属性原子类 - CSS 原生颜色
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface BackgroundColorAtoms {
  // CSS 基础背景色
  bgRed: StyleObject<'bg-red'>
  bgOrange: StyleObject<'bg-orange'>
  bgYellow: StyleObject<'bg-yellow'>
  bgGreen: StyleObject<'bg-green'>
  bgBlue: StyleObject<'bg-blue'>
  bgPurple: StyleObject<'bg-purple'>
  bgPink: StyleObject<'bg-pink'>
  bgCyan: StyleObject<'bg-cyan'>
  bgTeal: StyleObject<'bg-teal'>
  bgIndigo: StyleObject<'bg-indigo'>
  bgViolet: StyleObject<'bg-violet'>
  bgFuchsia: StyleObject<'bg-fuchsia'>
  bgRose: StyleObject<'bg-rose'>
  bgLime: StyleObject<'bg-lime'>
  bgEmerald: StyleObject<'bg-emerald'>
  bgSky: StyleObject<'bg-sky'>
  bgAmber: StyleObject<'bg-amber'>
  
  // 中性背景色
  bgWhite: StyleObject<'bg-white'>
  bgBlack: StyleObject<'bg-black'>
  bgGray: StyleObject<'bg-gray'>
  bgSlate: StyleObject<'bg-slate'>
  bgZinc: StyleObject<'bg-zinc'>
  bgNeutral: StyleObject<'bg-neutral'>
  bgStone: StyleObject<'bg-stone'>
  
  // 特殊值
  bgTransparent: StyleObject<'bg-transparent'>
  bgInherit: StyleObject<'bg-inherit'>
  bgCurrent: StyleObject<'bg-current'>
}
