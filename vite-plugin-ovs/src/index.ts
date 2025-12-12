/**
 * Vite 插件：处理 .ovs 文件
 *
 * 功能：
 * - 拦截 .ovs 文件
 * - 转换为 Vue 函数组件
 */

import type { Plugin } from 'vite'
import { createFilter } from 'vite'
import { vitePluginOvsTransform } from 'ovs-compiler'

export interface OvsPluginOptions {
    /**
     * CSS 类名前缀
     * @default ''
     */
    classPrefix?: string
}

export default function vitePluginOvs(options: OvsPluginOptions = {}): Plugin {
    const filter = createFilter(/\.ovs$/, null)

    return {
        name: 'vite-plugin-ovs',
        enforce: 'pre',

        transform(code, id) {
            if (!filter(id)) {
                return
            }

            // 转换 OVS 代码
            const res = vitePluginOvsTransform(code)

            return {
                code: res.code,
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
}

export { vitePluginOvs }
