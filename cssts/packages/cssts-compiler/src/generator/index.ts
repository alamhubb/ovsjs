/**
 * CssTs Generator
 * 
 * 提供类型定义和 properties.json 的生成功能
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

// 导出配置类型
export type { CsstsConfig, PropertyConfig, UnitConfig, UnitType } from './config.js'
export { defaultConfig, defaultProperties, systemDefaults, unitToSuffix } from './config.js'

// 导出原子类生成
export type { AtomDefinition } from './atom-generator.js'
export { generateAtoms, generatePropertiesJson } from './atom-generator.js'

// 导出类型定义生成
export {
  generateCsstsAtomsDts,
  generateGlobalDts,
  generateRuntimeDts,
  generateIndexDts,
} from './dts-generator.js'

// 导出数值生成
export { generateValues, resolveUnitConfig } from './value-generator.js'

import type { CsstsConfig } from './config.js'
import { defaultConfig } from './config.js'
import { generateAtoms, generatePropertiesJson } from './atom-generator.js'
import {
  generateCsstsAtomsDts,
  generateGlobalDts,
  generateRuntimeDts,
  generateIndexDts,
} from './dts-generator.js'

// ==================== 生成器选项 ====================

export interface GeneratorOptions {
  /** 输出目录 */
  outDir: string
  /** 配置 */
  config?: CsstsConfig
  /** 是否生成 .d.ts 文件（开发环境需要，生产环境不需要） */
  generateDts?: boolean
}

// ==================== 同步生成 properties.json ====================

/**
 * 同步生成 properties.json
 * 
 * 用于 vite 启动时和构建时
 */
export function generatePropertiesJsonSync(options: GeneratorOptions): string {
  const config = options.config ?? defaultConfig
  const atoms = generateAtoms(config)
  const properties = generatePropertiesJson(atoms)
  const content = JSON.stringify(properties, null, 2)

  // 确保目录存在
  if (!fs.existsSync(options.outDir)) {
    fs.mkdirSync(options.outDir, { recursive: true })
  }

  // 写入文件
  const filePath = path.join(options.outDir, 'properties.json')
  fs.writeFileSync(filePath, content)

  return filePath
}

// ==================== 异步生成 .d.ts ====================

/**
 * 异步生成 .d.ts 文件
 * 
 * 用于开发环境，不阻塞 vite 启动
 */
export async function generateDtsAsync(options: GeneratorOptions): Promise<string[]> {
  const config = options.config ?? defaultConfig
  const atoms = generateAtoms(config)

  // 确保目录存在
  if (!fs.existsSync(options.outDir)) {
    fs.mkdirSync(options.outDir, { recursive: true })
  }

  const files: string[] = []

  // 生成 CsstsAtoms.d.ts
  const atomsDtsPath = path.join(options.outDir, 'CsstsAtoms.d.ts')
  await fs.promises.writeFile(atomsDtsPath, generateCsstsAtomsDts(atoms))
  files.push(atomsDtsPath)

  // 生成 global.d.ts
  const globalDtsPath = path.join(options.outDir, 'global.d.ts')
  await fs.promises.writeFile(globalDtsPath, generateGlobalDts(atoms))
  files.push(globalDtsPath)

  // 生成 runtime.d.ts
  const runtimeDtsPath = path.join(options.outDir, 'runtime.d.ts')
  await fs.promises.writeFile(runtimeDtsPath, generateRuntimeDts())
  files.push(runtimeDtsPath)

  // 生成 index.d.ts
  const indexDtsPath = path.join(options.outDir, 'index.d.ts')
  await fs.promises.writeFile(indexDtsPath, generateIndexDts())
  files.push(indexDtsPath)

  return files
}

// ==================== 完整生成 ====================

/**
 * 完整生成（同步 properties.json + 异步 .d.ts）
 */
export async function generate(options: GeneratorOptions): Promise<{
  propertiesJson: string
  dtsFiles: string[]
}> {
  // 同步生成 properties.json
  const propertiesJson = generatePropertiesJsonSync(options)

  // 异步生成 .d.ts（如果需要）
  let dtsFiles: string[] = []
  if (options.generateDts !== false) {
    dtsFiles = await generateDtsAsync(options)
  }

  return { propertiesJson, dtsFiles }
}

// ==================== 配置合并工具 ====================

/**
 * 深度合并配置
 */
export function mergeConfig(base: CsstsConfig, override: Partial<CsstsConfig>): CsstsConfig {
  const result: CsstsConfig = {
    defaults: { ...base.defaults },
    properties: { ...base.properties },
  }

  // 合并 defaults
  if (override.defaults) {
    for (const [unit, config] of Object.entries(override.defaults)) {
      if (config) {
        (result.defaults as any)[unit] = {
          ...(result.defaults as any)?.[unit],
          ...config,
        }
      }
    }
  }

  // 合并 properties
  if (override.properties) {
    for (const [prop, config] of Object.entries(override.properties)) {
      if (config) {
        result.properties[prop] = {
          ...result.properties[prop],
          ...config,
        }
        
        // 深度合并每个单位配置
        const baseConfig = base.properties[prop] ?? {}
        for (const unit of ['px', 'rem', 'ratio', 'unitless', 'deg', 'ms', 'fr'] as const) {
          if (config[unit] !== undefined && baseConfig[unit] !== undefined) {
            (result.properties[prop] as any)[unit] = {
              ...baseConfig[unit],
              ...config[unit],
            }
          }
        }
      }
    }
  }

  return result
}

/**
 * 创建配置（基于默认配置合并）
 */
export function createConfig(override: Partial<CsstsConfig>): CsstsConfig {
  return mergeConfig(defaultConfig, override)
}
