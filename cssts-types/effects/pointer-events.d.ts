/**
 * CSS pointer-events 属性原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface PointerEventsAtoms {
  pointerEventsNone: StyleObject<'pointer-events-none'>
  pointerEventsAuto: StyleObject<'pointer-events-auto'>
}
