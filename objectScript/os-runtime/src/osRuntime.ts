/**
 * ObjectScript 运行时
 *
 * 提供多继承等 ObjectScript 特有功能的运行时支持
 */

// 内部使用的 Symbol keys
const SOURCE_CLASSES_KEY = Symbol.for('__os_source_classes')
const OS_CLASS_KEY = Symbol.for('__os_class')
const getParentKey = (name: string) => Symbol.for(`__os_parent_${name}`)

/**
 * 为类添加 Symbol.hasInstance 支持多继承的 instanceof 检查
 */
function patchHasInstance(TargetClass: Function): void {
  const patchedKey = Symbol.for('__os_hasInstance_patched__')

  if ((TargetClass as any)[patchedKey]) return

  const originalHasInstance = (TargetClass as any)[Symbol.hasInstance]

  Object.defineProperty(TargetClass, Symbol.hasInstance, {
    value: function(instance: any): boolean {
      const sourceClasses = instance?.constructor?.[SOURCE_CLASSES_KEY]
      if (Array.isArray(sourceClasses) && sourceClasses.includes(TargetClass)) {
        return true
      }
      if (originalHasInstance) {
        return originalHasInstance.call(TargetClass, instance)
      }
      return TargetClass.prototype.isPrototypeOf(instance)
    },
    writable: true,
    configurable: true
  })

  ;(TargetClass as any)[patchedKey] = true
}

/**
 * 检查实例是否是指定类的实例（支持多继承）
 */
export function isInstanceOf(instance: any, TargetClass: Function): boolean {
  if (instance instanceof TargetClass) return true

  const sourceClasses = instance?.constructor?.[SOURCE_CLASSES_KEY]
  if (Array.isArray(sourceClasses)) {
    for (const ParentClass of sourceClasses) {
      if (ParentClass === TargetClass) return true
      if (ParentClass.prototype instanceof TargetClass) return true
    }
  }
  return false
}

/**
 * 获取实例的所有父类列表
 *
 * @param instance 实例对象
 * @returns 父类构造函数数组，按继承声明顺序排列
 *
 * @example
 * class A extends B, C { }
 * const a = new A()
 * $osRuntime.getParentClasses(a)  // [B, C]
 */
export function getParentClasses(instance: any): Function[] {
  const sourceClasses = instance?.constructor?.[SOURCE_CLASSES_KEY]
  return Array.isArray(sourceClasses) ? [...sourceClasses] : []
}

/**
 * 获取父类实例（内部存储的委托对象）
 *
 * @param instance 子类实例
 * @param ParentClass 父类构造函数
 * @returns 父类实例，如果不存在则返回 undefined
 */
export function getParentInstance(instance: any, ParentClass: Function): any {
  return instance?.[getParentKey(ParentClass.name)]
}

// ============================================
// Super 调用支持（方案D）
// ============================================

/**
 * 在原型链中查找方法（跳过被多态替换的方法）
 */
function findMethodInPrototypeChain(ParentClass: Function, methodName: string): Function | null {
  let proto = ParentClass.prototype
  while (proto && proto !== Object.prototype) {
    const descriptor = Object.getOwnPropertyDescriptor(proto, methodName)
    if (descriptor && typeof descriptor.value === 'function') {
      return descriptor.value
    }
    proto = Object.getPrototypeOf(proto)
  }
  return null
}

/**
 * 按优先级查找并调用父类方法（调用原型上的原始方法，而非被多态替换的）
 * super.foo() → $osRuntime.superCall(this, 'foo', [])
 */
export function superCall(instance: any, methodName: string, args: any[]): any {
  const sourceClasses = instance.constructor[SOURCE_CLASSES_KEY] || []

  for (const ParentClass of sourceClasses) {
    const parentInstance = instance[getParentKey(ParentClass.name)]
    if (!parentInstance) continue

    // 从原型链查找原始方法（而非被多态替换的）
    const originalMethod = findMethodInPrototypeChain(ParentClass, methodName)
    if (originalMethod) {
      return originalMethod.call(parentInstance, ...args)
    }
  }
  throw new Error(`super.${methodName}() not found in any parent class`)
}

/**
 * 显式指定父类调用方法
 * super.B.foo() → $osRuntime.superCallOn(this, B, 'foo', [])
 */
