export type OvsCst = any

import { normalizeGeneratedCst } from "cssts-compiler";

declare function __qin_cst_name_of__(cst: any): any
declare function __qin_cst_value_of__(cst: any): any
declare function __qin_cst_children_of__(cst: any): any
declare function __qin_cst_loc_of__(cst: any): any
declare function __qin_collection_to_array__(value: any): any[]
declare function __qin_ast_type_of__(node: any): any

function isDescriptorText(value: any): boolean {
    return typeof value === 'string' && value.startsWith('{__qin_accessor_descriptor=')
}

function toTextValue(value: any): string | undefined {
    if (value === null || value === undefined || isDescriptorText(value)) return undefined
    return '' + value
}

export function cstNameOf(cst: OvsCst | undefined): string | undefined {
    if (cst === null || cst === undefined) return undefined
    return toTextValue(__qin_cst_name_of__(cst))
}

export function cstValueOf(cst: OvsCst | undefined): string | undefined {
    if (cst === null || cst === undefined) return undefined
    return toTextValue(__qin_cst_value_of__(cst))
}

export function toArray<T = any>(value: any): T[] {
    return __qin_collection_to_array__(value) as T[]
}

export function cstChildrenOf(cst: OvsCst | undefined): OvsCst[] {
    if (cst === null || cst === undefined) return []
    return toArray<OvsCst>(__qin_cst_children_of__(cst)).map(child => {
        const astType = __qin_ast_type_of__(child)
        if (astType !== null && astType !== undefined && ('' + astType).length > 0) return child
        return normalizeGeneratedCst(child)
    })
}

export function cstLocOf(cst: OvsCst | undefined): any {
    if (cst === null || cst === undefined) return undefined
    return __qin_cst_loc_of__(cst)
}

export function isCstNamed(cst: OvsCst | undefined, name: string): boolean {
    return cstNameOf(cst) === name
}
