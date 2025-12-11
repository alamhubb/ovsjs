/**
 * CSS white-space 属性原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface WhiteSpaceAtoms {
  whitespaceNormal: StyleObject<'whitespace-normal'>
  whitespaceNowrap: StyleObject<'whitespace-nowrap'>
  whitespacePre: StyleObject<'whitespace-pre'>
  whitespacePreLine: StyleObject<'whitespace-pre-line'>
  whitespacePreWrap: StyleObject<'whitespace-pre-wrap'>
  whitespaceBreakSpaces: StyleObject<'whitespace-break-spaces'>
}

export interface TextOverflowAtoms {
  truncate: StyleObject<'truncate'>
  textEllipsis: StyleObject<'text-ellipsis'>
  textClip: StyleObject<'text-clip'>
}

export interface WordBreakAtoms {
  breakNormal: StyleObject<'break-normal'>
  breakWords: StyleObject<'break-words'>
  breakAll: StyleObject<'break-all'>
  breakKeep: StyleObject<'break-keep'>
}