export function superCallOn(instance: any, ParentClass: Function, methodName: string, args: any[]): any {
  const parentInstance = instance[getParentKey(ParentClass.name)]
  if (!parentInstance) {
    throw new Error(`${ParentClass.name} is not a parent class`)
  }

  // 从原型链查找原始方法
  const originalMethod = findMethodInPrototypeChain(ParentClass, methodName)
  if (!originalMethod) {
    throw new Error(`${ParentClass.name}.${methodName} is not a function`)
  }
  return originalMethod.call(parentInstance, ...args)
}

/**
 * 按优先级查找父类属性
 * super.name → $osRuntime.superGet(this, 'name')
 */
export function superGet(instance: any, propName: string): any {
  const sourceClasses = instance.constructor[SOURCE_CLASSES_KEY] || []

  for (const ParentClass of sourceClasses) {
    const parentInstance = instance[getParentKey(ParentClass.name)]
    if (parentInstance && propName in parentInstance) {
      return parentInstance[propName]
    }
  }
  return undefined
}

/**
 * 显式指定父类访问属性
 * super.B.name → $osRuntime.superGetOn(this, B, 'name')
 */
export function superGetOn(instance: any, ParentClass: Function, propName: string): any {
  const parentInstance = instance[getParentKey(ParentClass.name)]
  if (!parentInstance) {
    throw new Error(`${ParentClass.name} is not a parent class`)
  }
  return parentInstance[propName]
}

/**
 * 按优先级查找并设置父类属性
 * super.name = x → $osRuntime.superSet(this, 'name', x)
 */
export function superSet(instance: any, propName: string, value: any): void {
  const sourceClasses = instance.constructor[SOURCE_CLASSES_KEY] || []

  for (const ParentClass of sourceClasses) {
    const parentInstance = instance[getParentKey(ParentClass.name)]
    if (parentInstance && propName in parentInstance) {
      parentInstance[propName] = value
      return
    }
  }
  // 如果没找到，赋值到第一个父类
  if (sourceClasses.length > 0) {
    const firstParent = instance[getParentKey(sourceClasses[0].name)]
    if (firstParent) firstParent[propName] = value
  }
}

/**
 * 显式指定父类设置属性
 * super.B.name = x → $osRuntime.superSetOn(this, B, 'name', x)
 */
export function superSetOn(instance: any, ParentClass: Function, propName: string, value: any): void {
  const parentInstance = instance[getParentKey(ParentClass.name)]
  if (!parentInstance) {
    throw new Error(`${ParentClass.name} is not a parent class`)
  }
  parentInstance[propName] = value
}

/**
 * 初始化单个父类
 *
 * 在子类构造函数中通过 super.ClassName(args) 调用时使用
 *
 * @param instance 子类实例 (this)
 * @param ParentClass 父类
 * @param args 构造函数参数
 */
