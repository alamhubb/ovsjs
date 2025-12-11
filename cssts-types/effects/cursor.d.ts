/**
 * CSS cursor 属性原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface CursorAtoms {
  cursorAuto: StyleObject<'cursor-auto'>
  cursorDefault: StyleObject<'cursor-default'>
  cursorPointer: StyleObject<'cursor-pointer'>
  cursorWait: StyleObject<'cursor-wait'>
  cursorText: StyleObject<'cursor-text'>
  cursorMove: StyleObject<'cursor-move'>
  cursorHelp: StyleObject<'cursor-help'>
  cursorNotAllowed: StyleObject<'cursor-not-allowed'>
  cursorNone: StyleObject<'cursor-none'>
  cursorContextMenu: StyleObject<'cursor-context-menu'>
  cursorProgress: StyleObject<'cursor-progress'>
  cursorCell: StyleObject<'cursor-cell'>
  cursorCrosshair: StyleObject<'cursor-crosshair'>
  cursorVerticalText: StyleObject<'cursor-vertical-text'>
  cursorAlias: StyleObject<'cursor-alias'>
  cursorCopy: StyleObject<'cursor-copy'>
  cursorNoDrop: StyleObject<'cursor-no-drop'>
  cursorGrab: StyleObject<'cursor-grab'>
  cursorGrabbing: StyleObject<'cursor-grabbing'>
  cursorAllScroll: StyleObject<'cursor-all-scroll'>
  cursorColResize: StyleObject<'cursor-col-resize'>
  cursorRowResize: StyleObject<'cursor-row-resize'>
  cursorNResize: StyleObject<'cursor-n-resize'>
  cursorEResize: StyleObject<'cursor-e-resize'>
  cursorSResize: StyleObject<'cursor-s-resize'>
  cursorWResize: StyleObject<'cursor-w-resize'>
  cursorNeResize: StyleObject<'cursor-ne-resize'>
  cursorNwResize: StyleObject<'cursor-nw-resize'>
  cursorSeResize: StyleObject<'cursor-se-resize'>
  cursorSwResize: StyleObject<'cursor-sw-resize'>
  cursorEwResize: StyleObject<'cursor-ew-resize'>
  cursorNsResize: StyleObject<'cursor-ns-resize'>
  cursorNeswResize: StyleObject<'cursor-nesw-resize'>
  cursorNwseResize: StyleObject<'cursor-nwse-resize'>
  cursorZoomIn: StyleObject<'cursor-zoom-in'>
  cursorZoomOut: StyleObject<'cursor-zoom-out'>
}
