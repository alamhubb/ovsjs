/**
 * CSS text-decoration 属性原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface TextDecorationAtoms {
  underline: StyleObject<'underline'>
  overline: StyleObject<'overline'>
  lineThrough: StyleObject<'line-through'>
  noUnderline: StyleObject<'no-underline'>
}

export interface TextTransformAtoms {
  uppercase: StyleObject<'uppercase'>
  lowercase: StyleObject<'lowercase'>
  capitalize: StyleObject<'capitalize'>
  normalCase: StyleObject<'normal-case'>
}