export function initParent(instance: any, ParentClass: Function, args: any[]): void {
  // 存储父类列表到子类构造函数，用于 instanceof 检查
  if (!instance.constructor[SOURCE_CLASSES_KEY]) {
    instance.constructor[SOURCE_CLASSES_KEY] = []
  }
  const sourceClasses = instance.constructor[SOURCE_CLASSES_KEY]
  if (!sourceClasses.includes(ParentClass)) {
    sourceClasses.push(ParentClass)
  }

  // 1. 创建父类实例
  const parentInstance = new (ParentClass as any)(...args)

  // 2. 存储父实例（用于 super 调用和 instanceof）
  instance[getParentKey(ParentClass.name)] = parentInstance

  // 3. 为父类添加 Symbol.hasInstance 支持
  patchHasInstance(ParentClass)

  // 4. 遍历完整原型链，创建委托方法（支持继承链）
  let proto = ParentClass.prototype
  while (proto && proto !== Object.prototype) {
    for (const name of Object.getOwnPropertyNames(proto)) {
      if (name === 'constructor') continue
      if (name in instance) {
        // 子类已有该成员，检查是否需要注入多态
        if (typeof instance[name] === 'function') {
          const descriptor = Object.getOwnPropertyDescriptor(proto, name)
          if (descriptor && typeof descriptor.value === 'function') {
            parentInstance[name] = (...a: any[]) => instance[name](...a)
          }
        }
        continue
      }

      const descriptor = Object.getOwnPropertyDescriptor(proto, name)
      if (!descriptor) continue

      if (typeof descriptor.value === 'function') {
        // 方法委托
        instance[name] = (...a: any[]) => parentInstance[name](...a)
      } else if (descriptor.get || descriptor.set) {
        // getter/setter 代理
        Object.defineProperty(instance, name, {
          get: descriptor.get ? () => descriptor.get!.call(parentInstance) : undefined,
          set: descriptor.set ? (v) => descriptor.set!.call(parentInstance, v) : undefined,
          enumerable: descriptor.enumerable,
          configurable: true
        })
      }
    }
    proto = Object.getPrototypeOf(proto)
  }

  // 5. 代理父实例自身属性（字段）
  for (const name of Object.getOwnPropertyNames(parentInstance)) {
    if (name in instance) {
      // 子类覆盖了属性，注入到父实例实现多态
      const ownDesc = Object.getOwnPropertyDescriptor(instance, name)
      if (ownDesc && 'value' in ownDesc) {
        Object.defineProperty(parentInstance, name, {
          get: () => instance[name],
          set: (v) => { instance[name] = v },
          enumerable: true,
          configurable: true
        })
      }
    } else {
      // 代理属性
      Object.defineProperty(instance, name, {
        get: () => parentInstance[name],
        set: (v) => { parentInstance[name] = v },
        enumerable: true,
        configurable: true
      })
    }
  }

  // 6. 代理父实例的 Symbol 属性
  for (const sym of Object.getOwnPropertySymbols(parentInstance)) {
    if (sym.toString().includes('__os_')) continue
    if (sym in instance) continue

    const descriptor = Object.getOwnPropertyDescriptor(parentInstance, sym)
    if (descriptor) {
      if ('value' in descriptor) {
        Object.defineProperty(instance, sym, {
          get: () => parentInstance[sym],
          set: (v) => { parentInstance[sym] = v },
          enumerable: descriptor.enumerable,
          configurable: true
        })
      } else {
        Object.defineProperty(instance, sym, {
          get: descriptor.get ? () => descriptor.get!.call(parentInstance) : undefined,
          set: descriptor.set ? (v) => descriptor.set!.call(parentInstance, v) : undefined,
          enumerable: descriptor.enumerable,
          configurable: true
        })
      }
    }
  }

  // 7. 代理父类的静态成员到子类
  const staticExcludes = ['length', 'name', 'prototype', 'arguments', 'caller']
  for (const name of Object.getOwnPropertyNames(ParentClass)) {
    if (staticExcludes.includes(name)) continue
    if (name in instance.constructor) continue

    const descriptor = Object.getOwnPropertyDescriptor(ParentClass, name)
    if (descriptor) {
      Object.defineProperty(instance.constructor, name, descriptor)
    }
  }

  // 8. 代理父类的静态 Symbol 属性
  for (const sym of Object.getOwnPropertySymbols(ParentClass)) {
    if (sym.toString().includes('__os_')) continue
    if (sym === Symbol.hasInstance) continue
    if (sym in instance.constructor) continue

    const descriptor = Object.getOwnPropertyDescriptor(ParentClass, sym)
    if (descriptor) {
      Object.defineProperty(instance.constructor, sym, descriptor)
    }
  }
}

// ============================================
// object 关键字支持
// ============================================

/**
 * 获取 object 实例对应的类
 *
 * 用于 object 继承 object 的场景：
 *   object Base { }
 *   object Child extends Base { }  // 编译为 extends $osRuntime.getObjectClass(Base)
 *
 * @param target 可能是类或 object 实例
 * @returns 类/构造函数
 */
export function getObjectClass(target: any): Function {
  // 1. 如果是 object 实例，返回其保存的类
  if (target && target[OS_CLASS_KEY]) {
    return target[OS_CLASS_KEY]
  }

  // 2. 如果是函数/类，直接返回
  if (typeof target === 'function') {
    return target
  }

  // 3. 其他情况报错
  throw new Error('Cannot extend: target is not a class or object instance')
}

/**
 * 为 object 实例设置其类引用
 *
 * @param instance object 实例
 * @param OsClass 临时生成的类
 */
export function setObjectClass(instance: any, OsClass: Function): void {
  instance[OS_CLASS_KEY] = OsClass
}

/**
 * ObjectScript 运行时对象
 * 在编译输出中作为 $osRuntime 使用
 */
export const $osRuntime = {
  initParent,
  isInstanceOf,
  // 辅助方法
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
}

export default $osRuntime

