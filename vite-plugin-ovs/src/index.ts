/**
 * Vite 插件：处理 .ovs 和 .cssts 文件
 *
 * 功能：
 * - 返回两个插件：cssts 插件 + ovs 插件
 * - cssts 插件处理 .cssts 文件
 * - ovs 插件处理 .ovs 文件
 * - 组件包装逻辑在 OvsCstToSlimeAst.toProgram 中完成
 */

import type { Plugin } from 'vite'
import { createFilter } from 'vite'
import { vitePluginOvsTransform } from 'ovs-compiler'
import cssTsPlugin, { type CssTsPluginOptions } from 'vite-plugin-cssts/src/index.ts'

export interface OvsPluginOptions {
  /** CSS 类名前缀 */
  classPrefix?: string
  /** cssts 插件配置 */
  cssts?: CssTsPluginOptions
}

/**
 * OVS Vite 插件
 * 
 * 返回两个插件：
 * 1. cssts 插件 - 处理 .cssts 文件
 * 2. ovs 插件 - 处理 .ovs 文件
 */
export default function vitePluginOvs(options: OvsPluginOptions = {}): Plugin[] {
  const ovsFilter = createFilter(/\.ovs$/, null)

  // OVS 插件（只处理 .ovs 文件）
  const ovsPlugin: Plugin = {
    name: 'vite-plugin-ovs',
    enforce: 'pre',

    transform(code, id) {
      if (!ovsFilter(id)) return null

      // 转换 .ovs 代码
      // 所有包装逻辑（wrapTopLevelExpressions, wrapOvsClassComponents）
      // 已在 OvsCstToSlimeAst.toProgram 中完成
      const res = vitePluginOvsTransform(code)

      return { code: res.code, map: null }
    },

    handleHotUpdate({ file, server }) {
      if (file.endsWith('.ovs')) {
        server.ws.send({ type: 'full-reload' })
      }
    }
  }

  // 返回两个插件：cssts + ovs
  return [
    cssTsPlugin(options.cssts || {}),
    ovsPlugin
  ]
}

export { vitePluginOvs }
