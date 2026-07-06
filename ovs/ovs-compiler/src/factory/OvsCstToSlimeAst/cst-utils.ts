import type { SubhutiCst } from "subhuti"

export function cstNameOf(cst: SubhutiCst | undefined): string | undefined {
    if (!cst) return undefined
    return typeof (cst as any).getName === 'function' ? (cst as any).getName() : (cst as any).name
}

export function toArray<T = any>(value: any): T[] {
    if (!value) return []
    if (Array.isArray(value)) return value as T[]
    if (Array.isArray(value.__items)) return value.__items as T[]
    if (typeof value.size === 'function' && typeof value.get === 'function') {
        const result: T[] = []
        for (let i = 0; i < value.size(); i++) {
            result.push(value.get(i))
        }
        return result
    }
    if (typeof value.size === 'number' && typeof value.get === 'function') {
        const result: T[] = []
        for (let i = 0; i < value.size; i++) {
            result.push(value.get(i))
        }
        return result
    }
    if (typeof value.length === 'number') {
        const result: T[] = []
        for (let i = 0; i < value.length; i++) {
            result.push(value[i])
        }
        return result
    }
    if (typeof value[Symbol.iterator] === 'function') {
        return Array.from(value) as T[]
    }
    return []
}

export function cstChildrenOf(cst: SubhutiCst | undefined): SubhutiCst[] {
    if (!cst) return []
    const children = typeof (cst as any).getChildren === 'function'
        ? (cst as any).getChildren()
        : (cst as any).children
    return toArray<SubhutiCst>(children)
}

export function isCstNamed(cst: SubhutiCst | undefined, name: string): boolean {
    return cstNameOf(cst) === name
}
