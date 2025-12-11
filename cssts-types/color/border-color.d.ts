/**
 * CSS border-color 属性原子类 - CSS 原生颜色
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface BorderColorAtoms {
  // CSS 基础边框色
  borderRed: StyleObject<'border-red'>
  borderOrange: StyleObject<'border-orange'>
  borderYellow: StyleObject<'border-yellow'>
  borderGreen: StyleObject<'border-green'>
  borderBlue: StyleObject<'border-blue'>
  borderPurple: StyleObject<'border-purple'>
  borderPink: StyleObject<'border-pink'>
  borderCyan: StyleObject<'border-cyan'>
  borderTeal: StyleObject<'border-teal'>
  borderIndigo: StyleObject<'border-indigo'>
  borderViolet: StyleObject<'border-violet'>
  borderFuchsia: StyleObject<'border-fuchsia'>
  borderRose: StyleObject<'border-rose'>
  borderLime: StyleObject<'border-lime'>
  borderEmerald: StyleObject<'border-emerald'>
  borderSky: StyleObject<'border-sky'>
  borderAmber: StyleObject<'border-amber'>
  
  // 中性边框色
  borderWhite: StyleObject<'border-white'>
  borderBlack: StyleObject<'border-black'>
  borderGray: StyleObject<'border-gray'>
  borderSlate: StyleObject<'border-slate'>
  borderZinc: StyleObject<'border-zinc'>
  borderNeutral: StyleObject<'border-neutral'>
  borderStone: StyleObject<'border-stone'>
  
  // 特殊值
  borderTransparent: StyleObject<'border-transparent'>
  borderInherit: StyleObject<'border-inherit'>
  borderCurrent: StyleObject<'border-current'>
}
