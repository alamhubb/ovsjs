/**
 * State Atomic Styles Type Definitions
 * 
 * 基于 Element Plus 组件状态系统
 */

/** Style object type */
type StyleObject<K extends string> = { [key in K]: true }

/** State Atoms Interface */
export interface StateAtoms {
  // ==================== 基础状态 ====================
  // Disabled state
  disabled: StyleObject<'is-disabled'>
  isDisabled: StyleObject<'is-disabled'>
  
  // Loading state
  loading: StyleObject<'is-loading'>
  isLoading: StyleObject<'is-loading'>
  
  // Active state
  active: StyleObject<'is-active'>
  isActive: StyleObject<'is-active'>
  
  // Focus state
  focus: StyleObject<'is-focus'>
  isFocus: StyleObject<'is-focus'>
  
  // Hover state
  hover: StyleObject<'is-hover'>
  isHover: StyleObject<'is-hover'>
  
  // Selected state
  selected: StyleObject<'is-selected'>
  isSelected: StyleObject<'is-selected'>
  
  // Checked state
  checked: StyleObject<'is-checked'>
  isChecked: StyleObject<'is-checked'>
  
  // Indeterminate state (checkbox)
  indeterminate: StyleObject<'is-indeterminate'>
  isIndeterminate: StyleObject<'is-indeterminate'>
  
  // ==================== 验证状态 ====================
  // Error state
  error: StyleObject<'is-error'>
  isError: StyleObject<'is-error'>
  
  // Success state
  success: StyleObject<'is-success'>
  isSuccess: StyleObject<'is-success'>
  
  // Warning state
  warning: StyleObject<'is-warning'>
  isWarning: StyleObject<'is-warning'>
  
  // Validating state
  validating: StyleObject<'is-validating'>
  isValidating: StyleObject<'is-validating'>
  
  // ==================== 按钮变体 ====================
  // Plain variant
  plain: StyleObject<'is-plain'>
  isPlain: StyleObject<'is-plain'>
  
  // Round variant
  round: StyleObject<'is-round'>
  isRound: StyleObject<'is-round'>
  
  // Circle variant
  circle: StyleObject<'is-circle'>
  isCircle: StyleObject<'is-circle'>
  
  // Text variant
  text: StyleObject<'is-text'>
  isText: StyleObject<'is-text'>
  
  // Link variant
  link: StyleObject<'is-link'>
  isLink: StyleObject<'is-link'>
  
  // Has background (text button)
  hasBg: StyleObject<'is-has-bg'>
  isHasBg: StyleObject<'is-has-bg'>
  
  // ==================== 展开/收起状态 ====================
  // Expanded state
  expanded: StyleObject<'is-expanded'>
  isExpanded: StyleObject<'is-expanded'>
  
  // Collapsed state
  collapsed: StyleObject<'is-collapsed'>
  isCollapsed: StyleObject<'is-collapsed'>
  
  // Opened state
  opened: StyleObject<'is-opened'>
  isOpened: StyleObject<'is-opened'>
  
  // Closed state
  closed: StyleObject<'is-closed'>
  isClosed: StyleObject<'is-closed'>
  
  // ==================== 可见性状态 ====================
  // Visible state
  visible: StyleObject<'is-visible'>
  isVisible: StyleObject<'is-visible'>
  
  // Hidden state
  hidden: StyleObject<'is-hidden'>
  isHidden: StyleObject<'is-hidden'>
  
  // ==================== 输入框状态 ====================
  // Exceed state (word limit exceeded)
  exceed: StyleObject<'is-exceed'>
  isExceed: StyleObject<'is-exceed'>
  
  // Readonly state
  readonly: StyleObject<'is-readonly'>
  isReadonly: StyleObject<'is-readonly'>
  
  // Clearable state
  clearable: StyleObject<'is-clearable'>
  isClearable: StyleObject<'is-clearable'>
  
  // ==================== 表格/列表状态 ====================
  // Current row
  current: StyleObject<'is-current'>
  isCurrent: StyleObject<'is-current'>
  
  // Striped
  striped: StyleObject<'is-striped'>
  isStriped: StyleObject<'is-striped'>
  
  // Bordered
  bordered: StyleObject<'is-bordered'>
  isBordered: StyleObject<'is-bordered'>
  
  // ==================== 树形状态 ====================
  // Leaf node
  leaf: StyleObject<'is-leaf'>
  isLeaf: StyleObject<'is-leaf'>
  
  // Dragging state
  dragging: StyleObject<'is-dragging'>
  isDragging: StyleObject<'is-dragging'>
  
  // Drop inner
  dropInner: StyleObject<'is-drop-inner'>
  isDropInner: StyleObject<'is-drop-inner'>
  
  // ==================== 方向状态 ====================
  // Reverse
  reverse: StyleObject<'is-reverse'>
  isReverse: StyleObject<'is-reverse'>
  
  // Vertical
  vertical: StyleObject<'is-vertical'>
  isVertical: StyleObject<'is-vertical'>
  
  // Horizontal
  horizontal: StyleObject<'is-horizontal'>
  isHorizontal: StyleObject<'is-horizontal'>
  
  // ==================== 尺寸状态 ====================
  // Large size
  large: StyleObject<'is-large'>
  isLarge: StyleObject<'is-large'>
  
  // Default size
  default: StyleObject<'is-default'>
  isDefault: StyleObject<'is-default'>
  
  // Small size
  small: StyleObject<'is-small'>
  isSmall: StyleObject<'is-small'>
  
  // ==================== 其他状态 ====================
  // First
  first: StyleObject<'is-first'>
  isFirst: StyleObject<'is-first'>
  
  // Last
  last: StyleObject<'is-last'>
  isLast: StyleObject<'is-last'>
  
  // Empty
  empty: StyleObject<'is-empty'>
  isEmpty: StyleObject<'is-empty'>
  
  // Required
  required: StyleObject<'is-required'>
  isRequired: StyleObject<'is-required'>
  
  // Optional
  optional: StyleObject<'is-optional'>
  isOptional: StyleObject<'is-optional'>
}
