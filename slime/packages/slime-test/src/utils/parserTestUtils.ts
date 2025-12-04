import {SlimeNodeType} from "slime-ast/src/SlimeNodeType";
import SubhutiCst from "subhuti/src/struct/SubhutiCst.ts";

/**
 * 递归清除 CST 节点的 tokens 属性（用于调试）
 * @param currentNode CST 节点
 * @returns 清除后的节点
 */
export function traverseClearTokens(currentNode: SubhutiCst) {
    if (!currentNode || !currentNode.children || !currentNode.children.length)
        return currentNode

    // 递归遍历子节点
    if (currentNode.children && currentNode.children.length > 0) {
        currentNode.children.forEach(child => traverseClearTokens(child))
    }

    // 清除 tokens 属性
    currentNode.tokens = undefined
    return currentNode
}


/**
 * 递归清除 CST 节点的 loc 属性（用于调试）
 * @param currentNode CST 节点
 * @returns 清除后的节点
 */
export function traverseClearLoc(currentNode: SubhutiCst) {
    if (!currentNode)
        return currentNode

    // 用来清除叶子节点的loc，如果不需要可注释
    currentNode.loc = undefined as any

    if (!currentNode.children || !currentNode.children.length) {
        return currentNode
    }

    // 递归遍历子节点
    if (currentNode.children && currentNode.children.length > 0) {
        currentNode.children.forEach(child => traverseClearLoc(child))
    }

    // 清除 loc 属性
    currentNode.loc = undefined as any
    return currentNode
}
