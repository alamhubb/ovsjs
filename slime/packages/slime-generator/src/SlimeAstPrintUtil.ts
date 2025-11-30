export default class SlimeAstPrintUtil {

    /**
     * 格式化 AST 为树形结构字符串
     *
     * @param ast - AST 节点
     * @param options - 配置选项
     * @returns 树形结构字符串
     */
    static formatAst(
        ast: any,
        options: {
            /** 是否显示 loc 属性，默认 false */
            showLoc?: boolean
            /** 字符串值最大长度，默认 40 */
            maxStringLength?: number
        } = {}
    ): string {
        const { showLoc = false, maxStringLength = 40 } = options
        return this.formatNode(ast, '', true, showLoc, maxStringLength)
    }

    /**
     * 递归格式化节点
     */
    private static formatNode(
        node: any,
        prefix: string,
        isLast: boolean,
        showLoc: boolean,
        maxStringLength: number
    ): string {
        const lines: string[] = []
        const connector = isLast ? '└─' : '├─'
        const childPrefix = prefix + (isLast ? '   ' : '│  ')

        // 获取节点类型
        const nodeType = node?.type

        // 显示节点类型
        lines.push(`${prefix}${connector}${nodeType}`)

        // 获取所有属性（排除 type）
        const keys = Object.keys(node).filter(key => {
            if (key === 'type') return false
            if (!showLoc && key === 'loc') return false
            return true
        })

        keys.forEach((key, index) => {
            const value = node[key]
            const isLastKey = index === keys.length - 1
            const keyConnector = isLastKey ? '└─' : '├─'
            const keyChildPrefix = childPrefix + (isLastKey ? '   ' : '│  ')

            const formattedLines = this.formatProperty(
                key,
                value,
                childPrefix,
                keyConnector,
                keyChildPrefix,
                showLoc,
                maxStringLength
            )
            lines.push(...formattedLines)
        })

        return lines.join('\n')
    }

    /**
     * 格式化单个属性
     */
    private static formatProperty(
        key: string,
        value: any,
        prefix: string,
        connector: string,
        childPrefix: string,
        showLoc: boolean,
        maxStringLength: number
    ): string[] {
        const lines: string[] = []

        // null 或 undefined
        if (value === null || value === undefined) {
            lines.push(`${prefix}${connector}${key}: ${value}`)
            return lines
        }

        // 基本类型
        if (typeof value === 'string') {
            const displayValue = this.formatStringValue(value, maxStringLength)
            lines.push(`${prefix}${connector}${key}: "${displayValue}"`)
            return lines
        }

        if (typeof value === 'number' || typeof value === 'boolean') {
            lines.push(`${prefix}${connector}${key}: ${value}`)
            return lines
        }

        // 数组
        if (Array.isArray(value)) {
            if (value.length === 0) {
                lines.push(`${prefix}${connector}${key}: []`)
                return lines
            }

            lines.push(`${prefix}${connector}${key}`)
            value.forEach((item, idx) => {
                const isLastItem = idx === value.length - 1
                const itemConnector = isLastItem ? '└─' : '├─'
                const itemChildPrefix = childPrefix + (isLastItem ? '   ' : '│  ')

                if (this.isAstNode(item)) {
                    // AST 节点：显示索引和类型
                    lines.push(`${childPrefix}${itemConnector}[${idx}]: ${item.type}`)

                    // 递归处理子属性
                    const subKeys = Object.keys(item).filter(k => {
                        if (k === 'type') return false
                        if (!showLoc && k === 'loc') return false
                        return true
                    })

                    subKeys.forEach((subKey, subIdx) => {
                        const subValue = item[subKey]
                        const isLastSubKey = subIdx === subKeys.length - 1
                        const subConnector = isLastSubKey ? '└─' : '├─'
                        const subChildPrefix = itemChildPrefix + (isLastSubKey ? '   ' : '│  ')

                        lines.push(...this.formatProperty(
                            subKey,
                            subValue,
                            itemChildPrefix,
                            subConnector,
                            subChildPrefix,
                            showLoc,
                            maxStringLength
                        ))
                    })
                } else {
                    // 非 AST 节点
                    lines.push(...this.formatProperty(
                        `[${idx}]`,
                        item,
                        childPrefix,
                        itemConnector,
                        itemChildPrefix,
                        showLoc,
                        maxStringLength
                    ))
                }
            })
            return lines
        }

        // 对象（AST 节点）
        if (this.isAstNode(value)) {
            lines.push(`${prefix}${connector}${key}: ${value.type}`)

            const subKeys = Object.keys(value).filter(k => {
                if (k === 'type') return false
                if (!showLoc && k === 'loc') return false
                return true
            })

            subKeys.forEach((subKey, subIdx) => {
                const subValue = value[subKey]
                const isLastSubKey = subIdx === subKeys.length - 1
                const subConnector = isLastSubKey ? '└─' : '├─'
                const subChildPrefix = childPrefix + (isLastSubKey ? '   ' : '│  ')

                lines.push(...this.formatProperty(
                    subKey,
                    subValue,
                    childPrefix,
                    subConnector,
                    subChildPrefix,
                    showLoc,
                    maxStringLength
                ))
            })
            return lines
        }

        // 普通对象
        if (typeof value === 'object') {
            const objKeys = Object.keys(value)
            if (objKeys.length === 0) {
                lines.push(`${prefix}${connector}${key}: {}`)
                return lines
            }

            lines.push(`${prefix}${connector}${key}`)
            objKeys.forEach((objKey, objIdx) => {
                const objValue = value[objKey]
                const isLastObjKey = objIdx === objKeys.length - 1
                const objConnector = isLastObjKey ? '└─' : '├─'
                const objChildPrefix = childPrefix + (isLastObjKey ? '   ' : '│  ')

                lines.push(...this.formatProperty(
                    objKey,
                    objValue,
                    childPrefix,
                    objConnector,
                    objChildPrefix,
                    showLoc,
                    maxStringLength
                ))
            })
            return lines
        }

        // 其他情况
        lines.push(`${prefix}${connector}${key}: ${String(value)}`)
        return lines
    }

    /**
     * 判断是否为 AST 节点
     */
    private static isAstNode(value: any): boolean {
        return value && typeof value === 'object' && typeof value.type === 'string'
    }

    /**
     * 格式化字符串值（转义特殊字符，截断长字符串）
     */
    private static formatStringValue(value: string, maxLength: number): string {
        let escaped = value
            .replace(/\\/g, '\\\\')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t')
            .replace(/"/g, '\\"')

        if (escaped.length > maxLength) {
            escaped = escaped.slice(0, maxLength) + '...'
        }

        return escaped
    }
}