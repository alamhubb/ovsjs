function javaListToArray<T = any>(list: any): T[] {
    if (!list) return []
    if (Array.isArray(list)) return list as T[]
    if (Array.isArray(list.__items)) return list.__items as T[]
    if (typeof list.size === 'function' && typeof list.get === 'function') {
        const result: T[] = []
        for (let i = 0; i < list.size(); i++) {
            result.push(list.get(i))
        }
        return result
    }
    if (typeof list[Symbol.iterator] === 'function') {
        return Array.from(list) as T[]
    }
    return []
}

function readPosition(position: any): any {
    if (!position) return undefined
    const line = typeof position.getLine === 'function' ? position.getLine() : position.line
    const column = typeof position.getColumn === 'function' ? position.getColumn() : position.column
    const index = typeof position.getIndex === 'function' ? position.getIndex() : position.index
    if (line === undefined || line === null || column === undefined || column === null || index === undefined || index === null) {
        return undefined
    }
    return { line, column, index }
}

function normalizeGeneratedLocation(location: any, value?: string, type?: string): any {
    if (!location) return undefined
    const existingStart = location.start || (typeof location.start === 'function' ? location.start() : undefined)
    const existingEnd = location.end || (typeof location.end === 'function' ? location.end() : undefined)
    const start = readPosition(typeof location.getStart === 'function' ? location.getStart() : existingStart)
    const end = readPosition(typeof location.getEnd === 'function' ? location.getEnd() : existingEnd)
    if (!start || !end) return undefined
    return {
        type: typeof location.getType === 'function' ? location.getType() : (location.type || type),
        value: typeof location.getValue === 'function' ? location.getValue() : (location.value || value),
        newLine: typeof location.getNewLine === 'function' ? location.getNewLine() : location.newLine,
        start,
        end,
        filename: typeof location.getFilename === 'function' ? location.getFilename() : location.filename,
        identifierName: typeof location.getIdentifierName === 'function' ? location.getIdentifierName() : location.identifierName
    }
}

export function normalizeGeneratedToken(token: any): any {
    if (!token || token.__ovsLegacyToken === true) return token
    const tokenName = typeof token.getTokenName === 'function' ? token.getTokenName() : (typeof token.tokenName === 'function' ? token.tokenName() : token.tokenName)
    const tokenValue = typeof token.getTokenValue === 'function' ? token.getTokenValue() : (typeof token.tokenValue === 'function' ? token.tokenValue() : token.tokenValue)
    const rowNum = typeof token.getRowNum === 'function' ? token.getRowNum() : (typeof token.rowNum === 'function' ? token.rowNum() : (token.rowNum ?? token.line))
    const columnStartNum = typeof token.getColumnStartNum === 'function' ? token.getColumnStartNum() : (typeof token.columnStartNum === 'function' ? token.columnStartNum() : (token.columnStartNum ?? token.column))
    const columnEndNum = typeof token.getColumnEndNum === 'function' ? token.getColumnEndNum() : (typeof token.columnEndNum === 'function' ? token.columnEndNum() : token.columnEndNum)
    const index = typeof token.getIndex === 'function' ? token.getIndex() : (typeof token.index === 'function' ? token.index() : (token.index ?? token.codeIndex))
    const hasLineBreakBefore = typeof token.hasLineBreakBefore === 'function'
        ? token.hasLineBreakBefore()
        : (typeof token.getHasLineBreakBefore === 'function' ? token.getHasLineBreakBefore() : token.hasLineBreakBefore)

    Object.defineProperties(token, {
        __ovsLegacyToken: { value: true, configurable: true },
        tokenName: { value: tokenName, configurable: true, writable: true },
        tokenValue: { value: tokenValue, configurable: true, writable: true },
        rowNum: { value: rowNum, configurable: true, writable: true },
        line: { value: rowNum, configurable: true, writable: true },
        columnStartNum: { value: columnStartNum, configurable: true, writable: true },
        column: { value: columnStartNum, configurable: true, writable: true },
        columnEndNum: { value: columnEndNum, configurable: true, writable: true },
        index: { value: index, configurable: true, writable: true },
        codeIndex: { value: index, configurable: true, writable: true },
        hasLineBreakBefore: { value: !!hasLineBreakBefore, configurable: true, writable: true }
    })
    return token
}

export function normalizeGeneratedTokens(tokens: any): any[] {
    return javaListToArray(tokens).map(token => normalizeGeneratedToken(token))
}

export function normalizeGeneratedCst<T = any>(cst: T): T {
    if (!cst || typeof cst !== 'object') return cst
    const node: any = cst
    if (node.__ovsLegacyCst === true) return cst
    const originalGetChildren = typeof node.getChildren === 'function' ? node.getChildren.bind(node) : undefined
    const originalGetChild = typeof node.getChild === 'function' ? node.getChild.bind(node) : undefined
    const originalGetToken = typeof node.getToken === 'function' ? node.getToken.bind(node) : undefined

    Object.defineProperties(node, {
        __ovsLegacyCst: { value: true, configurable: true },
        name: {
            configurable: true,
            enumerable: true,
            get() {
                return typeof node.getName === 'function' ? node.getName() : node.__qin_field_name
            }
        },
        value: {
            configurable: true,
            enumerable: true,
            get() {
                return typeof node.getValue === 'function' ? node.getValue() : node.__qin_field_value
            }
        },
        loc: {
            configurable: true,
            enumerable: true,
            get() {
                const raw = typeof node.getLoc === 'function'
                    ? node.getLoc()
                    : (typeof node.getLocation === 'function' ? node.getLocation() : node.__qin_field_loc)
                return normalizeGeneratedLocation(raw, node.value, node.name)
            }
        },
        children: {
            configurable: true,
            enumerable: true,
            get() {
                const raw = originalGetChildren ? originalGetChildren() : node.__qin_field_children
                return javaListToArray(raw).map(child => normalizeGeneratedCst(child))
            }
        }
    })
    node.getChildren = (name?: string) => {
        const children = node.children
        if (name === undefined) return children
        return children.filter((child: any) => child.name === name)
    }
    node.getChild = (name: string, index = 0) => {
        const child = node.getChildren(name)[index]
        if (child !== undefined) return child
        return originalGetChild ? normalizeGeneratedCst(originalGetChild(name, index)) : undefined
    }
    node.getToken = (tokenName: string) => {
        const token = node.children.find((child: any) => child.name === tokenName && child.value !== undefined && child.value !== null)
        if (token !== undefined) return token
        return originalGetToken ? normalizeGeneratedCst(originalGetToken(tokenName)) : undefined
    }
    node.children.forEach((child: any) => normalizeGeneratedCst(child))
    return cst
}
