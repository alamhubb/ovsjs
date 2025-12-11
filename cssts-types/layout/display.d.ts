/**
 * CSS display 属性原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface DisplayAtoms {
  block: StyleObject<'block'>
  inlineBlock: StyleObject<'inline-block'>
  inline: StyleObject<'inline'>
  flex: StyleObject<'flex'>
  inlineFlex: StyleObject<'inline-flex'>
  grid: StyleObject<'grid'>
  inlineGrid: StyleObject<'inline-grid'>
  hidden: StyleObject<'hidden'>
  contents: StyleObject<'contents'>
  flowRoot: StyleObject<'flow-root'>
  listItem: StyleObject<'list-item'>
  tableCell: StyleObject<'table-cell'>
  tableRow: StyleObject<'table-row'>
}
