/**
 * 前缀树节点（针对字符串数组）
 *
 * 核心设计：
 * - children: Map<string, ArrayTrieNode> - 存储子节点，key 是 token（字符串）
 * - fullPaths: string[][] - 存储所有经过此节点的完整路径
 *
 * 示例：
 * 路径 ["If", "LParen", "Expression"] 会创建：
 * root -> "If" -> "LParen" -> "Expression"
 * 每个节点都会存储完整路径的引用
 */
class ArrayTrieNode {
    /** 子节点映射：token（字符串）-> 子节点 */
    children = new Map<string, ArrayTrieNode>()

    /** 存储所有经过此节点的完整路径（用于快速查找） */
    fullPaths: string[][] = []
}

/**
 * 字符串数组前缀树
 *
 * 核心原理：
 * 1. 将字符串数组中的每个字符串当作基本单元（类似字符）
 * 2. 构建树形结构，共享相同前缀
 * 3. 查询时只需遍历前缀的 token，无需遍历所有路径
 */
export default class ArrayTrie {
    private root = new ArrayTrieNode()

    /**
     * 插入路径到前缀树
     *
     * 核心逻辑：
     * 1. 从 root 开始
     * 2. 遍历路径的每个 token（字符串）
     * 3. 如果子节点不存在，创建新节点
     * 4. 移动到子节点
     * 5. 在每个节点存储完整路径的引用
     *
     * 时间复杂度：O(k)，k=路径长度（token数）
     */
    insert(path: string[]): void {
        let node = this.root

        // 遍历每个 token（字符串），构建树路径
        for (const ruleName of path) {
            // 如果子节点不存在，创建新节点
            if (!node.children.has(ruleName)) {
                node.children.set(ruleName, new ArrayTrieNode())
            }

            // 移动到子节点
            node = node.children.get(ruleName)!

            // 🔴 核心：在每个节点存储完整路径（用于快速查找）
            // 这样查询时可以直接获取所有经过此节点的完整路径
            node.fullPaths.push(path)
        }
    }

    /**
     * 查找完全相同的路径
     */
    findEqual(path: string[]): string[] | null {
        let node = this.root

        // 沿着路径向下遍历
        for (const token of path) {
            if (!node.children.has(token)) {
                return null  // 路径不存在
            }
            node = node.children.get(token)!
        }

        // 检查 fullPaths 中是否有完全相同的路径
        for (const fullPath of node.fullPaths) {
            // 🔴 使用提取的 isEqual 方法
            if (this.isEqual(path, fullPath)) {
                return fullPath
            }
        }

        return null
    }

    /**
     * 查找以 prefix 为前缀的路径（且不等于 prefix）
     *
     * 核心逻辑：
     * 1. 从 root 开始
     * 2. 沿着 prefix 的每个 token 向下遍历
     * 3. 如果找不到对应的子节点，返回 null
     * 4. 找到前缀节点后，检查 fullPaths 中是否有更长的路径
     * 5. 返回第一个匹配的完整路径
     *
     * 时间复杂度：O(k)，k=前缀长度（token数）
     */
    findPrefixMatch(prefix: string[]): string[] | null {
        let node = this.root

        // 🔴 核心：沿着前缀路径向下遍历
        for (const token of prefix) {
            // 如果找不到对应的子节点，说明没有匹配的前缀
            if (!node.children.has(token)) {
                return null
            }

            // 移动到子节点
            node = node.children.get(token)!
        }

        // 🔴 核心：找到前缀节点，检查是否有更长的路径
        // fullPaths 中存储的是所有经过此节点的完整路径
        for (const fullPath of node.fullPaths) {
            // 确保不是完全相同（完全相同不算前缀关系）
            // 确保 fullPath 确实以 prefix 开头（防御性检查）
            if (this.isPrefix(prefix, fullPath)) {
                return fullPath
            }
        }

        // 没有找到匹配的路径
        return null
    }

    /**
     * 检查两个路径数组是否完全相同
     *
     * 核心逻辑：
     * 1. 长度必须相同
     * 2. 逐个比较 token，必须完全相同
     *
     * 时间复杂度：O(k)，k=路径长度
     *
     * @returns 如果两个路径完全相同返回 true，否则返回 false
     * @param prefix
     * @param fullPath
     */
    private isEqual(prefix: string[], fullPath: string[]): boolean {
        // 长度必须相同
        if (prefix.length !== fullPath.length) {
            return false
        }

        // 🔴 核心：逐个比较 token
        for (let i = 0; i < prefix.length; i++) {
            if (prefix[i] !== fullPath[i]) {
                return false
            }
        }

        return true
    }

    /**
     * 检查 prefix 是否是 fullPath 的前缀
     *
     * 核心逻辑：
     * 1. 前缀必须比完整路径短
     * 2. 逐个比较 token，必须完全相同
     *
     * 时间复杂度：O(k)，k=前缀长度
     */
    private isPrefix(prefix: string[], fullPath: string[]): boolean {
        // 🔴 修复：前缀必须比完整路径短（前缀长度 < 完整路径长度）
        if (prefix.length >= fullPath.length) {
            return false
        }

        // 🔴 核心：逐个比较 token（只比较前缀的长度）
        for (let i = 0; i < prefix.length; i++) {
            if (prefix[i] !== fullPath[i]) {
                return false
            }
        }

        return true
    }
}