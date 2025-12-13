/**
 * Vite 插件：处理 .ovs 文件
 *
 * 功能：
 * - 拦截 .ovs 文件
 * - 转换为 Vue 函数组件
 * - 内部集成 cssts 插件，自动处理 css {} 语法
 */

import type { Plugin } from 'vite'
import { createFilter } from 'vite'
import { vitePluginOvsTransform, OvsCstToSlimeAstUtil } from 'ovs-compiler'
// 导入 cssts 插件（不再导入 globalUsedAtoms，改用实例级共享）
import cssTsPlugin, { VIRTUAL_CSS_ID, type CssTsPluginOptions } from '../../vite-plugin-cssts/src/index.ts'

export interface OvsPluginOptions {
    /**
     * cssts 插件配置（透传给 vite-plugin-cssts）
     */
    cssts?: CssTsPluginOptions
}

/**
 * OVS Vite 插件
 * 
 * 返回插件数组：[ovsPlugin, csstsPlugin]
 * - ovsPlugin: 处理 .ovs 文件转换
 * - csstsPlugin: 处理 css {} 语法的 CSS 生成
 * 
 * 两个插件通过共享的 sharedUsedAtoms 实例通信，
 * 避免使用模块级全局变量，支持多实例场景。
 */
export default function vitePluginOvs(options: OvsPluginOptions = {}): Plugin[] {
    const filter = createFilter(/\.ovs$/, null)
    
    // 创建实例级的原子类收集器（每次调用 vitePluginOvs 都创建新的）
    // 这样多个 OVS 插件实例不会共享同一个 Set
    const sharedUsedAtoms = new Set<string>()

    // OVS 核心插件：处理 .ovs 文件转换
    const ovsPlugin: Plugin = {
        name: 'vite-plugin-ovs',
        enforce: 'pre',

        transform(code, id) {
            if (!filter(id)) {
                return
            }

            // 转换 OVS 代码
            const res = vitePluginOvsTransform(code)

            // 收集使用的原子类，注册到共享的收集器（实例级，非全局）
            const usedAtoms = OvsCstToSlimeAstUtil.getUsedAtoms()
            for (const atom of usedAtoms) {
                sharedUsedAtoms.add(atom)
            }

            // 如果使用了原子类，注入虚拟 CSS 模块的导入
            let transformedCode = res.code
            if (usedAtoms.size > 0 && !transformedCode.includes(VIRTUAL_CSS_ID)) {
                transformedCode = `import '${VIRTUAL_CSS_ID}'\n` + transformedCode
            }

            return {
                code: transformedCode,
                map: null
            }
        },

        // HMR 支持
        handleHotUpdate({ file, server }) {
            if (file.endsWith('.ovs')) {
                // 触发页面刷新
                server.ws.send({ type: 'full-reload' })
            }
        }
    }

    // 返回插件数组：OVS 插件 + cssts 插件
    // 将共享的 usedAtoms 传给 cssts 插件
    return [
        ovsPlugin,
        cssTsPlugin({ ...options.cssts, usedAtoms: sharedUsedAtoms })
    ]
}

export { vitePluginOvs }
