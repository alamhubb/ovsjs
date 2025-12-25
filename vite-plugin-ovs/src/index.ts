/**
 * Vite 插件：处理 .ovs 和 .cssts 文件
 *
 * 功能：
 * - 返回两个插件：cssts 插件 + ovs 插件
 * - cssts 插件处理 .cssts 文件
 * - ovs 插件处理 .ovs 文件
 * - 两个插件共享同一个 globalStyles Set，统一收集样式
 * - 组件包装逻辑在 OvsCstToSlimeAst.toProgram 中完成
 */

import type { Plugin } from 'vite'
import { createFilter } from 'vite'
import { vitePluginOvsTransform } from 'ovs-compiler'
import cssTsPlugin, { type CssTsPluginOptions, VIRTUAL_CSS_ID } from 'vite-plugin-cssts'

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
 * 
 * 两个插件共享同一个 globalStyles Set，确保所有样式都被收集
 */
export default function vitePluginOvs(options: OvsPluginOptions = {}): Plugin[] {
  const ovsFilter = createFilter(/\.ovs$/, null)
  
  // 创建共享的样式集合
  const sharedStyles = new Set<string>()

  // OVS 插件（只处理 .ovs 文件）
  const ovsPlugin: Plugin = {
    name: 'vite-plugin-ovs',
    enforce: 'pre',

    transform(code, id) {
      if (!ovsFilter(id)) return null

      // 转换 .ovs 代码，传入共享的样式集合
      const res = vitePluginOvsTransform(code, { globalStyles: sharedStyles })

      let transformedCode = res.code
      
      // 如果收集到了样式，注入虚拟 CSS 导入
      if (sharedStyles.size > 0 && !transformedCode.includes(VIRTUAL_CSS_ID)) {
        transformedCode = `import '${VIRTUAL_CSS_ID}'\n` + transformedCode
      }

      return { code: transformedCode, map: null }
    },

    handleHotUpdate({ file, server }) {
      if (file.endsWith('.ovs')) {
        server.ws.send({ type: 'full-reload' })
      }
    }
  }

  // 返回两个插件：cssts + ovs，共享同一个 globalStyles
  return [
    cssTsPlugin({ ...options.cssts, globalStyles: sharedStyles }),
    ovsPlugin
  ]
}

export { vitePluginOvs }
