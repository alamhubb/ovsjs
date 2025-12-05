/**
 * Vite 插件：处理 .ovs 文件
 *
 * 功能：
 * - 拦截 .ovs 文件
 * - 转换为 Vue 函数组件
 * - 自动格式化生成的代码（分号后换行、{} 缩进）
 */

import type { Plugin } from 'vite'
import { createFilter } from 'vite'
import { vitePluginOvsTransform } from 'ovs-compiler'

export default function vitePluginOvs(): Plugin {
    // 创建文件过滤器：只处理 .ovs 文件
    const filter = createFilter(/\.ovs$/, null)

    return {
        name: 'vite-plugin-ovs',
        enforce: 'pre',  // 在其他插件之前执行

        transform(code, id) {
            // 只处理 .ovs 文件
            if (!filter(id)) {
                return
            }

            // 转换 OVS 代码（SlimeGenerator 已自带格式化：分号后换行 + {} 缩进）
            const res = vitePluginOvsTransform(code)

            return {
                code: res.code,
                map: null  // TODO: 支持 source map
            }
        }
    }
}

// 同时导出命名导出，方便用户选择导入方式
export { vitePluginOvs }

