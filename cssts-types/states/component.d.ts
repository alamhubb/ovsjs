/**
 * 组件状态原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface ComponentStateAtoms {
  // 按钮变体
  plain: StyleObject<'is-plain'>
  isPlain: StyleObject<'is-plain'>
  round: StyleObject<'is-round'>
  isRound: StyleObject<'is-round'>
  circle: StyleObject<'is-circle'>
  isCircle: StyleObject<'is-circle'>
  text: StyleObject<'is-text'>
  isText: StyleObject<'is-text'>
  link: StyleObject<'is-link'>
  isLink: StyleObject<'is-link'>
  
  // 展开/折叠
  expanded: StyleObject<'is-expanded'>
  isExpanded: StyleObject<'is-expanded'>
  collapsed: StyleObject<'is-collapsed'>
  isCollapsed: StyleObject<'is-collapsed'>
  
  // 可见性
  visible: StyleObject<'is-visible'>
  isVisible: StyleObject<'is-visible'>
  hidden: StyleObject<'is-hidden'>
  isHidden: StyleObject<'is-hidden'>
}

export interface SizeStateAtoms {
  large: StyleObject<'is-large'>
  isLarge: StyleObject<'is-large'>
  small: StyleObject<'is-small'>
  isSmall: StyleObject<'is-small'>
  mini: StyleObject<'is-mini'>
  isMini: StyleObject<'is-mini'>
}

export interface OrientationStateAtoms {
  vertical: StyleObject<'is-vertical'>
  isVertical: StyleObject<'is-vertical'>
  horizontal: StyleObject<'is-horizontal'>
  isHorizontal: StyleObject<'is-horizontal'>
}
