/**
 * ObjectScript 运行时
 *
 * 提供多继承和 object 关键字的运行时支持
 *
 * @example
 * ```typescript
 * import { $osRuntime } from 'osjs'
 *
 * // 多继承支持
 * class A extends B, C {
 *   constructor() {
 *     $osRuntime.initParent(this, B, [args])
 *     $osRuntime.initParent(this, C, [args])
 *   }
 * }
 *
 * // object 关键字支持
 * object Config {
 *   name = "MyApp"
 * }
 * ```
 */

// 导出运行时核心函数
export {
  $osRuntime,
  // 多继承函数
  initParent,
  isInstanceOf,
  getParentClasses,
  getParentInstance,
  // super 调用支持
  superCall,
  superCallOn,
  superGet,
  superGetOn,
  superSet,
  superSetOn,
  // object 关键字支持
  getObjectClass,
  setObjectClass
} from './osRuntime.ts'

export { $osRuntime as default } from './osRuntime.ts'

